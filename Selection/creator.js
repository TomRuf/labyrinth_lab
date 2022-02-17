const selectionMap = document.getElementById("selection-map");
const slider = document.getElementById("size-slider");
const mapName = document.getElementById("map-name");
let size = 11;
let lastClickedButton = null;
let clicked = [];
let lineCompleter = false;
let edit = false;

const startField = document.getElementById("draggable-start");
const finishField = document.getElementById("draggable-finish");
const dragButtonsBox = document.getElementById("drag-buttons-box");
let draggedObjectId = null;
let dragImgStart = null;
let dragImgFinish = null;

// colors
const darkGrey = "#808080",
    lightGrey = "#D3D3D3";

// important data
let mapTitle = "Neues Labyrinth";
let startPos = null;
let finishPos = null;
let editMapId = null;

initCreator();

function initCreator() {
    createMap(size);

    dragImgStart = document.createElement("button");
    dragImgStart.setAttribute("class", "draggable-start");
    dragImgStart.style.width = "50px";
    dragImgStart.style.height = "50px";

    dragImgFinish = document.createElement("button");
    dragImgFinish.setAttribute("class", "draggable-finish");
    dragImgFinish.style.width = "30px";
    dragImgFinish.style.height = "30px";
}

slider.oninput = function() {

    size = parseInt(slider.value);
    resetDragButtons();
    startPos = null;
    finishPos = null;
    lastClickedButton = null;

    createMap(size);
}

function loadMapToEdit(mapId, mapObj) {

    size = mapObj.mapData.length;
    startPos = mapObj.startPos;
    finishPos = mapObj.finishPos;
    edit = true;
    editMapId = mapId;
    mapTitle = mapObj.mapTitle;

    createMap(size);

    let id = 0;
    for(let y = 0; y < size; y++) {
        for(let x = 0; x < size; x++) {
            if(mapObj.mapData[y][x] === 1) {
                clicked.push(id);
                // set the color of the clicked field
                let clickedButton = document.getElementById(""+id);
                clickedButton.style.background = lightGrey;
                clickedButton.setAttribute("ondragover", "allowDrop(event)");
            }
            id++;
        }
    }

    // set title
    mapName.setAttribute("placeholder", mapObj.mapTitle);

    // set start
    let startButton = document.getElementById(startPos);
    startField.style.width = "100%";
    startField.style.height = "100%";
    startButton.appendChild(startField);

    // set finish
    let finishButton = document.getElementById(finishPos);
    finishField.style.width = "100%";
    finishField.style.height = "100%";
    finishButton.appendChild(finishField);
}

/**
 * resets the draggable start and finish field
 */
function resetDragButtons() {

    startPos = null;
    finishPos = null;

    startField.style.height = "50px";
    startField.style.width = "50px";
    finishField.style.height = "50px";
    finishField.style.width = "50px";

    dragButtonsBox.appendChild(startField);
    dragButtonsBox.appendChild(finishField);
}

/**
 * resets the creator
 */
function resetCreator() {
    size = 11;
    clicked = [];
    lineCompleter = false;
    lastClickedButton = null;
    mapId = null;
    edit = false;

    document.getElementById("map-name").value = "";
    document.getElementById("size-slider").value = 11;
    mapName.setAttribute("placeholder", "Neues Labyrinth");

    mapTitle = "Neues Labyrinth";

    resetDragButtons();
    createMap(size);
}

/**
 * creates the clickable map, consisting of buttons
 * @param size the amount of buttons in x and y direction
 */
function createMap(size) {

    selectionMap.innerHTML = "";
    clicked = [];

    const buttonSize = 100/size;
    let amount = size * size;

    let black = false;

    for (let i = 0; i < amount; i++) {

        if (i % size === 0) black = !black;

        let newButton = document.createElement("button");
        newButton.setAttribute("id", "" + i);
        newButton.setAttribute("style", "width:" + buttonSize + "%; height:" + buttonSize + "%;");

        if (black && i % 2 === 0) {
            newButton.setAttribute("class", "lab-button-deactivated");
        } else {
            newButton.setAttribute("data-button", "data-button");
            newButton.setAttribute("class", "lab-button");
            newButton.setAttribute("ondrop", "drop(event)");
        }

        selectionMap.appendChild(newButton);
    }
}

/**
 * creates the final map and saves it to the map-array
 */
