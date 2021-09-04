var width = 120,
    height = 120;

var game = {};

var darkGrey = '#808080',
    lightGrey = '#D3D3D3';

function init() {
    /*
    canvas = document.getElementById('game');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
     */

    //let tempMap = {id: 100, map: [[1,1,1], [1,0,1], [1,1,1]], mapTitle: "added-at-start", startPos: 0, finishPos: 0};

    //localStorage.setItem("map-" + 100, JSON.stringify(tempMap));

    //drawMap();
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

init();
