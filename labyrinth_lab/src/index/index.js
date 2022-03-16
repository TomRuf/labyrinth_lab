"use strict";

function init() {

    isMobile();

    document.getElementById("experiment-button").addEventListener('click', (event) => {
        document.location.href = "../labor/labor.html";
    });

    document.getElementById("challenge-button").addEventListener('click', (event) => {
        document.location.href = "../challenge/challenge.html";
    });
}

// checks if the simulation runs on a mobile device
function isMobile () {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        alert("Labyrinth Lab is developed for desktop. For the best experience, consider using your laptop/pc!");
    }
}

init();
