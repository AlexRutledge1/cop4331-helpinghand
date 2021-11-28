import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import AccountCircle from "@material-ui/icons/AccountCircle";
import DateAndTimePickers from "../datePicker/datePicker.js";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import axios from "axios";
import { useState } from "react";
import Grid from "@material-ui/core/Grid";
import { useHistory } from "react-router-dom";
import Appbar from "../appbar/appbar.js";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import AutoComplete from "react-google-autocomplete";
import DateFnsUtils from "@date-io/date-fns";
import * as moment from "moment";

import {
	KeyboardDatePicker,
	MuiPickersUtilsProvider,
} from "@material-ui/pickers";
const buildPath = require("../../redux/buildPath");

const utilStyles = makeStyles((theme) => ({
	fields: {
		"& > *": {
			background: "#F1F1F1",
			marginTop: "20px",
			marginBottom: "20px",
			// backgroundColor: "#F1F1F1",
			opacity: "0.90",

			// color: "#263238",
		},
	},
	date: {
		marginTop: "20px",
	},
	margin: {
		marginTop: "10px",
		marginBottom: "10px",
		width: "20ch",
		background: "#F1F1F1",
		opacity: "0.90",
	},
	title: {
		marginTop: "40px",
	},
	button: {
		marginTop: "40px",
		backgroundColor: "#27AE60",
	},
	image: {
		marginTop: "70px",
		height: "300px",
		width: "382px",
		alignSelf: "center",
	},
}));

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: 40,
	},
	radio1: {
		width: "110px",
		marginBottom: 20,
		marginLeft: 0,
	},
	radio2: {
		width: "110px",
		marginLeft: 5,
	},
	radio3: {
		width: "110px",
		marginTop: 20,
		marginLeft: 0,
		marginBottom: 20,
	},
	image: {
		marginTop: "5px",
		height: "100px",
		justifySelf: "center",
	},
	button: {
		marginTop: "40px",
		width: "110px",
		height: "40px",
		backgroundColor: "#27AE60",
		color: "#FFFFFF",
	},
	buttonColor: {
		backgroundColor: "#27AE60",
		color: "#FFFFFF",
		"&:hover": {
			backgroundColor: "#197257",
			color: "#ffffff",
		},
	},
	tab: {
		fullWidth: true,
		textAlign: "center",
	},
	tabPanel: {
		textAlign: "center",
	},
	navbuttons: {
		width: "100%",
		textAlign: "center",
	},
}));

