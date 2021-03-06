const experimentGrid = document.getElementById("grid-container");
const repeatButton = document.getElementById("repeat-button");

const mapSize = 140;

const experiments = [];

let selectedExp = null;
let experimentToDelete = null;

function init() {

    isMobile();

    loadExperiments();
}

// checks if the simulation runs on a mobile device
function isMobile () {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        alert("Labyrinth Lab is developed for desktop. For the best experience, consider using your laptop/pc!");
    }
}

function startNewExperiment() {
    document.location.href = "../selection/selection.html";
}

function repeatExperiment() {

    // get experiment data
    let sExp = experiments[getIndexOf(selectedExp)];

    // map
    let mapString = encodeURIComponent(JSON.stringify(sExp.map.mapData));

    let url = "../simulation/simulation.html?map=" + mapString + "&robots=";

    // add robots
    for (let i = 0; i < sExp.robots.length; i++) {
        url += sExp.robots[i] + "_";
    }
    // delete last _
    url = url.slice(0, -1);

    // add finish and start position
    url += "&start=" + sExp.map.startPos;
    url += "&finish=" + sExp.map.finishPos;

    document.location.href = url;
}

function loadExperiments() {

    let experiments = [];

    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).startsWith("exp")) {
            let storageKey = localStorage.key(i);
            let exp = JSON.parse(localStorage.getItem(storageKey));
            experiments[parseInt(exp.id)] = exp;
        }
    }

    for (let i = 0; i < experiments.length; i++) {
       if (experiments[i] !== undefined) {
           createExperimentItem(experiments[i], false);
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

    expWrapper.addEventListener("click", () => {
        selectExp(exp.id);
    });

    expWrapper.appendChild(newExp);

    //-------------------------------------------------------------------------------

    if (!defaultExperiment) {
        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "button delete-button");
        deleteButton.setAttribute("id", "delete-button-" + exp.id);
        deleteButton.innerText = "\u2716";

        deleteButton.addEventListener("click", () => {
            confirmDeleteExp(exp.id);
        });

        newExp.appendChild(deleteButton);
    }

    //-------------------------------------------------------------------------------

    let title = document.createElement("p");
    title.setAttribute("class", "title-sm");
    title.setAttribute("id", "title-" + exp.id);
    title.textContent = exp.expTitle;

    newExp.appendChild(title);

    //-------------------------------------------------------------------------------

    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas-" + exp.id);
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", "" + mapSize);
    canvas.setAttribute("height", "" + mapSize);

    newExp.appendChild(canvas);

    //-------------------------------------------------------------------------------

    for (let i = 0; i < exp.robots.length; i++) {

        let robotImg = document.createElement("img");
        robotImg.setAttribute("src", "../../img/robot-" + exp.robots[i] + ".png");
        robotImg.setAttribute("id", "exp-" + exp.id + "-robot-" + exp.robots[i]);
        robotImg.setAttribute("class", "robot-img right-" + i);

        newExp.appendChild(robotImg);
    }

    //-------------------------------------------------------------------------------

    experimentGrid.insertBefore(expWrapper, experimentGrid.children[experiments.length]);

    drawCanvas(exp.map.mapData, exp.id, exp.map.startPos, exp.map.finishPos);

    experiments.push(exp);
}

function confirmDeleteExp(id) {

    document.getElementById("confirm-modal").style.display = "block";
    experimentToDelete = id;
    document.getElementById("confirm-modal-text").innerHTML = `Bist du dir sicher dass du "<b>${experiments[getIndexOf(id)].expTitle}</b>" l??schen willst? Dieser Vorgang kann nicht r??ckg??ngig gemacht werden.`;
}

function deleteExp() {

    // delete from maps list
    let index = getIndexOf(experimentToDelete);
    experiments.splice(index, 1);

    // delete from local storage
    localStorage.removeItem("exp-" + experimentToDelete);

    // delete div
    document.getElementById("exp-wrapper-" + experimentToDelete).remove();

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
    document.getElementById("exp-wrapper-" + id).appendChild(repeatButton);
    repeatButton.style.display = "block";
}

function closeConfirmModal() {
    document.getElementById("confirm-modal").style.display = "none";
}

function drawCanvas(mapData, id, startPos, finishPos) {

    let canvas = document.getElementById("canvas-" + id);
    let ctx = canvas.getContext("2d");
    drawMap(ctx, canvas, mapData, startPos, finishPos);
}

/**
 * draws the map
 */
function drawMap(ctx, canvas, mapData, startPos, finishPos) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(175,175,175)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

            if((row.length * y + x) === parseInt(startPos)) {
                ctx.fillStyle = 'darkOrange';
            } else if ((row.length * y + x) === parseInt(finishPos)) {
                let squareSize = w/3;
                ctx.rect(w * x, h * y, w - 0.2, h - 0.2);

                let counter = 0;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        counter % 2 === 0 ? ctx.fillStyle = "#181818" : ctx.fillStyle = "#ffffff";
                        ctx.fillRect(w * x + squareSize * j, h * y + squareSize * i, squareSize, squareSize);
                        counter++;
                    }
                }
                continue;
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

function goToPreviousPage() {
    // window.history.back();
    document.location.href = "../index/index.html";
}

init();
