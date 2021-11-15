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

// Register Volunteer
router.post('/register', async(req, res) =>
{
    // input: email, password1, password2, first_name, last_name, accepted_distance, location
    // output: id, first_name, last_name, error
    let error = {};
    const db = client.db();

    const {email, password1, password2, first_name, last_name, accepted_distance, longitude, latitude} = req.body;
    const data = 
    {
        email: email,
        password1: password1,
        password2: password2,
        longitude: longitude, 
        latitude: latitude,
        accepted_distance: accepted_distance,
        role: 'Volunteer'
    };
    var responsePackage = {id: -1, first_name: '', last_name: '', error: {}}
    const {errors, isValid} = checkReg.checkRegistrationFields(data);
    if (!isValid)
    {
        responsePackage.error = errors;
        return res.status(400).json(responsePackage);
    }

    const emailCheck = await db.collection('volunteer').find({vol_email: email}).toArray();

    if (emailCheck.length > 0)
    {
        responsePackage.error.email = 'this email is already in use';
        
        return res.status(400).json(responsePackage);
    }

    var token;
    crypto.randomBytes(48, function(err, buffer) {
        token = buffer.toString('hex');
    });

    bcrypt.genSalt(12, async (err, salt) => {
        if (err) throw err;

        bcrypt.hash(data.password1, salt, async (err, hash) => {
            if (err) throw err;
            const location = {type: "Point", coordinates: [longitude, latitude]};
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
            responsePackage = {id: results.insertedId, first_name: first_name, last_name: last_name, error: error};

            let to = [newVol.vol_email];

            let sub = "Confirm Registration";

            let link = "https://localhost:3000/vol/verify/" + newVol.token;

            let content = 
                "<body><p>Please verify email.</p> <a href=" + 
                link + 
                ">Verify email</a></body>";
            sendEmail.Email(to, sub, content);

            return res.status(200).json(responsePackage);
        })
    })
})

// Verify Volunteer email
router.post('/verify/:token', async(req, res) => {
    const {token} = req.params;
    const db = client.db();

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
    const db = client.db();
    const {email, password} = req.body;

    var responsePackage = {id: -1, email: '', first_name: '', last_name: '', errors: {}};

    const validate = checkLogin.checkLoginFields({email: email, password: password});

    if (!validate.isValid)
    {
        responsePackage.errors = validate.errors;
        return res.status(400).json(responsePackage);
    }
    
    var results = await db.collection('volunteer').findOne({vol_email: email, email_verified: "t"});

    
    if (!ifEmpty(results))
    {
        await bcrypt.compare(password, results.vol_pw).then(isMatch => {
            if (isMatch) {
                responsePackage.id = results._id;
                responsePackage.first_name = results.vol_first_name;
                responsePackage.last_name = results.vol_last_name;
                responsePackage.email = results.vol_email;
                
                jwt.sign(
                    responsePackage,
                    key.secretOrKey,
                    {expiresIn: 3600},
                    (err, token) => {
                        return res.status(200).json(responsePackage);
                    }
                );
                return;
            
            } else {
                responsePackage.errors.password = "Wrong password";
                return res.status(400).json(responsePackage);
            }
        });
    }
    else
    {
        responsePackage.errors.email = 'Invalid username/password';
        return res.status(400).json(responsePackage);
    }
    
})

// Forgot password
router.post('/forgot', async(req, res) =>
{
    // input: email
    // response: boolean (email sent), error
    const {email} = req.body;
    const db = client.db();
    var responsePackage = {success: false, error: {}};

    const emailCheck = await db.collection('volunteer').find({vol_email: email, email_verified: "t"});

    if (!ifEmpty(emailCheck))
    {
        let resetToken;
        resetToken = crypto.randomBytes(20).toString("hex");
        await db.collection('volunteer').updateOne({vol_email: email}, {$set: {password_token: resetToken,
            password_token_used: "f"}});

        let to = [email];

        let sub = "Reset password";

        let link = "https://localhost:3000/vol/reset/" + resetToken;

        let content = 
            "<body><p>Click the link to reset your password</p> <a href=" + 
            link + 
            ">Reset</a></body>";
        sendEmail.Email(to, sub, content);
        responsePackage.success = true;
        return res.status(200).json(responsePackage);

    }
    else
    {
        responsePackage.error.email = "This email does not exist or has not been verified";
        return res.status(400).json(responsePackage);
    }
})

router.post('/reset/:token', async(req, res) =>
{
    const db = client.db();
    const {token} = req.params;
    var responsePackage = {};

    const checkExistence = await db.collection('volunteer').find({password_token: token,
        password_token_used: "f"});

    if (!ifEmpty(checkExistence))
    {
        bcrypt.genSalt(12, async(err, salt) =>
        {
            if (err) throw err;
            bcrypt.hash(req.body.password1, salt, async(err, hash) =>
            {
                if (err) throw err;
                const update = await db.collection('volunteer').updateOne({password_token: token}, {vol_pw: hash,
                    password_token_used: "t"});
                if (update.modifiedCount > 0)
                {
                    const to = [checkExistence.vol_email];
                    const sub = "Password changed for your account";
                    const txt = `The password for your account registered under ${
                        checkExistence.vol_email
                      } has been successfully changed.`;
                    sendEmail.Email(to, sub, txt);
                    res.json("Password successfully changed");
                }
            })
        })
    }
    else
    {
        responsePackage.error = "invalid token";
        return res.status(400).json(responsePackage);
    }
})

module.exports = router;