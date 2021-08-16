const robotModal = document.getElementById("robot-modal"),
    creatorModal = document.getElementById("creator-modal"),
    modalTitle = document.getElementById("modalTitle"),
    closeRobot = document.getElementById("close-robot-modal"),
    closeCreator = document.getElementById("close-creator-modal"),
    algorithmText = document.getElementById("algorithm-text"),
    robotModalLeftTable = document.getElementById("modal-table-item-left"),
    startButton = document.getElementById("start-button");

const wrapper = document.getElementById("robot-grid"),
    wrapper2 = document.getElementById("map-grid");

let addBtn = null;

let selectedRobots = [],
    selectedMap = null;

const experimentName = document.getElementById("experiment-name");

const mapGrid = document.getElementById("map-grid");

const maps = [];

const map1 = [[0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
                [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0],
                [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
                [0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
                [0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
                [0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
                [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

const map2 = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
                [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
                [0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0],
                [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
                [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
                [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0],
                [0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
                [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
                [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0]];

const map3 = [[0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 0, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 3, 1, 1, 0],
                [0, 1, 0, 0, 0, 0, 1, 0],
                [0, 1, 0, 0, 0, 0, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 2, 0, 0, 0, 0]];

const map4 = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 3],
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0],
                [0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0],
                [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
                [0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0],
                [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
                [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]];

const mapSize = 150;

init();

/**
 * initializes the site
 */
function init() {
    createAddBtn();
    addMap(map1, "default");
    addMap(map2, "default2");
    addMap(map3, "default3");
    addMap(map4, "default4");
}

// todo: maybe delete later
function createRandomMaps(size, amount) {
    for (let i = 0; i < amount; i++) {
        let temp = [];
        for (let y = 0; y < size; y++) {
            let temp2 = [];
            for (let x = 0; x < size; x++) {
                temp2.push(Math.round(Math.random()));
            }
            temp.push(temp2);
        }
        maps.push(temp);
    }
}

/**
 * adds a map
 * @param map the map which gets added
 * @param mapTitle the title of the map
 */
function addMap(map, mapTitle) {

    let counter = maps.length;

    let newMap = document.createElement("div");
    newMap.setAttribute("id", "map-" + counter);
    newMap.setAttribute("class", "grid-item");
    newMap.setAttribute("data-clickable", "data-clickable");

    let title = document.createElement("p");
    title.setAttribute("class", "title");
    title.setAttribute("id", "title-" + counter);
    title.setAttribute("data-clickable", "data-clickable");
    title.textContent = mapTitle;

    let canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas-" + counter);
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("data-clickable", "data-clickable");
    canvas.setAttribute("width", "" + mapSize);
    canvas.setAttribute("height", "" + mapSize);

    newMap.appendChild(title);
    newMap.appendChild(canvas)
    mapGrid.insertBefore(newMap, mapGrid.children[counter]);

    drawCanvas(map, counter);

    maps.push(map);
}

function drawCanvas(map, id) {

    let canvas = document.getElementById("canvas-" + id);
    let ctx = canvas.getContext("2d");
    drawMap(ctx, canvas, map);
}

/**
 * creates the add-button and adds it to the html
 */
function createAddBtn() {

    let button = document.createElement("div");
    button.innerHTML = '<div class="button-div"><button id="addBtn" class="add-button">&#43;</button></div>';
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
function drawMap(ctx, canvas, map) {
    const h = canvas.height / map.length;
    for (let y = 0; y < map.length; y++) {
        let row = map[y];
        let w = canvas.width / row.length;
        for (let x = 0; x < row.length; x++) {
            let c = row[x];
            ctx.beginPath();

            if (c === 0) {
                ctx.fillStyle = '#808080';
            } else {
                ctx.fillStyle = '#D3D3D3';
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

    const nodeName = event.target.nodeName;
    const id = event.target.id;

    // todo: improve this --> see wrapper2

    if(nodeName === "BUTTON") {
        showRobotModal(id.slice(-1));
    } else  if(nodeName === "DIV" && id !== "robot-grid") {
        selectRobot(id.slice(-1));
    }
});

wrapper2.addEventListener('click', (event) => {

    // only detect clicks on items
    if(event.target.matches("[data-clickable]")) {

        const id = event.target.id;
        let index = id.indexOf('-');

        selectMap(id.substring(index+1));
    }
});

/**
 * listens to click events on the add button
 */
addBtn.addEventListener('click', (event) => {
    showCreatorModal();
});

/**
 * selects a map and saves it as selected
 * @param id the id of the selected map
 */
function selectMap(id) {

    let item = null;

    // change old one
    if(selectedMap !== null) {
        item = document.getElementById("map-" + selectedMap);
        //item.style.background = "#0087F5";
        item.style.boxShadow = "inset 0.2rem 0.2rem 0.5rem #c8d0e7, inset -0.2rem -0.2rem 0.5rem #ffffff";

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
    //item.style.background = "#0087F5";
    item.style.boxShadow = "0.8rem 0.8rem 0.8rem #c8d0e7, -0.4rem -0.4rem 0.9rem #ffffff";

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

    switch (id) {
        case '1':
            title = 'ROB1';

            // set algorithm
            inner = `<pre><code>
Solange Ziel nicht erreicht
    Falls Weg rechts 
        gehe rechts 
    Falls Weg geradeaus
        gehe geradeaus
    Falls Weg links 
        gehe links 
    Sonst 
        drehe dich um
    </code></pre>`;

            break;
        case '2':
            title = 'ROB2';
            inner = 'Tremaux Algorithm';

            inner = `<pre><code>
Solange Ziel nicht erreicht
    markiere momentanen Pfad
    folge Pfad bis Ende
        Falls Sackgasse
            kehre um
        sonst
            markiere momentanen pfad
            falls Kreuzung hat unbekannte Wege
                Wähle einen unbekannten Weg
            falls Kreuzung hat Wege mit nur einer Markierung
                Wähle Weg mit nur einer Markierung
            Sonst
                Kehre um
    </code></pre>`;

            break;
        case '3':
            title = 'ROB3';
            inner = `<pre><code>
Solange Ziel nicht erreicht
    falls Sackgasse oder Ariadnefaden quert Kreuzung
        drehe dich um und gehe Gang zurück (und wickle auf)
    sonst
        gehe 1. Gang von links (falls Ariadnefaden im Gang, dann
        aufwickeln sonst abspulen)
    </code></pre>`;
            break;
        case '4':
            title = 'ROB4';
            inner = `<pre><code>
Setze Drehzähler auf 0

Wiederhole bis Ausgang erreicht
    Wiederhole bis Wand berührt wird
        Gehe gerade aus
    Drehung nach links
    Wiederhole bis Drehzähler auf 0 steht
        Folge der Wand
        Falls Drehung
            Adaptiere Drehzähler
    </code></pre>`;
            break;
        case '5':
            title = 'ROB5';
            inner = `<pre><code>
Wiederhole bis Ausgang erreicht
    in welche Richtung kann gegangen werden?
    wähle eine mögliche Richtung zufällig aus 
    und gehe in diese Richtung
    </code></pre>`;
            break;
    }

    // set robot image
    let robotImg = document.getElementById("modal-robot-img");
    robotImg.setAttribute("src", "../img/robot-" + id + ".png");

    modalTitle.innerHTML = '<h1>'+title+'</h1>';
    algorithmText.innerHTML = inner;
}

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

function closeCreatorModal() {
    creatorModal.style.display = "none";
    resetCreator();
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

    if(selectedRobots.length === 0 || selectedMap === null) {
        alert("Don't forget to select a map and the robots!");
        return;
    }

    // todo: add map-array to URL?
    /*
    let tempMap = maps[selectedMap];
    let temp = encodeURIComponent(JSON.stringify(tempMap));
     */

    let url = "../Simulation/simulation.html?map=" + selectedMap + "&robots=";

    // add robots
    for (let i = 0; i < selectedRobots.length; i++) {
        url += selectedRobots[i] + "_";
    }

    // delete last _
    url = url.slice(0, -1);

    location.href = url;
}



