const Direction = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right'
};

const maps = [];

let canvas = null,
    ctx = null,
    canvasSize = null,
    simulation = {},
    robots = [], // consisting of robot objects with: id, color, posX, posY, direction, path, finished
    step = null,
    radius = null,
    autoMoveActivated = false;

const outputScreen = document.getElementById("output-screen");

const darkGrey = "#808080",
    lightGrey = "#D3D3D3",
    lightRed = "#FFAE9D",
    lightGreen = "#B8FF9D",
    robotColors = ["", "yellow", "green", "blue", "red", "grey"];

const path = [],
    start = {},
    finish = {};

function init() {

    canvas = document.getElementById("simulation");
    canvasSize = 1000;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx = canvas.getContext('2d');

    maps.push([[0,0,0,0,0,3,0,0,0,0,0],
                [0,1,0,1,0,1,1,1,1,1,0],
                [0,1,1,1,0,0,0,1,0,1,0],
                [0,1,0,1,0,1,1,1,0,1,0],
                [0,1,0,1,1,1,0,0,0,1,0],
                [0,1,0,0,0,1,0,0,1,1,0],
                [0,1,0,1,1,1,1,0,0,0,0],
                [0,0,0,1,0,0,1,0,1,0,0],
                [0,0,0,1,0,0,1,1,1,0,0],
                [0,1,1,1,0,1,1,0,1,1,0],
                [0,2,0,0,0,0,0,0,0,0,0]]);

maps.push([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
            [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0],
            [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
            [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0],
            [0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
            [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0]]);

maps.push([[0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 3, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 2, 0, 0, 0, 0]]);

maps.push([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 3],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0],
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]]);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // get map
    let mapId = parseInt(urlParams.get("map"));
    simulation.map = maps[mapId];

    radius = (canvasSize / simulation.map.length) / 4;
    step = canvasSize / simulation.map.length;

    initStartAndFinish();

    // get robots
    let temp = urlParams.get("robots");
    initRobots(temp.split("_"));

    loop();
}

function initStartAndFinish() {
    let length = simulation.map.length;

    for (let y = 0; y < length; y++) {
        for ( let x = 0; x < length; x++) {
            if (simulation.map[y][x] > 1) {
                if (simulation.map[y][x] === 2) {   // start
                    start.y = y;
                    start.x = x;
                } else {    // finish
                    finish.y = y;
                    finish.x = x;
                }
            }
        }
    }
}

