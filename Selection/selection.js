const robotModal = document.getElementById("robot-modal"),
    creatorModal = document.getElementById("creator-modal"),
    modalTitle = document.getElementById("modalTitle"),
    closeRobot = document.getElementById("close-robot-modal"),
    closeCreator = document.getElementById("close-creator-modal"),
    algorithmText = document.getElementById("algorithm-text"),
    robotGrid = document.getElementById("robot-grid"),
    extraInformationText = document.getElementById("extra-information-text"),
    robotModalLeftTable = document.getElementById("modal-table-item-left"),
    startButton = document.getElementById("start-button");

const wrapper = document.getElementById("robot-grid"),
    wrapper2 = document.getElementById("map-grid");

let idCounter = 0;

let addBtn = null;
let mapToDelete = null;

let selectedRobots = [],
    selectedMap = null;

const experimentName = document.getElementById("experiment-name");

const mapGrid = document.getElementById("map-grid");

const maps = [],
    robotColors = ["","#f3dd7e","#88c56e","#6eb4c5","#c56e6e","#999999"],
    robotNames = ["","Wall","Trem","Aria","Pledge","Rando"];

const defaultMaps = [
    {mapData: [[0,0,0,0,0,1,0,0,0,0,0],
            [0,1,0,1,0,1,1,1,1,1,0],
            [0,1,1,1,0,0,0,1,0,1,0],
            [0,1,0,1,0,1,1,1,0,1,0],
            [0,1,0,1,1,1,0,0,0,1,0],
            [0,1,0,0,0,1,0,0,1,1,0],
            [0,1,0,1,1,1,1,0,0,0,0],
            [0,0,0,1,0,0,1,0,1,0,0],
            [0,0,0,1,0,0,1,1,1,0,0],
            [0,1,1,1,0,1,1,0,1,1,0],
            [0,1,0,0,0,0,0,0,0,0,0]], title: "default-1", startPos: 111, finishPos: 5},

    {mapData: [[0,0,0,0,0,0,0,0,0,0,0],
            [0,1,0,1,0,1,1,1,0,1,0],
            [0,1,1,1,1,1,0,1,1,1,1],
            [0,0,0,1,0,1,1,1,0,1,0],
            [0,1,1,1,1,1,0,1,0,1,0],
            [0,1,0,0,0,1,0,0,0,1,0],
            [0,1,0,1,1,1,1,0,1,1,0],
            [0,0,0,1,0,0,1,0,0,0,0],
            [0,0,0,1,0,0,1,1,1,0,0],
            [0,1,1,1,0,1,1,0,1,1,0],
            [0,0,0,0,0,1,0,0,0,0,0]], title: "default-2", startPos: 115, finishPos: 32}];

const mapSize = 150;

init();

/**
 * initializes the site
 */
function init() {

    createAddBtn();
    createRobotItems();

    // load default maps
    loadDefaultMaps();

    // load maps from local storage
    loadSavedCustomMaps();
}

function showLocalStorage() {
    for (let i=0; i < localStorage.length; i++) {
        let storageKey = localStorage.key(i);
        let mapObject = JSON.parse(localStorage.getItem(storageKey));
        console.log(mapObject);
    }

    console.log("------------");
    console.log(maps);
}

function deleteLocalStorage() {
    localStorage.clear();
}

function loadDefaultMaps() {
    for(let i = 0; i < defaultMaps.length; i++) {
        createMapItem(idCounter, defaultMaps[i].mapData, defaultMaps[i].title, defaultMaps[i].startPos, defaultMaps[i].finishPos, true);
        idCounter++;
    }
}

function loadSavedCustomMaps() {
    for (let i=0; i < localStorage.length; i++) {
        let storageKey = localStorage.key(i);

        if(storageKey.startsWith("map")) {
            let mapObject = JSON.parse(localStorage.getItem(storageKey));

            createMapItem(mapObject.id, mapObject.mapData, mapObject.mapTitle, mapObject.startPos, mapObject.finishPos, false);
            idCounter++;
        }
    }
}

