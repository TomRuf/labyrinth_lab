const Direction = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right'
};

let canvas = null,
    ctx = null,
    canvasSize = null,
    simulation = {},
    robots = [], // consisting of robot objects with: id, color, posX, posY, currentDirection, path, finished
    step = null,
    radius = null,
    pathWidth = null,
    autoMoveActivated = false;

const outputScreen = document.getElementById("output-screen");

const darkGrey = "#808080",
    lightGrey = "#D3D3D3",
    lightRed = "#FFAE9D",
    lightGreen = "#B8FF9D",
    robotColors = ["", "#f3dd7e", "#88c56e", "#6eb4c5", "#c56e6e", "#999999"];

const robotGrid = document.getElementById("robot-grid");

let selectedRobot = null;
let robOutputCounter = []; // the number of outputs for every robot
let positionToShow = {x: null, y: null};

let start = {},
    finish = {};

function init() {

    canvas = document.getElementById("simulation");
    canvasSize = 1000;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx = canvas.getContext('2d');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // get map
    simulation.map = JSON.parse(urlParams.get("map"));

    radius = (canvasSize / simulation.map.length) / 4;
    pathWidth = radius/1.5;
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

    draw();
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

    for (let i = 1; i < robots.length+1; i++) {
        let robotId = robots[i-1].id;

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
            selectedRobot = robots[i-1].id;
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
            currentDirection: Direction.up, path: [], finished: false
        });
        robOutputCounter[robotIds[i]] = 0;
    }
}

/**
 * draws the map, paths and robots
 * @param showPosition true if canvas is drawn to show a past position
 */
function draw(showPosition) {

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    drawMap();

    let selected = null;

    for (let i = 0; i < robots.length; i++) {
        // skip selected robot
        if (parseInt(robots[i].id) !== parseInt(selectedRobot)) {
            computePath(robots[i], i, showPosition);
            drawPath(robots[i]);
        } else {
            selected = i;
        }
    }

    // draw selected as last to be on top
    computePath(robots[selected], selected, showPosition);
    drawPath(robots[selected]);

    for (let i = 0; i < robots.length; i++) {
        if (i !== selected) {
            drawRobot(robots[i], i);
        }
    }
    drawRobot(robots[selected], selected);
}



/**
 * draws the map
 */
