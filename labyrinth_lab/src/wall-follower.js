// wall-follower algorithm

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


class WallFollower {

    constructor(id, posX, posY, currentDirection, radius, offset) {
        this.id = id;
        this.posX = posX;
        this.posY = posY;
        this.currentDirection = currentDirection;
        this.radius = radius;
        this.offset = offset;

        this.name = "Wall";
        this.color = "#f3dd7e";
        this.path = [];
        this.pastDirections = [];
        this.finished = false;

        this.path.push({x: this.posX, y: this.posY});
        this.pastDirections.push(this.currentDirection);
    }

    moveOneStep(map) {

        let direction = this.computeDirectionNumber(this.currentDirection); // starting direction

        for (let i = 0; i < 3; i++) {
            // check if position is on map
            if (this.checkIfOnMap(direction + i, map)) {
                // check for path
                if (map[this.posY + robotDecisions[(direction + i) % 4].y][this.posX + robotDecisions[(direction + i) % 4].x] >= 1) {
                    this.posX += robotDecisions[(direction + i) % 4].x;
                    this.posY += robotDecisions[(direction + i) % 4].y;
                    this.currentDirection = robotDirections[(direction + i) % 4];

                    this.wallFollowerOutput(i);
                    this.path.push({x: this.posX, y: this.posY});
                    this.pastDirections.push(this.currentDirection);
                    return;
                }
            }
        }
        this.wallFollowerOutput(3);
        this.currentDirection = robotDirections[(direction + 3) % 4]; // turn around
        this.path.push({x: this.posX, y: this.posY});
        this.pastDirections.push(this.currentDirection);
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
            i === 0 ? ctx.moveTo(convertToPixel(this.path[0].x) + this.offset, convertToPixel(this.path[0].y)) + this.offset : ctx.lineTo(convertToPixel(this.path[i].x) + this.offset, convertToPixel(this.path[i].y) + this.offset);
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

    wallFollowerOutput(number) {

        let outputWrapperData = [];

        switch (number) {
            case 0:
                outputWrapperData.push({text: "gehe rechts", id: this.id, style: 1});
                break;
            case 1:
                outputWrapperData.push({text: "gehe rechts", id: this.id, style: 3});
                outputWrapperData.push({text: "gehe geradeaus", id: this.id, style: 1});
                break;
            case 2:
                outputWrapperData.push({text: "gehe rechts", id: this.id, style: 3});
                outputWrapperData.push({text: "gehe geradeaus", id: this.id, style: 3});
                outputWrapperData.push({text: "gehe links", id: this.id, style: 1});
                break;
            case 3:
                outputWrapperData.push({text: "gehe rechts", id: this.id, style: 3});
                outputWrapperData.push({text: "gehe geradeaus", id: this.id, style: 3});
                outputWrapperData.push({text: "gehe links", id: this.id, style: 3});
                outputWrapperData.push({text: "drehe um", id: this.id, style: 1});
                break;
            default:
                break;
        }
        addOutput(outputWrapperData, false);
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

