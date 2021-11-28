import React, { useState, useEffect, useRef } from "react";
import AreaCard from "../tasknearcard/tasknearcard.js";
import Grid from "@material-ui/core/Grid";
import Appbar from "../appbar/appbar.js";
import { connect } from "react-redux";
import { setAreas } from "../../redux/actions.js";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
const buildPath = require("../../redux/buildPath");

function FindTask(props) {
	const location = useLocation();

	const [areas, setAreas] = useState([]);
	var user_data = JSON.parse(localStorage.getItem("user_data"));
	var user_email = user_data.email;
	var user_id = user_data.id;
	var user_name = user_data.first_name;
	console.log(user_data);

	console.log(user_email);
	console.log(user_id);
	const [posts, setPosts] = useState([]);
	const [taskNear, setTasksNear] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [selected, setSelected] = useState({});
	let idTrack = useRef(null);

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
		async function handleSubmit() {
			console.log(buildPath("/vol/tasks"));
			console.log(user_data);
			var obj = { email: user_email };
			var js = JSON.stringify(obj);
			console.log(js);

			try {
				const response = await fetch(buildPath("/task/find" + user_email), {
					method: "GET",
					headers: { "Content-Type": "application/json" },
					// body: js,
				});
				console.log(response);
				var res = JSON.parse(await response.text());
				// console.log(res);
				if (res.error != null) {
					console.log(res.error);
				} else {
					console.log("success");
					//this is a check because the page might render twice and cause the call to fail
					//if the call fails and res is set then the structure is different from if it returned tasks
					//and we cans use the same syntax to parse it with map
					if (res != "no such user found") {
						// console.log("res: ", res);
						let tmpArray = [];
						for (var i = 0; i < res.length; i++) {
							if (!(res[i].vol_arr.indexOf(user_id) > -1)) {
								tmpArray.push(res[i]);
								console.log(
									"does it include? ",
									res[i].vol_arr,
									" user id: ",
									user_id
								);
								console.log(res[i].vol_arr.indexOf(user_id) > -1);
								console.log(tmpArray);

								// setPosts(res);
							}
						}
						setPosts(tmpArray);
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

		handleSubmit();
	}, []);

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

	function handleAdd() {}

	function generateCards() {
		let newArray = [];
		if (posts.length > 0) {
			return posts.map((task, index) => (
				<Grid item key={"Task" + task.id}>
					<AreaCard
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
			<Appbar title="Volunteer Tasks Near You" />
			<Grid
				container
				direction="row"
				spacing={2}
				// columnSpacing={{ xs: 1, sm: 2, md: 3 }}
				// justify="space-between"
				// spacing={{ xs: 2, md:  }}
				columns={{ xs: 4, sm: 8, md: 12 }}
				justifyContent="space-evenly"
				alignItems="flex-start"
			>
				{generateCards()}
				{/* {areasTest.map((area, index) => (
					<Grid item key={"area" + area.id}>
						<AreaCard
							name={area.name}
							location={area.location}
							numVol={area.numVol}
							maxVol={area.maxVol}
							description={area.description}
							miles={area.miles}
						/>
					</Grid>
				))} */}
			</Grid>
		</div>
	);
}

const mapStateToProps = (state) => {
	console.log(state);
	return {
		areas: state.areas,
	};
};

const mapDispatchToProps = { areaAction: setAreas };

export default connect(mapStateToProps, mapDispatchToProps)(FindTask);