function saveMap() {

    // check if startPos and finishPos are set
    if (startPos === null || finishPos === null) {
        alert("Don't forget to set start and finish!");
        return;
    }

    let tempMap = [];

    // create new 2d array filled with false
    for (let y = 0; y < size; y++) {
        tempMap[y] = [];
        for (let x = 0; x < size; x++) {
            tempMap[y][x] = 0;
        }
    }

    // add the path segments
    for(let i = 0; i < clicked.length; i++) {
        let buttonNumber = parseInt(clicked[i]);

        let x = buttonNumber % size;
        let y = Math.floor(buttonNumber / size);

        // set path
        tempMap[y][x] = 1;
    }

    // set the name if changed
    let temp = document.getElementById("map-name").value;
    if(temp.length !== 0) {
        mapTitle = temp;
    }

    if(edit) {
        updateMap(editMapId, tempMap, mapTitle, startPos, finishPos);
        edit = false;
    } else {
        addMap(tempMap, mapTitle, startPos, finishPos);
    }

    // todo: delete this
    //logMap(tempMap, startPos, finishPos);

    closeCreatorModal();
}

/**
 * for manually creating default maps
 * prints the 2d array to the console
 */
function logMap(map, startPos, finishPos) {

    console.log("size: " + map[0].length);
    console.log("startPos: " + startPos);
    console.log("finishPos: " + finishPos);
    console.log("------------------------");

    for (let y = 0; y < map.length; y++) {
        let output = "";
        if (y === 0) {
            output = "[[";
        } else {
            output = "[";
        }
        for (let x = 0; x < map[0].length; x++) {
            if (x === map[0].length-1) {
                output += map[y][x] + "]";
            } else {
                output += map[y][x] + ",";
            }
        }
        if (y === map.length-1) {
            output += "]";
        }
        console.log(output);
    }

}

/**
 * creates a random map
 */
function createRandomMap() {

    clicked = [];
    resetDragButtons();

    selectionMap.innerHTML = "";
    const buttonSize = 100 / size;

    let mapData = [];

    // create outer wall boundary
    for (let y = 0; y < size; y++) {
        mapData[y] = [];
        for (let x = 0; x < size; x++) {
            if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
                mapData[y][x] = 0;
            } else {
                mapData[y][x] = 1;
            }
        }
    }

    // PRIM'S ALGORITHM          --> source: https://codepen.io/PChambino/pen/gqjtD
    let cell = {x: 1, y: 1};

    mapData[cell.y][cell.x] = "#";

    let walls = [
        {x: cell.x - 1, y: cell.y},
        {x: cell.x + 1, y: cell.y},
        {x: cell.x, y: cell.y - 1},
        {x: cell.x, y: cell.y + 1}
    ];

    while (walls.length > 0) {
        let wall = walls.splice(Math.floor(Math.random() * walls.length), 1)[0];

        if (mapData[wall.y - 1] && mapData[wall.y + 1] &&
            mapData[wall.y - 1][wall.x] === "#" && mapData[wall.y + 1][wall.x] === 1) {
            mapData[wall.y + 1][wall.x] = mapData[wall.y][wall.x] = "#";
            walls.push({x: wall.x - 1, y: wall.y + 1});
            walls.push({x: wall.x + 1, y: wall.y + 1});
            walls.push({x: wall.x, y: wall.y + 2});

        } else if (mapData[wall.y - 1] && mapData[wall.y + 1] &&
            mapData[wall.y + 1][wall.x] === "#" && mapData[wall.y - 1][wall.x] === 1) {
            mapData[wall.y - 1][wall.x] = mapData[wall.y][wall.x] = "#";
            walls.push({x: wall.x - 1, y: wall.y - 1});
            walls.push({x: wall.x + 1, y: wall.y - 1});
            walls.push({x: wall.x, y: wall.y - 2});

        } else if (mapData[wall.y] && mapData[wall.y] &&
            mapData[wall.y][wall.x - 1] === "#" && mapData[wall.y][wall.x + 1] === 1) {
            mapData[wall.y][wall.x + 1] = mapData[wall.y][wall.x] = "#";
            walls.push({x: wall.x + 1, y: wall.y - 1});
            walls.push({x: wall.x + 1, y: wall.y + 1});
            walls.push({x: wall.x + 2, y: wall.y});

        } else if (mapData[wall.y] && mapData[wall.y] &&
            mapData[wall.y][wall.x + 1] === "#" && mapData[wall.y][wall.x - 1] === 1) {
            mapData[wall.y][wall.x - 1] = mapData[wall.y][wall.x] = "#";
            walls.push({x: wall.x - 1, y: wall.y - 1});
            walls.push({x: wall.x - 1, y: wall.y + 1});
            walls.push({x: wall.x - 2, y: wall.y});

        }
    }

    let id = 0;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {

            let newButton = document.createElement("button");
            newButton.setAttribute("id", "" + id);
            newButton.setAttribute("style", "width:" + buttonSize + "%; height:" + buttonSize + "%;");

            if (y % 2 === 0 && x % 2 === 0) {
                newButton.setAttribute("class", "lab-button-deactivated");

            } else {
                newButton.setAttribute("class", "lab-button");
                newButton.setAttribute("data-button", "data-button");
                newButton.setAttribute("ondrop", "drop(event)");
            }

            selectionMap.appendChild(newButton);

            if (mapData[y][x] === "#") {
                mapData[y][x] = 1;
                addClicked(id);
            } else {
                mapData[y][x] = 0;
            }
            id++;
        }
    }
}

