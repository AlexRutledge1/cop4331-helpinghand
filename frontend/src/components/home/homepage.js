import React, { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import Appbar from "../appbar/appbar.js";
import { styled } from "@mui/material/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import { useSpring, animated } from "react-spring";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import { setAreas } from "../../redux/actions.js";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { sizing } from "@mui/system";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import AutoComplete from "react-google-autocomplete";

import "./homepage.css";
import Particles from "react-tsparticles";
import "react-tabs/style/react-tabs.css";
import { FaCentercode } from "react-icons/fa";
// import { sendConfirmationEmail } from "../../mailer.js";

const buildPath = require("../../redux/buildPath");

function AccessCodePage(props) {
	const classes = useStyles();
	//const location = useLocation();
	let history = useHistory();
	const [registrationFormStatus, setRegistartionFormStatus] = useState(false);

	const loginBtnProps = useSpring({
		borderBottom: registrationFormStatus
			? "solid 0px transparent"
			: "solid 2px #1059FF",
		color: registrationFormStatus ? "#808080" : "#27AE60",
		fontSize: "15px",
	});
	const registerBtnProps = useSpring({
		borderBottom: registrationFormStatus
			? "solid 2px #1059FF"
			: "solid 0px transparent",
		color: registrationFormStatus ? "#27AE60" : "#808080",
		fontSize: "15px",
	});

	function registerClicked() {
		setRoleShown(false);
		setRegistartionFormStatus(true);
	}
	function loginClicked() {
		setRoleShown(true);
		setRegistartionFormStatus(false);
	}

	const [roleShown, setRoleShown] = useState(true);
	const apiKey = "AIzaSyCVF0U1KIXIVF3WkEhJ84Ps3EnlKt4NtO4";
	//login
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("Volunteer");

	const [place, setLocation] = useState(null);
	const [lat, setLat] = useState("");
	const [long, setLong] = useState("");

	//register
	// const [location, setLocation] = useState(null);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [registerEmail, setRegisterEmail] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");
	// const [longitude, setLongitude] = useState(0);
	// const [latitude, setLatitude] = useState(0);
	const [distance, setDistance] = useState(0);
	const [registerRole, setRegisterRole] = useState("Volunteer");
	console.log(place);

	//submit login
	async function handleSubmit(event) {
		// role has just been added , Api needs to add to api call console.log(role);
		// and make the call based on the value of role
		// register role as well i assume
		event.preventDefault();
		console.log(email);
		console.log(password);
		if (!isLoginEmpty()) {
			var obj = { email: email, password: password };
			var js = JSON.stringify(obj);

			try {
				const response = await fetch(buildPath("/vol/login"), {
					method: "POST",
					body: js,
					headers: { "Content-Type": "application/json" },
				});

				var res = JSON.parse(await response.text());
				if (res.id < 0) {
					setMessage(res.error);
				} else {
					console.log(res.id);
					var user = {
						first_name: res.first_name,
						last_name: res.last_name,
						email: res.email,
						id: res.id,
					};
					console.log(user);
					console.log("userID: ", user.id);
					localStorage.setItem("user_data", JSON.stringify(user));

					setMessage("");
					console.log(role);
					if (role == "Volunteer") {
						history.push("/findtask");
					} else {
						history.push("/coordinatorPage");
					}
				}
			} catch (e) {
				alert(e.toString());
				return;
			}
		} else {
			window.alert("Please fill out all required fields.");
		}
	}

	//handle submit registration moved from createvolunteer
	async function handleRegistration(event) {
		event.preventDefault();
		//check if fields are empty, if it is give popup
		if (!isEmpty()) {
			if (registerRole == "Volunteer") {
				//get Location
				if (place != null) {
					console.log(place.formatted_address);
					var lati = place.geometry.location.lat();
					var lng = place.geometry.location.lng();
					console.log(lat, long);
				}

				var obj = {
					email: registerEmail,
					password1: password1,
					password2: password2,
					first_name: firstName,
					last_name: lastName,
					longitude: lng,
					latitude: lati,
					accepted_distance: distance,
				};

				var js = JSON.stringify(obj);

				try {
					const response = await fetch(buildPath("/vol/register"), {
						method: "POST",
						body: js,
						headers: { "Content-Type": "application/json" },
					});

					var res = JSON.parse(await response.text());

					if (res.id == -1) {
						alert(JSON.stringify(res.error));
					} else {
						var user = {
							first_name: res.first_name,
							last_name: res.last_name,
							id: res.id,
							email: res.email,
						};
						localStorage.setItem("user_data", JSON.stringify(user));

						setMessage("");
						// await sendConfirmationEmail({toUser: user.email, hash: user.id});
						history.push("/findtask"); // would this be history.push areas as well
					}
				} catch (e) {
					// alert(e.toString());
					return;
				}
			} else {
				var obj = {
					email: registerEmail,
					password1: password1,
					password2: password2,
					first_name: firstName,
					last_name: lastName,
				};

				var js = JSON.stringify(obj);

				try {
					const response = await fetch(buildPath("/coord/register"), {
						method: "POST",
						body: js,
						headers: { "Content-Type": "application/json" },
					});

					var res = JSON.parse(await response.text());

					if (res.id == -1) {
						alert(JSON.stringify(res.error));
					} else {
						var user = {
							first_name: res.first_name,
							last_name: res.last_name,
							id: res.id,
							email: res.email,
						};
						localStorage.setItem("user_data", JSON.stringify(user));
						// await sendConfirmationEmail({toUser: user.email, hash: user.id});
						history.push("/coordinatorPage"); // would this be history.push areas as well
					}
				} catch (e) {
					// alert(e.toString());
					return;
				}
			}
		} else {
			window.alert("Please fill out all required fields.");
		}
	}

	function isEmpty() {
		if (registerRole === "Coordinator") {
			if (
				registerEmail.length <= 0 ||
				password1.length <= 0 ||
				password2.length <= 0 ||
				firstName.length <= 0 ||
				lastName.length <= 0
			) {
				return true;
			}
		} else {
			if (
				registerEmail.length <= 0 ||
				password1.length <= 0 ||
				password2.length <= 0 ||
				firstName.length <= 0 ||
				lastName.length <= 0 ||
				distance.length <= 0 ||
				place.length <= 0
			) {
				return true;
			}
		}
	}

	function isLoginEmpty() {
		if (email.length <= 0 || password.length <= 0) {
			return true;
		}
	}

	return (
		<>
			<Appbar title={"Home Page"} />
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
					<div className={classes.navbuttons}>
						<animated.button
							onClick={loginClicked}
							id="loginBtn"
							style={loginBtnProps}
						>
							Login
						</animated.button>
						<animated.button
							onClick={registerClicked}
							id="registerBtn"
							style={registerBtnProps}
						>
							Register
						</animated.button>
					</div>
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
						<Grid item className={classes.tabPanel}>
							<img className={classes.image} src="/images/Logo.png"></img>
						</Grid>
						{roleShown ? getLogin() : getRegister()}
					</Box>
				</Grid>
			</Grid>
		</>
	);

	function getLogin() {
		return (
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
					id="email"
					label="Email Address"
					name="email"
					autoComplete="email"
					autoFocus
					onChange={(event) => setEmail(event.target.value)}
				/>
				<TextField
					marginBottom="normal"
					required
					fullWidth
					name="password"
					label="Password"
					type="password"
					id="password"
					autoComplete="current-password"
					onChange={(event) => setPassword(event.target.value)}
				/>

				<Grid container>
					<Grid
						item
						style={{
							marginTop: "22px",
							marginRight: "10px",
						}}
					>
						Role:
					</Grid>
					<Grid item>
						<RadioGroup
							aria-label="Role"
							defaultValue="Volunteer"
							name="role-buttons-group"
							label="test"
							style={{
								flexDirection: "row",
								marginTop: "15px",
								marginBottom: "15px",
								color: "#808080",
							}}
						>
							<FormControlLabel
								value="Volunteer"
								control={<BpRadio />}
								label="Volunteer"
								onChange={(event) => setRole(event.target.value)}
							/>
							<FormControlLabel
								value="Coordinator"
								control={<BpRadio />}
								label="Coordinator"
								onChange={(event) => setRole(event.target.value)}
							/>
						</RadioGroup>
					</Grid>
				</Grid>

				<Button
					className={classes.buttonColor}
					type="submit"
					fullWidth
					variant="contained"
					sx={{ mt: 3, mb: 2 }}
				>
					Sign In
				</Button>
				<Grid container>
					<Grid item xs>
						<Link href="/forgot" variant="body2">
							Forgot password?
						</Link>
					</Grid>
				</Grid>
			</Box>
		);
	}

	function getRegister() {
		return (
			<Box
				component="form"
				noValidate
				onSubmit={handleRegistration}
				sx={{ mb: 1 }}
			>
				<TextField
					margin="normal"
					required
					fullWidth
					id="firstName"
					label="First Name"
					name="firstName"
					autoComplete="firstName"
					autoFocus
					onChange={(event) => setFirstName(event.target.value)}
				/>
				<TextField
					margin="normal"
					required
					fullWidth
					id="lastName"
					label="Last Name"
					name="lastName"
					autoComplete="lastName"
					onChange={(event) => setLastName(event.target.value)}
				/>
				<TextField
					margin="normal"
					required
					fullWidth
					id="registerEmail"
					label="Email Address"
					name="email"
					autoComplete="email"
					onChange={(event) => setRegisterEmail(event.target.value)}
				/>
				<TextField
					margin="normal"
					required
					fullWidth
					id="password1"
					label="Password"
					name="password1"
					type="password"
					autoComplete="password1"
					onChange={(event) => setPassword1(event.target.value)}
				/>
				<TextField
					margin="normal"
					required
					fullWidth
					id="password2"
					label="Confirm Password"
					name="password2"
					type="password"
					autoComplete="password1"
					onChange={(event) => setPassword2(event.target.value)}
				/>
				<Grid container>
					<Grid
						item
						style={{
							marginTop: "22px",
							marginRight: "10px",
						}}
					>
						Role:
					</Grid>
					<Grid item>
						<RadioGroup
							aria-label="Role"
							defaultValue="Volunteer"
							name="register-role-buttons-group"
							style={{
								flexDirection: "row",
								marginTop: "15px",
								marginBottom: "15px",
								color: "#808080",
							}}
						>
							<FormControlLabel
								value="Volunteer"
								control={<BpRadio />}
								label="Volunteer"
								onChange={(event) => setRegisterRole(event.target.value)}
							/>
							<FormControlLabel
								value="Coordinator"
								control={<BpRadio />}
								label="Coordinator"
								onChange={(event) => setRegisterRole(event.target.value)}
							/>
						</RadioGroup>
					</Grid>
				</Grid>
				<>
					{registerRole === "Volunteer" && (
						<Grid>
							{/* <input
								id="searchTextField"
								type="text"
								size="50"
								placeholder="Select Your Location"
							></input> */}
							<Grid>
								<AutoComplete
									placeholder="Current Location*"
									apiKey="AIzaSyCVF0U1KIXIVF3WkEhJ84Ps3EnlKt4NtO4"
									required
									style={{
										width: "100%",
										fontSize: 16,
										// height: 60,
										// margin: "0.5rem",
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
							</Grid>
							{/* <GooglePlacesAutocomplete
								selectProps={{
									location,
									onChange: setLocation,
								}}
								style={{ width: 100 }}
								apiOptions={{ region: "us" }}
								apiKey="AIzaSyCVF0U1KIXIVF3WkEhJ84Ps3EnlKt4NtO4"
							/> */}

							<TextField
								margin="normal"
								required
								fullWidth
								name="distance"
								label="Maximum Distance to Volunteer"
								id="distance"
								autoComplete="distance"
								onChange={(event) => setDistance(event.target.value)}
							/>
							{/* <TextField
								margin="normal"
								required
								fullWidth
								id="longitude"
								label="longitude"
								name="longitude"
								autoComplete="longitude"
								onChange={(event) => setLongitude(event.target.value)}
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								name="latitude"
								label="latitude"
								id="latitude"
								autoComplete="latitude"
								onChange={(event) => setLatitude(event.target.value)}
							/> */}
						</Grid>
					)}
				</>
				<div>
					<Button
						className={classes.buttonColor}
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
						style={{ marginTop: 15 }}
					>
						Complete Registration
					</Button>
				</div>
			</Box>
		);
	}
}

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

const BpIcon = styled("span")(({ theme }) => ({
	borderRadius: "50%",
	width: 16,
	height: 16,
	boxShadow:
		theme.palette.mode === "dark"
			? "0 0 0 1px rgb(16 22 26 / 40%)"
			: "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
	backgroundColor: theme.palette.mode === "dark" ? "#394b59" : "#f5f8fa",
	backgroundImage:
		theme.palette.mode === "dark"
			? "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))"
			: "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
	".Mui-focusVisible &": {
		outline: "2px auto rgba(19,124,189,.6)",
		outlineOffset: 2,
	},
	"input:hover ~ &": {
		backgroundColor: theme.palette.mode === "dark" ? "#30404d" : "#ebf1f5",
	},
	"input:disabled ~ &": {
		boxShadow: "none",
		background:
			theme.palette.mode === "dark"
				? "rgba(57,75,89,.5)"
				: "rgba(206,217,224,.5)",
	},
}));

const BpCheckedIcon = styled(BpIcon)({
	backgroundColor: "#137cbd",
	backgroundImage:
		"linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
	"&:before": {
		display: "block",
		width: 16,
		height: 16,
		backgroundImage: "radial-gradient(#fff,#fff 28%,transparent 32%)",
		content: '""',
	},
	"input:hover ~ &": {
		backgroundColor: "#106ba3",
	},
});

function BpRadio(props) {
	return (
		<Radio
			sx={{
				"&:hover": {
					bgcolor: "transparent",
				},
			}}
			disableRipple
			color="default"
			checkedIcon={<BpCheckedIcon />}
			icon={<BpIcon />}
			{...props}
		/>
	);
}

const mapDispatchToProps = { areaAction: setAreas };

export default connect(null, mapDispatchToProps)(AccessCodePage);
