start http-server -a ::1 -p 8080
start node "%~dp0js\server.js"
start http://localhost:8080/html/home.html