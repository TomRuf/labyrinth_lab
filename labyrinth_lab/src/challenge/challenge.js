"use strict";

const challengeGrid = document.getElementById("grid-container");

const challenges = [
    {id: 1, title: "Challenge 1", img:"finish.png", desc: "Wird das Ziel erreicht?", unlocked: true},
    {id: 2, title: "Challenge 2", img:"fast.png", desc: "Auf die Plätze, fertig, los!", unlocked: true},
    {id: 3, title: "Challenge 3", img:"path.png", desc: "Der Weg ist das Ziel!", unlocked: false},
    {id: 4, title: "Challenge 4", img:"maze.png", desc: "description", unlocked: false},
    {id: 5, title: "Challenge 5", img:"robot.png", desc: "description", unlocked: false},
    {id: 6, title: "Challenge 6", img:"step.png", desc: "Jeder Schritt zählt!", unlocked: false}
];

let completedChallenges;

function init() {

    isMobile();
    completedChallenges = getCompletedChallenges();
    document.getElementById("completed-challenges").innerText = `abgeschlossen: ${completedChallenges.length}/${challenges.length}`;
    createChallenges();
}

// checks if the simulation runs on a mobile device
function isMobile () {

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        alert("Labyrinth Lab is developed for desktop. For the best experience, consider using your laptop/pc!");
    }
}

function createChallenges() {



    challenges.forEach(challenge => {
        if (challenge.id <= completedChallenges.length + 2) challenge.unlocked = true; // unlock them step by step
       createChallengeItem(challenge);
    });
}

function createChallengeItem(c) {

    let newChallenge = document.createElement("div");
    newChallenge.setAttribute("id", "challenge-" + c.id);
    newChallenge.setAttribute("class", "grid-item");

    // icon
    let icon = document.createElement("img");
    icon.setAttribute("src", "../../img/" + c.img);
    icon.setAttribute("class", "icon");
    newChallenge.appendChild(icon);

    let title = document.createElement("p");
    title.setAttribute("class", "title-sm");
    title.setAttribute("id", "title-" + c.id);
    title.innerText = c.title;
    newChallenge.appendChild(title);

    // description
    let desc = document.createElement("i");
    desc.setAttribute("class", "description");
    desc.innerText = c.desc;
    newChallenge.appendChild(desc);

    // if completed --> mark as completed
    if (completedChallenges.includes(c.id)) {
        let completed = document.createElement("img");
        completed.setAttribute("src", "../../img/check-mark.png");
        completed.setAttribute("class", "completed-mark");
        completed.innerText = " \u2713 ";
        newChallenge.appendChild(completed);
    }

    // make challenge-item clickable if unlocked & change appearance
    if (c.unlocked) {
        newChallenge.setAttribute("class", "grid-item-unlocked");
        newChallenge.addEventListener("click", (event) => {
            document.location.href = "./challenge-" + c.id + "/challenge-" + c.id + ".html";
        });
    } else {
        newChallenge.setAttribute("class", "grid-item-locked");
    }

    challengeGrid.appendChild(newChallenge);
}

function getCompletedChallenges() {

    let completedChallenges = JSON.parse(localStorage.getItem("completed-challenges"));

    if (completedChallenges === null) {
        localStorage.setItem("completed-challenges", JSON.stringify([]));
        return [];
    } else {
        return completedChallenges;
    }
}

function goToPreviousPage() {
    // window.history.back();
    document.location.href = "../index/index.html";
}

// todo: delete later
function deleteCompleted() {
    localStorage.setItem("completed-challenges", JSON.stringify([]));
    document.location.href = "challenge.html";
}

init();
