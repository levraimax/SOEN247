
function displayHistory() {
    let contents = document.querySelector(".contents");
    for (let log of history) {
        if (!log.admin && log.user==user) {
            contents.appendChild(document.createElement("p")).textContent = log.log;
        }
    }
}