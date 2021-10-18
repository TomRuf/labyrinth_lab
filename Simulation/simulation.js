const Direction = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right'
};

let ctx = null,
    canvasSize = null,
    simulation = {},
    robots = [], // consisting of robot objects with: id, color, posX, posY, currentDirection, path, finished
    step = null,
    radius = null,
    pathWidth = null,
    autoMoveActivated = false;

const outputScreen = document.getElementById("output-screen"),
    canvas = document.getElementById("simulation"),
    robotModal = document.getElementById("robot-modal"),
    closeRobot = document.getElementById("close-robot-modal"),
    modalTitle = document.getElementById("modalTitle"),
    extraInformationText = document.getElementById("extra-information-text"),
    algorithmText = document.getElementById("algorithm-text"),
    robotGrid = document.getElementById("robot-grid");

const darkGrey = "#808080",
    lightGrey = "#D3D3D3",
    lightGreen = "#B8FF9D",
    robotColors = ["", "#f3dd7e", "#88c56e", "#6eb4c5", "#c56e6e", "#999999"],
    robotNames = ["", "Wall", "Trem", "Aria", "Pledge", "Rando"];

let selectedRobotId = null,
    robOutputCounter = [], // the number of outputs for every robot
    positionToShow = {x: null, y: null},
    positionToShowIndex = null,
    selectedOutput = null;

let start = {},
    finish = {};

const robotDirections = [Direction.right, Direction.up, Direction.left, Direction.down],
    robotDecisions = [{x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}];


function init() {

    //canvas = document.getElementById("simulation");
    canvasSize = 700;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx = canvas.getContext('2d');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // get map
    simulation.map = JSON.parse(urlParams.get("map"));

    radius = (canvasSize / simulation.map.length) / 4;
    pathWidth = radius / 1.5;
    step = canvasSize / simulation.map.length;

    // get start and finish position
    let startPos = parseInt(urlParams.get("start"));
    let finishPos = parseInt(urlParams.get("finish"));
    start = initStartOrFinish(startPos);
    finish = initStartOrFinish(finishPos);

    // get robots
    let temp = urlParams.get("robots");
    initRobots(temp.split("_"));

    // generate robot tabs
    generateRobotTabs();

    if (robots.length === 1) {
        addLogicStepButton();
    }

    draw(false, false, true);
}

function addLogicStepButton() {
    let grid = document.getElementById("button-grid");
    grid.style.gridTemplateColumns = "auto auto auto";

    let gridItem = document.createElement("div");
    gridItem.setAttribute("class", "button-grid-item");

    grid.insertBefore(gridItem, grid.children[0]);

    let button = document.createElement("button");
    button.setAttribute("class", "button navigation-button");
    button.setAttribute("onclick", "logicStep()");
    button.innerText = "\u203A";

    gridItem.appendChild(button);
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
        robImg.setAttribute("src", "../img/robot-" + robotId + ".png");
        robImg.setAttribute("class", "img-small");
        gridItem.appendChild(robImg);

        // create output div
        let output = document.createElement("div");
        output.setAttribute("id", "output-robot-" + robotId);
        output.setAttribute("class", "robot-output");
        outputScreen.appendChild(output);

        if (i === 1) {  // select the first robot
            selectedRobotId = parseInt(robots[i - 1].id);
            gridItem.style.backgroundColor = "var(--darkGrey)";
            gridItem.style.marginTop = "0";
            gridItem.style.opacity = "1";
            robImg.style.opacity = "1";
            output.style.display = "block";
        }
    }
}

function initStartOrFinish(position) {

    let tempX = position % simulation.map.length;
    let tempY = Math.floor(position / simulation.map.length);

    return {x: tempX, y: tempY};
}

function initRobots(robotIds) {

    for (let i = 0; i < robotIds.length; i++) {
        robots.push({
            id: robotIds[i], color: robotColors[robotIds[i]], posX: start.x, posY: start.y,
            currentDirection: Direction.up, path: [], pastDirections: [], finished: false
        });
        robOutputCounter[robotIds[i]] = 0;
    }
}

/**
 * draws the map, paths and robots
 * @param showPosition true if canvas is drawn to show a past position
 * @param reset true if showPosition needs to be reset
 * @param moved true if the robot changed position
 */
function draw(showPosition, reset, moved) {

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    drawMap(showPosition, reset);

    let selected = null;

    for (let i = 0; i < robots.length; i++) {
        // skip selected robot (draw it later on top)
        if (parseInt(robots[i].id) !== parseInt(selectedRobotId)) {
            computePath(robots[i], showPosition, moved);
            drawPath(robots[i], showPosition, reset);
        } else {
            selected = i;
        }
    }

    // draw marks of Tremaux if selected
    if (marked.length !== 0 && selectedRobotId === 2) {
        drawTremauxMarks(showPosition, reset);
    }

    // draw selected robot as last to be on top
    computePath(robots[selected], showPosition, moved);
    drawPath(robots[selected], showPosition, reset);

    // draw ariadne thread if selected
    if (ariadneThread.length !== 0 && selectedRobotId === 3) {
        drawAriadneThread(showPosition, reset);
    }

    for (let i = 0; i < robots.length; i++) {
        if (i !== selected) {
            drawRobot(robots[i], showPosition, reset);
        }
    }
    drawRobot(robots[selected], showPosition, reset);

    // if showPosition: draw past position of the robot
    if (showPosition && positionToShow.x !== null && !reset) {
        // draw past path
        drawPastPath(robots[selected], positionToShowIndex);

        // if selected, draw past ariadne thread
        if (ariadneThread.length !== 0 && selectedRobotId === 3) drawPastAriadneThread();

        //draw past position
        drawPastPosition(robots[selected]);
    }
}

function drawTremauxMarks(showPosition, reset) {

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    if (showPosition && !reset) {
        for (let i = 0; i < marksToDraw.length; i++) {
            if (marksToDraw[i].pathIndex <= positionToShowIndex) {
                ctx.fillRect(marksToDraw[i].x, marksToDraw[i].y, marksToDraw[i].w, marksToDraw[i].h);
            } else {
                break;
            }
        }
    } else {
        for (let i = 0; i < marksToDraw.length - hiddenMarks; i++) {
            ctx.fillRect(marksToDraw[i].x, marksToDraw[i].y, marksToDraw[i].w, marksToDraw[i].h);
        }
    }
}

function drawAriadneThread(showPosition, reset) {

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();

    let offset = computeOffset(3);

    if (!showPosition || reset) {
        for (let i = 0; i < ariadneThread.length; i++) {
            i === 0 ? ctx.moveTo(ariadneThread[0].x * step + step/2 + offset, ariadneThread[0].y * step + step/2 + offset) : ctx.lineTo(ariadneThread[i].x * step + step/2 + offset, ariadneThread[i].y * step + step/2 + offset);
        }
    }
    ctx.lineWidth = pathWidth/3;
    ctx.stroke();
}

/**
 * computes the position offset of a robot according to its number in the robots array --> first = middle, second = right, third = left
 * @param robotId
 * @returns {null|number} returns the offset in pixel
 */
function computeOffset(robotId) {
    let number = getIndexOfRobot(robotId);
    if (number === 0) return 0;
    else if (number === 1) return pathWidth;
    else if (number === 2) return -pathWidth;
}

/**
 * draws an ariadne thread from the past
 */
