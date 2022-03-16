// pledge algorithm

"use strict";

// const Direction = {
//     up: 'up',
//     down: 'down',
//     left: 'left',
//     right: 'right'
// };
//
// // todo: maybe replace with images
// const directionArrows = ['⮝', '⮜', '⮟', '⮞'];
//
// const robotDirections = [Direction.right, Direction.up, Direction.left, Direction.down];
// const robotDecisions = [{x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}];


class Pledge {

    constructor(id, posX, posY, currentDirection, radius, offset) {
        this.id = id;
        this.posX = posX;
        this.posY = posY;
        this.currentDirection = currentDirection;
        this.radius = radius;
        this.offset = offset;

        this.name = "Pledge";
        this.color = "#c56e6e";
        this.path = [];
        this.pastDirections = [];
        this.finished = false;

        this.turnCounter = 0;
        this.pushPathAndDirection();
    }

    moveOneStep(map) {

        let outputWrapperData = [];

        if (this.turnCounter === 0) {

            let direction = this.computeDirectionNumber(this.currentDirection);

            if (this.checkIfOnMap(direction + 1, map)) { // go straight
                if (map[this.posY + robotDecisions[(direction + 1) % 4].y][this.posX + robotDecisions[(direction + 1) % 4].x] === 1) {
                    outputWrapperData.push({text: "Wand berührt", id: this.id, style: 3});

                    this.posX += robotDecisions[(direction + 1) % 4].x;
                    this.posY += robotDecisions[(direction + 1) % 4].y;
                    outputWrapperData.push({text: "gehe geradeaus", id: this.id, style: 1});
                    addOutput(outputWrapperData, false);
                    this.pushPathAndDirection();
                    return;
                }
            }

            // turn left
            this.currentDirection = robotDirections[(this.computeDirectionNumber(this.currentDirection) + 2) % 4];
            this.turnCounter++;
            outputWrapperData.push({text: "Wand berührt", id: this.id, style: 1});
            outputWrapperData.push({text: "Drehung nach links", id: this.id, style: 1});
            outputWrapperData.push({text: "erhöhe Drehzähler: " + this.turnCounter, id: this.id, style: 1});
        }

        let direction = this.computeDirectionNumber(this.currentDirection);

        for (let i = 0; i < 3; i++) {
            if (this.checkIfOnMap(direction + i, map)) {

                if (map[this.posY + robotDecisions[(direction + i) % 4].y][this.posX + robotDecisions[(direction + i) % 4].x] === 1) {

                    this.posX += robotDecisions[(direction + i) % 4].x;
                    this.posY += robotDecisions[(direction + i) % 4].y;
                    this.currentDirection = robotDirections[(direction + i) % 4];

                    outputWrapperData.push({text: "Drehzähler auf 0", id: this.id, style: 3});
                    outputWrapperData.push({text: "folge der Wand", id: this.id, style: 1});

                    if (i === 0) { // follow robot right
                        this.turnCounter--;
                        outputWrapperData.push({text: "Drehung", id: this.id, style: 1});
                        outputWrapperData.push({text: "adaptiere Drehzähler: " + this.turnCounter, id: this.id, style: 1});

                    } else if (i === 1) { // follow robot straight
                        outputWrapperData.push({text: "Drehung", id: this.id, style: 3});

                    } else {
                        this.turnCounter++;
                        outputWrapperData.push({text: "Drehung", id: this.id, style: 1});
                        outputWrapperData.push({text: "adaptiere Drehzähler: " + this.turnCounter, id: this.id, style: 1});
                    }
                    addOutput(outputWrapperData, false);
                    this.pushPathAndDirection();
                    return;
                }
            }
        }
        this.currentDirection = robotDirections[(direction + 2) % 4]; // just turn left (only happens when dead end)
        this.turnCounter++;
        outputWrapperData.push({text: "Drehzähler auf 0", id: this.id, style: 3});
        outputWrapperData.push({text: "folge der Wand", id: this.id, style: 1});
        outputWrapperData.push({text: "Drehung", id: this.id, style: 1});
        outputWrapperData.push({text: "adaptiere Drehzähler: " + this.turnCounter, id: this.id, style: 1});
        addOutput(outputWrapperData, false);
        this.pushPathAndDirection();
    }

