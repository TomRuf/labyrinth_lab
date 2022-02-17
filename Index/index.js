"use strict";

const darkGrey = '#808080',
    lightGrey = '#D3D3D3';

const experimentButton = document.getElementById("experiment-button");
const challengeButton = document.getElementById("challenge-button");

function init() {

    isMobile();

    experimentButton.addEventListener('click', (event) => {
        startExperimentMode();
    });

    challengeButton.addEventListener('click', (event) => {
        startChallengeMode();
    });
}

// checks if the simulation runs on a mobile device
function isMobile () {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        alert("Labyrinth Lab is developed for desktop. For the best experience, consider using your laptop/pc!");
    }
}

function startExperimentMode() {
    document.location.href = "../Start/start.html";
}

function startChallengeMode() {
    // document.location.href = "../Selection/selection.html";
    alert("start challenge");
}

// experimentGrid.addEventListener('click', (event) => {
//
//     // only detect clicks on items
//     if(event.target.matches("[data-clickable]")) {
//
//         const id = event.target.id;
//         let index = id.indexOf('-');
//         selectExp(parseInt(id.substring(index+1)));
//
//     } else if(event.target.matches("[data-delete]")) {
//
//         const id = event.target.id;
//         let index = id.lastIndexOf('-');
//         confirmDeleteExp(parseInt(id.substring(index+1)));
//     }
// });

init();