function drawPastAriadneThread() {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();

    let offset = computeOffset(3);

    let threadArray = pastAriadneThreads[positionToShowIndex-1];
    if (threadArray !== undefined) {
        for (let i = 0; i < threadArray.length; i++) {
            i === 0 ? ctx.moveTo(threadArray[0].x * step + step/2 + offset, threadArray[0].y * step + step/2 + offset) : ctx.lineTo(threadArray[i].x * step + step/2 + offset, threadArray[i].y * step + step/2 + offset);
        }
    }

    ctx.lineWidth = pathWidth/3;
    ctx.stroke();
}

/**
 * draws the map
 */
function drawMap(showPosition, reset) {
    const h = canvasSize / simulation.map.length;
    for (let y = 0; y < simulation.map.length; y++) {
        let row = simulation.map[y];
        let w = canvasSize / row.length;
        for (let x = 0; x < row.length; x++) {
            let c = row[x];
            ctx.beginPath();

            if (c === 0) {
                ctx.fillStyle = darkGrey;
            } else {
                ctx.fillStyle = lightGrey;
            }

            // draw position from output-mouseover
            if (showPosition && !reset && positionToShow.x === x && positionToShow.y === y) {
                ctx.fillStyle = lightGreen;
            }

            // draw checkerboard-pattern if current position = finish position
            if (x === finish.x && y === finish.y) {

                let squareSize = w / 5;
                ctx.rect(w * x, h * y, w - 0.2, h - 0.2);

                let counter = 0;
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 5; j++) {
                        counter % 2 === 0 ? ctx.fillStyle = "#181818" : ctx.fillStyle = "#ffffff";
                        ctx.fillRect(w * x + squareSize * j, h * y + squareSize * i, squareSize, squareSize);
                        counter++;
                    }
                }
                continue;
            }
            ctx.rect(w * x, h * y, w - 0.2, h - 0.2);
            ctx.fill();
        }
    }
}

function computePath(robot, showPosition, moved) {

    // add offset to the path to prevent overlapping
    let offset = computeOffset(parseInt(robot.id));

    let posX = (robot.posX * step) + step / 2 + offset;
    let posY = (robot.posY * step) + step / 2 + offset;

    if (!showPosition && moved) { // only push path if robot moved & if the canvas isn't redrawn to show past position
        robot.path.push({x: posX, y: posY});
        robot.pastDirections.push(robot.currentDirection); // push currentDirection
    }
}

/**
 * draws the covered path
 */
function drawPath(robot, showPosition, reset) {

    ctx.beginPath();

    for (let i = 0; i < robot.path.length; i++) {
        i === 0 ? ctx.moveTo(robot.path[0].x, robot.path[0].y) : ctx.lineTo(robot.path[i].x, robot.path[i].y);
    }

    if (!showPosition || reset) {
        if (parseInt(selectedRobotId) === parseInt(robot.id)) {
            ctx.strokeStyle = robot.color;
        } else {
            let rgb = robot.color.convertToRGB();
            ctx.strokeStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 0.4)";
        }
    } else {
        let rgb = robot.color.convertToRGB();
        ctx.strokeStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 0.2)";
    }

    ctx.lineWidth = pathWidth;
    ctx.stroke();
}

/**
 * draws an path from the past up to a certain index
 * @param robot
 * @param index the index of the past position
 */
function drawPastPath(robot, index) {

    ctx.beginPath();

    for (let i = 0; i <= index; i++) {
        i === 0 ? ctx.moveTo(robot.path[0].x, robot.path[0].y) : ctx.lineTo(robot.path[i].x, robot.path[i].y);
    }

    ctx.strokeStyle = robot.color;
    ctx.lineWidth = pathWidth;
    ctx.stroke();
}

