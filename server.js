// TODO: 
// Check all api input for validity *****ESPECIALLY LOCATION*******
// Forgot password API
// Resend verification email API
// findTasks API

const bodyParser = require('body-parser');
const cors = require('cors');
const volRoutes = require('./api/routes/volunteer');
const coordRoutes = require('./api/routes/coordinator');
const taskRoutes = require('./api/routes/task');

var express = require('express');

const path = require('path');
const port = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, './frontend/build')))
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/build'))
})
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => 
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




// Setup your api routes with express
app.use("/vol", volRoutes);
app.use("/coord", coordRoutes);
app.use("/task", taskRoutes);


// express returns an HTTP server
app.listen(port, () => console.log("[Server] on port " + port + " online " + new Date()));