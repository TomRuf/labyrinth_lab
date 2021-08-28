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

// colors
const darkGrey = "#808080",
    lightGrey = "#D3D3D3";

// important data
let mapTitle = "New Labyrinth";
let startPos = null;
let finishPos = null;
let editMapId = null;

initCreator();

function initCreator() {
    createMap(size);
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

    size = mapObj.map.length;
    startPos = mapObj.startPos;
    finishPos = mapObj.finishPos;
    edit = true;
    editMapId = mapId;
    mapTitle = mapObj.mapTitle;

    createMap(size);

    let id = 0;
    for(let y = 0; y < mapObj.map.length; y++) {
        for(let x = 0; x < mapObj.map.length; x++) {
            if(mapObj.map[y][x] === 1) {
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
    document.getElementById("size-slider").value = 10;
    mapName.setAttribute("placeholder", "New Labyrinth");

    mapTitle = "New Labyrinth";

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

    for (let i = 0; i < amount; i++) {

        let newButton = document.createElement("button");
        newButton.setAttribute("id", "" + i);
        newButton.setAttribute("class", "lab-button");
        newButton.setAttribute("ondrop", "drop(event)");
        newButton.setAttribute("style", "width:" + buttonSize + "%; height:" + buttonSize + "%;");
        newButton.setAttribute("data-button", "data-button");

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

    closeCreatorModal();
}

/**
 * creates a random map
 */
function createRandomMap() {

    clicked = [];
    resetDragButtons();

    selectionMap.innerHTML = "";
    const buttonSize = 100 / size;

    let map = [];

    // create outer wall boundary
    for (let y = 0; y < size; y++) {
        map[y] = [];
        for (let x = 0; x < size; x++) {
            if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
                map[y][x] = 0;
            } else {
                map[y][x] = 1;
            }
        }
    }

    // PRIM'S ALGORITHM          --> source: https://codepen.io/PChambino/pen/gqjtD
    let cell = {
        x: 1,
        y: 1
    };

    map[cell.y][cell.x] = "#";

    let walls = [
        {x: cell.x - 1, y: cell.y},
        {x: cell.x + 1, y: cell.y},
        {x: cell.x, y: cell.y - 1},
        {x: cell.x, y: cell.y + 1}
    ];

    while (walls.length > 0) {
        let wall = walls.splice(Math.floor(Math.random() * walls.length), 1)[0];

        if (map[wall.y - 1] && map[wall.y + 1] &&
            map[wall.y - 1][wall.x] === "#" && map[wall.y + 1][wall.x] === 1) {
            map[wall.y + 1][wall.x] = map[wall.y][wall.x] = "#";
            walls.push({x: wall.x - 1, y: wall.y + 1});
            walls.push({x: wall.x + 1, y: wall.y + 1});
            walls.push({x: wall.x, y: wall.y + 2});

        } else if (map[wall.y - 1] && map[wall.y + 1] &&
            map[wall.y + 1][wall.x] === "#" && map[wall.y - 1][wall.x] === 1) {
            map[wall.y - 1][wall.x] = map[wall.y][wall.x] = "#";
            walls.push({x: wall.x - 1, y: wall.y - 1});
            walls.push({x: wall.x + 1, y: wall.y - 1});
            walls.push({x: wall.x, y: wall.y - 2});

        } else if (map[wall.y] && map[wall.y] &&
            map[wall.y][wall.x - 1] === "#" && map[wall.y][wall.x + 1] === 1) {
            map[wall.y][wall.x + 1] = map[wall.y][wall.x] = "#";
            walls.push({x: wall.x + 1, y: wall.y - 1});
            walls.push({x: wall.x + 1, y: wall.y + 1});
            walls.push({x: wall.x + 2, y: wall.y});

        } else if (map[wall.y] && map[wall.y] &&
            map[wall.y][wall.x + 1] === "#" && map[wall.y][wall.x - 1] === 1) {
            map[wall.y][wall.x - 1] = map[wall.y][wall.x] = "#";
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
            newButton.setAttribute("class", "lab-button");
            newButton.setAttribute("ondrop", "drop(event)");
            newButton.setAttribute("style", "width:" + buttonSize + "%; height:" + buttonSize + "%;");
            newButton.setAttribute("data-button", "data-button");

            selectionMap.appendChild(newButton);

            if (map[y][x] === "#") {
                map[y][x] = 1;
                addClicked(id);
            } else {
                map[y][x] = 0;
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

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    let dragObject = document.getElementById(data);
    dragObject.style.width = "100%";
    dragObject.style.height = "100%";
    event.target.appendChild(document.getElementById(data));

    // save position of start & finish
    if (data === "draggable-start") {
        startPos = event.target.id;
    }   else {
        finishPos = event.target.id;
    }
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}