selectionMap.addEventListener('click', (event) => {

    // only detect clicks on button
    if(event.target.matches("[data-button]")) {

        let id = event.target.id;
        let added = addClicked(id);

        if (added) {
            if(lastClickedButton !== null && lineCompleter) {
                completeLine(parseInt(id));
            }
            lastClickedButton = id;
        } else {
            lastClickedButton = null;
        }
    }
});

/**
 * adds a clicked button to the clicked-button-array
 * @param id the id of the button
 * @returns {boolean} true if added, false if already in array and removes it
 */
function addClicked(id) {

    id = parseInt(id);

    // delete
    if(clicked.includes(id)) {
        let index = clicked.indexOf(id);
        if(index > -1) {
            clicked.splice(index, 1);
        }
        // reset the color of the clicked field
        let clickedButton = document.getElementById(id);
        clickedButton.style.background = darkGrey;
        clickedButton.removeAttribute("ondragover");
        return false;

    } else { // add
        clicked.push(id);
        // set the color of the clicked field
        let clickedButton = document.getElementById(id);
        clickedButton.style.background = lightGrey;
        clickedButton.setAttribute("ondragover", "allowDrop(event)");
        return true;
    }
}

/**
 * enables or disables the line-completer function
 */
function toggleLineCompleter() {
    lineCompleter = !lineCompleter;
}

/**
 * fills the line between two clicked fields if they are vertically or horizontally aligned
 * @param current the currently clicked field
 */
function completeLine(current) {

    if(lastClickedButton % size === current % size) {   // same row

        let amount = current - lastClickedButton;

        // positive
        if (amount > 0) {

            for (let i = 0; i < amount; i += size) {
                let index = current - i;
                let temp = document.getElementById("" + index);
                temp.style.background = lightGrey;
                temp.setAttribute("ondragover", "allowDrop(event)");

                // push added fields
                if(!clicked.includes("" + index)) {
                    clicked.push("" + index);
                }
            }
        } else { // negative
            for (let i = -amount; i > 0; i -= size) {
                let index = current + i;
                let temp = document.getElementById("" + index);
                temp.style.background = lightGrey;
                temp.setAttribute("ondragover", "allowDrop(event)");

                // push added fields
                if(!clicked.includes("" + index)) {
                    clicked.push("" + index);
                }
            }
        }

    } else if(Math.floor(lastClickedButton/size) === Math.floor(current/size)) {    // same line

        let amount = current - lastClickedButton;

        // positive
        if(amount > 0) {
            for(let i = 0; i < amount; i++) {
                let index = current - i;
                let temp = document.getElementById("" + index);
                temp.style.background = lightGrey;
                temp.setAttribute("ondragover", "allowDrop(event)");

                // push added fields
                if(!clicked.includes("" + index)) {
                    clicked.push("" + index);
                }
            }
        } else { // negative
            for(let i = -amount; i > 0; i--) {
                let index = current + i;
                let temp = document.getElementById("" + index);
                temp.style.background = lightGrey;
                temp.setAttribute("ondragover", "allowDrop(event)");

                // push added fields
                if(!clicked.includes("" + index)) {
                    clicked.push("" + index);
                }
            }
        }
    }
}

function drag(event) {
    draggedObjectId = event.target.id;

    //event.dataTransfer.setDragImage(event.target, event.target.clientWidth/2, event.target.clientHeight/2);
    event.dataTransfer.setData("text/plain", event.target.id);

}

function allowDrop(event) {
    event.preventDefault();
    let dragObject = document.getElementById(draggedObjectId);

    dragObject.style.width = "100%";
    dragObject.style.height = "100%";
    dragObject.style.opacity = "0.5";
    if(event.target.matches("[data-button]")) {
        event.target.appendChild(dragObject);

        if (draggedObjectId === "draggable-start") {
            startPos = event.target.id;
        } else {
            finishPos = event.target.id;
        }
    }
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    let dragObject = document.getElementById(data);
    dragObject.style.width = "100%";
    dragObject.style.height = "100%";

    // to prevent parent-child errors
    let parentObject = null;
    if(event.target.matches("[data-button]")) {
        parentObject = event.target;
    } else {
        parentObject = event.target.parentElement;
    }

    parentObject.appendChild(document.getElementById(data));

    // save position of start & finish
    if (data === "draggable-start") {
        startPos = parentObject.id;
    }   else {
        finishPos = parentObject.id;
    }
}

function finishedDrag() {

    finishField.style.opacity = "1";
    startField.style.opacity = "1";

}
