
function displayHistory() {
    let contents = document.querySelector(".contents");
    for (let log of history) {
        if (!log.admin && log.user==user) {
            contents.appendChild(document.createElement("p")).textContent = log.log;
        }
        let line = document.createElement("hr");
        line.classList.add("line");
        contents.appendChild(line)
    }
}