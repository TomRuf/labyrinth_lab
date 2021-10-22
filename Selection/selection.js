document.getElementById("modal-table-item-left");
const robotModal = document.getElementById("robot-modal"),
    creatorModal = document.getElementById("creator-modal"),
    modalTitle = document.getElementById("modalTitle"),
    closeRobot = document.getElementById("close-robot-modal"),
    closeCreator = document.getElementById("close-creator-modal"),
    algorithmText = document.getElementById("algorithm-text"),
    robotGrid = document.getElementById("robot-grid"),
    extraInformationText = document.getElementById("extra-information-text"),
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
            [0,1,0,0,0,0,0,0,0,0,0]], title: "simple-map", startPos: 111, finishPos: 5},

    {mapData: [[0,1,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,0],
            [0,1,0,0,0,0,0,1,0],
            [0,1,0,1,1,1,0,1,0],
            [0,1,0,1,0,1,0,1,0],
            [0,1,0,1,0,1,0,1,0],
            [0,1,0,0,0,1,0,1,0],
            [0,1,1,1,1,1,1,1,0],
            [0,0,0,0,0,0,0,0,0]], title: "follower-trap", startPos: 70, finishPos: 40},

    {mapData: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,0],
                [0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0],
                [0,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,0],
                [0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0],
                [0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0],
                [0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0],
                [0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,0],
                [0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0],
                [0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,0],
                [0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0],
                [0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,0],
                [0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0],
                [0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,0],
                [0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0],
                [0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]], title: "complex-map", startPos: 270, finishPos: 128}];

const mapSize = 140;

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

function loadDefaultMaps() {
    for(let i = 0; i < defaultMaps.length; i++) {
        createMapItem(idCounter, defaultMaps[i].mapData, defaultMaps[i].title, defaultMaps[i].startPos, defaultMaps[i].finishPos, true);
        idCounter++;
    }
}