/**
 * creates all selectable robot items
 */
function createRobotItems() {

    // create all 5 robot items
    for (let i = 1; i <= 5; i++) {

        // robot item
        let newRobotItem = document.createElement("div");
        newRobotItem.setAttribute("id", "robot-item-" + i);
        newRobotItem.setAttribute("class", "robot-item");
        newRobotItem.setAttribute("data-clickable", "data-clickable");
        robotGrid.appendChild(newRobotItem);

        // robot name
        let robotName = document.createElement("p");
        robotName.innerText = robotNames[i];
        robotName.setAttribute("id", "robot-name-" + i);
        robotName.setAttribute("data-clickable", "data-clickable");
        newRobotItem.appendChild(robotName);

        // robot image
        let robotImage = document.createElement("img");
        robotImage.setAttribute("class", "robot-img-sm");
        robotImage.setAttribute("id", "robot-img-" + i);
        robotImage.setAttribute("src", "../img/robot-" + i + ".png");
        robotImage.setAttribute("data-clickable", "data-clickable");
        newRobotItem.appendChild(robotImage);

        // robot line
        let robotLine = document.createElement("canvas");
        robotLine.setAttribute("id", "line-" + i);
        robotLine.setAttribute("class", "line-canvas");
        robotLine.setAttribute("data-clickable", "data-clickable");
        newRobotItem.appendChild(robotLine);

        let ctx = robotLine.getContext("2d");

        // draw line
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(150, 250);
        ctx.strokeStyle = robotColors[i];
        ctx.setLineDash([10-i, 5-i]); // todo: maybe change this
        ctx.lineWidth = 30;
        ctx.stroke();

        // details button
        let detailsButton = document.createElement("button");
        detailsButton.setAttribute("id", "detailsBtn" + i);
        detailsButton.setAttribute("class", "button details-button");
        detailsButton.innerText = "details";
        newRobotItem.appendChild(detailsButton);
    }
}

/**
 * adds a map
 * @param mapData the map which gets added
 * @param mapTitle the title of the map
 * @param startPos the position of the start
 * @param finishPos the position of the finish
 */
function addMap(mapData, mapTitle, startPos, finishPos) {

    // idCounter needs to check if id already exists
    while(localStorage.getItem("map-" + idCounter) !== null) {
        idCounter++;
    }

    createMapItem(idCounter, mapData, mapTitle, startPos, finishPos);

    // save in local storage
    localStorage.setItem("map-" + idCounter, JSON.stringify(maps[maps.length-1]));

    selectMap(idCounter);
    idCounter++;
}

function createMapItem(id, mapData, mapTitle, startPos, finishPos, defaultMap) {

    let newMap = document.createElement("div");
    newMap.setAttribute("id", "map-" + id);
    newMap.setAttribute("class", "grid-item");
    newMap.setAttribute("data-clickable", "data-clickable");
    if(selectedMap !== null) {
        newMap.style.opacity = "0.4";
    }

    //-------------------------------------------------------------------------------

    if(!defaultMap) {
        let editButton = document.createElement("button");
        editButton.setAttribute("class", "button edit-button");
        editButton.setAttribute("id", "edit-button-" + id);
        editButton.setAttribute("data-edit", "data-edit");
        editButton.innerText = "\u270E";

        newMap.appendChild(editButton);

        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "button delete-button");
        deleteButton.setAttribute("id", "delete-button-" + id);
        deleteButton.setAttribute("data-delete", "data-delete");
        deleteButton.innerText = "\u2716";

        newMap.appendChild(deleteButton);
    }

    //-------------------------------------------------------------------------------

    let title = document.createElement("p");
    title.setAttribute("class", "title");
    title.setAttribute("id", "title-" + id);
    title.setAttribute("data-clickable", "data-clickable");
    title.textContent = mapTitle;

    newMap.appendChild(title);

    //-------------------------------------------------------------------------------

    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas-" + id);
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("data-clickable", "data-clickable");
    canvas.setAttribute("width", "" + mapSize);
    canvas.setAttribute("height", "" + mapSize);

    newMap.appendChild(canvas);
    mapGrid.insertBefore(newMap, mapGrid.children[maps.length]);

    drawCanvas(mapData, id);

    let mapObject = {id: id, mapData: mapData, mapTitle: mapTitle, startPos: startPos, finishPos: finishPos};
    maps.push(mapObject);
}

