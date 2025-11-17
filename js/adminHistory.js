

function displayHistory() {
    let contents = document.querySelector(".contents");
    for (let log of history) {
        if (!log.userOnly) contents.appendChild(document.createElement("p")).textContent = log.log;
    }
}