function loadSavedCustomMaps() {

    // unsorted
    /*
    for (let i=0; i < localStorage.length; i++) {
        let storageKey = localStorage.key(i);

        if(storageKey.startsWith("map")) {
            let mapObject = JSON.parse(localStorage.getItem(storageKey));

            createMapItem(mapObject.id, mapObject.mapData, mapObject.mapTitle, mapObject.startPos, mapObject.finishPos, false);
            idCounter++;
        }
    }
     */

    // sorted
    let customMaps = [];

    for (let i = 0; i < localStorage.length; i++) {
        let storageKey = localStorage.key(i);

        if(storageKey.startsWith("map")) {
            let mapObject = JSON.parse(localStorage.getItem(storageKey));
            customMaps[parseInt(mapObject.id)] = mapObject;
            idCounter++;
        }
    }

    for (let i = 0; i < customMaps.length; i++) {
        if (customMaps[i] !== undefined) {
            createMapItem(customMaps[i].id, customMaps[i].mapData, customMaps[i].mapTitle, customMaps[i].startPos, customMaps[i].finishPos, false);
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
        //ctx.setLineDash([10-i, 5-i]);     // --> line dash could be implemented but leads to messy visual representation in the simulation
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
    title.setAttribute("class", "title-sm");
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

    drawCanvas(mapData, startPos, finishPos, id);

    let mapObject = {id: id, mapData: mapData, mapTitle: mapTitle, startPos: startPos, finishPos: finishPos};
    maps.push(mapObject);
}

/**
 * updates the html and array of a certain map
 * @param id
 * @param mapData
 * @param mapTitle
 * @param startPos
 * @param finishPos
 */
function updateMap(id, mapData, mapTitle, startPos, finishPos) {

    // 1. update html
    let newTitle = document.getElementById("title-" + id);
    newTitle.textContent = mapTitle;
    drawCanvas(mapData, startPos, finishPos, id);

    // 2. change maps array
    let index = getIndexOf(id);
    let newMap = {id: id, mapData: mapData, mapTitle: mapTitle, startPos: startPos, finishPos: finishPos};
    maps[index] = newMap;

    // 3. change in local storage
    localStorage.setItem("map-" + id, JSON.stringify(newMap));
}

function drawCanvas(mapData, startPos, finishPos, id) {

    let canvas = document.getElementById("canvas-" + id);
    let ctx = canvas.getContext("2d");
    drawMap(ctx, canvas, mapData, startPos, finishPos);
}

/**
 * creates the add-button and adds it to the html
 */
function createAddBtn() {

    let buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "button-div");
    mapGrid.appendChild(buttonDiv);

    let button = document.createElement("button");
    button.setAttribute("id", "addBtn");
    button.setAttribute("class", "button add-button");
    button.innerText = "\u002B";

    button.addEventListener('click', () => {showCreatorModal();});

    buttonDiv.appendChild(button);
}

/**
 * draws any map
 * @param ctx
 * @param canvas
 * @param mapData
 */
function drawMap(ctx, canvas, mapData, startPos, finishPos) {

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
            extraInfo = "Geht immer der rechten Wand entlang.";
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
            extraInfo = "Markiert Anfang und Ende von besuchten Pfaden. Pfade mit 2 Markierungen werden nicht mehr betreten.";
            inner = `<pre><code>
1 solange Ziel nicht erreicht
2     folge Pfad bis Ende 
3     falls Pfadende
4         markiere Pfadende
5         falls alle Pfade unbekannt
6             betrete unbekannten Pfad & markiere Anfang
7         falls einer der Pfade schon bekannt
8             untersuche vorherigen Pfad
9             falls vorheriger Pfad nur 1x markiert
10                kehre um & markiere Anfang des Pfades
11            sonst
12                falls ein Pfad noch nicht markiert
13                    betrete Pfad & markiere Anfang
14                sonst
15                    wähle Pfad mit einer Markierung & markiere Anfang
    </code></pre>`;
            break;

        case '3':
            title = robotNames[id];
            extraInfo = "Legt einen Faden entlang seines Weges und entscheidet anhand dessen welche Stellen des Labyrinths schon bekannt sind.";
            inner = `<pre><code>
1 Solange Ziel nicht erreicht
2     falls Sackgasse oder Ariadnefaden quert Kreuzung
3         drehe um und gehe Gang zurück (und wickle auf)
4     sonst
5         gehe 1. Gang von links 
6         falls Ariadnefaden im Gang
7             wickle auf 
8         sonst
9             lege Ariadnefaden
    </code></pre>`;

            break;

        case '4':
            title = robotNames[id];
            extraInfo = "Folgt der Wand und zählt Drehungen (Rechtsdrehung -1 und Linksdrehung +1). Sobald der Drehzähler auf 0 steht, geht er so lange geradeaus bis er auf die nächste Wand trifft."; // Dabei soll der Roboter der Wand folgen und jeweils mitzählen wie oft er nach Links und Rechts abgebogen ist und sich nur von der Wand lösen wenn er in seine Startrichtung gehen kann und er sein Drehzähler auf 0 steht.
            inner = `<pre><code>
1 Setze Drehzähler auf 0
2 
3 Wiederhole bis Ausgang erreicht
4     Wiederhole bis Wand berührt wird
5         Gehe gerade aus
6     Drehung nach links
7     erhöhe Drehzähler
8     Wiederhole bis Drehzähler auf 0 steht
9         Folge der Wand
10        Falls Drehung
11            Adaptiere Drehzähler
    </code></pre>`;
            break;

        case '5':
            title = robotNames[id];
            extraInfo = "Wählt den nächsten Pfad bei Kreuzungen zufällig.";
            inner = `<pre><code>
1 Wiederhole bis Ausgang erreicht
2    folge Pfad bis Ende
3    falls Kreuzung
4        wähle einen Pfad zufällig
5    sonst
6        drehe um
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

    // save experiment in local storage

    let expId = 0;
    // detect free id
    while(localStorage.getItem("exp-" + expId) !== null) {
        expId++;
    }

    let experiment = {id: expId, expTitle: experimentName.value, map: sMap, robots: selectedRobots};

    localStorage.setItem("exp-" + expId, JSON.stringify(experiment));

    // -----------------------------------------------------------------

    document.location.href = url;
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

function goToPreviousPage() {
    window.history.back();
}



