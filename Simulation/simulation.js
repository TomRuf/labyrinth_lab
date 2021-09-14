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

const path = [];

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
    //loop();
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

        addOutput("robot " + robotId + " ready", true, robotId);

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
    }
}

function loop() {
    draw();
    requestAnimFrame(loop);
}

function draw() {

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    drawMap();

    // separated because otherwise robots would be overdrawn
    for (let i = 0; i < robots.length; i++) {
        computePath(robots[i], i);
        drawPath(robots[i]);
    }

    for (let i = 0; i < robots.length; i++) {
        drawRobot(robots[i], i);
    }
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

            if (x === finish.x && y === finish.y) { // draw checkerboard-pattern if current position = finish position

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

function computePath(robot, number) {

    // add offset to the path to prevent overlapping
    let offsetX = 0;
    let offsetY = 0;

    if (number === 1) {
        offsetX = pathWidth;
        offsetY = pathWidth;
    } else if (number === 2) {
        offsetX = -pathWidth;
        offsetY = -pathWidth;
    }

    let posX = (robot.posX * step) + step / 2 + offsetX;
    let posY = (robot.posY * step) + step / 2 + offsetY;

    robot.path.push({x: posX, y: posY});
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

    ctx.strokeStyle = robot.color;

    ctx.lineWidth = pathWidth;
    ctx.stroke();
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


    //canvas_arrow(posX, posY - radius/2, posX, posY + radius/2);
}

function canvas_arrow(fromX, fromY, toX, toY) {
    ctx.beginPath();
    ctx.strokeStyle = "#181818";
    ctx.lineWidth = radius/4;
    ctx.lineCap = 'round';
    let headLen = radius; // length of head in pixels
    let dx = toX - fromX;
    let dy = toY - fromY;
    let angle = Math.atan2(dy, dx);
    ctx.moveTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.stroke();
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

function addOutput(text, successful, robotId) {
    let output = document.createElement("code");
    output.setAttribute("class", "output-text");

    if (successful) {
        //output.setAttribute("style", "color: green;");
        output.innerText = " \u2713 "; // check mark
    } else {
        //output.setAttribute("style", "color: white;");
        output.innerText = " \u2717 "; // x mark
    }

    output.innerText += text;
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
});

/**-------------------------------------
 *              Algorithms
 -------------------------------------*/

/**
 * wall-follower V2
 */
function wallFollower(robot) {

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

function finishCheck(robot) {
    if (robot.posY === finish.y && robot.posX === finish.x) {
        addOutput("FINISHED!",true, robot.id);
        robot.finished = true;
    }
}

init();
