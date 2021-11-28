import React, { useState, useRef, useEffect } from "react";
import TaskCard from "./coordinatortasklist";
import Grid from "@material-ui/core/Grid";
import Appbar from "../appbar/appbar.js";
import { useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { setAreas } from "../../redux/actions";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { useHistory } from "react-router-dom";
const buildPath = require("../../redux/buildPath");

export default function CoordinatorPage(props) {
	const location = useLocation();
	let history = useHistory();
	const [tasks, setTasks] = useState([]);
	const [selected, setSelected] = useState({});
	let idTrack = useRef(null);
	const [posts, setPosts] = useState([]);
	var user_data = JSON.parse(localStorage.getItem("user_data"));
	var user_email = user_data.email;
	var user_name = user_data.first_name;
	console.log(user_data);
	console.log(user_name);

	const style = {
		margin: 0,
		top: "auto",
		right: 20,
		bottom: 20,
		left: "auto",
		position: "fixed",
		backgroundColor: "#19AE59",
	};
	const fabStyle = {
		right: 20,
		position: "fixed",
	};
	/*
  useEffect(() => {
    setUserData(localStorage.getItem("user_data"));
  }, [user_data]);
  */

	useEffect(() => {
		if (props.areas && props.areas.length > 0) {
			let index = location.state | 0;
			setTasks(props.areas[index].tasks);
		}
	}, [props.areas]);

	useEffect(() => {
		if (tasks && tasks.length > 0 && Object.values(selected).length === 0) {
			let taskObj = {};
			tasks.forEach((task) => (taskObj[task.id] = false));
			setSelected(taskObj);
		}
	}, [tasks, selected]);

	useEffect(() => {
		async function getTasks() {
			console.log(buildPath("/coord/tasks"));
			var obj = { email: user_email };
			var js = JSON.stringify(obj);
			console.log(js);

			try {
				const response = await fetch(buildPath("/coord/tasks"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: js,
				});

				var res = JSON.parse(await response.text());
				if (res.error != null) {
					console.log(res.error);
				} else {
					console.log("success");
					//this is a check because the page might render twice and cause the call to fail
					//if the call fails and res is set then the structure is different from if it returned tasks
					//and we cans use the same syntax to parse it with map
					if (res != "no such user found") {
						setPosts(res);
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

		getTasks();
	}, []);

	//TODO: CALL API TO GET TASKS WITHIN THAT USER

	const handleSelect = (id) => {
		let newSelected = { ...selected };
		if (idTrack.current === null) {
			idTrack.current = id;
		}
		if (selected[id]) {
			// We are leaving the task
			//Socket.send(JSON.stringify({topic: "task", action: "leave", message: {id: id, action: "Leaving"}}));
			newSelected[id] = false;
			setSelected(newSelected);
		} else {
			// We are joining the task
			if (idTrack.current !== id) {
				//Socket.send(JSON.stringify({topic: "task", action: "leave", message: {id: idTrack.current, action: "Leaving"}}));
			}
			//Socket.send(JSON.stringify({topic: "task", action: "join", message: {id: id, action: "Joining"}}));
			for (const prop in newSelected) {
				newSelected[prop] = false;
			}
			newSelected[id] = true;
			setSelected(newSelected);
		}
		idTrack.current = id;
	};

	function generateCards() {
		if (posts.length > 0) {
			console.log(posts);
			return posts.map((task, index) => (
				<Grid item key={"Task" + task.id}>
					<TaskCard
						selected={selected[task.id]}
						handleSelected={handleSelect}
						id={task.id}
						task={task}
					/>
				</Grid>
			));
		}
	}

	return (
		<div>
			<Appbar title={user_name + "'s Task Created"} type="coordinator" />
			<Grid
				container
				direction="row"
				spacing={2}
				// columnSpacing={{ xs: 1, sm: 2, md: 3 }}
				// justify="space-between"
				// spacing={{ xs: 2, md:  }}
				columns={{ xs: 1, sm: 2, md: 3 }}
				justifyContent="space-evenly"
				alignItems="flex-start"
			>
				{generateCards()}
			</Grid>
			<Fab
				style={style}
				color="primary"
				aria-label="add"
				onClick={() => {
					history.push("/createTask");
				}}
			>
				<AddIcon />
			</Fab>
		</div>
	);
}