String.prototype.convertToRGB = function () {

    // delete #
    let color = this.substring(1);

    const aRgbHex = color.match(/.{1,2}/g);
    return [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
}


const directionArrows = ['\u2B9D', '\u2B9C', '\u2B9F', '\u2B9E']; // [up, left, down, right]
/**
 * draws the robot
 */
function drawRobot(robot, showPosition, reset) {

    let alpha = 0.2;

    ctx.beginPath();

    if (showPosition && !reset) {
        let rgb = robot.color.convertToRGB();
        ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", " + alpha + ")";
    } else {
        ctx.fillStyle = robotColors[robot.id];
    }

    let posX = robot.path[robot.path.length - 1].x;
    let posY = robot.path[robot.path.length - 1].y;

    ctx.arc(posX, posY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // show direction of robot
    if (showPosition && !reset) {
        ctx.fillStyle = "rgba(24, 24, 24, " + alpha + ")";
    } else {
        ctx.fillStyle = "rgb(24, 24, 24)";
    }
    ctx.font = radius + 'px Arial';
    ctx.textAlign = "center";

    // draw direction-arrow
    let direction = computeDirectionNumber(robot.currentDirection);
    ctx.fillText(directionArrows[direction], posX, posY + radius / 3);
}

function drawPastPosition(robot) {
    let showPosX = robot.path[positionToShowIndex].x;
    let showPosY = robot.path[positionToShowIndex].y;

    // body
    ctx.beginPath();
    ctx.fillStyle = robot.color;
    ctx.font = radius + 'px Arial';
    ctx.textAlign = "center";
    ctx.arc(showPosX, showPosY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // arrow
    ctx.fillStyle = "#181818";
    let showPosDirection = computeDirectionNumber(robot.pastDirections[positionToShowIndex]);
    ctx.fillText(directionArrows[showPosDirection], showPosX, showPosY + radius / 3);

}

function logicStep() {

    if (robots[0].finished === false) {

        let moved = moveLogicStep(robots[0]);

        draw(false, false, moved);
    }
}

/**
 * calls the appropriate moving-algorithm depending on the robot
 */
function moveOneStep() {

    // if interruption of logic steps
    if (robots.length === 1 && !robOutputDivFinished[robots[0].id]) {

        // remove output
        document.getElementById("output-wrapper-robot-" + robots[0].id + "-" + robOutputCounter[robots[0].id]).remove();

        // set robot to full step
        robots[0].posX = newPos.posX;
        robots[0].posY = newPos.posY;
        robots[0].currentDirection = newPos.currentDirection;

        // add complete output
        addOutput(parseInt(robots[0].id));
        hiddenMarks = 0;
        if (robots[0].id === '3') ariadneThread = newAriadneThread;
        draw(false, false, true);
        moved = false;
        logicStepCounter = 0;
        return;
    }

    for (let i = 0; i < robots.length; i++) {

        if (robots[i].finished === false) {
            switch (robots[i].id) {
                case '1':
                    wallFollower(robots[i]);
                    break;
                case '2':
                    tremaux(robots[i]);
                    break;
                case '3':
                    ariadne(robots[i]);
                    break;
                case '4':
                    pledge(robots[i]);
                    break;
                case '5':
                    randomFollower(robots[i]);
                    break;
                default:
                    break;
            }

            robots[i].posX = newPos.posX;
            robots[i].posY = newPos.posY;
            robots[i].currentDirection = newPos.currentDirection;
            logicStepCounter = 0; // reset
            addOutput(parseInt(robots[i].id));
        }
        if (robots[i].id === '2') hiddenMarks = 0; // reset hidden marks if tremaux is in simulation
        if (robots[i].id === '3') ariadneThread = newAriadneThread;
    }
    draw(false, false, true);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoMove() {

    autoMoveActivated = !autoMoveActivated;
    let button = document.getElementById("auto-move-button");

    if (autoMoveActivated) {
        button.style.background = "var(--secondary)";
    } else {
        button.style.background = "var(--primary)";
    }

    while (autoMoveActivated && checkIfRobotsStillMoving()) {
        await sleep(100);
        moveOneStep();
    }

    autoMoveActivated = false;
    button.style.background = "var(--primary)";
}

function checkIfRobotsStillMoving() {
    for (let i = 0; i < robots.length; i++) {
        if (robots[i].finished === false) {
            return true;
        }
    }
    return false;
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function showPosition(robotId, position) {

    position = parseInt(position);
    robotId = parseInt(robotId);
    let robot = robots[getIndexOfRobot(robotId)];

    let coordinatePosition = robot.path[position];

    positionToShow.x = Math.floor(coordinatePosition.x / step);
    positionToShow.y = Math.floor(coordinatePosition.y / step);

    positionToShowIndex = position;

    draw(true, false, false);

}

function stopShowingPosition() {
    draw(true, true, false);
}


let currentOutputWrapper = [];
/**
 *
 * @param logicId       0 = nothing, 1 = moves, 2 = turns, 3 = moves & turns
 * @param text          the shown text
 * @param robotId       id of the robot
 * @param style         0 = , 1 = , 2 =
 * @param outputEnd
 */
function pushToOutputWrapper(logicId, text, robotId, style, outputEnd) {

    currentOutputWrapper.push({logicId: logicId, text: text, robotId: robotId, style: style, outputEnd: outputEnd});

}

function addOutput(robotId) {

    // create output-wrapper element
    let outputWrapper = document.createElement("div"); // create new div
    outputWrapper.setAttribute("id", "output-wrapper-robot-" + robotId + "-" + robOutputCounter[robotId]);
    outputWrapper.setAttribute("class", "output-wrapper");
    outputWrapper.setAttribute("onmouseover", "showPosition(" + robotId + ", " + robOutputCounter[robotId] + ")");
    outputWrapper.setAttribute("onmouseleave", "stopShowingPosition()");

    let outputDisplay = document.getElementById("output-robot-" + robotId);
    outputDisplay.appendChild(outputWrapper);

    for (let i = 0; i < currentOutputWrapper.length ; i++) {
        let output = document.createElement("code");
        output.setAttribute("class", "output-text");

        output.innerText = currentOutputWrapper[i].text;

        switch (currentOutputWrapper[i].style) {
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
    currentOutputWrapper = [];

    robOutputCounter[robotId]++;
    robOutputDivFinished[robotId] = true;

}

let robOutputDivFinished = [true, true, true, true, true, true];
function addOutputLogic(text, robotId, style, outputEnd) {

    if (robOutputDivFinished[robotId]) {
        robOutputDivFinished[robotId] = false;

        let outputWrapper = document.createElement("div"); // create new div
        outputWrapper.setAttribute("id", "output-wrapper-robot-" + robotId + "-" + robOutputCounter[robotId]);
        outputWrapper.setAttribute("class", "output-wrapper");
        outputWrapper.setAttribute("onmouseover", "showPosition(" + robotId + ", " + robOutputCounter[robotId] + ")");
        outputWrapper.setAttribute("onmouseleave", "stopShowingPosition()");

        let outputScreen = document.getElementById("output-robot-" + robotId);
        outputScreen.appendChild(outputWrapper);
    }

    let output = document.createElement("code");
    output.setAttribute("class", "output-text");

    output.innerText = text;

    switch (style) {
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

    let outputWrapper = document.getElementById("output-wrapper-robot-" + robotId + "-" + robOutputCounter[robotId]);
    outputWrapper.appendChild(output);

    if (outputEnd) {
        robOutputCounter[robotId]++;
        robOutputDivFinished[robotId] = true;
        currentOutputWrapper = []; // reset
    }

    // auto-scroll --> always show the latest output
    outputScreen.scrollTop = outputScreen.scrollHeight;
}

robotGrid.addEventListener('click', (event) => {

    let index = event.target.id.lastIndexOf("-");
    let robotId = parseInt(event.target.id.substring(index + 1));

    if (robotId === selectedRobotId) { // show robot modal if selected robot is clicked twice
        showRobotModal('' + robotId);
        return;
    }

    let robotItems = document.getElementsByClassName("robot-grid-item");
    for (let i = 0; i < robotItems.length; i++) {
        robotItems[i].style.opacity = "0.7";
        robotItems[i].style.backgroundColor = "var(--lightGrey)";
        robotItems[i].style.marginTop = "20px";
    }

    document.getElementById("robot-grid-item-" + robotId).style.backgroundColor = "var(--darkGrey)";
    document.getElementById("robot-grid-item-" + robotId).style.opacity = "1";
    document.getElementById("robot-grid-item-" + robotId).style.marginTop = "0";
    document.getElementById("robot-img-" + robotId).style.opacity = "1";

    // show decision output of robot
    // hide old one
    document.getElementById("output-robot-" + selectedRobotId).style.display = "none";
    // show new one
    document.getElementById("output-robot-" + robotId).style.display = "block";

    // scroll to the end
    outputScreen.scrollTop = outputScreen.scrollHeight;

    selectedRobotId = robotId;
    draw(true, true, false);
});

function showRobotModal(id) {
    robotModal.style.display = "block";

    let title;
    let inner;
    let extraInfo;

    switch (id) {
        case '1':
            title = robotNames[id];
            extraInfo = "geht immer der rechten Wand entlang";
            inner = `<pre><code>
1 Solange Ziel nicht erreicht
2     Falls Weg rechts 
3         gehe rechts 
4     Falls Weg geradeaus
5         gehe geradeaus
6     Falls Weg links 
7         gehe links 
8     Sonst 
9         drehe dich um
    </code></pre>`;

            break;
        case '2':
            title = robotNames[id];
            extraInfo = "markiert besuchte Pfade. Pfade mit 2 Markierungen werden nicht mehr betreten";
            inner = `<pre><code>
1 solange Ziel nicht erreicht
2     folge Pfad bis Ende 
3     falls Pfadende
4         markiere Pfadende
5         falls alle Pfade unbekannt
6             betrete unbekannten Pfad & markiere Anfang
7         falls einer der Pfade schon bekannt
8             untersuche vorherigen Pfad
9             falls vorheriger Pfad nur 1x markiert
10                kehre um & markiere Anfang des Pfades
11            sonst
12                falls ein Pfad noch nicht markiert
13                    betrete Pfad & markiere Anfang
14                sonst
15                    wähle Pfad mit einer Markierung & markiere Anfang
    </code></pre>`;
            break;

        case '3':
            title = robotNames[id];
            extraInfo = "TBA";
            inner = `<pre><code>
1 Solange Ziel nicht erreicht
2     falls Sackgasse oder Ariadnefaden quert Kreuzung
3         drehe dich um und gehe Gang zurück (und wickle auf)
4     sonst
5         gehe 1. Gang von links (falls Ariadnefaden im Gang, dann
6         aufwickeln sonst abspulen)
    </code></pre>`;

            break;

        case '4':
            title = robotNames[id];
            extraInfo = "TBA";
            inner = `<pre><code>
1 Setze Drehzähler auf 0
2 
3 Wiederhole bis Ausgang erreicht
4     Wiederhole bis Wand berührt wird
5         Gehe gerade aus
6     Drehung nach links
7     erhöhe Drehzähler
8     Wiederhole bis Drehzähler auf 0 steht
9         Folge der Wand
10        Falls Drehung
11            Adaptiere Drehzähler
    </code></pre>`;
            break;

        case '5':
            title = robotNames[id];
            extraInfo = "wählt Pfad bei Kreuzungen zufällig";
            inner = `<pre><code>
1 Wiederhole bis Ausgang erreicht
2    folge Pfad bis Ende
3    falls Kreuzung
4        wähle einen Pfad zufällig
5    sonst
6        drehe um
    </code></pre>`;
            break;
    }

    // set robot image
    let robotImg = document.getElementById("modal-robot-img");
    robotImg.setAttribute("src", "../img/robot-" + id + ".png");

    modalTitle.innerText = title;
    extraInformationText.innerText = extraInfo;
    algorithmText.innerHTML = inner;
}

robotModal.onclick = function (event) {
    if (event.target === robotModal || event.target === closeRobot) {
        robotModal.style.display = "none";
    }
}

function goToPreviousPage() {
    window.history.back();
}

/**---------------------------------------------------------------------------------------------------------------------
 *                                                     Algorithms
 ---------------------------------------------------------------------------------------------------------------------*/

/**-------------------------------------
 *           Logic-Step
 -------------------------------------*/

let newPos = {posX: null, posY: null, currentDirection: null};
let logicStepCounter = 0;
let moved = false;
let hiddenMarks = 0; // in order to hide marks until their corresponding logic step is made
/**
 * moves any algorithm one logic step
 */
function moveLogicStep(robot) {

    let index = logicStepCounter;

    if (logicStepCounter === 0) {
        // move one normal step
        switch (robot.id) {
            case '1':
                wallFollower(robot);
                break;
            case '2':
                tremaux(robot);
                break;
            case '3':
                ariadne(robot);
                break;
            case '4':
                pledge(robot);
                break;
            case '5':
                randomFollower(robot);
                break;
        }
    }

    let justMoved = false;

    switch(currentOutputWrapper[index].logicId) {
        case 0: // nothing
            break;
        case 1: // moves
            robot.posX = newPos.posX;
            robot.posY = newPos.posY;
            if (!moved) justMoved = true; //
            break;
        case 2: // turns
            robot.currentDirection = newPos.currentDirection;
            break;
        case 3: // moves & turns
            robot.posX = newPos.posX;
            robot.posY = newPos.posY;
            robot.currentDirection = newPos.currentDirection;
            if (!moved) justMoved = true;
            break;
        case 4: // sets mark
            hiddenMarks = 1;
            break;
        case 5: // moves, turns & sets mark
            hiddenMarks = 0;
            robot.posX = newPos.posX;
            robot.posY = newPos.posY;
            robot.currentDirection = newPos.currentDirection;
            if (!moved) justMoved = true;
            break;
        case 6: // turns first time --> exception for a certain pledge case
            robot.currentDirection = robotDirections[(computeDirectionNumber(robot.currentDirection) + 2) % 4];
            break;
        case 7: // update ariadne Thread
            //ariadneThread.push(threadPositionToAdd);
            ariadneThread = newAriadneThread;
            break;
    }

    addOutputLogic(currentOutputWrapper[index].text, currentOutputWrapper[index].robotId,
        currentOutputWrapper[index].style, currentOutputWrapper[index].outputEnd);

    logicStepCounter++;
    if (currentOutputWrapper.length === 0) {
        logicStepCounter = 0;   // reset
        if (!moved) {
            return true; // needed to save a position of a finished step even though the robot didn't change position
        } else {
            moved = false;
        }
    }

    if (justMoved) {
        moved = true;
        return true;
    }
}

/**-------------------------------------
 *           Wall-Follower
 -------------------------------------*/

/**
 * Wall-Follower V2
 */
function wallFollower(robot) {

    // save old position & set newPos (needed for logic steps)
    setNewPos(robot.posX, robot.posY, robot.currentDirection);

    if(finishCheck(robot)) return;

    let direction = computeDirectionNumber(newPos.currentDirection); // starting direction

    for (let i = 0; i < 3; i++) {
        // check if position is on map
        if (checkIfOnMap(newPos.posX, newPos.posY, direction + i)) {
            // check for path
            if (simulation.map[newPos.posY + robotDecisions[(direction + i) % 4].y][newPos.posX + robotDecisions[(direction + i) % 4].x] >= 1) {
                newPos.posX += robotDecisions[(direction + i) % 4].x;
                newPos.posY += robotDecisions[(direction + i) % 4].y;
                newPos.currentDirection = robotDirections[(direction + i) % 4];
                wallFollowerOutput(i, robot.id);
                return;
            }
        }
    }
    wallFollowerOutput(3, robot.id);
    newPos.currentDirection = robotDirections[(direction + 3) % 4]; // turn around
}

function wallFollowerOutput(number, robotId) {

    switch (number) {
        case 0:
            pushToOutputWrapper(3, "gehe rechts", robotId, 1, true);
            break;
        case 1:
            pushToOutputWrapper(0, "gehe rechts", robotId, 3, false);
            pushToOutputWrapper(1, "gehe geradeaus", robotId, 1, true);
            break;
        case 2:
            pushToOutputWrapper(0, "gehe rechts", robotId, 3, false);
            pushToOutputWrapper(0, "gehe geradeaus", robotId, 3, false);
            pushToOutputWrapper(3, "gehe links", robotId, 1, true);
            break;
        case 3:
            pushToOutputWrapper(0, "gehe rechts", robotId, 3, false);
            pushToOutputWrapper(0, "gehe geradeaus", robotId, 3, false);
            pushToOutputWrapper(0, "gehe links", robotId, 3, false);
            pushToOutputWrapper(2, "drehe um", robotId, 1, true);
            break;
        default:
            break;
    }
}

/**-------------------------------------
 *              Pledge
 -------------------------------------*/

let turnCounter = 0;
/**
 * pledge algorithm
 */
function pledge(robot) {

    // save old position & set newPos (needed for logic steps)
    setNewPos(robot.posX, robot.posY, robot.currentDirection);

    if(finishCheck(robot)) return;

    if (turnCounter === 0) {

        let direction = computeDirectionNumber(newPos.currentDirection);

        if (checkIfOnMap(newPos.posX, newPos.posY, direction + 1)) { // go straight
            if (simulation.map[robot.posY + robotDecisions[(direction + 1) % 4].y][robot.posX + robotDecisions[(direction + 1) % 4].x] === 1) {
                pushToOutputWrapper(0, "Wand berührt", robot.id, 3, false);

                newPos.posX += robotDecisions[(direction + 1) % 4].x;
                newPos.posY += robotDecisions[(direction + 1) % 4].y;
                pushToOutputWrapper(1, "gehe geradeaus", robot.id, 1, true);
                return;
            }
        }

        // turn left
        pushToOutputWrapper(0, "Wand berührt", robot.id, 1, false);
        newPos.currentDirection = robotDirections[(computeDirectionNumber(robot.currentDirection) + 2) % 4];
        pushToOutputWrapper(6, "Drehung nach links", robot.id, 1, false);
        turnCounter++;
        pushToOutputWrapper(0, "erhöhe Drehzähler: " + turnCounter, robot.id, 1, false);
    }

    let direction = computeDirectionNumber(newPos.currentDirection);

    for (let i = 0; i < 3; i++) {
        if (checkIfOnMap(newPos.posX, newPos.posY, direction + i)) {

            if (simulation.map[newPos.posY + robotDecisions[(direction + i) % 4].y][newPos.posX + robotDecisions[(direction + i) % 4].x] === 1) {

                newPos.posX += robotDecisions[(direction + i) % 4].x;
                newPos.posY += robotDecisions[(direction + i) % 4].y;
                newPos.currentDirection = robotDirections[(direction + i) % 4];

                pushToOutputWrapper(0, "Drehzähler auf 0", robot.id, 3, false);
                pushToOutputWrapper(3, "folge der Wand", robot.id, 1, false);

                if (i === 0) { // follow wall right
                    turnCounter--;
                    pushToOutputWrapper(0, "Drehung", robot.id, 1, false);
                    pushToOutputWrapper(0, "adaptiere Drehzähler: " + turnCounter, robot.id, 1, true);

                } else if (i === 1) { // follow wall straight
                    pushToOutputWrapper(0, "Drehung", robot.id, 3, true);
                    turnedLeft = false;

                } else {
                    turnCounter++;
                    pushToOutputWrapper(0, "Drehung", robot.id, 1, false);
                    pushToOutputWrapper(0, "adaptiere Drehzähler: " + turnCounter, robot.id, 1, true);
                }
                return;
            }
        }
    }
    newPos.currentDirection = robotDirections[(direction + 2) % 4]; // just turn left (only happens when dead end)
    turnCounter++;
    pushToOutputWrapper(0, "Drehzähler auf 0", robot.id, 3, false);
    pushToOutputWrapper(2, "folge der Wand", robot.id, 1, false);
    pushToOutputWrapper(0, "Drehung", robot.id, 1, false);
    pushToOutputWrapper(0, "adaptiere Drehzähler: " + turnCounter, robot.id, 1, true);
}

/**-------------------------------------
 *              Tremaux
 -------------------------------------*/

let nextDirection = null;
let marked = [];
let lastMarked = 0; // in order to prevent double marking paths with length = 1 (which would lead to incorrect behaviour)
let marksToDraw = [];
/**
 * tremaux algorithm
 */
function tremaux(robot) {

    // save old position & set newPos (needed for logic steps)
    setNewPos(robot.posX, robot.posY, robot.currentDirection);

    if(finishCheck(robot)) return;

    let possibleWays = getPossibleWays(robot);

    if (possibleWays.length === 1) { // folge pfad

        newPos.posX += possibleWays[0].x;
        newPos.posY += possibleWays[0].y;
        newPos.currentDirection = nextDirection;
        lastMarked++;
        pushToOutputWrapper(3, "folge Pfad", robot.id, 1, true);

    } else if (possibleWays.length === 0) { // drehe um

        let direction = computeDirectionNumber(newPos.currentDirection);
        newPos.currentDirection = robotDirections[(direction + 3) % 4];
        lastMarked++;
        pushToOutputWrapper(2, "drehe um (folge Pfad)", robot.id, 1, true);

    } else { // entscheide richtung

        // 1. markiere momentanen pfad
        if (robot.path.length >= 2) {
            let position = robot.path[robot.path.length - 2]; // needs to be converted from pixel- to labyrinth-space
            let posX = Math.floor(position.x / step);
            let posY = Math.floor(position.y / step);

            pushToOutputWrapper(4, "markiere Pfadende", robot.id, 1, false);

            hiddenMarks = 2;

            if (lastMarked > 1) { // to prevent double marking paths with length = 1 (exception)
                addMarked(robot, posX, posY, newPos.currentDirection, false);
            } else if (lastMarked === 1) { // draw marking
                let found = false;
                for (let i = 0; i < marked.length; i++) {
                    if (marked[i].x === posX && marked[i].y === posY && marked[i].visits === 2) {
                        addMarksToDraw(robot, posX, posY, newPos.currentDirection, false, true);
                        found = true;
                    }
                }
                if (!found) addMarksToDraw(robot, posX, posY, newPos.currentDirection, false, false);
            } else {
                lastMarked++;
            }
        }

        //--------------------------------------------------------------------------------------------------------------

        // 1. falls alle wege unbetreten (= neuer Platz)
        if (checkIfAllPathsUnknown(possibleWays, newPos.posX, newPos.posY)) {

            let randomPath = possibleWays[getRandomInt(0, possibleWays.length)]; // random path selection
            newPos.posX += randomPath.x;
            newPos.posY += randomPath.y;
            newPos.currentDirection = computeNewDirection(randomPath);

            /*
            addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
            */
            lastMarked = 0;

            pushToOutputWrapper(0, "alle Pfade unbekannt", robot.id, 1, false);

            // check if unbekannter Pfad = Kreuzung
            if (checkIfCrossing(newPos.posX, newPos.posY, newPos.currentDirection)) {
                console.log("Should be fixed!");
                pushToOutputWrapper(3, "betrete unbekannten Pfad", robot.id, 1, true);
            } else {
                addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
                pushToOutputWrapper(5, "betrete unbekannten Pfad & markiere Anfang", robot.id, 1, true);
            }
            return;

        } else {
            pushToOutputWrapper(0, "alle Pfade unbekannt", robot.id, 3, false);

            // 2. falls einer der wege schon bekannt (--> nicht alle unbekannt impliziert dass mind. 1er bekannt sein muss)
            // untersuche vorherigen weg
            let visits = getVisitsOfPreviousPath(newPos.posX, newPos.posY, newPos.currentDirection);
            // 2.1 falls nur 1 visit
            if (visits === 1) { // kehre um
                let direction = computeDirectionNumber(newPos.currentDirection);
                newPos.posX += robotDecisions[(direction + 3) % 4].x;
                newPos.posY += robotDecisions[(direction + 3) % 4].y;
                newPos.currentDirection = robotDirections[(direction + 3) % 4];

                addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
                pushToOutputWrapper(0, "herführender Pfad nur 1x markiert", robot.id, 1, false);
                pushToOutputWrapper(5, "kehre um & markiere Anfang", robot.id, 1, true);
                return;

            } else if (visits === 0) {
                // herführender weg war kreuzung
                // TODO: fix issue

            } else { // 2.2 falls weg geschlossen (= 2 visits)

                pushToOutputWrapper(0, "herführender Pfad nur 1x markiert", robot.id, 3, false);

                // 2.2.1 falls ein weg ohne visits
                let unknownPaths = getUnknownPaths(possibleWays, newPos.posX, newPos.posY);
                if (unknownPaths.length !== 0) {

                    let randomPath = unknownPaths[getRandomInt(0, unknownPaths.length)];

                    newPos.posX += randomPath.x;
                    newPos.posY += randomPath.y;
                    newPos.currentDirection = computeNewDirection(randomPath);

                    //addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
                    lastMarked = 0;

                    pushToOutputWrapper(0, "unbekannter Pfad vorhanden", robot.id, 1, false);
                    //pushToOutputWrapper(5, "betrete unbekannten Pfad & markiere Anfang", robot.id, 1, true);

                    // -----------------------------------------

                    // check if unbekannter Pfad = Kreuzung
                    if (checkIfCrossing(newPos.posX, newPos.posY, newPos.currentDirection)) {
                        console.log("Should be fixed!");
                        pushToOutputWrapper(3, "betrete unbekannten Pfad", robot.id, 1, true);
                    } else {
                        addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
                        pushToOutputWrapper(5, "betrete unbekannten Pfad & markiere Anfang", robot.id, 1, true);
                    }
                    return;

                }

                // 2.2.2 falls nur wege mit mind. 1 visit
                let pathsWithOneMark = getPathsWithOneMark(possibleWays, newPos.posX, newPos.posY);
                if (pathsWithOneMark.length !== 0) {

                    let randomPath = pathsWithOneMark[getRandomInt(0, pathsWithOneMark.length)];
                    newPos.posX += randomPath.x;
                    newPos.posY += randomPath.y;
                    newPos.currentDirection = computeNewDirection(randomPath);

                    addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
                    lastMarked = 0;

                    pushToOutputWrapper(0, "unbekannter Pfad vorhanden", robot.id, 3, false);
                    pushToOutputWrapper(5, "betrete 1x markierten Pfad & markiere Anfang", robot.id, 1, true);
                    return;
                }
            }
        }
        // Ziel nicht erreichbar
        pushToOutputWrapper(0, "Ziel unerreichbar", robot.id, 1, true);
        lastMarked++;
    }
}

function tremauxBeforeBug(robot) {

    // save old position & set newPos (needed for logic steps)
    setNewPos(robot.posX, robot.posY, robot.currentDirection);

    if(finishCheck(robot)) return;

    let possibleWays = getPossibleWays(robot);

    if (possibleWays.length === 1) { // folge pfad

        newPos.posX += possibleWays[0].x;
        newPos.posY += possibleWays[0].y;
        newPos.currentDirection = nextDirection;
        lastMarked++;
        pushToOutputWrapper(3, "folge Pfad", robot.id, 1, true);

    } else if (possibleWays.length === 0) { // drehe um

        let direction = computeDirectionNumber(newPos.currentDirection);
        newPos.currentDirection = robotDirections[(direction + 3) % 4];
        lastMarked++;
        pushToOutputWrapper(2, "drehe um (folge Pfad)", robot.id, 1, true);

    } else { // entscheide richtung

        // 1. markiere momentanen pfad
        if (robot.path.length >= 2) {
            let position = robot.path[robot.path.length - 2]; // needs to be converted from pixel- to labyrinth-space
            let posX = Math.floor(position.x / step);
            let posY = Math.floor(position.y / step);

            pushToOutputWrapper(4, "markiere Pfadende", robot.id, 1, false);

            hiddenMarks = 2;

            if (lastMarked > 1) { // to prevent double marking paths with length = 1 (exception)
                addMarked(robot, posX, posY, newPos.currentDirection, false);
            } else if (lastMarked === 1) { // draw marking
                let found = false;
                for (let i = 0; i < marked.length; i++) {
                    if (marked[i].x === posX && marked[i].y === posY && marked[i].visits === 2) {
                        addMarksToDraw(robot, posX, posY, newPos.currentDirection, false, true);
                        found = true;
                    }
                }
                if (!found) addMarksToDraw(robot, posX, posY, newPos.currentDirection, false, false);
            } else {
                lastMarked++;
            }
        }

        //--------------------------------------------------------------------------------------------------------------

        // 1. falls alle wege unbetreten (= neuer Platz)
        if (checkIfAllPathsUnknown(possibleWays, newPos.posX, newPos.posY)) {

            let randomPath = possibleWays[getRandomInt(0, possibleWays.length)]; // random path selection
            newPos.posX += randomPath.x;
            newPos.posY += randomPath.y;
            newPos.currentDirection = computeNewDirection(randomPath);

            lastMarked = 0;
            addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);

            pushToOutputWrapper(0, "alle Pfade unbekannt", robot.id, 1, false);
            pushToOutputWrapper(5, "betrete unbekannten Pfad & markiere Anfang", robot.id, 1, true);
            return;

        } else {
            pushToOutputWrapper(0, "alle Pfade unbekannt", robot.id, 3, false);

            // 2. falls einer der wege schon bekannt (--> nicht alle unbekannt impliziert dass mind. 1er bekannt sein muss)
            // untersuche vorherigen weg
            let visits = getVisitsOfPreviousPath(newPos.posX, newPos.posY, newPos.currentDirection);
            // 2.1 falls nur 1 visit
            if (visits === 1) { // kehre um
                let direction = computeDirectionNumber(newPos.currentDirection);
                newPos.posX += robotDecisions[(direction + 3) % 4].x;
                newPos.posY += robotDecisions[(direction + 3) % 4].y;
                newPos.currentDirection = robotDirections[(direction + 3) % 4];

                addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
                pushToOutputWrapper(0, "herführender Pfad nur 1x markiert", robot.id, 1, false);
                pushToOutputWrapper(5, "kehre um & markiere Anfang", robot.id, 1, true);
                return;

            } else { // 2.2 falls weg geschlossen (= 2 visits)

                pushToOutputWrapper(0, "herführender Pfad nur 1x markiert", robot.id, 3, false);

                // 2.2.1 falls ein weg ohne visits
                let unknownPaths = getUnknownPaths(possibleWays, newPos.posX, newPos.posY);
                if (unknownPaths.length !== 0) {

                    let randomPath = unknownPaths[getRandomInt(0, unknownPaths.length)];

                    newPos.posX += randomPath.x;
                    newPos.posY += randomPath.y;
                    newPos.currentDirection = computeNewDirection(randomPath);

                    addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
                    lastMarked = 0;

                    pushToOutputWrapper(0, "unbekannter Pfad vorhanden", robot.id, 1, false);
                    pushToOutputWrapper(5, "betrete unbekannten Pfad & markiere Anfang", robot.id, 1, true);
                }

                // 2.2.2 falls nur wege mit mind. 1 visit
                let pathsWithOneMark = getPathsWithOneMark(possibleWays, newPos.posX, newPos.posY);
                if (pathsWithOneMark.length !== 0) {

                    let randomPath = pathsWithOneMark[getRandomInt(0, pathsWithOneMark.length)];
                    newPos.posX += randomPath.x;
                    newPos.posY += randomPath.y;
                    newPos.currentDirection = computeNewDirection(randomPath);

                    addMarked(robot, newPos.posX, newPos.posY, newPos.currentDirection, true);
                    lastMarked = 0;

                    pushToOutputWrapper(0, "unbekannter Pfad vorhanden", robot.id, 3, false);
                    pushToOutputWrapper(5, "betrete 1x markierten Pfad & markiere Anfang", robot.id, 1, true);
                    return;
                }
            }
        }
        // Ziel nicht erreichbar
        pushToOutputWrapper(0, "Ziel unerreichbar", robot.id, 1, true);
        lastMarked++;
    }
}

function checkIfCrossing(posX, posY, currentDirection) {
    let direction = computeDirectionNumber(currentDirection);

    let pathCounter = 0;
    for (let i = 0; i < 3; i++) { // check right - straight - left
        if (checkIfOnMap(posX, posY, direction + i)) {
            if (simulation.map[posY + robotDecisions[(direction + i) % 4].y][posX + robotDecisions[(direction + i) % 4].x] === 1) {
                pathCounter++;
                if (pathCounter > 1) return true;
            }
        }
    }
    return false;
}

function getVisitsOfPreviousPath(posX, posY, currentDirection) {
    let direction = computeDirectionNumber(currentDirection);
    let prevPosX = posX + robotDecisions[(direction + 3) % 4].x;
    let prevPosY = posY + robotDecisions[(direction + 3) % 4].y;

    for (let i = 0; i < marked.length; i++) {
        if (marked[i].x === prevPosX && marked[i].y === prevPosY) {
            return marked[i].visits;
        }
    }
    return 0;
}

function addMarked(robot, posX, posY, direction, entering) {

    for (let i = 0; i < marked.length; i++) {
        if (marked[i].x === posX && marked[i].y === posY) {
            marked[i].visits = 2; // increase visits if found
            addMarksToDraw(robot, posX, posY, direction, entering, true);
            return;
        }
    }

    marked.push({x: posX, y: posY, visits: 1}); // otherwise add new entry
    addMarksToDraw(robot, posX, posY, direction, entering, false);

}

function addMarksToDraw(robot, posX, posY, direction, entering, secondVisit) {

    let lineWeight = step / 20;
    let offset = step / 10;
    let secondVisitOffset;
    secondVisit ? secondVisitOffset = offset / 1.2 : secondVisitOffset = 0;

    switch (direction) {

        case Direction.up:
            if (entering) {
                marksToDraw.push({
                    pathIndex: robot.path.length,
                    x: posX * step + offset,
                    y: (posY + 1) * step - (offset + secondVisitOffset),
                    w: offset * 8,
                    h: lineWeight
                });
            } else {
                marksToDraw.push({
                    pathIndex: robot.path.length,
                    x: posX * step + offset,
                    y: posY * step + (offset + secondVisitOffset),
                    w: offset * 8,
                    h: lineWeight
                });
            }
            break;

        case Direction.left:
            if (entering) {
                marksToDraw.push({
                    pathIndex: robot.path.length,
                    x: (posX + 1) * step - (offset + secondVisitOffset),
                    y: posY * step + offset,
                    w: lineWeight,
                    h: offset * 8
                });
            } else {
                marksToDraw.push({
                    pathIndex: robot.path.length,
                    x: posX * step + (offset + secondVisitOffset),
                    y: posY * step + offset,
                    w: lineWeight,
                    h: offset * 8
                });
            }
            break;

        case Direction.down:
            if (entering) {
                marksToDraw.push({
                    pathIndex: robot.path.length,
                    x: posX * step + offset,
                    y: posY * step + (offset + secondVisitOffset),
                    w: offset * 8,
                    h: lineWeight
                });
            } else {
                marksToDraw.push({
                    pathIndex: robot.path.length,
                    x: posX * step + offset,
                    y: (posY + 1) * step - (offset + secondVisitOffset),
                    w: offset * 8,
                    h: lineWeight
                });
            }
            break;

        case Direction.right:
            if (entering) {
                marksToDraw.push({
                    pathIndex: robot.path.length,
                    x: posX * step + (offset + secondVisitOffset),
                    y: posY * step + offset,
                    w: lineWeight,
                    h: offset * 8
                });
            } else {
                marksToDraw.push({
                    pathIndex: robot.path.length,
                    x: (posX + 1) * step - (offset + secondVisitOffset),
                    y: posY * step + offset,
                    w: lineWeight,
                    h: offset * 8
                });
            }
            break;
    }
}

function checkIfAllPathsUnknown(possibleWays, posX, posY) {

    for (let i = 0; i < possibleWays.length; i++) {
        for (let j = 0; j < marked.length; j++) {
            if (marked[j].x === (posX + possibleWays[i].x) && marked[j].y === (posY + possibleWays[i].y)) {
                return false; // if one matches return false
            }
        }
    }
    return true;
}

function getUnknownPaths(possibleWays, posX, posY) {

    let unknownPaths = [];
    for (let i = 0; i < possibleWays.length; i++) {
        let found = false;
        for (let x = 0; x < marked.length; x++) {
            if (marked[x].x === (posX + possibleWays[i].x) && marked[x].y === (posY + possibleWays[i].y)) {
                found = true;
                break;
            }
        }
        if (!found) {
            unknownPaths.push(possibleWays[i]);
        }
    }
    return unknownPaths;
}

function getPathsWithOneMark(possibleWays, posX, posY) {
    let pathsWithOneMark = [];
    for (let i = 0; i < possibleWays.length; i++) {
        for (let x = 0; x < marked.length; x++) {
            if (marked[x].x === (posX + possibleWays[i].x) && marked[x].y === (posY + possibleWays[i].y)) {
                if (marked[x].visits === 1) {
                    pathsWithOneMark.push(possibleWays[i]);
                }
            }
        }
    }
    return pathsWithOneMark;
}

function getPossibleWays(robot) {

    let direction = computeDirectionNumber(robot.currentDirection);

    let possibleWays = [];
    for (let i = 0; i < 3; i++) { // check right - straight - left
        if (checkIfOnMap(robot.posX, robot.posY, direction + i)) {
            if (simulation.map[robot.posY + robotDecisions[(direction + i) % 4].y][robot.posX + robotDecisions[(direction + i) % 4].x] === 1) {
                possibleWays.push(robotDecisions[(direction + i) % 4]);
                nextDirection = robotDirections[(direction + i) % 4];
            }
        }
    }
    return possibleWays;
}

/**-------------------------------------
 *              Ariadne
 -------------------------------------*/

/**
 * ariadne algorithm
 */
let ariadneThread = [];
let initialThreadPush = true;
let newAriadneThread = [];
let pastAriadneThreads = [];
function ariadne(robot) {

    if (initialThreadPush) {
        ariadneThread.push({x: robot.posX, y: robot.posY});
        initialThreadPush = false;
    }

    // save old position & set newPos (needed for logic steps)
    setNewPos(robot.posX, robot.posY, robot.currentDirection);

    // clone old ariadne thread
    newAriadneThread = cloneAriadneThread(ariadneThread);

    if(finishCheck(robot)) return;

    // 1. folge Pfad bis Ende + faden ablegen / aufsammeln
    let possibleWays = getPossibleWays(robot);

    if (possibleWays.length === 1) {
        newPos.posX += possibleWays[0].x;
        newPos.posY += possibleWays[0].y;
        newPos.currentDirection = nextDirection;

        pushToOutputWrapper(3, "folge Pfad", robot.id, 1, false);

        if (checkIfThread(newPos.posX, newPos.posY)) {
            if (ariadneThread[ariadneThread.length-2].x === newPos.posX && ariadneThread[ariadneThread.length-2].y === newPos.posY) { // prevent removing thread from a visited crossing
                removeAriadneThread(newAriadneThread, robot.posX, robot.posY); // remove ariadne thread
                pushToOutputWrapper(7, "wickle auf", robot.id, 1, true);
            }
        } else {
            newAriadneThread.push({x: newPos.posX, y: newPos.posY}); // put ariadne thread on position
            pushToOutputWrapper(7, "lege Ariadne-Faden", robot.id, 1, true);
        }
    } else {
        // falls Sackgasse oder Ariadnefaden quert Kreuzung
        if (possibleWays.length === 0 || checkIfThreadCrossing(newPos.posX, newPos.posY, possibleWays)) {

            pushToOutputWrapper(0, "Sackgasse oder Ariadnefaden quert Kreuzung", robot.id, 1, false);

            // drehe um & wickle auf
            let direction = computeDirectionNumber(newPos.currentDirection);
            newPos.posX += robotDecisions[(direction + 3) % 4].x;
            newPos.posY += robotDecisions[(direction + 3) % 4].y;
            newPos.currentDirection = robotDirections[(direction + 3) % 4];
            pushToOutputWrapper(3, "drehe um", robot.id, 1, false);

            // wickle auf
            if (checkIfThread(newPos.posX, newPos.posY)) {
                if (ariadneThread[ariadneThread.length-1].x === robot.posX && ariadneThread[ariadneThread.length-1].y === robot.posY) {
                    removeAriadneThread(newAriadneThread, robot.posX, robot.posY);
                }
            }
            pushToOutputWrapper(7, "wickle auf", robot.id, 1, true);
        } else {
            pushToOutputWrapper(0, "Sackgasse oder Ariadnefaden quert Kreuzung", robot.id, 3, false);
            // 1. gang von links
            newPos.posX += possibleWays[possibleWays.length-1].x;
            newPos.posY += possibleWays[possibleWays.length-1].y;
            newPos.currentDirection = nextDirection;
            pushToOutputWrapper(3, "gehe 1. Gang von links", robot.id, 1, false);

            if (checkIfThread(newPos.posX, newPos.posY)) {

                pushToOutputWrapper(3, "Ariadnefaden im Gang", robot.id, 1, false);
                removeAriadneThread(newAriadneThread, robot.posX, robot.posY); // remove ariadne thread
                pushToOutputWrapper(7, "wickle auf", robot.id, 1, true);

            } else {
                pushToOutputWrapper(3, "Ariadnefaden im Gang", robot.id, 3, false);
                newAriadneThread.push({x: newPos.posX, y: newPos.posY}); // put ariadne thread on position
                pushToOutputWrapper(7, "lege Ariadne-Faden", robot.id, 1, true);
            }
        }
    }
    pastAriadneThreads.push(newAriadneThread); // save ariadne thread for each step in order to show past positions
}

function checkIfThreadCrossing(posX, posY, possibleWays) {
    let threadCounter = 0;
    for (let i = 0; i < possibleWays.length; i++) {
        for (let x = 0; x < ariadneThread.length; x++) {
            if (posX + possibleWays[i].x === ariadneThread[x].x && posY + possibleWays[i].y === ariadneThread[x].y) {
                threadCounter++;
                if (threadCounter >= 2) return true;
            }
        }
    }
    return false;
}

function checkIfThread(posX, posY) {
    for (let i = 0; i < ariadneThread.length; i++) {
        if (ariadneThread[i].x === posX && ariadneThread[i].y === posY) {
            return true;
        }
    }
    return false;
}

function removeAriadneThread(ariadneThread, posX, posY) {
    for (let i = 0; i < ariadneThread.length; i++) {
        if (ariadneThread[i].x === posX && ariadneThread[i].y === posY) {
            ariadneThread.splice(i, 1);
            return;
        }
    }
}

function cloneAriadneThread(thread) {
    let temp = [];
    for (let i = 0; i < thread.length; i++) {
        temp.push({x: thread[i].x, y: thread[i].y});
    }
    return temp;
}

/**-------------------------------------
 *              Random
 -------------------------------------*/

/**
 * random direction algorithm
 */
function randomFollower(robot) {

    // save old position & set newPos (needed for logic steps)
    setNewPos(robot.posX, robot.posY, robot.currentDirection);

    if(finishCheck(robot)) return;

    let direction = computeDirectionNumber(newPos.currentDirection);

    let possibleWays = [];
    for (let i = 0; i < 3; i++) { // check right - straight - left
        if (checkIfOnMap(newPos.posX, newPos.posY, direction + i)) {
            if (simulation.map[newPos.posY + robotDecisions[(direction + i) % 4].y][newPos.posX + robotDecisions[(direction + i) % 4].x] === 1) {
                possibleWays.push(robotDecisions[(direction + i) % 4]);
                nextDirection = robotDirections[(direction + i) % 4];
            }
        }
    }

    if (possibleWays.length === 1) { // follow path

        newPos.posX += possibleWays[0].x;
        newPos.posY += possibleWays[0].y;

        newPos.currentDirection = computeNewDirection(possibleWays[0]);
        pushToOutputWrapper(3, "folge Pfad", robot.id, 1, true);

    } else if (possibleWays.length === 0) { // turn around

        newPos.currentDirection = robotDirections[(direction + 3) % 4];
        pushToOutputWrapper(0, "folge Pfad", robot.id, 3, false);
        pushToOutputWrapper(0, "Kreuzung", robot.id, 3, false);
        pushToOutputWrapper(2, "drehe um", robot.id, 1, true);

    } else { // decide random

        let randomDirectionMovement = possibleWays[getRandomInt(0, possibleWays.length)];

        newPos.posX += randomDirectionMovement.x;
        newPos.posY += randomDirectionMovement.y;

        newPos.currentDirection = computeNewDirection(randomDirectionMovement);
        pushToOutputWrapper(0, "folge Pfad", robot.id, 3, false);
        pushToOutputWrapper(0, "Kreuzung", robot.id, 1, false);
        pushToOutputWrapper(3, "wähle einen Pfad zufällig", robot.id, 1, true);

    }
}

function computeNewDirection(directionMovement) {

    if (directionMovement.x > 0) return Direction.right;
    else if (directionMovement.x < 0) return Direction.left;
    else if (directionMovement.y > 0) return Direction.down;
    else if (directionMovement.y < 0) return Direction.up;

}

function computeDirectionNumber(currentDirection) {

    switch (currentDirection) {
        case Direction.up:
            return 0;
        case Direction.left:
            return 1;
        case Direction.down:
            return 2;
        case Direction.right:
            return 3;
    }
}

function checkIfOnMap(posX, posY, direction) {

    return posX + robotDecisions[(direction) % 4].x < simulation.map.length
        && posX + robotDecisions[(direction) % 4].x >= 0
        && posY + robotDecisions[(direction) % 4].y < simulation.map.length
        && posY + robotDecisions[(direction) % 4].y >= 0;
}

function finishCheck(robot) {
    if (robot.posY === finish.y && robot.posX === finish.x) {
        pushToOutputWrapper(0, "FINISHED! (" + (robot.path.length - 1) + " steps)", robot.id, 1, true);
        robot.finished = true;
        return true;
    }
    return false;
}

init();

// detect hover on canvas
canvas.onmousemove = function (event) {

    let rect = this.getBoundingClientRect();
    let mouseX = event.clientX - rect.left; // pixel-coordinates
    let mouseY = event.clientY - rect.top;

    let posX = Math.floor(mouseX / step); // labyrinth-coordinates
    let posY = Math.floor(mouseY / step);

    if (positionToShow.x !== posX || positionToShow.y !== posY) { // only detect new segments of labyrinth

        positionToShow.x = posX;
        positionToShow.y = posY;

        if (simulation.map[posY][posX] === 1) { // check if there's a way

            let robotIndex = getIndexOfRobot(selectedRobotId);
            let outputIndex = getIndexOfOutput(robots[robotIndex], posX, posY); // check if there's a path

            if (outputIndex !== null) {
                positionToShowIndex = outputIndex;
                if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset old output
                draw(true, false, false); // draw position on canvas

                selectedOutput = document.getElementById("output-wrapper-robot-" + selectedRobotId + "-" + outputIndex);
                selectedOutput.setAttribute("class", "output-wrapper-highlighted"); // highlight output
                selectedOutput.scrollIntoView({block: "end", behavior: "smooth"}); // automatically scroll to the output element
            } else {
                draw(true, true, false);
                if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output
            }

        } else {
            draw(true, true, false);
            if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output
        }
    }
}

// reset highlighted output if mouse leaves canvas
canvas.onmouseleave = function () {

    positionToShow.x = null; // reset positionToShow
    positionToShow.y = null;
    if (selectedOutput !== null) selectedOutput.setAttribute("class", "output-wrapper"); // reset output

    draw(true, true, false); // reset canvas
}

function getIndexOfOutput(robot, posX, posY) {

    for (let i = 0; i < robot.path.length - 1; i++) {

        let pathX = Math.floor(robot.path[i].x / step);
        let pathY = Math.floor(robot.path[i].y / step);

        if (pathX === posX && pathY === posY) {
            return i;
        }
    }
    return null;
}

function getIndexOfRobot(id) {
    for (let i = 0; i < robots.length; i++) {
        if (parseInt(robots[i].id) === id) {
            return i;
        }
    }
    return null;
}

function setNewPos(posX, posY, direction) {
    newPos.posX = posX;
    newPos.posY = posY;
    newPos.currentDirection = direction;
}
