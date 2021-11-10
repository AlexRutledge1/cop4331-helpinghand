// Establish needed requirements
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const checkLogin = require('../validation/login');
const sendEmail = require('../../utilities/sendEmail');
const key = require("../../utilities/keys");

// Connect to mongo
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://root:andrewhasgrayhair@cluster0.w0djj.mongodb.net/project2';
const checkReg = require('../validation/registration.js');
const ifEmpty = require("../validation/checkForEmpty");

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

// Register Volunteer
router.post('/register', async(req, res) =>
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
        return res.status(400).json({id: -1, firstname: "", lastname: "", error: errors});
    }

    const emailCheck = await db.collection('volunteer').find({vol_email: email}).toArray();

    if (emailCheck.length > 0)
    {
        error.email = 'this email is already in use';
        const ret = {id: -1, error: error};
        return res.status(400).json(ret);
    }

    var token;
    crypto.randomBytes(48, function(err, buffer) {
        token = buffer.toString('hex');
    });

    bcrypt.genSalt(12, async (err, salt) => {
        if (err) throw err;

        bcrypt.hash(data.password1, salt, async (err, hash) => {
            if (err) throw err;
            const newVol = {vol_accepted_distance: accepted_distance, vol_email: email, 
                    vol_first_name: first_name, vol_last_name: last_name, token: token,
                    vol_location: location, vol_pw: hash, email_verified: "f",
                    token_used: "f"};
            const results = await db.collection('volunteer').insertOne(newVol);

            if (results.length == 0)
            {
                error.database = 'could not insert volunteer';
                return res.status(400).json({id: -1, first_name: '', last_name: '', error: error});
            }
            const ret = {id: results.insertedId, first_name: first_name, last_name: last_name, error: error};

            let to = [newVol.vol_email];

            let sub = "Confirm Registration";

            let link = "https://localhost:3000/vol/verify/" + newVol.token;

            let content = 
                "<body><p>Please verify email.</p> <a href=" + 
                link + 
                ">Verify email</a></body>";
            sendEmail.Email(to, sub, content);

            return res.status(200).json(ret);
        })
    })
})

// Verify Volunteer email
router.post('/verify/:token', async(req, res) => {
    console.log("running verify");
    const {token} = req.params;
    const db = client.db();
    const errors = {};

    const results = await db.collection('volunteer').find({token: token, token_used: 'f'})

    if (results.length == 0)
    {
        const emailVerify = await db.collection('volunteer').find({token: token, email_verified: "t"});
        if (emailVerify.length > 0)
            return res.json("Email has already been verified!");
        return res.json("Verification token invalid");
    }

    const update = await db.collection('volunteer').updateOne({token: token},{$set : {email_verified: "t", token_used: "t"}});

    return res.json("Email verified! Please login to your account");

})

// Volunteer Login
router.post('/login', async(req, res) =>
{
    // input: email, password
    // output: id, firstName, lastName, error
    var error = '';
    const db = client.db();
    const {email, password} = req.body;

    const validate = checkLogin.checkLoginFields({email: email, password: password});

    if (!validate.isValid)
    {
        return res.status(400).json(validate.errors);
    }
    
    var results = await db.collection('volunteer').findOne({vol_email: email, email_verified: "t"});

    var id = -1;
    var fn = '';
    var ln = '';
    
    if (!ifEmpty(results))
    {
        await bcrypt.compare(password, results.vol_pw).then(isMatch => {
            if (isMatch) {
                const payload = {id: results._id, email: results.vol_email, first_name: results.vol_first_name,
                     last_name: results.vol_last_name};
                jwt.sign(
                    payload,
                    key.secretOrKey,
                    {expiresIn: 3600},
                    (err, token) => {
                        return res.status(200).json(payload);
                    }
                );
                return;
            
            } else {
                return res.status(400).json("Wrong password");
            }
        });
    }
    else
    {
        error = 'Invalid username/password';
        return res.status(400).json({id: -1, firstName: '', lastName: '', error: error});
    }
    
})

/*
router.post('/api/forgotPassword', async(req, res) =>
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