/**
 * updates the html and array of a certain map
 * @param id
 * @param map
 * @param mapTitle
 * @param startPos
 * @param finishPos
 */
function updateMap(id, mapData, mapTitle, startPos, finishPos) {

    // 1. update html
    let newTitle = document.getElementById("title-" + id);
    newTitle.textContent = mapTitle;
    drawCanvas(mapData, id);

    // 2. change maps array
    let index = getIndexOf(id);
    let newMap = {id: id, mapData: mapData, mapTitle: mapTitle, startPos: startPos, finishPos: finishPos};
    maps[index] = newMap;

    // 3. change in local storage
    localStorage.setItem("map-" + id, JSON.stringify(newMap));
}

function drawCanvas(mapData, id) {

    let canvas = document.getElementById("canvas-" + id);
    let ctx = canvas.getContext("2d");
    drawMap(ctx, canvas, mapData);
}

/**
 * creates the add-button and adds it to the html
 */
function createAddBtn() {

    // todo: delete innerHtml

    let button = document.createElement("div");
    button.innerHTML = '<div class="button-div"><button id="addBtn" class="button add-button">&#43;</button></div>';
    mapGrid.appendChild(button);

    addBtn = document.getElementById("addBtn");
    addBtn.addEventListener('click', (event) => {
        showCreatorModal();
    });
}

/**
 * draws any map
 * @param ctx
 * @param canvas
 * @param map
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

/**
 * listens to click events in the robot grid
 */
wrapper.addEventListener('click', (event) => {

    const id = event.target.id;

    if (event.target.matches("[data-clickable]")) {

        let index = id.lastIndexOf('-');
        selectRobot(id.substring(index+1));

    } else if(id !== "robot-grid") {
        showRobotModal(id.slice(-1));
    }
});

/**
 * listens to click events in the map grid
 */
wrapper2.addEventListener('click', (event) => {

    // only detect clicks on items
    if(event.target.matches("[data-clickable]")) {

        const id = event.target.id;
        let index = id.indexOf('-');
        selectMap(parseInt(id.substring(index+1)));

    } else if(event.target.matches("[data-edit]")) {

        const id = event.target.id;
        let index = id.lastIndexOf('-');
        editMap(parseInt(id.substring(index+1)));

    } else if(event.target.matches("[data-delete]")) {

        const id = event.target.id;
        let index = id.lastIndexOf('-');
        confirmDeleteMap(parseInt(id.substring(index+1)));
    }

});

/**
 * opens the creator with the map to edit
 * @param id
 */
function editMap(id) {

    showCreatorModal();

    let index = getIndexOf(id);
    loadMapToEdit(id, maps[index]);
}

function confirmDeleteMap(id) {
    document.getElementById("confirm-modal").style.display = "block";
    mapToDelete = id;

    let title = maps[getIndexOf(id)].mapTitle;
    document.getElementById("confirm-modal-text").innerHTML = "Do you really want to delete map: <b>" + title + "</b>? This process cannot be undone.";
}

/**
 * deletes a map
 */
function deleteMap() {

    // delete in maps list
    let index = getIndexOf(mapToDelete);
    maps.splice(index, 1);

    // delete from local storage
    localStorage.removeItem("map-" + mapToDelete);

    // delete div
    let mapItem = document.getElementById("map-" + mapToDelete);
    mapItem.remove();

    // reset selected
    selectedMap = null;

    const elements = document.getElementsByClassName("grid-item");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.opacity = "1";
    }

    closeConfirmModal();
}