function drawMap() {
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
            if (positionToShow.x === x && positionToShow.y === y) {
                ctx.fillStyle = lightGreen;
                positionToShow.x = null;
                positionToShow.y = null;
            }

            // draw checkerboard-pattern if current position = finish position
            if (x === finish.x && y === finish.y) {

                let squareSize = w/5;
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

function computePath(robot, number, showPosition) {

    // add offset to the path to prevent overlapping
    let offset = 0;

    if (number === 1) {
        offset = pathWidth;
    } else if (number === 2) {
        offset = -pathWidth;
    }

    let posX = (robot.posX * step) + step / 2 + offset;
    let posY = (robot.posY * step) + step / 2 + offset;

    /* // todo: possible fix for ugly offset on turns
    if (robot.path.length > 3 && !showPosition) {
        adjustOffset(robot, posX, posY, offset);
    }*/

    if (!showPosition) { // don't push the path if canvas is redrawn to show past position
        robot.path.push({x: posX, y: posY});
    }
}

/**
 * determins if an offset adjustment is needed
 */
function adjustOffset(robot, posX, posY, offset) {

    let oldPosition = robot.path[robot.path.length-2];

    if (oldPosition.x === posX && oldPosition.y === posY) {
        // todo implement for all robots
    } else if (posX === robot.path[robot.path.length-3].x && posY === robot.path[robot.path.length-3].y) { // for rob1 --> because of turn

        if (robot.currentDirection === Direction.up || robot.currentDirection === Direction.down) {
            robot.path[robot.path.length-2].y -= offset;
        } else {
            robot.path[robot.path.length-2].x -= offset;
        }
        robot.path[robot.path.length-1] = robot.path[robot.path.length-2];

    }

}

/**
 * draws the covered path
 */
function drawPath(robot) {

    ctx.beginPath();

    for (let i = 0; i < robot.path.length; i++) {
        if (i === 0) {
            ctx.moveTo(robot.path[0].x, robot.path[0].y);
        } else {
            ctx.lineTo(robot.path[i].x, robot.path[i].y);
        }
    }

    // if the robot is not selected --> path with opacity
    if(parseInt(selectedRobot) === parseInt(robot.id)) {
        ctx.strokeStyle = robot.color;
    } else {
        let rgb = robot.color.convertToRGB();
        ctx.strokeStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 0.6)";
    }

    ctx.lineWidth = pathWidth;
    ctx.stroke();
}

String.prototype.convertToRGB = function(){

    // delete #
    let color = this.substring(1);

    const aRgbHex = color.match(/.{1,2}/g);
    const aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    return aRgb;
}

/**
 * draws the robot
 */
function drawRobot(robot) {

    ctx.beginPath();
    ctx.fillStyle = robot.color;

    let posX = robot.path[robot.path.length-1].x;
    let posY = robot.path[robot.path.length-1].y;

    ctx.arc(posX, posY, radius, 2*Math.PI, false);
    ctx.fill();

    // show direction of robot
    ctx.fillStyle = "#181818";
    ctx.font = radius + 'px Arial';
    ctx.textAlign = "center";

    switch (robot.currentDirection) {
        case Direction.up:
            ctx.fillText("\u2B9D", posX, posY + radius/3);
            break;
        case Direction.right:
            ctx.fillText("\u2B9E", posX, posY + radius/3);
            break;
        case Direction.down:
            ctx.fillText("\u2B9F", posX, posY + radius/3);
            break;
        case Direction.left:
            ctx.fillText("\u2B9C", posX, posY + radius/3);
            break;
        default:
            break;
    }

}

/**
 * calls the appropriate moving-algorithm depending on the robot
 */
function moveOneStep() {

    for (let i = 0; i < robots.length; i++) {
        if (robots[i].finished === false) {
            switch (robots[i].id) {
                case '1':
                    wallFollower(robots[i]);
                    break;
                case '2':
                    console.log("Tremaux not implemented yet");
                    break;
                case '3':
                    console.log("Ariadne not implemented yet");
                    break;
                case '4':
                    console.log("Pledge not implemented yet");
                    //pledge(robots[i]);
                    break;
                case '5':
                    randomFollower(robots[i]);
                    break;
                default:
                    break;
            }
        }
    }

    draw();

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

    while (autoMoveActivated) {
        await sleep(100);
        moveOneStep();
    }
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
    let robot = null;

    for (let i = 0; i < robots.length; i++) {
        if (parseInt(robots[i].id) === robotId) {
            robot = robots[i];
        }
    }

    let coordinatePosition = robot.path[position];

    positionToShow.x = Math.floor(coordinatePosition.x / step);
    positionToShow.y = Math.floor(coordinatePosition.y / step);

    draw(true);

}

function addOutput(text, successful, robotId) {

    let output = document.createElement("code");
    output.setAttribute("class", "output-text");
    output.setAttribute("onmouseover", "showPosition(" + robotId + ", " + robOutputCounter[robotId] + ")");

    output.innerText = text;

    if (successful) {
        output.setAttribute("style", "color: lightGreen; margin-bottom: 20px;");
        output.innerText += " \u2713 "; // check mark
        robOutputCounter[robotId]++;
    } else {
        output.setAttribute("style", "color: white;");
        output.innerText += " \u2717 "; // x mark
    }

    let outputDiv = document.getElementById("output-robot-" + robotId);
    outputDiv.appendChild(output);

    // auto-scroll --> always show the latest output
    outputScreen.scrollTop = outputScreen.scrollHeight;
}

robotGrid.addEventListener('click', (event) => {

    let index = event.target.id.lastIndexOf("-");
    let robotId = parseInt(event.target.id.substring(index+1));

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
    document.getElementById("output-robot-" + selectedRobot).style.display = "none";
    // show new one
    document.getElementById("output-robot-" + robotId).style.display = "block";

    // scroll to the end
    outputScreen.scrollTop = outputScreen.scrollHeight;

    selectedRobot = robotId;
    draw(true);
});

/**-------------------------------------
 *              Algorithms
 -------------------------------------*/


let followerDecisions = [{x:1, y:0}, {x:0, y:-1}, {x:-1, y:0}, {x:0, y:1}]; // abhängig von Startpunkt: rechts - oben - links
let followerDirections = [Direction.right, Direction.up, Direction.left, Direction.down];

/**
 * Wall-Follower V2
 * @param robot
 */
function wallFollower(robot) {

    let direction = computeDirectionNumber(robot); // starting direction

    for (let i = 0; i < 3; i++) {
        // check if position is on map
        if (robot.posX + followerDecisions[(direction + i) % 4].x < simulation.map.length
            && robot.posX + followerDecisions[(direction + i) % 4].x >= 0
            && robot.posY + followerDecisions[(direction + i) % 4].y < simulation.map.length
            && robot.posY + followerDecisions[(direction + i) % 4].y >= 0) {
            // check for path
            if (simulation.map[robot.posY + followerDecisions[(direction + i) % 4].y][robot.posX + followerDecisions[(direction + i) % 4].x] >= 1) {
                robot.posX += followerDecisions[(direction + i) % 4].x;
                robot.posY += followerDecisions[(direction + i) % 4].y;
                robot.currentDirection = followerDirections[(direction + i) % 4];
                wallFollowerDecisions(i + 1, robot.id);
                finishCheck(robot);
                return;
            }
        }
    }
    wallFollowerDecisions(4, robot.id);
    robot.currentDirection = followerDirections[(direction + 3) % 4] // turn around
}
/**
 * wall-follower V2
 */
function oldWallFollower(robot) {

    switch (robot.currentDirection) {
        case Direction.up:

            if (robot.posX + 1 < simulation.map.length) {
                if (simulation.map[robot.posY][robot.posX + 1] >= 1) {
                    robot.posX += 1;
                    wallFollowerDecisions(1, robot.id);
                    robot.currentDirection = Direction.right;
                    break;
                }
            }
            if (robot.posY - 1 >= 0) {
                if (simulation.map[robot.posY - 1][robot.posX] >= 1) {
                    robot.posY -= 1;
                    wallFollowerDecisions(2, robot.id);
                    break;
                }
            }
            if (robot.posX - 1 >= 0) {
                if (simulation.map[robot.posY][robot.posX - 1] >= 1) {
                    robot.posX -= 1;
                    wallFollowerDecisions(3, robot.id);
                    robot.currentDirection = Direction.left;
                    break;
                }
            }
            // else
            wallFollowerDecisions(4, robot.id);
            robot.currentDirection = Direction.down;
            break;

        case Direction.down:

            if (robot.posX - 1 >= 0) {
                if (simulation.map[robot.posY][robot.posX - 1] >= 1) {
                    robot.posX -= 1;
                    wallFollowerDecisions(1, robot.id);
                    robot.currentDirection = Direction.left;
                    break;
                }
            }
            if (robot.posY + 1 < simulation.map.length) {
                if (simulation.map[robot.posY + 1][robot.posX] >= 1) {
                    robot.posY += 1;
                    wallFollowerDecisions(2, robot.id);
                    break;
                }
            }
            if (robot.posX + 1 < simulation.map.length) {
                if (simulation.map[robot.posY][robot.posX + 1] >= 1) {
                    robot.posX += 1;
                    wallFollowerDecisions(3, robot.id);
                    robot.currentDirection = Direction.right;
                    break;
                }
            }

            wallFollowerDecisions(4, robot.id);
            robot.currentDirection = Direction.up;
            break;

        case Direction.left:

            if (robot.posY - 1 >= 0) {
                if (simulation.map[robot.posY - 1][robot.posX] >= 1) {
                    robot.posY -= 1;
                    wallFollowerDecisions(1, robot.id);
                    robot.currentDirection = Direction.up;
                    break;
                }
            }
            if (robot.posX - 1 >= 0) {
                if (simulation.map[robot.posY][robot.posX - 1] >= 1) {
                    robot.posX -= 1;
                    wallFollowerDecisions(2, robot.id);
                    break;
                }
            }
            if (robot.posY + 1 < simulation.map.length) {
                if (simulation.map[robot.posY + 1][robot.posX] >= 1) {
                    robot.posY += 1;
                    wallFollowerDecisions(3, robot.id);
                    robot.currentDirection = Direction.down;
                    break;
                }
            }

            wallFollowerDecisions(4, robot.id);
            robot.currentDirection = Direction.right;
            break;

        case Direction.right:

            if (robot.posY + 1 < simulation.map.length) {
                if (simulation.map[robot.posY + 1][robot.posX] >= 1) {
                    robot.posY += 1;
                    wallFollowerDecisions(1, robot.id);
                    robot.currentDirection = Direction.down;
                    break;
                }
            }
            if (robot.posX + 1 < simulation.map.length) {
                if (simulation.map[robot.posY][robot.posX + 1] >= 1) {
                    robot.posX += 1;
                    wallFollowerDecisions(2, robot.id);
                    break;
                }
            }
            if (robot.posY - 1 >= 0) {
                if (simulation.map[robot.posY - 1][robot.posX] >= 1) {
                    robot.posY -= 1;
                    wallFollowerDecisions(3, robot.id);
                    robot.currentDirection = Direction.up;
                    break;
                }
            }

            wallFollowerDecisions(4, robot.id);
            robot.currentDirection = Direction.left;
            break;
    }

    // check if finished
    finishCheck(robot);
}

let turnCounter = 0;
let directions = [Direction.up, Direction.left, Direction.down, Direction.right];

function pledge(robot) {

    /*
    Wiederhole bis Wand berührt wird
        Gehe gerade aus
    Drehung nach links
    Wiederhole bis Drehzähler auf 0 steht
        Folge der Wand
        Falls Drehung
            Adaptiere Drehzähler
    */

    // wiederhole bis Wand berührt wird
    //      gehe gerade aus
    switch (robot.currentDirection) {
        case Direction.up:
            if (simulation.map[robot.posY-1][robot.posX] === 1) {
                robot.posY -= 1;
                return;
            }
            break;
        case Direction.right:
            if (simulation.map[robot.posY][robot.posX+1] === 1) {
                robot.posX += 1;
                return;
            }
            break;
        case Direction.down:
            if (simulation.map[robot.posY+1][robot.posX] === 1) {
                robot.posY += 1;
                return;
            }
            break;
        case Direction.left:
            if (simulation.map[robot.posY][robot.posX-1] === 1) {
                robot.posX -= 1;
                return;
            }
            break;
        default:
            break;
    }

    // Drehung nach links
    turnCounter++;
    robot.currentDirection = directions[turnCounter % 4];

    console.log("turned left, new direction: " + robot.currentDirection);




}

/**
 * random direction decision
 * @param robot
 */
function randomFollower(robot) {

    let possibleWays = [];

    // detect possible ways
    if (robot.posY - 1 !== simulation.map.length) {
        if (simulation.map[robot.posY - 1][robot.posX] === 1) {
            possibleWays.push(Direction.up);
        } // up
    }

    if (robot.posX + 1 !== simulation.map.length) {
        if (simulation.map[robot.posY][robot.posX + 1] === 1) {
            possibleWays.push(Direction.right);
        } // right
    }

    if (robot.posY + 1 !== simulation.map.length) {
        if (simulation.map[robot.posY + 1][robot.posX] === 1) {
            possibleWays.push(Direction.down);
        } // down
    }

    if (robot.posX - 1 !== simulation.map.length) {
        if (simulation.map[robot.posY][robot.posX - 1] === 1) {
            possibleWays.push(Direction.left);
        } // left
    }

    let direction = possibleWays[getRandomInt(0, possibleWays.length)];

    switch (direction) {
        case 'up':
            robot.posY -= 1;
            robot.direction = Direction.up;
            addOutput("go up", true, robot.id);
            break;
        case 'right':
            robot.posX += 1;
            robot.direction = Direction.right;
            addOutput("go right", true, robot.id);
            break;
        case 'down':
            robot.posY += 1;
            robot.direction = Direction.down;
            addOutput("go down", true, robot.id);
            break;
        case 'left':
            robot.posX -= 1;
            robot.direction = Direction.left;
            addOutput("go left", true, robot.id);
            break;
        default:
            break;
    }

    // check if finished
    finishCheck(robot);
}

function wallFollowerDecisions(number, robotId) {
    switch (number) {
        case 1:
            addOutput("gehe rechts", true, robotId);
            break;
        case 2:
            addOutput("gehe rechts", false, robotId);
            addOutput("gehe geradeaus", true, robotId);
            break;
        case 3:
            addOutput("gehe rechts", false, robotId);
            addOutput("gehe geradeaus", false, robotId);
            addOutput("gehe links", true, robotId);
            break;
        case 4:
            addOutput("gehe rechts", false, robotId);
            addOutput("gehe geradeaus", false, robotId);
            addOutput("gehe links", false, robotId);
            addOutput("drehe um", true, robotId);
            break;
        default:
            break;
    }
}

function computeDirectionNumber(robot) {

    switch (robot.currentDirection) {
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

function finishCheck(robot) {
    if (robot.posY === finish.y && robot.posX === finish.x) {
        addOutput("FINISHED!",true, robot.id);
        robot.finished = true;
    }
}

init();
