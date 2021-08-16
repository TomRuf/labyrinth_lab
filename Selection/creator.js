const selectionMap = document.getElementById("selection-map");
const slider = document.getElementById("size-slider");
let size = 11;
let lastClickedButton = null;
let clicked = [];
let lineCompleter = false;

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

/**
 * resets the draggable start and finish field
 */
function resetDragButtons() {
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
    size = 10;
    startPos = null;
    finishPos = null;
    clicked = [];
    lineCompleter = false;
    lastClickedButton = null;

    document.getElementById("map-name").value = "";
    document.getElementById("size-slider").value = 10;

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

    // create new 2d array filled with 0
    //let tempMap = new Array(size).fill().map(function(){ return new Array(size).fill(0);});

    if (startPos === null || finishPos === null) {
        alert("Don't forget to set start and finish!");
        return;
    }

    let tempMap = [];

    for (let y = 0; y < size; y++) {
        tempMap[y] = [];
        for (let x = 0; x < size; x++) {
            tempMap[y][x] = 0;
        }
    }

    // add the path segments
    for(let i = 0; i < clicked.length; i++) {
        let buttonNumber = parseFloat(clicked[i]);

        let y = Math.floor(buttonNumber / size);
        let x = buttonNumber % size;

        // set path
        tempMap[y][x] = 1;
    }

    // set the start
    if(startPos !== null) {
        let y = Math.floor(startPos / size);
        let x = startPos % size;

        tempMap[y][x] = 2;
    }

    // set the finish
    if(finishPos !== null) {
        let y = Math.floor(finishPos / size);
        let x = finishPos % size;

        tempMap[y][x] = 3;
    }

    // set the name if changed
    let temp = document.getElementById("map-name").value;
    if(temp.length !== 0) {
        mapTitle = temp;
    }

    addMap(tempMap, mapTitle);
    closeCreatorModal();
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

// todo: shorten code
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
