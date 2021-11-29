import React, {useState} from "react"
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Appbar from "../appbar/appbar.js";
import { useHistory } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useLocation, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { setAreas } from '../../redux/actions.js';

const buildPath = require('../../redux/buildPath');

const useStyles = makeStyles((theme) => ({
    root: {
        ...theme.typography.button,
        backgroundColor: theme.palette.background.paper,
    },
    string: {
        marginTop: '20px',
        marginBottom: '20px',
        fontSize: '20px',
    },
    welcome: {
        margin: '15px',
        marginBottom: '10px',
        fontSize: '28px',
        fontWeight: 'bold',
    },
    starter: {
        fontSize: '18px',
        marginBottom: '60px',

    },
    padding: {
        marginTop: '20px',
        marginBottom: '20px',
    },
    button: {
        width: '200px',
        height: '60px',
        fontSize: '22px',
        background: '#27AE60',
        boxShadow: '0px 4px 4px rgba(154, 154, 154, 0.25)',
        radius: '10px',
        color: '#FFFFFF'
    },
    smallbutton: { 
        marginTop:'20px',
        width: '120px',
        height: '40px',
        fontSize: '13px',
        background: '#27AE60',
        boxShadow: '0px 4px 4px rgba(154, 154, 154, 0.25)',
        radius: '10px',
        color: '#FFFFFF'
    },
    image: {
        marginTop: '15px',
        height: '200px',
    },
    link: {
        alignItems: "center",
        color: "#27AE60",
    }

}));

function Reset(props)
{
    let {token} = useParams();
    const classes = useStyles();
    let history = useHistory();
    const location = useLocation();
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        var obj = {password1: password1, password2: password2};
        var js = JSON.stringify(obj);

        try{
            const response = await fetch(buildPath('/vol/reset/') + token, {method: 'POST',
                body: js, headers:{'Content-Type':'application/json'}});
            
                var res = JSON.parse(await response.text());
            if (res.success == true)
            {
                history.push('/');
            }
        }
        catch (e)
        {
            alert(e.toString());
        }
    }
    return (
        <div>
            <Appbar title="Reset Password" type="Volunteer"/>
            <Grid
                container
                direction="column"
                justify="space-between"
                alignItems="center"
            >
            {/* <Grid item>
            <img className={classes.image} src="/images/volunteer.png"></img>
            </Grid> */}
            <Grid item>
            <Typography className={classes.welcome} variant="h4" component="h4" align="center">Forgot Password</Typography>
            </Grid>
            <Grid item>
              <TextField
                required
                id="filled-bare"
                placeholder={"password"}
                margin="normal"
                variant="filled"
                onChange={(e)=> setPassword1(e.target.value)}
               />
            </Grid>
            <Grid item>
              <TextField
                required
                id="filled-bare"
                placeholder={"confirm password"}
                margin="normal"
                variant="filled"
                onChange={(e)=> setPassword2(e.target.value)}
               />   
            </Grid>
            <Grid item>
            <Button 
                className={classes.smallbutton}
                onClick={(handleSubmit)}>Submit
            </Button>
            </Grid>
            </Grid>
        </div>
    )
}

const mapDispatchToProps = { areaAction: setAreas }


export default connect(
  null,
  mapDispatchToProps
)(Reset)