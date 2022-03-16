"use strict";

const map = {
    mapData: [[0,0,0,0,0,1,0,0,0,0,0],
        [0,1,0,1,0,1,1,1,1,1,0],
        [0,1,1,1,0,0,0,1,0,1,0],
        [0,1,0,1,0,1,1,1,0,1,0],
        [0,1,0,1,1,1,0,0,0,1,0],
        [0,1,0,0,0,1,0,0,1,1,0],
        [0,1,0,1,1,1,1,0,0,0,0],
        [0,0,0,1,0,0,1,0,1,0,0],
        [0,0,0,1,0,0,1,1,1,0,0],
        [0,1,1,1,0,1,1,0,1,1,0],
        [0,1,0,0,0,0,0,0,0,0,0]],
    startPos: 111,
    finishPos: 5
    };

const canvasSize = 600,
      challengeId = 2;

let step,
    finish;

// map
let mapObj,
    ctx,
    canvas;

// robot
const robots = [];
let robotObj;

let selectedRobotId,
    selectedOutput = null,
    outputCounter = [0, 0, 0, 0],
    positionToShow = {x: -1, y: -1};

let userAnswer = null;
const correctAnswer = true;

function init() {

    let start = initStartOrFinish(map.startPos);
    finish = initStartOrFinish(map.finishPos);

    canvas = document.getElementById("simulation");
    ctx = canvas.getContext('2d');

    let radius = (canvasSize / map.mapData.length) / 4;
    step = canvasSize / map.mapData.length;

    // create map object
    mapObj = new LabyrinthMap(map.mapData, "simple-map", map.startPos, map.finishPos, start, finish, canvas, canvasSize);

    // create robot object (wall follower)
    robotObj = new Pledge(4, start.x, start.y, Direction.up, radius);
    robots.push(robotObj);

    generateRobotTabs();

    draw(false, false, true);

}

function generateRobotTabs() {

    let grid = document.getElementById("robot-grid");
    let outputScreen = document.getElementById("output-screen");

    switch (robots.length) {
        case 1:
            grid.style.gridTemplateColumns = "auto";
            break;
        case 2:
            grid.style.gridTemplateColumns = "auto auto";
            break;
        case 3:
            grid.style.gridTemplateColumns = "auto auto auto";
            break;
        default:
            break;
    }

    for (let i = 1; i < robots.length + 1; i++) {
        let robotId = robots[i - 1].id;

        let gridItem = document.createElement("div");
        gridItem.setAttribute("id", "robot-grid-item-" + robotId);
        gridItem.setAttribute("class", "robot-grid-item");
        grid.appendChild(gridItem);

        let robImg = document.createElement("img");
        robImg.setAttribute("id", "robot-img-" + robotId);
        robImg.setAttribute("src", "../../../img/robot-" + robotId + ".png");
        robImg.setAttribute("class", "img-small");
        gridItem.appendChild(robImg);

        // create output div
        let output = document.createElement("div");
        output.setAttribute("id", "output-robot-" + robotId);
        output.setAttribute("class", "robot-output");
        outputScreen.appendChild(output);

        if (i === 1) {  // select the first robot
            selectedRobotId = parseInt(robots[i - 1].id);
            gridItem.style.backgroundColor = "var(--foreground)";
            gridItem.style.marginTop = "0";
            gridItem.style.opacity = "1";
            robImg.style.opacity = "1";
            output.style.display = "block";
        }
    }
}

function draw(showPosition, reset) {

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = "rgb(175,175,175)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    mapObj.drawMap(ctx, showPosition, reset, positionToShow);
    robotObj.drawPath(ctx, showPosition, reset, selectedRobotId);
    robotObj.drawRobot(ctx, showPosition, reset);

}

async function startSimulation() {

    while (!robotObj.finished) {
        if (robotObj.finishCheck(finish)) {
            continue;
        }
        robotObj.moveOneStep(map.mapData);
        draw(false, false, true);

        await sleep(200);
    }

    if (userAnswer === correctAnswer) {
        showModalTitle(true);
        saveChallengeAsCompleted();
    } else {
        showModalTitle(false);
    }
}

function initStartOrFinish(position) {

    let tempX = position % map.mapData.length;
    let tempY = Math.floor(position / map.mapData.length);

    return {x: tempX, y: tempY};
}

function addOutput(outputWrapperData, finished) {

    // create output-wrapper element
    let outputWrapper = document.createElement("div"); // create new div
    outputWrapper.setAttribute("id", "output-wrapper-robot-" + outputWrapperData[0].id + "-" + outputCounter[outputWrapperData[0].id - 1]);
    outputWrapper.setAttribute("class", "output-wrapper");

    if (!finished) {
        outputWrapper.setAttribute("onmouseover", "showPosition(" + outputWrapperData[0].id + ", " + outputCounter[outputWrapperData[0].id - 1] + ")");
        outputWrapper.setAttribute("onmouseleave", "stopShowingPosition()");
    }

    let outputScreen = document.getElementById("output-screen");
    outputScreen.appendChild(outputWrapper);

    for (let i = 0; i < outputWrapperData.length ; i++) {
        let output = document.createElement("code");
        output.setAttribute("class", "output-text");

        output.innerText = outputWrapperData[i].text;

        switch (outputWrapperData[i].style) {
            case 1:
                output.setAttribute("style", "color: lightGreen;");
                output.innerText += " \u2713 "; // check mark
                break;
            case 2:
                output.setAttribute("style", "color: white;");
                break;
            case 3:
                output.setAttribute("style", "color: indianRed;");
                output.innerText += " \u2717 "; // x mark
                break;
        }

        outputWrapper.appendChild(output);
    }

    // auto-scroll --> always show the latest output
    outputScreen.scrollTop = outputScreen.scrollHeight;

    // reset currentOutputWrapper
    // currentOutputWrapper = [];

    outputCounter[outputWrapperData[0].id - 1]++;
    // outputCounter++;
    // robOutputDivFinished[robotId] = true;
}