/**
 * selects a map and saves it as selected
 * @param id the id of the selected map
 */
function selectMap(id) {

    let item = null;

    // change old one
    if(selectedMap !== null) {
        item = document.getElementById("map-" + selectedMap);
        item.style.boxShadow = "inset 0.2rem 0.2rem 0.5rem #c8d0e7, inset -0.2rem -0.2rem 0.5rem #ffffff";

        let editButton = document.getElementById("edit-button-" + selectedMap);
        let deleteButton = document.getElementById("delete-button-" + selectedMap);
        if(editButton !== null) {
            editButton.style.display = "none";
            deleteButton.style.display = "none";
        }

        // deselect map when it's clicked twice
        if(selectedMap === id) {
            selectedMap = null;

            const elements = document.getElementsByClassName("grid-item");
            for (let i = 0; i < elements.length; i++) {
                elements[i].style.opacity = "1";
            }
            return;
        }
    }

    selectedMap = id;

    item = document.getElementById("map-" + id);
    item.style.boxShadow = "0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff";

    // show edit and delete button
    let editButton = document.getElementById("edit-button-" + id);
    let deleteButton = document.getElementById("delete-button-" + id);
    if(editButton !== null) {
        editButton.style.display = "block";
        deleteButton.style.display = "block";
    }

    const elements = document.getElementsByClassName("grid-item");
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.opacity = "0.4";
    }

    item.style.opacity = "1";
}

/**
 * selects a robot and adds it to the selected list
 * @param id the id of the selected robot
 */
function selectRobot(id) {

    const item = document.getElementById("robot-item-" + id);

    if(selectedRobots.includes(id)){
        let index = selectedRobots.indexOf(id);
        if (index > -1) {
            selectedRobots.splice(index, 1);
        }
        item.style.boxShadow = "inset 0.2rem 0.2rem 0.5rem #c8d0e7, inset -0.2rem -0.2rem 0.5rem #ffffff";
        item.style.opacity = "0.4";

        // if no robot selected: make all visible
        if (selectedRobots.length === 0) {
            const elements = document.getElementsByClassName("robot-item");
            for (let i = 1; i < elements.length+1; i++) {
                if(selectedRobots.includes(""+i)){
                    continue;
                }
                elements[i-1].style.opacity = "1";
            }
        }

    } else {

        // limit number of robots to 3
        if (selectedRobots.length >= 3) {
            return;
        }

        selectedRobots.push(id);
        item.style.boxShadow = "0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff";

        const elements = document.getElementsByClassName("robot-item");
        for (let i = 1; i < elements.length+1; i++) {
            if(selectedRobots.includes(""+i)){
                continue;
            }
            elements[i-1].style.opacity = "0.4";
        }

        item.style.opacity = "1";
    }
}

/**
 * opens the robot-modal
 * @param id id of the chosen robot
 */
