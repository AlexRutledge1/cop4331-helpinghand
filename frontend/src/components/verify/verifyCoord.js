import React, {useState} from "react"
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Appbar from "../appbar/appbar.js";
import { useHistory, useParams } from "react-router-dom";
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
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

function VerifyCoord()
{
    let {token} = useParams();
    const history = useHistory();
    async function handleSubmit(){
        try{
        const res = await fetch(buildPath('/coord/verify/') + token, {method: 'GET', headers:{'Content-Type':'application/json'}});
        let response = JSON.parse(await res.text());
        if (response.success)
        {
            history.push("/");
        }
        else
        {
            alert(response.error);
        }
        }
        catch(e)
        {
        alert(e);
        }
    }
    const classes = useStyles();
    return (
        <div>
            <Appbar title="Verify Email" type="Volunteer"/>
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
            <Button 
                className={classes.smallbutton}
                onClick={(handleSubmit)}>Verify
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
)(VerifyCoord)