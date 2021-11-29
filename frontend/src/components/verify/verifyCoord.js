import React, { useState } from "react"
import { makeStyles } from '@material-ui/core/styles';
import TaskCard from '../volunteertaskcard/taskcard.js'
import Grid from '@material-ui/core/Grid';
import Appbar from "../appbar/appbar.js";
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import { connect } from "react-redux";
import { setAreas } from '../../redux/actions.js';
import { useHistory } from "react-router-dom";

const buildPath = require('../../redux/buildPath');

const useStyles = makeStyles((theme) => ({
    root: {
      marginTop: 40,
    },
    button: {
      marginTop: '40px',
      width: '110px',
      height: '40px',
      backgroundColor: "#27AE60",
      color: '#FFFFFF'
    },
}));

function VerifyCoordPage(props)
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
        <>
            <Grid container
                direction="column"
                justify="center"
                alignItems="center"
                className={classes.root}
                spacing={4}
          ></Grid>
            <Grid item>
                <Button 
                className={classes.smallbutton}
                onClick={(handleSubmit)}>Verify Email
            </Button>
            </Grid>
        </>
    )
}

const mapDispatchToProps = { areaAction: setAreas }


export default connect(
  null,
  mapDispatchToProps
)(VerifyCoordPage)
