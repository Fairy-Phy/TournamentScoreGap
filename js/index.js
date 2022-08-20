// Copyright 2022 (Fairy)Phy


// socket init //

const socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");

socket.onopen = () => {
	console.log("Successfully Connected");
};

socket.onclose = event => {
	console.log("Socket Closed Connection: ", event);
	socket.send("Client Closed!");
};

socket.onerror = error => {
	console.log("Socket Error: ", error);
};

// init //

const team_scale = chroma.scale(["lightcoral", "white", "lightskyblue"]).domain([-1000, 0, 1000]);

const scoreCount = new countUp.CountUp("score", 0, {
	prefix: "Score Gap: "
});
if (scoreCount.error)
	console.error(scoreCount.error);

scoreCount.start();

const score_element = $("#score");

const color_change = s => {
	const col = team_scale(s).css();
	score_element.css({
		"color": col,
		"-webkit-text-stroke": `1px ${col}`
	});
};
color_change(0);

let prev_state = 0;
let prev_score_gap = 0;

// main //

socket.onmessage = async event => {
	const osu_status = JSON.parse(event.data);

	const tourney = osu_status.tourney.manager;
	if (tourney.ipcState == 1 && prev_state != 1) {
		score_element.fadeOut();
		scoreCount.reset();
	}
	else if (tourney.ipcState == 3) {
		const scores = tourney.gameplay.score;
		const score_gap = scores.right - scores.left;
		if (prev_score_gap != score_gap || prev_state != tourney.ipcState) {
			if (prev_state != tourney.ipcState) {
				score_element.fadeIn();
			}
			scoreCount.update(Math.abs(score_gap));
			color_change(score_gap);
			prev_score_gap = score_gap;
		}
	}

	prev_state = tourney.ipcState;
};
