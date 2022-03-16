// labyrinth map

"use strict";

class LabyrinthMap {

    darkGrey = "#808080";
    lightGrey = "#D3D3D3";
    lightGreen = "#B8FF9D";

    start;
    finish;

    constructor(mapData, title, startPos, finishPos, startInPixel, finishInPixel, canvas, canvasSize) {

        this.mapData = mapData;
        this.title = title;
        this.startPos = startPos;
        this.finishPos = finishPos;
        this.canvas = canvas;
        this.canvasSize = canvasSize;

        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;

        this.start = startInPixel;
        this.finish = finishInPixel;

    }

    drawMap(ctx, showPosition, reset, positionToShow) {

        const h = this.canvasSize / this.mapData.length;
        for (let y = 0; y < this.mapData.length; y++) {
            let row = this.mapData[y];
            let w = this.canvasSize / row.length;
            for (let x = 0; x < row.length; x++) {
                let c = row[x];
                ctx.beginPath();

                if (c === 0) {
                    ctx.fillStyle = this.darkGrey;
                } else {
                    ctx.fillStyle = this.lightGrey;
                }

                // draw position from output-mouseover
                if (showPosition && !reset && positionToShow.x === x && positionToShow.y === y) {
                    ctx.fillStyle = this.lightGreen;
                }

                // draw checkerboard-pattern if current position = finish position
                if (x === this.finish.x && y === this.finish.y) {

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
}