export default function EventRegistrationForm() {
	const utilStyle = utilStyles();
	const classes = useStyles();
	const [place, setLocation] = useState(null);
	const [lat, setLat] = useState("");
	const [long, setLong] = useState("");
	const [date, setDate] = React.useState(new Date("2014-08-18"));

	const [description, setDescription] = useState(""); // '' is the initial state value
	const [title, setTitle] = useState(""); // '' is the initial state value
	const [locationInput, setLocationInput] = useState(""); // '' is the initial state value
	const [maxVol, setMaxVol] = useState(""); // '' is the initial state value
	let res;
	let history = useHistory();
	const [selectedDate, handleDateChange] = useState(new Date());
	var user_data = JSON.parse(localStorage.getItem("user_data"));
	var user_email = user_data.email;
	console.log(user_email);

	function isEmpty() {
		if (
			title.length <= 0 ||
			description.length <= 0 ||
			selectedDate.length <= 0 ||
			maxVol.length <= 0 ||
			place.formatted_address <= 0
		) {
			return true;
		}
	}

	async function handleSubmit(event) {
		// role has just been added , Api needs to add to api call console.log(role);
		// and make the call based on the value of role
		// register role as well i assume
		event.preventDefault();
		if (!isEmpty()) {
			if (place != null) {
				var lati = place.geometry.location.lat();
				var lng = place.geometry.location.lng();
				console.log(lati, lng);
			}
			console.log(place.formatted_address);
			const beginDate = moment(selectedDate).format("YYYY-MM-DD");
			console.log("ddate: ", beginDate);
			console.log(selectedDate);
			var obj = {
				name: title,
				description: description,
				date: beginDate,
				max_slots: maxVol,
				latitude: lati,
				longitude: lng,
				email: user_email,
				address: place.formatted_address,
			};
			var js = JSON.stringify(obj);

			try {
				const response = await fetch(buildPath("/task/create"), {
					method: "POST",
					body: js,
					headers: { "Content-Type": "application/json" },
				});

				var res = JSON.parse(await response.text());
				if (res.id < 0) {
					// setMessage(res.error);
				} else {
					var user = {
						id: res.id,
					};
					console.log(user);

					history.push("/coordinatorPage");
				}
			} catch (e) {
				return;
			}
		} else {
			alert("Please fill out required fields.");
		}
	}

	return (
		<>
			<Appbar title={"Create New Task"} />
			<Grid container direction="column" justify="center" alignItems="center">
				<Grid
					className={classes.root}
					item
					xs={12}
					sm={8}
					md={5}
					component={Paper}
					elevation={6}
					square
				>
					<Box
						sx={{
							my: 8,
							mx: 4,
							width: "400px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<Box
							component="form"
							noValidate
							onSubmit={handleSubmit}
							sx={{ my: 0, mx: 0, width: "400px" }}
						>
							<TextField
								margin="normal"
								required
								fullWidth
								id="title"
								label="Title"
								name="title"
								autoComplete="title"
								autoFocus
								onChange={(event) => setTitle(event.target.value)}
							/>
							<TextField
								marginBottom="normal"
								required
								fullWidth
								name="description"
								label="Description"
								type="description"
								id="description"
								onChange={(event) => setDescription(event.target.value)}
							/>
							<TextField
								marginBottom="normal"
								required
								fullWidth
								name="maxVol"
								label="Number of Volunteers"
								type="maxVol"
								id="maxVol"
								onChange={(event) => setMaxVol(event.target.value)}
							/>

							<AutoComplete
								placeholder="Location*"
								apiKey="AIzaSyCVF0U1KIXIVF3WkEhJ84Ps3EnlKt4NtO4"
								required
								style={{
									width: "100%",
									fontSize: 16,
									// height: 60,
									marginTop: "1.5rem",
									marginBottom: "0.5rem",
									// backgroundColor: "#eee",
									display: "inline-block",
									borderBottom: "1px solid rgb(112, 111, 111)",
								}}
								//  predefinedPlacesDescription: {
								//    color: '#1faadb',
								//  }, }}
								variant="outlined"
								onPlaceSelected={(place) => setLocation(place)}
								options={{
									types: ["address"],
									componentRestrictions: { country: "us" },
								}}
							/>
							<MuiPickersUtilsProvider
								style={{ marginTop: "1.5rem" }}
								utils={DateFnsUtils}
							>
								<KeyboardDatePicker
									style={{ marginTop: "1.5rem" }}
									autoOk
									variant="inline"
									inputVariant="outlined"
									label="Date of Task*"
									format="MM/dd/yyyy"
									value={selectedDate}
									InputAdornmentProps={{ position: "start" }}
									onChange={(date) => handleDateChange(date)}
								/>
							</MuiPickersUtilsProvider>

							<Grid container></Grid>

							<Button
								className={classes.buttonColor}
								type="submit"
								fullWidth
								style={{ marginTop: "1.5rem" }}
								variant="contained"
								sx={{ mt: 3, mb: 2 }}
							>
								Create
							</Button>
						</Box>
					</Box>
				</Grid>
			</Grid>
		</>
	);
	// <>
	//     <Appbar title="New Task Form" />
	//     <Grid
	//         container
	//         direction="column"
	//         justify="center"
	//         alignItems="center"
	//     >
	//         {/* <Grid item>
	//             <p className={utilStyle.title}
	//             >New Task</p>
	//         </Grid> */}
	//         <Grid item className={utilStyle.title}>
	//             <TextField
	//                 className={utilStyle.margin}
	//                 value={taskInput}
	//                 onInput={e => setTaskInput(e.target.value)}
	//                 id="Task-name"
	//                 label="Task name?"
	//             />
	//         </Grid>
	//         <Grid item>
	//             <TextField
	//                 className={utilStyle.margin}
	//                 id="description"
	//                 label="Description?"
	//                 value={description}
	//                 onInput={e => setDescription(e.target.value)}
	//             />
	//         </Grid>
	//         <Grid item>
	//             <TextField
	//                 className={utilStyle.margin}
	//                 id="maxVol"
	//                 label="How many volunteers are needed?"

	//                 value={maxVol}
	//                 onInput={e => setMaxVol(e.target.value)}
	//             />
	//         </Grid>
	//         <Grid item>
	//             <TextField
	//                 className={utilStyle.margin}
	//                 id="location"
	//                 label="Location?"
	//                 value={locationInput}
	//                 onInput={e => setLocationInput(e.target.value)}
	//             />
	//         </Grid>
	//         <Grid item>
	//             <Button
	//                 className={utilStyle.button}
	//                 onClick={() => { handleSubmit() }}>Submit</Button>
	//         </Grid>
	//         <Grid item>
	//              <img className={utilStyle.image} src="/images/help.png"></img>
	//         </Grid>
	//     </Grid>
	// </>

	// );
}