function showPosition(robotId, position) {

    position = parseInt(position);
    robotId = parseInt(robotId);
    let robot = robots[getIndexOfRobot(robotId)];

    // let coordinatePosition = robot.path[position];

    // positionToShow.x = Math.floor(coordinatePosition.x / step);
    // positionToShow.y = Math.floor(coordinatePosition.y / step);

    // positionToShow.x = coordinatePosition.x;
    // positionToShow.y = coordinatePosition.y;
    //
    // positionToShowIndex = position;

    positionToShow.x = robot.path[position].x;
    positionToShow.y = robot.path[position].y;

    draw(true, false);

    robot.drawPastPath(ctx, position);
    robot.drawPastPosition(position);
}

function stopShowingPosition() {
    draw(true, true);
}

function showModalTitle(success) {

    if (success) {
        document.getElementById("confirm-modal-title").innerText = "Challenge geschafft!";
        document.getElementById("modal-button-restart").style.display = "none";
        document.getElementById("modal-img").setAttribute("src", "../../../img/check.png");
        document.getElementById("confirm-modal-text").innerText = "In der Übersicht warten weitere spannende Challenges auf dich!";
    } else {
        document.getElementById("confirm-modal-title").innerText = "Challenge nicht geschafft!";
        document.getElementById("modal-img").setAttribute("src", "../../../img/cross.png");
        document.getElementById("confirm-modal-text").innerText = "Schau mal im Labor vorbei! Experimente mit unterschiedlichen Labyrinthen könnten dir dabei helfen die Algorithmen der Roboter besser zu verstehen.";
    }

    // showModal
    document.getElementById("confirm-modal").style.display = "block";

}

function goToPreviousPage() {
    window.history.back();
    document.location.href = "../challenge.html";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getIndexOfRobot(id) {
    for (let i = 0; i < robots.length; i++) {
        if (parseInt(robots[i].id) === id) {
            return i;
        }
    }
    return null;
}

document.getElementById("yes-button").addEventListener("click", () => {

    let yesButton = document.getElementById("yes-button");
    yesButton.style.background = "var(--secondary)";
    yesButton.disabled = true;
    document.getElementById("no-button").disabled = true;
    userAnswer = true;
    startSimulation();
});

document.getElementById("no-button").addEventListener("click", () => {

    let noButton = document.getElementById("no-button");
    noButton.style.background = "var(--secondary)";
    noButton.disabled = true;
    document.getElementById("yes-button").disabled = true;
    userAnswer = false;
    startSimulation();
});

document.getElementById("confirm-modal").onclick = function (event) {

    let confirmModal = document.getElementById("confirm-modal");

    if (event.target === confirmModal || event.target === document.getElementById("close-confirm-modal")) {
        confirmModal.style.display = "none";
    }
}

init();

// detect mouse hover over canvas
canvas.onmousemove = function (event) {

    let rect = this.getBoundingClientRect();
    let mouseX = event.clientX - rect.left; // pixel-coordinates
    let mouseY = event.clientY - rect.top;

    let posX = Math.floor(mouseX / step); // labyrinth-coordinates
    let posY = Math.floor(mouseY / step);

    if (positionToShow.x !== posX || positionToShow.y !== posY) { // detect if it's a new segment for less overhead

        positionToShow.x = posX;
        positionToShow.y = posY;

        if (mapObj.mapData[posY][posX] === 1) { // check if there's a way

            let robot = robots[getIndexOfRobot(selectedRobotId)];
            let outputIndex = getIndexOfOutput(robot, posX, posY);

            if (outputIndex != null) { // check if robot has visited this map-segment

                if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset old output

                draw(true, false);
                robot.drawPastPath(ctx, outputIndex);
                robot.drawPastPosition(outputIndex);

                // mark the corresponding output on the screen
                selectedOutput = document.getElementById("output-wrapper-robot-" + selectedRobotId + "-" + outputIndex);
                selectedOutput.setAttribute("class", "output-wrapper-highlighted"); // highlight output
                selectedOutput.scrollIntoView({block: "end", behavior: "smooth"}); // automatically scroll to the output element

            } else {
                draw(true, true);
                if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output
            }

        } else {
            draw(true, true);
            if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output
        }
    }
};

// checks if a robot has already visited a certain position and returns the index
function getIndexOfOutput(robot, posX, posY) {

    for (let i = robot.path.length-2; i >= 0; i--) {
        if (robot.path[i].x === posX && robot.path[i].y === posY) {
            return i;
        }
    }
    return null;
}

// reset highlighted output if mouse leaves canvas
canvas.onmouseleave = function () {

    positionToShow.x = null; // reset positionToShow
    positionToShow.y = null;
    if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output

    draw(true, true, false); // reset canvas
};

function restartChallenge() {
    document.location.href = "challenge-1.html";
}

function saveChallengeAsCompleted() {

    let completedChallenges = JSON.parse(localStorage.getItem("completed-challenges"));

    // check if challenge is already saved as completed
    for (let i = 0; i < completedChallenges.length; i++) {
        if (completedChallenges[i] === challengeId) {
            return;
        }
    }

    completedChallenges.push(challengeId);
    localStorage.setItem("completed-challenges", JSON.stringify(completedChallenges));
}


