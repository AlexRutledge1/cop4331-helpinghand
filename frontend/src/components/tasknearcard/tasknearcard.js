import React, { useState } from "react";
import { ThemeProvider, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useLocation } from "react-router-dom";
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { styled } from "@mui/material/styles";
import Grid from "@material-ui/core/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ShareIcon from "@mui/icons-material/Share";
import VolunteerPage from "../volunteertaskspage/volunteertasks.js";
import { useHistory } from "react-router-dom";

// const [list, setList] = useState(initialList);
const buildPath = require("../../redux/buildPath");

const useStyles = makeStyles({
	root: {
		minWidth: 400,
		minHeight: 250,
		marginTop: 20,
		borderRadius: 10,
		borderWidth: 5,
		backgroudColor: "rgb(122, 102, 102)",
	},
	selected: {
		minWidth: 275,
		marginTop: 30,
		marginBottom: 10,
		// background: "rgb(226,248,235)",
		// background: "linear-gradient(180deg, rgba(226,248,235,1) 0%, rgba(226,248,235,1) 40%, rgba(244,244,244,1) 100%)"
	},
	bullet: {
		display: "inline-block",
		margin: "0 2px",
		transform: "scale(0.8)",
	},
	title: {
		fontSize: 22,
	},
	locationField: {
		fontSize: 14,
	},
	button: {
		maxWidth: "100px",
		maxHeight: "40px",
		minWidth: "100px",
		minHeight: "40px",
		background: "#19AE59",
		color: "#ffffff",
		fontSize: 12,
		"&:hover": {
			backgroundColor: "#197257",
			color: "#ffffff",
		},
	},
	fab: {
		marginLeft: "auto",
	},
});

const ExpandMore = styled((props) => {
	const { expand, ...other } = props;
	return <IconButton {...other} />;
})(({ theme, expand }) => ({
	transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
	marginLeft: "auto",
	transition: theme.transitions.create("transform", {
		duration: theme.transitions.duration.shortest,
	}),
}));

export default function AreaCard(props) {
	const location = useLocation();
	let history = useHistory();
	var user_data = JSON.parse(localStorage.getItem("user_data"));
	var user_email = user_data.email;
	// const [selected, setSelected] = useState(false)
	const classes = useStyles();
	const bull = <span className={classes.bullet}>•</span>;
	const [posts, setPosts] = useState([]);

	async function handleSubmit() {
		console.log(buildPath("/vol/tasks"));
		console.log(user_data);
		var obj = { email: user_email, taskID: props.task._id };

		var js = JSON.stringify(obj);
		console.log(js);

		try {
			const response = await fetch(buildPath("/vol/addTask"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: js,
			});
			console.log(response);
			var res = JSON.parse(await response.text());
			console.log(res);
			if (res.error != null) {
				console.log(res.error);
			} else {
				console.log("success");
				// window.location.reload(false);

				//this is a check because the page might render twice and cause the call to fail
				//if the call fails and res is set then the structure is different from if it returned tasks
				//and we cans use the same syntax to parse it with map
				if (res != "no such user found") {
					setPosts(res);
					// history.push({
					// 	pathname: "/volunteer", // your data array of objects
					// });
				} else {
					console.log("User not found error");
				}
				return res;
			}
		} catch (e) {
			alert(e.toString());
			return;
		}
	}

	async function goToSummaryPage() {
		let result = await handleSubmit(); // wait for the fetch to complete
		// console.log(result);
		// if (!result.error) {
		// get whatever you need from 'result'
		history.push("/volunteer");
		// } else {
		// 	// show error from 'result.error'
		// }
	}

	return (
		<>
			<Card
				sx={{ maxWidth: 345 }}
				className={classes.root}
				style={{ color: "black", backgroundColor: "#f7f7f7" }}
			>
				<CardHeader
					title={props.task.task_name}
					subheader={
						<div className={classes.locationField}>
							{" "}
							<FaMapMarkerAlt /> {props.task.task_address}{" "}
							<div className={classes.locationField} style={{ marginLeft: 18 }}>
								{props.task.distance.toFixed(2)} miles away
							</div>
						</div>
					}
				/>
				<CardContent>
					<Typography variant="body2" color="text.secondary">
						<FaCalendarAlt /> {"   "} {props.task.task_date.substr(0, 10)}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{props.task.task_description}
					</Typography>
				</CardContent>

				<CardActions disableSpacing>
					<Button
						className={classes.button}
						aria-label="add to tasks"
						variant="contained"
						key={props.name}
						onClick={goToSummaryPage}
					>
						Add
					</Button>
					{/* <IconButton className={classes.button} aria-label="share">
          <ShareIcon />
        </IconButton> */}
					<ExpandMore aria-label="show more">
						<Typography color="textSecondary">
							Slots available: {props.task.slots_available}
						</Typography>
					</ExpandMore>
				</CardActions>
			</Card>
			{/* <Card className={classes.root} onClick={() => {}} >
      <CardContent>
        <Grid item xs={10}>
            <Typography className={classes.locationField} color="textSecondary">
            <FaMapMarkerAlt/> {props.location}
            </Typography>
        </Grid>
        
        <Typography className={classes.title} align="left" gutterBottom>
          {props.name}
        </Typography>

        <Grid item xs={10}>
            <Typography color="textSecondary">
            {props.numVol} / {props.maxVol}
            </Typography>
          </Grid>
      </CardContent>
    </Card> */}
		</>
	);
}

// title
// location