    drawRobot(ctx, showPosition, reset) {

        let alpha = 0.2;

        ctx.beginPath();

        if (showPosition && !reset) {
            let rgb = this.color.convertToRGB();
            ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", " + alpha + ")";
        } else {
            ctx.fillStyle = this.color;
        }

        let posX = convertToPixel(this.path[this.path.length - 1].x) + this.offset;
        let posY = convertToPixel(this.path[this.path.length - 1].y) + this.offset;

        ctx.arc(posX, posY, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        // show direction of robot
        if (showPosition && !reset) {
            ctx.fillStyle = "rgba(24, 24, 24, " + alpha + ")";
        } else {
            ctx.fillStyle = "rgb(24, 24, 24)";
        }
        ctx.font = this.radius + 'px Arial';
        ctx.textAlign = "center";

        // draw direction-arrow
        let direction = this.computeDirectionNumber(this.currentDirection);
        ctx.fillText(directionArrows[direction], posX, posY + this.radius / 3);
    }

    drawPastPosition(position) {

        let showPosX = convertToPixel(this.path[position].x) + this.offset;
        let showPosY = convertToPixel(this.path[position].y) + this.offset;

        // body
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = this.radius + 'px Arial';
        ctx.textAlign = "center";
        ctx.arc(showPosX, showPosY, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        // arrow
        ctx.fillStyle = "#181818";
        let showPosDirection = this.computeDirectionNumber(this.pastDirections[position]);
        ctx.fillText(directionArrows[showPosDirection], showPosX, showPosY + this.radius / 3);

    }

    drawPath(ctx, showPosition, reset, selectedRobotId) {

        ctx.beginPath();

        for (let i = 0; i < this.path.length; i++) {
            i === 0 ? ctx.moveTo(convertToPixel(this.path[0].x) + this.offset, convertToPixel(this.path[0].y) + this.offset) : ctx.lineTo(convertToPixel(this.path[i].x) + this.offset, convertToPixel(this.path[i].y) + this.offset);
        }

        if (!showPosition || reset) {
            if (selectedRobotId === this.id) {
                ctx.strokeStyle = this.color;
            } else {
                let rgb = this.color.convertToRGB();
                ctx.strokeStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 0.4)";
            }
        } else {
            let rgb = this.color.convertToRGB();
            ctx.strokeStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 0.2)";
        }

        ctx.lineWidth = this.radius / 1.5;
        ctx.stroke();
    }

    drawPastPath(ctx, index) {

        ctx.beginPath();

        for (let i = 0; i <= index; i++) {
            i === 0 ? ctx.moveTo(convertToPixel(this.path[0].x) + this.offset, convertToPixel(this.path[0].y) + this.offset) : ctx.lineTo(convertToPixel(this.path[i].x) + this.offset, convertToPixel(this.path[i].y) + this.offset);
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.radius / 1.5;
        ctx.stroke();
    }

    computeDirectionNumber(currentDirection) {

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

    checkIfOnMap(direction, map) {

        return this.posX + robotDecisions[(direction) % 4].x < map.length
            && this.posX + robotDecisions[(direction) % 4].x >= 0
            && this.posY + robotDecisions[(direction) % 4].y < map.length
            && this.posY + robotDecisions[(direction) % 4].y >= 0;
    }

    finishCheck(finish) {
        if (this.posY === finish.y && this.posX === finish.x) {
            addOutput([{text: `FINISHED! (${this.path.length - 1} steps)`, id: this.id, style: 1}], true);
            this.finished = true;
            return true;
        }
        return false;
    }

    pushPathAndDirection() {
        this.path.push({x: this.posX, y: this.posY});
        this.pastDirections.push(this.currentDirection);
    }

}

function convertToPixel(position) {
    return (position * step + step/2);
}

String.prototype.convertToRGB = function () {

    let color = this.substring(1);

    const aRgbHex = color.match(/.{1,2}/g);
    return [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
}