function showRobotModal(id) {
    robotModal.style.display = "block";

    let title;
    let inner;
    let extraInfo;

    switch (id) {
        case '1':
            title = robotNames[id];
            extraInfo = "Geht immer der rechten Wand entlang";
            inner = `<pre><code>
1 Solange Ziel nicht erreicht
2     Falls Weg rechts 
3         gehe rechts 
4     Falls Weg geradeaus
5         gehe geradeaus
6     Falls Weg links 
7         gehe links 
8     Sonst 
9         drehe dich um
    </code></pre>`;

            break;
        case '2':
            title = robotNames[id];
            extraInfo = "TBA";
            inner = `<pre><code>
1 Solange Ziel nicht erreicht
2     markiere momentanen Pfad
3     folge Pfad bis Ende
4         Falls Sackgasse
5             kehre um
6         sonst
7             markiere momentanen pfad
8             falls Kreuzung hat unbekannte Wege
9                 Wähle einen unbekannten Weg
10            falls Kreuzung hat Wege mit nur einer Markierung
11               Wähle Weg mit nur einer Markierung
12            Sonst
13                Kehre um
    </code></pre>`;
            break;

        case '3':
            title = robotNames[id];
            extraInfo = "TBA";
            inner = `<pre><code>
1 Solange Ziel nicht erreicht
2     falls Sackgasse oder Ariadnefaden quert Kreuzung
3         drehe dich um und gehe Gang zurück (und wickle auf)
4     sonst
5         gehe 1. Gang von links (falls Ariadnefaden im Gang, dann
6         aufwickeln sonst abspulen)
    </code></pre>`;

            break;

        case '4':
            title = robotNames[id];
            extraInfo = "TBA";
            inner = `<pre><code>
1 Setze Drehzähler auf 0
2 
3 Wiederhole bis Ausgang erreicht
4     Wiederhole bis Wand berührt wird
5         Gehe gerade aus
6     Drehung nach links
7     Wiederhole bis Drehzähler auf 0 steht
8         Folge der Wand
9         Falls Drehung
10            Adaptiere Drehzähler
    </code></pre>`;
            break;

        case '5':
            title = robotNames[id];
            extraInfo = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
            inner = `<pre><code>
1 Wiederhole bis Ausgang erreicht
2     in welche Richtung kann gegangen werden?
3     wähle eine mögliche Richtung zufällig aus 
4     gehe in diese Richtung
    </code></pre>`;
            break;
    }

    // set robot image
    let robotImg = document.getElementById("modal-robot-img");
    robotImg.setAttribute("src", "../img/robot-" + id + ".png");

    modalTitle.innerText = title;
    extraInformationText.innerText = extraInfo;
    algorithmText.innerHTML = inner;
}

/**
 * opens the creator-modal
 */
function showCreatorModal() {
    creatorModal.style.display = "block";
}

/**
 * closes the robot modal
 */
closeRobot.onclick = function() {
    robotModal.style.display = "none";
}

/**
 * closes the creator modal
 */
closeCreator.onclick = function() {
    closeCreatorModal();
}

/**
 * closes the creator modal
 */
function closeCreatorModal() {
    creatorModal.style.display = "none";
    resetCreator();
}

function closeConfirmModal() {
    document.getElementById("confirm-modal").style.display = "none";
}

/**
 * closes the modal if clicked anywhere outside
 * @param event
 */
window.onclick = function(event) {
    if (event.target === robotModal) {
        robotModal.style.display = "none";
    } else if (event.target === creatorModal) {
        closeCreatorModal();
    }
}

startButton.onclick = function() {

    if (selectedRobots.length === 0 || selectedMap === null) {
        alert("Don't forget to select a map and the robots!");
        return;
    }

    if (experimentName.value.length === 0) {
        alert("Don't forget to name your experiment!");
        return;
    }

    let sMap = maps[getIndexOf(selectedMap)];

    let tempMap = sMap.mapData;
    let temp = encodeURIComponent(JSON.stringify(tempMap));

    let url = "../Simulation/simulation.html?map=" + temp + "&robots=";

    // add robots
    for (let i = 0; i < selectedRobots.length; i++) {
        url += selectedRobots[i] + "_";
    }
    // delete last _
    url = url.slice(0, -1);

    // add finish and start position
    url += "&start=" + sMap.startPos;
    url += "&finish=" + sMap.finishPos;

    // -----------------------------------------------------------------
    // save experiment in local storage
    // -----------------------------------------------------------------

    let expId = 0;
    // detect free id
    while(localStorage.getItem("exp-" + expId) !== null) {
        expId++;
    }

    let experiment = {id: expId, expTitle: experimentName.value, map: sMap, robots: selectedRobots};

    localStorage.setItem("exp-" + expId, JSON.stringify(experiment));

    // -----------------------------------------------------------------

    location.href = url;
}

/**
 * returns the index of a map-object by its id
 * @param id
 * @returns {number}
 */
function getIndexOf(id) {
    let index = 0;
    for (let i = 0; i < maps.length; i++) {
        if(maps[i].id === id) {
            return index;
        }
        index++;
    }
}



