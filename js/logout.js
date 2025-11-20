function showAlert() {
    if (confirm("Are you sure you want to Log out?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("reference");
        window.location.href = 'home.html';
    }
}

