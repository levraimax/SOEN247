const express = require("express")
const mysql = require("mysql")
const cors = require("cors");

const app = express();
app.use(cors());

let availabilities;

const database = mysql.createConnection({
    host: "localhost"
    , user: "root"
    , password: ""
    , database: "soen247"
})

database.connect((err) => {
    if (err) {
        console.log("Failed to connect to database", err);
    } else {
        console.log("Connected to database");
        //database.query("SELECT * FROM availabilities", (err, result) => {
        //    availabilities = result;
        //    console.log(availabilities);
        //})
    }
});


app.get("/signup", (req, res) => {
    //console.log(req.query);
    let sql = `INSERT INTO users (netname,name,last_name,email,admin,password) VALUES ('${req.query.netname}','${req.query.firstName}','${req.query.lastName}','${req.query.email}',${(req.query.role=="admin")? 1:0})`
    database.query(sql, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send();
        } else {
            res.status(200).send();
        }
    })
})

app.get("/login", (req, res) => {
    let netname = req.query.netname;
    let password = req.query.password;

    if (netname == null || password == null) {

    } else {
        let sql = `SELECT password, admin FROM users WHERE netname = '${netname}'`
        database.query(sql, (err, result) => {
            if (!err && result.length > 0) {
                console.log("admin", result[0].admin);
                res.status(200).json([result[0].password==password,result[0].admin]);
            } else {
                res.status(200).send(false);
            }
        })
    }
})


//app.get("/signup/:id", (req, res) => {
//    let student_id = req.params.id;
//    let sql = `INSERT INTO users (name) VALUES ('${student_id}')`;

//    database.query(sql, (err, result) => {
//        if (err) {
//            console.log(err);
//            res.status(500).send("Failed")
//        } else {
//            res.status(200).send("Success");
//        }
//    })
//})

app.get("/userdata", (req, res) => {
   
    let sql = `SELECT name, last_name, email, address, phone FROM users WHERE netname = '${req.query.netname}'`
    database.query(sql, (err, result) => {
        if (err) {
            res.status(500).send();
        } else {
            res.status(200).json(result);
        }
    })
})

app.get("/submituserdata", (req, res) => {
    let field = req.query.field;
    if (field != null && !field.includes(" ") && !field.toLowerCase().includes("netname")) {
        let sql = `UPDATE users SET ${req.query.field} = '${req.query.value}' WHERE netname='${req.query.user}'`
        database.query(sql, (err) => {
            if (err) {
                res.status(500).send("Failed to update user data");
            } else {
                res.status(200).send("User data updated successfully");
            }
        })
    } else {
        res.status(500).send("Failed to update user data");
    }
})


app.get("/createResource", (req, res) => {
    let resource = req.query.resource;
    let sql = `INSERT INTO resources (name) VALUES ('${resource}')`;

    database.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Failed");
        } else {
            res.status(200).send("Success");
        }
    })

})

app.get("/createAvailability", (req, res) => {
    let resource = req.query.resource;
    let start = req.query.start;
    let end = req.query.end;
    let capacity = req.query.capacity | 1;

    if (resource == null || start == null || end == null) {
        res.status(500).send("Invalid inputs");
    } else {
        start = start.replace("T", " ") + ":00";
        end = end.replace("T", " ") + ":00";
        let sql = `INSERT INTO availabilities (resource,start,end,capacity) VALUES (${resource},'${start}','${end}',${capacity})`
        //console.log("HERE\t", sql);
        database.query(sql, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send("Failure");
            } else {
                res.status(200).send("Success");
            }
        })
    }


})

app.get("/resources", (req, res) => {

    let sql = "SELECT * FROM resources";
    database.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error");
        } else {
            res.status(200).json(result);
        }
    })
})

app.get("/availabilities", (req, res) => {

    let sql = "SELECT * FROM availabilities";
    database.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error");
        } else {
            res.status(200).json(result);
        }
    })
})

app.get("/request", (req, res) => {
    let availability = req.query.availability;
    let user = req.query.user;
    


    if (availability == null || user == null) {
        res.status(500).send("Invalid resource or user");
    } else {
        if (hasRoom(availability)) {
            let sql = `INSERT INTO bookings (availability,user) VALUES (${availability},${user})`;
            database.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Failure");
                } else {
                    res.status(200).send("Success");
                }
            })
        } else {
            res.status(500).send("No room left");
        }
    }

})

//app.get("/getstudent/:id", (req, res) => {
//    let sql = `SELECT * FROM students WHERE student_id=${req.params.id}`;

//    database.query(sql, (err, result) => {
//        if (err) {
//            res.status(500).send("Database query failed");
//        } else {
//            res.status(200).json(result);
//        }
//    });
//})

//app.get("/addstudent/:student_id/:grade/:name/:last_name", (req, res) => {
//    let student = { student_id: req.params.student_id, grade: req.params.grade, name: req.params.name, last_name: req.params.last_name };

//    let sql = `INSERT INTO students SET ?`;

//    database.query(sql, student, (err, result) => {
//        if (err) {
//            console.log(err);
//            res.status(500).send("Failed to add student");
//        } else {
//            res.status(200).send("Student added successfully");
//        }
//    })
//})

//app.get("/deletestudent/:student_id", (req, res) => {
//    let sql = `DELETE FROM students WHERE student_id=${req.params.student_id}`;

//    database.query(sql, (err, result) => {
//        if (err) {
//            res.status(500).send("Failed to delete student");
//        } else {
//            res.status(200).send("Student deleted successfully");
//        }
//    })
//})

//app.get("/filter", (req, res) => {
//    //let filters = JSON.parse(req.params.filters);
//    let [filters, valid] = validFilters(req.query);
//    if (valid) {
//        console.log(`SELECT * FROM students WHERE${filters}`);
//        database.query(`SELECT * FROM students WHERE${filters}`, (err, result) => {
//            if (!err) {
//                if (result.length > 0) {
//                    res.status(200).json(result);
//                } else {
//                    res.status(200).send("No results match the query");

//                }
//            } else {
//                console.log(err);
//            }
//        })
//    } else {
//        res.status(200).send("No valid filters received");
//    }
//    //console.log(filters);
//})

//let params = [];
//let formatOfParams = {};

//database.query("DESCRIBE students", (err, result) => {
//    if (!err) {
//        params = result.map((row) => row.Field);
//        params.forEach((param) => {
//            formatOfParams[param] = result.find((row) => row.Field === param).Type;
//        });
//        //console.log(formatOfParams);
//    }
//})

//function validFilters(query) {
//    let res = [];
//    for (let key in query) {
//        if (params.includes(key)) {
//            switch (formatOfParams[key]) {
//                case "int(11)":
//                    if (/^(>|<|=|>=|<=){1}\d+$/.test(query[key])) res.push(` ${key} ${query[key].replace(/(\d{1,}$)/, " $1")}`);
//                    break;
//                case "text":
//                    if (/^\w+(-\w+)*$/.test(query[key])) res.push(` ${key} = '${query[key]}'`);
//                    break;
//            }
//        }
//    }
//    return [res.join(" AND"), res.length > 0];
//}





app.listen(3000, () => { console.log("Server is running on port 3000") });
