function showAlert() {
    if (confirm("Are you sure you want to Log out?")) {
        GET("http://localhost:3000/logout", function () {
            localStorage.removeItem("user");
            localStorage.removeItem("reference");
            window.location.href = 'home.html';
        })   
    }
}

