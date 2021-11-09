// Establish needed requirements
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const checkRegistrationFields = require("../validation/registration");

// Connect to mongo
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://root:andrewhasgrayhair@cluster0.w0djj.mongodb.net/project2';
const checkReg = require('../validation/registration.js');

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

// Create Volunteer
router.post('/api/createVolunteer', async(req, res, next) =>
{
    // input: email, password1, password2, first_name, last_name, accepted_distance, location
    // output: id, firstname, lastname, error
    let error = {};
    const db = client.db();

    const {email, password1, password2, first_name, last_name, accepted_distance, location} = req.body;
    const data = 
    {
        email: email,
        password1: password1,
        password2: password2,
        location: location,
        accepted_distance: accepted_distance,
        role: 'Volunteer'
    };
    const {errors, isValid} = checkReg.checkRegistrationFields(data);
    if (!isValid)
    {
        res.status(200).json({id: -1, firstname: "", lastname: "", error: errors});
    }
    else
    {
        const newVol = {vol_accepted_distance: accepted_distance, vol_email: email, 
            vol_first_name: first_name, vol_last_name: last_name, vol_token: token,
            vol_location: location, vol_pw: password1};

        const emailCheck = await db.collection('volunteer').find({vol_email: email}).toArray();

        if (emailCheck.length > 0)
        {
            error.email = 'this email is already in use';
            const ret = {id: -1, error: error};
            res.status(200).json(ret);
        }
        else
        {
            const results = await db.collection('volunteer').insertOne(newVol);
            if (results.length == 0)
            {
                error.database = 'could not insert volunteer';
            }
            const ret = {id: results.insertedId, first_name: first_name, last_name: last_name, error: error};
            res.status(200).json(ret);
        }
    }
    

})

// Create Coordinator
router.post('/api/createCoordinator', async(req, res, next) =>
{
    // input: firstname, lastname, location, email, password1, password 2
    // output: id, firstname, lastname, error
    let error = {};
    const db = client.db();

    const {firstname, lastname, location, email, password1, password2} = req.body;

    const data = 
    {
        email: email,
        password1: password1,
        password2: password2,
        role: 'Coordinator'
    };
    const {errors, isValid} = checkReg.checkRegistrationFields(data);

    if (!isValid)
    {
        res.status(200).json({id: -1, firstname: "", lastname: "",  error: errors});
    }
    else
    {
        const newCoord = {coord_email: email, coord_pw: password, coord_first_name: firstname,
            coord_last_name: lastname, coord_location: location};

        const emailCheck = await db.collection('coordinator').find({coord_email: email}).toArray();
        if (emailCheck.length > 0)
        {
            error.email = 'this email is already in use';
            const ret = {id: -1, error: error};
            res.status(200).json(ret);
        }
        else 
        {
            const results = await db.collection('coordinator').insertOne(newCoord);

            if (results.length == 0)
            {
                email.database = 'could not insert coordinator';
            }
            
            const ret = {id: results.insertedId, first_name: firstname, last_name: lastname, error: error};

            res.status(200).json(ret);
        }
    }

    
    
})

// Volunteer Login
router.post('/api/volLogin', async(req, res, next) =>
{
    // input: email, password
    // output: id, firstName, lastName, error
    var error = '';
    const db = client.db();
    const {email, password} = req.body;
    
    const results = await db.collection('volunteer').find({vol_email: email, vol_pw: password}).toArray();

    var id = -1;
    var fn = '';
    var ln = '';

    if (results.length > 0)
    {
        id = results[0]._id;
        fn = results[0].vol_first_name;
        ln = results[0].vol_last_name;
    }
    else
    {
        error = 'Invalid username/password';
    }
    var ret = {id:id, firstName: fn, lastName: ln, error: error};
    res.status(200).json(ret);
})

// Coordinator Login
router.post('/api/coordLogin', async(req, res, next) =>
{
    // input: email, password
    // return: id, firstName, lastName, error
    var error = '';
    const db = client.db();
    const {email, password} = req.body;

    const results = await db.collection('coordinator').find({coord_email: email, coord_pw: password}).toArray();

    var id = -1;
    var fn = '';
    var ln = '';

    if (results.length > 0)
    {
        id = results[0]._id;
        fn = results[0].coord_first_name;
        ln = results[0].coord_last_name;
    }
    else
    {
        error = 'Invalid username/password';
    }
    var ret = {id:id, firstName: fn, lastName: ln, error: error};
    res.status(200).json(ret);
})

// Create Task
router.post('/api/createtask', async(req, res, next) =>
{
    // input: name, description, date, max_slots, location
    // return: id, error
    var error = '';

    const{name, description, date, max_slot, location} = req.body;

    

    const newTask = {task_name: name, task_description: description, 
        task_date: date, max_slots: max_slot, task_location: location, slots_available: max_slot};
    
    const db = client.db();
    const result = await db.collection('tasks').insertOne(newTask);

    var ret = {id: result.insertedId, error: error};
    res.status(200).json(ret);

});

/*
router.post('/api/forgotPassword', async(req, res, next) =>
{
    // input: email
    // output: error
    var error = '';

    const {email} = req.body;
    const db = client.db();

    const volCheck = await db.collection('volunteer').find({vol_email: email}).toArray();
    const coordCheck = await db.collection('coordinator').find({coord_email: email}).toArray();

    if (volCheck.length == 0 && coordCheck.length == 0)
    {
        error = 'email does not exist in the system';
    }
    else
    {
        if (volCheck.length > 0)
        {
            // Volunteer forgot pass
        }

        if (coordCheck.length > 0)
        {
            // Coordinator forgot pass
        }
    }
})
*/

module.exports = router;