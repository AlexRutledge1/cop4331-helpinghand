// Establish needed requirements
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const checkLogin = require('../validation/login');
const sendEmail = require('../../utilities/sendEmail');
const key = require("../../utilities/keys");
const checkReg = require('../validation/registration.js');
const ifEmpty = require("../validation/checkForEmpty");
const buildPath = require('../../frontend/src/redux/buildPath');
const findUser = require('../utilities/findUser');

// Connect to mongo
require('dotenv').config();
const url = process.env.MONGODB_URI;
const MongoClient = require('mongodb').MongoClient;
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

// Create Coordinator
router.post('/register', async(req, res) =>
{
    // input: firstname, lastname, email, password1, password 2
    // output: id, firstname, lastname, error
    let error = {};
    const db = client.db();

    const {email, password1, password2, first_name, last_name} = req.body;
    const data = 
    {
        email: email,
        password1: password1,
        password2: password2,
        role: 'Coordinator'
    };

    var responsePackage = {id: -1, first_name: '', last_name: '', email: '', error: {}};

    // check validity of input
    const {errors, isValid} = checkReg.checkRegistrationFields(data);

    if (!isValid)
    {
        responsePackage.error = errors;
        return res.status(400).json(responsePackage);
    }
    
    // check to see if email has already been used
    const emailCheck = await db.collection('coordinator').find({coord_email: email}).toArray();
    if (emailCheck.length > 0)
    {
        responsePackage.error.email = 'this email is already in use';
        
        return res.status(200).json(responsePackage);
    }

    // generate random token for email verification
    var token;
    crypto.randomBytes(48, function(err, buffer) {
        token = buffer.toString('hex');
    });
    
    // password encryption
    bcrypt.genSalt(12, async (err, salt) => {
        if (err) throw err;

        bcrypt.hash(data.password1, salt, async (err, hash) => {
            if (err) throw err;

            // new coord object
            const newCoord = {coord_email: email, 
                    coord_first_name: first_name, coord_last_name: last_name, token: token,
                    coord_pw: hash, email_verified: "f",
                    token_used: "f", task_arr: []};
            const results = await db.collection('coordinator').insertOne(newCoord);

            if (results.length == 0)
            {
                responsePackage.error.database = 'could not insert coordinator';
                return res.status(400).json(responsePackage);
            }
            responsePackage = {id: results.insertedId, first_name: first_name, last_name: last_name, email: email, error: {}};
            

            // Send verification email
            let to = newCoord.coord_email;

            let sub = "Confirm Registration";

            let link = buildPath('/coord/verify/') + newCoord.token;

            let content = 
                "<body><p>Please verify email.</p> <a href=" + 
                link + 
                ">Verify email</a></body>";
            sendEmail.Email(to, sub, content);

            // After successful email sending, return json data for user
            return res.status(200).json(responsePackage);
        })
    })
})

// Coordinator Login
router.post('/login', async(req, res) =>
{
    // input: email, password
    // return: id, firstName, lastName, error
    var error = '';
    const db = client.db();
    const {email, password} = req.body;

    // Check if input is valid
    const validity = checkLogin.checkLoginFields(req.body);
    if (!validity.isValid)
    {
        return res.status(400).json(validity.errors);
    }
    var responsePackage = {id: -1, first_name: '', last_name: '', email: '', error: ''};

    // ensure that the email exists & has been verified
    var results = await db.collection('coordinator').findOne({coord_email: email, email_verified: "t"});

    if (!ifEmpty(results))
    {
        // Check if hashed password matches input
        await bcrypt.compare(password, results.coord_pw).then(isMatch => {
            if (isMatch) {
                
                responsePackage = {id: results._id, first_name: results.coord_first_name, 
                    last_name: results.coord_last_name, email: results.coord_email, error: ''};
                        
                return res.status(200).json(responsePackage);
            } else {
                responsePackage.error = "Wrong password";
                return res.status(200).json(responsePackage);
            }
        });
    }
    else
    {
        responsePackage.error = 'Invalid username/password';
        return res.status(200).json(responsePackage);
    }
    
})

// Verify Coordinator email
router.get('/verify/:token', async(req, res) => {
    const {token} = req.params;
    const db = client.db();
    const errors = {};

    const results = await db.collection('coordinator').find({token: token, token_used: 'f'})
    var responsePackage = {success: true, error:''};

    if (results.length == 0)
    {
        const emailVerify = await db.collection('coordinator').find({token: token, email_verified: "t"});
        if (emailVerify.length > 0)
        {
            responsePackage.error("Email has already been verified");
            return res.status(200).json(responsePackage);
        }
        responsePackage.error = "Verification token invalid";
        responsePackage.success = false;
        return res.status(200).json(responsePackage);
    }

    const update = await db.collection('coordinator').updateOne({token: token},{$set : {email_verified: "t", token_used: "t"}});

    return res.status(200).json(responsePackage);

})

router.post('/tasks', async(req, res) => {
    // Input: email
    // Output: array of tasks
    const db = client.db();
    var user;
    var ret = [];
    
    async function getTask(data){
        var obj = await db.collection('tasks').findOne({_id: data});
        
        return obj;
    }

    function callback() {
        return res.status(200).json(ret);
    }
    var items = 0;
    user = await db.collection('coordinator').findOne({coord_email: req.body.email}).then((result) => {
        if (result == null)
            return res.status(400).json("no such user found");
        var taskIDs = result.task_arr;
        if (taskIDs == null || taskIDs.length == 0)
            callback();
        else 
            taskIDs.forEach(async(item, index, array) => {
                await ret.push(await getTask(item));
                items++;
                if(items === array.length)
                {
                    callback();
                }
            });
    });
});

module.exports = router;