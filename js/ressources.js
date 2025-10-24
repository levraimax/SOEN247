// ressources.js

function loadResources() {
    const data = localStorage.getItem("resources");
    return data ? JSON.parse(data) : [];
}

function addAllResources() {
    const resources = loadResources();
    const contentsDiv = document.querySelector(".contents");
    contentsDiv.innerHTML = "";

    resources.forEach(res => {
        const card = document.createElement("div");
        card.className = "resource-card";

        if (res.blocked) {
            card.style.opacity = "0.5";
        }

        const img = document.createElement("img");
        img.src = res.img || "../img/default.png";
        img.alt = res.name;
        img.className = "resource-img";

        const info = document.createElement("div");
        info.className = "resource-info";

        const name = document.createElement("h3");
        name.textContent = res.name;

        const desc = document.createElement("p");
        desc.textContent = res.description;

        const loc = document.createElement("p");
        loc.textContent = "Location: " + res.location;

        const cap = document.createElement("p");
        cap.textContent = "Capacity: " + res.capacity;

        info.appendChild(name);
        info.appendChild(desc);
        info.appendChild(loc);
        info.appendChild(cap);

        card.appendChild(img);
        card.appendChild(info);

        contentsDiv.appendChild(card);
    });
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    addAllResources();
});
