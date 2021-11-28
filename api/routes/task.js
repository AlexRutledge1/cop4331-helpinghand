const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const checkFields = require("../validation/task");
const findUser = require('../utilities/findUser');


// Connect to mongo
require('dotenv').config();
const url = process.env.MONGODB_URI;
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const client = new MongoClient(url);
client.connect();

router.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

// Create Task
router.post('/create', async(req, res) =>
{
    // input: name, description, date, max_slots, latitude, longitude, address,  email
    // return: id, error
    var error = {};

    const {errors, isValid} = checkFields.checkTaskFields(req.body);
    if (!isValid)
    {
      error = errors;
      return res.status(400).json({id: -1, error});
    }
    
    const{name, description, date, max_slots, email, address} = req.body;
    //var _date = date.replaceAll('//','-');
    const location = {type: "Point", coordinates: [req.body.longitude, req.body.latitude]};
    //let d = new Date(_date);
    let m = max_slots;
    if (typeof max_slots === "string")
    {
      m = parseInt(max_slots);
    }
    const newTask = {task_name: name, task_description: description, 
        task_date: date, max_slots: m, task_location: location, task_address: address, slots_available: m,
        vol_arr: []};
    
    const db = client.db();
    
    const result = await db.collection('tasks').insertOne(newTask);

    var ret = {id: result.insertedId, error: error};
    var coord = await db.collection('coordinator').updateOne({coord_email: email}, 
      {
        $push: 
        {
          task_arr: ret.id
        }
      }
      ).then( (result) => {
        if (result.modifiedCount == 0)
        {
          db.collection('tasks').findOneAndDelete({_id: ret.id});
          return res.status(400).json("could not find user, task not created");
        }
      });
    
    res.status(200).json(ret);

});

function getMiles(lon1, lat1, lon2, lat2)
{
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres

    return d/1609.34;
}

router.get('/find:email', async(req, res) =>
{
  // input: email
  // out: list of tasks
  const db = client.db();
  const {email} = req.params;
  await db.collection('volunteer').findOne({vol_email: email}).then( (user) => {
    if (user == null)
    {
      return res.status(400).json("Couldn't find user");
    }
    let searchRange = user.vol_accepted_distance * 1609.34;
    db.collection('tasks').find({task_location:
      {$near:
        {
          $geometry: {type: "Point", coordinates: user.vol_location.coordinates.map(Number)},
          $minDistance: 0,
          $maxDistance: searchRange
        }
      }
    }).toArray().then( async(results) =>{
      const userID = await new mongodb.ObjectId(user._id);
      if (results.length > 0)
      {
        
        // iterate through nearby tasks
        outer: for (var i = 0; i < results.length; i++)
        {
          // first calculate the distance between the user and the task
          let dist = getMiles(results[i].task_location.coordinates[0],results[i].task_location.coordinates[1],
             user.vol_location.coordinates[0], user.vol_location.coordinates[1]);
          results[i].distance = dist;

          // check if the user is signed up already or not
          inner: for (var k = 0; k < results[i].vol_arr.length; k++)
          {
            if (userID == results[i].vol_arr[k].toString())
            {
              results[i].added = true;
              continue outer;
            }

          }
          //console.log(existence );
          results[i].added = false;
          
        }
      }
      else return res.status(200).json([]);

      

      return res.status(200).json(results);
    });
    
  });

})

router.post('/remove', async(req, res) => {
  // Input: email, taskID
  const db = client.db();
  const {email, taskID} = req.body;
  var task = new mongodb.ObjectId(taskID);

  db.collection('coordinator').findOneAndUpdate(
    {
      $and: [
        {coord_email: email},
        {task_arr: task}
      ]
    },
    {
      $pull: {task_arr: task}
    }
  ).then( async(coord) => {
    if (coord.lastErrorObject.updatedExisting == false)
    {
      return res.status(400).json("Cannot find that coordinator with this task");
    }
    db.collection('tasks').findOneAndDelete({_id: task}).then( async(result) => {
      console.log(result);
      if (result == null)
      {
        return res.status(400).json("Cannot find task");
      }
      var arr = result.value.vol_arr;
      arr.forEach( async(item, ind, arr) => {
        console.log(item);
        console.log(task);
        await db.collection('volunteer').findOneAndUpdate({
            _id: item
        }, 
        {
          $pull: {task_arr: task}
        }).then((re) => {
          console.log(re);
        })
      })
      

      return res.status(200).json({success: true});
    })
  })
})

module.exports = router;