function initRobots(robotIds) {

    let tempX = (step * start.x) + step/2;
    let tempY = (step * start.y) + step/2;

    for (let i = 0; i < robotIds.length; i++) {
        robots.push({id: robotIds[i], color: robotColors[robotIds[i]], posX: start.x, posY: start.y,
            currentDirection: Direction.up, path: [], finished: false});
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
    var h = canvasSize / simulation.map.length;
    for (var y = 0; y < simulation.map.length; y++) {
        var row = simulation.map[y];
        var w = canvasSize / row.length;
        for (var x = 0; x < row.length; x++) {
            var c = row[x];
            ctx.beginPath();

            if (c === 0) {
                ctx.fillStyle = darkGrey;
            } else if (c === 1) {
                ctx.fillStyle = lightGrey;
            } else if (c === 2) {
                ctx.fillStyle = lightRed;
            } else {
                ctx.fillStyle = lightGreen;
            }

            ctx.rect(w * x, h * y, w-0.2, h-0.2);
            ctx.fill();
        }
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

    ctx.strokeStyle = robot.color;

    // todo: solution for overlapping paths
    ctx.lineWidth = 10;
    ctx.stroke();
}

/**
 * draws the robot
 */
function drawRobot(robot, number) {
    ctx.beginPath();
    ctx.fillStyle = robot.color;

    let distance = 10;

    let posX = (robot.posX * step) + step/2 + distance * number;
    let posY = (robot.posY * step) + step/2 + distance * number;

    ctx.arc(posX, posY, radius, 2 * Math.PI, false);
    ctx.fill();

    robot.path.push({x: posX, y: posY});
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
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoMove() {

    autoMoveActivated = !autoMoveActivated;

    while(autoMoveActivated) {
        await sleep(300);
        moveOneStep();
    }
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function addOutput(text, successful) {
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
    outputScreen.appendChild(output);

    // auto-scroll --> always show the latest output
    outputScreen.scrollTop = outputScreen.scrollHeight;
}

/**-------------------------------------
 *              Algorithms
 -------------------------------------*/

/**
 * wall-follower V2
 */
function wallFollower(robot) {

    switch (robot.currentDirection) {
        case Direction.up:

            if (robot.posX+1 < simulation.map.length) {
                if (simulation.map[robot.posY][robot.posX+1] >= 1) {
                    robot.posX += 1;
                    wallFollowerDecisions(1);
                    robot.currentDirection = Direction.right;
                    break;
                }
            }
            if (robot.posY-1 >= 0) {
                if (simulation.map[robot.posY-1][robot.posX] >= 1) {
                    robot.posY -= 1;
                    wallFollowerDecisions(2);
                    break;
                }
            }
            if (robot.posX-1 >= 0) {
                if (simulation.map[robot.posY][robot.posX-1] >= 1) {
                    robot.posX -= 1;
                    wallFollowerDecisions(3);
                    robot.currentDirection = Direction.left;
                    break;
                }
            }
            // else
            wallFollowerDecisions(4);
            robot.currentDirection = Direction.down;
            break;

        case Direction.down:

            if (robot.posX-1 >= 0) {
                if (simulation.map[robot.posY][robot.posX-1] >= 1) {
                    robot.posX -= 1;
                    wallFollowerDecisions(1);
                    robot.currentDirection = Direction.left;
                    break;
                }
            }
            if(robot.posY+1 < simulation.map.length) {
                if (simulation.map[robot.posY+1][robot.posX] >= 1) {
                    robot.posY += 1;
                    wallFollowerDecisions(2);
                    break;
                }
            }
            if(robot.posX+1 < simulation.map.length) {
                if (simulation.map[robot.posY][robot.posX+1] >= 1) {
                    robot.posX += 1;
                    wallFollowerDecisions(3);
                    robot.currentDirection = Direction.right;
                    break;
                }
            }

            wallFollowerDecisions(4);
            robot.currentDirection = Direction.up;
            break;

        case Direction.left:

            if(robot.posY-1 >= 0) {
                if (simulation.map[robot.posY-1][robot.posX] >= 1) {
                    robot.posY -= 1;
                    wallFollowerDecisions(1);
                    robot.currentDirection = Direction.up;
                    break;
                }
            }
            if(robot.posX-1 >= 0) {
                if (simulation.map[robot.posY][robot.posX-1] >= 1) {
                    robot.posX -= 1;
                    wallFollowerDecisions(2);
                    break;
                }
            }
            if(robot.posY+1 < simulation.map.length) {
                if (simulation.map[robot.posY+1][robot.posX] >= 1) {
                    robot.posY += 1;
                    wallFollowerDecisions(3);
                    robot.currentDirection = Direction.down;
                    break;
                }
            }

            wallFollowerDecisions(4);
            robot.currentDirection = Direction.right;
            break;

        case Direction.right:

            if(robot.posY+1 < simulation.map.length) {
                if (simulation.map[robot.posY+1][robot.posX] >= 1) {
                    robot.posY += 1;
                    wallFollowerDecisions(1);
                    robot.currentDirection = Direction.down;
                    break;
                }
            }
            if(robot.posX+1 < simulation.map.length) {
                if (simulation.map[robot.posY][robot.posX+1] >= 1) {
                    robot.posX += 1;
                    wallFollowerDecisions(2);
                    break;
                }
            }
            if(robot.posY-1 >= 0) {
                if (simulation.map[robot.posY-1][robot.posX] >= 1) {
                    robot.posY -= 1;
                    wallFollowerDecisions(3);
                    robot.currentDirection = Direction.up;
                    break;
                }
            }

            wallFollowerDecisions(4);
            robot.currentDirection = Direction.left;
            break;
    }

    // check if finish
    if (simulation.map[robot.posY][robot.posX] === 3) {
        addOutput("FINISHED!");
        robot.finished = true;
    }
}

/**
 * random direction decision
 * @param robot
 */
function randomFollower(robot) {

    let possibleWays = [];

    // detect possible ways
    if (robot.posY-1 !== simulation.map.length) {
        if (simulation.map[robot.posY-1][robot.posX] === 1) {possibleWays.push(Direction.up);} // up
    }

    if (robot.posX+1 !== simulation.map.length) {
        if (simulation.map[robot.posY][robot.posX+1] === 1) {possibleWays.push(Direction.right);} // right
    }

    if (robot.posY+1 !== simulation.map.length) {
        if (simulation.map[robot.posY+1][robot.posX] === 1) {possibleWays.push(Direction.down);} // down
    }

    if (robot.posX-1 !== simulation.map.length) {
        if (simulation.map[robot.posY][robot.posX - 1] === 1) {possibleWays.push(Direction.left);} // left
    }

    let direction = possibleWays[getRandomInt(0, possibleWays.length)];

    switch (direction) {
        case 'up':
            robot.posY -= 1;

            break;
        case 'right':
            robot.posX += 1;
            break;
        case 'down':
            robot.posY += 1;
            break;
        case 'left':
            robot.posX -= 1;
            break;
        default:
            break;
    }
}

function wallFollowerDecisions(number) {
    switch (number) {
        case 1:
            addOutput("gehe rechts", true);
            break;
        case 2:
            addOutput("gehe rechts", false);
            addOutput("gehe geradeaus", true);
            break;
        case 3:
            addOutput("gehe rechts", false);
            addOutput("gehe geradeaus", false);
            addOutput("gehe links", true);
            break;
        case 4:
            addOutput("gehe rechts", false);
            addOutput("gehe geradeaus", false);
            addOutput("gehe links", false);
            addOutput("drehe um", true);
            break;
        default:
            break;
    }
}

init();
