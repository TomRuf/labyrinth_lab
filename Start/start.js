const experimentGrid = document.getElementById("grid-container");
const repeatButton = document.getElementById("repeat-button");

const mapSize = 150;

const darkGrey = '#808080',
    lightGrey = '#D3D3D3';

const experiments = [];

let selectedExp = null;
let experimentToDelete = null;

function init() {
    loadExperiments();
}

function startNewExperiment() {
    location.href = "../Selection/selection.html";
}

function repeatExperiment() {

    // get experiment data
    let sExp = experiments[getIndexOf(selectedExp)];

    // map
    let mapString = encodeURIComponent(JSON.stringify(sExp.map.mapData));

    let url = "../Simulation/simulation.html?map=" + mapString + "&robots=";

    // add robots
    for (let i = 0; i < sExp.robots.length; i++) {
        url += sExp.robots[i] + "_";
    }
    // delete last _
    url = url.slice(0, -1);

    // add finish and start position
    url += "&start=" + sExp.map.startPos;
    url += "&finish=" + sExp.map.finishPos;

    location.href = url;
}

function loadExperiments() {

    // get experiments from local storage
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("exp")) {
            let storageKey = localStorage.key(i);
            let exp = JSON.parse(localStorage.getItem(storageKey));
            createExperimentItem(exp, false);
        }
    }

}

function createExperimentItem(exp, defaultExperiment) {

    let expWrapper = document.createElement("div");
    expWrapper.setAttribute("id", "exp-wrapper-" + exp.id);
    expWrapper.setAttribute("class", "grid-item-wrapper");

    let newExp = document.createElement("div");
    newExp.setAttribute("id", "exp-" + exp.id);
    newExp.setAttribute("class", "grid-item");
    newExp.setAttribute("data-clickable", "data-clickable");

    expWrapper.appendChild(newExp);

    //-------------------------------------------------------------------------------

    if (!defaultExperiment) {
        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "button delete-button");
        deleteButton.setAttribute("id", "delete-button-" + exp.id);
        deleteButton.setAttribute("data-delete", "data-delete");
        deleteButton.innerText = "\u2716";

        newExp.appendChild(deleteButton);
    }

    //-------------------------------------------------------------------------------

    let title = document.createElement("p");
    title.setAttribute("class", "text");
    title.setAttribute("id", "title-" + exp.id);
    title.setAttribute("data-clickable", "data-clickable");
    title.textContent = exp.expTitle;

    newExp.appendChild(title);

    //-------------------------------------------------------------------------------

    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas-" + exp.id);
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("data-clickable", "data-clickable");
    canvas.setAttribute("width", "" + mapSize);
    canvas.setAttribute("height", "" + mapSize);

    newExp.appendChild(canvas);

    //-------------------------------------------------------------------------------

    for (let i = 0; i < exp.robots.length; i++) {

        let robotImg = document.createElement("img");
        robotImg.style.right = "" + (10 + 10 * i);
        robotImg.setAttribute("src", "../img/robot-" + exp.robots[i] + ".png");
        robotImg.setAttribute("id", "exp-" + exp.id + "-robot-" + exp.robots[i]);
        robotImg.setAttribute("class", "robot-img right-" + i);
        robotImg.setAttribute("data-clickable", "data-clickable");

        newExp.appendChild(robotImg);
    }

    //-------------------------------------------------------------------------------

    experimentGrid.insertBefore(expWrapper, experimentGrid.children[experiments.length]);

    drawCanvas(exp.map.mapData, exp.id);

    experiments.push(exp);
}

function confirmDeleteExp(id) {

    document.getElementById("confirm-modal").style.display = "block";
    experimentToDelete = id;

    let title = experiments[getIndexOf(id)].expTitle;
    document.getElementById("confirm-modal-text").innerHTML = "Do you really want to delete experiment: <b>" + title + "</b>? This process cannot be undone.";

}

function deleteExp() {

    // delete from maps list
    let index = getIndexOf(experimentToDelete);
    experiments.splice(index, 1);

    // delete from local storage
    localStorage.removeItem("exp-" + experimentToDelete);

    // delete div
    let expItem = document.getElementById("exp-wrapper-" + experimentToDelete);
    expItem.remove();

    // reset selected
    selectedExp = null;

    repeatButton.style.display = "none";

    // reset opacity
    const otherItems = document.getElementsByClassName("grid-item");
    for (let i = 0; i < otherItems.length; i++) {
        otherItems[i].style.opacity = "1";
    }

    closeConfirmModal();
}

function selectExp(id) {

    let item = null;

    // change old one
    if(selectedExp !== null) {

        item = document.getElementById("exp-" + selectedExp);
        //item.style.boxShadow = "inset 0.2rem 0.2rem 0.5rem #c8d0e7, inset -0.2rem -0.2rem 0.5rem #ffffff";
        item.style.boxShadow = null;

        let deleteButton = document.getElementById("delete-button-" + selectedExp);
        if(deleteButton !== null) {
            deleteButton.style.display = "none";
        }

        // deselect map when it's clicked twice
        if(selectedExp === id) {
            selectedExp = null;

            const otherItems = document.getElementsByClassName("grid-item");
            for (let i = 0; i < otherItems.length; i++) {
                otherItems[i].style.opacity = "1";
            }

            repeatButton.style.display = "none";
            return;
        }
    }

    selectedExp = id;

    item = document.getElementById("exp-" + id);
    item.style.boxShadow = "0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff";

    // show delete-button
    let deleteButton = document.getElementById("delete-button-" + id);
    if(deleteButton !== null) {
        deleteButton.style.display = "block";
    }

    // change opacity of all other ones
    const otherItems = document.getElementsByClassName("grid-item");
    for (let i = 0; i < otherItems.length-1; i++) {
        otherItems[i].style.opacity = "0.4";
    }

    item.style.opacity = "1";

    // show repeatButton under selected experiment
    let wrapper = document.getElementById("exp-wrapper-" + id);
    wrapper.appendChild(repeatButton);
    repeatButton.style.display = "block";
}

experimentGrid.addEventListener('click', (event) => {

    // only detect clicks on items
    if(event.target.matches("[data-clickable]")) {

        const id = event.target.id;
        let index = id.indexOf('-');
        selectExp(parseInt(id.substring(index+1)));

    } else if(event.target.matches("[data-delete]")) {

        const id = event.target.id;
        let index = id.lastIndexOf('-');
        confirmDeleteExp(parseInt(id.substring(index+1)));
    }
});

function closeConfirmModal() {
    document.getElementById("confirm-modal").style.display = "none";
}



function drawCanvas(mapData, id) {

    let canvas = document.getElementById("canvas-" + id);
    let ctx = canvas.getContext("2d");
    drawMap(ctx, canvas, mapData);
}

/**
 * draws the map
 */
function drawMap(ctx, canvas, mapData) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const h = canvas.height / mapData.length;
    for (let y = 0; y < mapData.length; y++) {
        let row = mapData[y];
        let w = canvas.width / row.length;
        for (let x = 0; x < row.length; x++) {
            let c = row[x];
            ctx.beginPath();

            if (c === 1) {
                ctx.fillStyle = '#D3D3D3';
            } else {
                ctx.fillStyle = '#808080';
            }

            ctx.rect(w * x, h * y, w-0.2, h-0.2);
            ctx.fill();
        }
    }
}

function getIndexOf(id) {
    let index = 0;
    for (let i = 0; i < experiments.length; i++) {
        if(experiments[i].id === id) {
            return index;
        }
        index++;
    }
}

init();
