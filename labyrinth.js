const Direction = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right'
};

var canvas = null,
    ctx = null,
    width = 1000,
    height = 1000,
    sizeX = 11,
    sizeY = 11,
    game = {},
    robot = {},
    step = null,
    currPosX = null,
    currPosY = null;

var darkGrey = '#808080',
    lightGrey = '#D3D3D3',
    blue = '#6ddaf1',
    red = '#f35d4f',
    yellow = '#f1e85b';

var path = [];
    selectedAlgorithm = null;
    currentDirection = null;
    finish = {posX: null, posY: null};

function init() {
    canvas = document.getElementById('game');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');

    createGame(sizeX, sizeY, 0);

    step = width / game.map.length;
    robot.px = step + step/2;
    robot.py = step*10 + step/2;

    path.push({x: robot.px, y: robot.py});

    currPosX = 1;
    currPosY = 10;

    currentDirection = Direction.up;
    finish.posX = 5;
    finish.posY = 0;

    loop();
}

function moveOneStep() {

    // todo: remove
    selectedAlgorithm = document.getElementById('algorithm').value;

    // todo: implement all algorithms

    // 1. wall-follower-algorithm
    if(selectedAlgorithm === '1') {
        wallFollowerAlgorithm();
    }

    // 2. tremaux algorithm
    if(selectedAlgorithm === '2') {
    }

    // 3. ariadneal algorithm
    if(selectedAlgorithm === '3') {
    }

    // 4. pledge algorithm
    if(selectedAlgorithm === '4') {
    }

    // 5. random path
    if(selectedAlgorithm === '5') {
    }

    // push new location to the path
    path.push({x: robot.px, y: robot.py});

}

function move() {
    // todo implement

    while (currPosX !== finish.posX || currPosY !== finish.posY) {
        moveOneStep();
    }
    console.log("FINISH!!!")
}

function loop() {
    draw();
    requestAnimFrame(loop);
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    drawMap();

    drawPath();

    drawRobot();
}

/**
 * draws the covered path
 */
function drawPath() {
    ctx.beginPath();

    for (var i = 0; i < path.length; i++) {
        if (i === 0) {
            ctx.moveTo(path[0].x, path[0].y);
        } else {
            ctx.lineTo(path[i].x, path[i].y);
        }
    }

    ctx.strokeStyle = red;
    ctx.lineWidth = 20;
    ctx.stroke();

}

/**
 * draws the robot
 */
function drawRobot() {
    ctx.beginPath();
    ctx.fillStyle = blue;

    ctx.arc(robot.px, robot.py, step/3, 2 * Math.PI, false);
    ctx.fill();
}

/**
 * draws the map
 */
function drawMap() {
    var h = height / game.map.length;
    for (var y = 0; y < game.map.length; y++) {
        var row = game.map[y];
        var w = width / row.length;
        for (var x = 0; x < row.length; x++) {
            var c = row[x];
            ctx.beginPath();

            if (c === 0) {
                ctx.fillStyle = darkGrey;
            } else {
                ctx.fillStyle = lightGrey;
            }

            ctx.rect(w * x, h * y, w, h);
            ctx.fill();
        }
    }
}

function createGame(sizeX, sizeY) {

    // 0 --> wall
    // 1 --> path
    game.map = [[0,0,0,0,0,1,0,0,0,0,0],
                [0,1,0,1,0,1,1,1,1,1,0],
                [0,1,1,1,0,0,0,1,0,1,0],
                [0,1,0,1,0,1,1,1,0,1,0],
                [0,1,0,1,1,1,0,0,0,1,0],
                [0,1,0,0,0,1,0,0,1,1,0],
                [0,1,0,1,1,1,1,0,0,0,0],
                [0,0,0,1,0,0,1,0,1,0,0],
                [0,0,0,1,0,0,1,1,1,0,0],
                [0,1,1,1,0,1,1,0,1,1,0],
                [0,1,0,0,0,0,0,0,0,0,0]];

    // todo: automatic labyrinth generator
    /*for (y = 0; y < sizeY; y++) {
        game.map[y] = [];
        for (x = 0; x < sizeX; x++) {
            if (x === 0 || x === sizeX-1 || y === 0 || y === sizeY-1) {
                game.map[y][x] = 0;
            } else {
                game.map[y][x] = 1;
            }
        }
    }*/
}

/**
 * wall-follower V2
 */
function wallFollowerAlgorithm() {

    switch (currentDirection) {
        case Direction.up:
            if (game.map[currPosY][currPosX+1] === 1) {
                currPosX += 1;
                robot.px += step;
                console.log("moved right");
                currentDirection = Direction.right;

            } else if (game.map[currPosY-1][currPosX] === 1) {
                currPosY -= 1;
                robot.py -= step;
                console.log("moved straight");

            } else if (game.map[currPosY][currPosX-1] === 1) {
                currPosX -= 1;
                robot.px -= step;
                console.log("moved left");
                currentDirection = Direction.left;

            } else {
                console.log("turned around");
                currentDirection = Direction.down;
            }
            break;

        case Direction.down:
            if (game.map[currPosY][currPosX-1] === 1) {
                currPosX -= 1;
                robot.px -= step;
                console.log("moved right");
                currentDirection = Direction.left;

            } else if (game.map[currPosY+1][currPosX] === 1) {
                currPosY += 1;
                robot.py += step;
                console.log("moved straight");

            } else if (game.map[currPosY][currPosX+1] === 1) {
                currPosX += 1;
                robot.px += step;
                console.log("moved left");
                currentDirection = Direction.right;

            } else {
                console.log("turned around");
                currentDirection = Direction.up;
            }
            break;

        case Direction.left:
            if (game.map[currPosY-1][currPosX] === 1) {
                currPosY -= 1;
                robot.py -= step;
                console.log("moved right");
                currentDirection = Direction.up;

            } else if (game.map[currPosY][currPosX-1] === 1) {
                currPosX -= 1;
                robot.px -= step;
                console.log("moved straight");

            } else if (game.map[currPosY+1][currPosX] === 1) {
                currPosY += 1;
                robot.py += step;
                console.log("moved left");
                currentDirection = Direction.down;

            } else {
                console.log("turned around");
                currentDirection = Direction.right;
            }
            break;

        case Direction.right:
            if (game.map[currPosY+1][currPosX] === 1) {
                currPosY += 1;
                robot.py += step;
                console.log("moved right");
                currentDirection = Direction.down;

            } else if (game.map[currPosY][currPosX+1] === 1) {
                currPosX += 1;
                robot.px += step;
                console.log("moved straight");

            } else if (game.map[currPosY-1][currPosX] === 1) {
                currPosY -= 1;
                robot.py -= step;
                console.log("moved left");
                currentDirection = Direction.up;

            } else {
                console.log("turned around");
                currentDirection = Direction.left;
            }
            break;
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

init();
