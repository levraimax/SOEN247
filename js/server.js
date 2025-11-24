const express = require("express")
const mysql = require("mysql")
const cors = require("cors");
const multer = require('multer');
const upload = multer();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger to help diagnose 404s from the client
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.originalUrl);
    next();
});

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
    let { netname, firstName, lastName, email, role, password } = req.query;
    let params = [netname, firstName, lastName, email, (role == "admin") ? 1 : 0, password]
    let sql = `INSERT INTO users (netname,name,last_name,email,admin,password) VALUES (?,?,?,?,?,?)`
    database.query(sql, params, (err) => {
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
        let sql = `SELECT password, admin, reference FROM users WHERE netname = '${netname}'`
        database.query(sql, (err, result) => {
            if (!err && result.length > 0) {
                console.log("admin", result[0].admin);
                res.status(200).json([result[0].password == password, result[0].admin,result[0].reference]);
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


app.get("/booksData", (req, res) => {
    let { user } = req.query;

    let sql = `SELECT * FROM bookings WHERE user = ?`

    database.query(sql, [user], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send()
        } else {
            res.status(200).json(result);
        }
    })
})



app.get("/requestsData", (req, res) => {
    let { user } = req.query;

    let sql = `SELECT * FROM requests WHERE user = ?`

    database.query(sql, [user], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send()
        } else {
            res.status(200).json(result);
        }
    })

})

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


app.post("/createResource", upload.single('image'), (req, res) => {
    //console.log(req.file);
    if (req.body.name != null && req.body.description != null && req.body.location != null && req.body.capacity != null && req.body.capacity > 0) {
        let resource = req.body.name;
        let params = [req.body.name, req.body.description, req.body.location, req.body.capacity, req.file.buffer]
        let sql = `INSERT INTO resources (name,description,location,capacity,image) VALUES (?,?,?,?,?)`;

        database.query(sql, params, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Failed");
            } else {
                res.status(200).send("Success");
            }
        })
    } else {
        res.status(500).send("Failed");
    }
})

app.get("/resourceImage/:id", (req, res) => {
    //console.log(req.params.id);
    const sql = "SELECT image FROM resources WHERE reference = ?";
    database.query(sql, [req.params.id], (err, result) => {
        if (err || result.length === 0 || !result[0].image) {
            res.status(404).send("Image not found");
        } else {
            // Set the appropriate content type. Adjust if you store other formats.
            res.setHeader("Content-Type", "image/png");
            res.send(result[0].image);
        }
    });
});

function formatDateTime(dateTime) {
    return dateTime.replace("T", " ") + ":00";
}

app.get("/createAvailability", (req, res) => {
    //let resource = req.query.resource;
    //let start = req.query.start;
    //let end = req.query.end;
    //let auth = req.query.auth | 0;
    let { resource, start, end, auth } = req.query;

    console.log(resource)
    console.log(start)
    console.log(end)
    console.log(auth)
    //let capacity = req.query.capacity | 1;

    if (resource == null || start == null || end == null || auth == null) {
        res.status(500).send("Invalid inputs");
    } else {
        start = formatDateTime(start)
        end = formatDateTime(end)
        let sql = `INSERT INTO availabilities (resource,start,end,auth) VALUES (${resource},'${start}','${end}','${auth}')`
        //console.log("HERE\t", sql);
        database.query(sql, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            } else {
                res.status(200).send();
            }
        })
    }


})

app.get("/deleteAvailability", (req, res) => {
    let availability = req.query.reference;
    if (availability != null) {
        let sql = `DELETE FROM availabilities WHERE reference = ${availability}`
        database.query(sql, (err) => {
            if (err) {
                console.log(err)
                res.status(500).send()
            } else {
                res.status(200).send();
            }
        })
    }
})

app.get("/updateAvailability", (req, res) => {
    let { reference, resource, start, end, auth } = req.query;

    if (reference == null || resource == null | start == null || end == null || auth == null) {
        console.log("Invalid inputs")
        res.status(500).send("Invalid inputs")
    } else {
        let sql = `UPDATE availabilities SET resource = ?, start = ?, end = ?, auth = ? WHERE reference = ${reference}`;
        let params = [resource, formatDateTime(start), formatDateTime(end), auth];
        database.query(sql, params, (err) => {
            if (err) {
                res.status(500).send();
            } else {
                res.status(200).send();
            }
        })
    }
})

app.get("/updateResource", (req, res) => {
    console.log("Updating resource.. implement checking credentials")
    //console.log(req.query);
    //name description, location, capacity

    let name = req.query.name;
    let description = req.query.description;
    let location = req.query.location;
    let capacity = req.query.capacity;
    let reference = req.query.id;
    let blocked = req.query.blocked;
    //console.log(reference)

    if (reference == null || name == null || description == null || location == null || capacity == null || blocked == null) {
        res.status(500).send("Invalid inputs");
    } else {
        let sql = `UPDATE resources SET name = '${name}', description = '${description}', location = '${location}', capacity = ${capacity}, blocked = ${blocked} WHERE reference = ${reference}`
        database.query(sql, (err) => {
            if (err) {
                console.log("Err")
                res.status(404).send()
            } else {
                res.status(200).send();
            }
        })
    }

})

app.get("/deleteResource", (req, res) => {
    console.log("Deleting resource.. implement checking credentials")
    let resource = req.query.reference;
    let sql = `DELETE FROM resources WHERE reference = ${resource}`
    database.query(sql, (err) => {
        if (err) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }
    })
})

app.get("/deleteRequest", (req, res) => {
    console.log("Deleting request.. implement checking credentials")
    let { reference } = req.query;
    let sql = `DELETE FROM requests WHERE reference = ${reference}`
    database.query(sql, (err) => {
        if (err) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }
    })
})

app.get("/deleteBooking", (req, res) => {
    console.log("Deleting booking.. implement checking credentials")
    console.log("Deleting booking.. IMPLEMENT CAPACITY")
    let { reference } = req.query;
    let sql = `DELETE FROM bookings WHERE reference = ${reference}`
    database.query(sql, (err) => {
        if (err) {
            res.status(404).send();
        } else {
            res.status(200).send();
        }
    })
})

app.get("/resources", (req, res) => {
    let sql = "SELECT reference,name,description,location,capacity,blocked FROM resources";
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

app.get("/requests", (req, res) => {
    console.log("Obtaining requests.. implement checking credentials")
    let sql = "SELECT * FROM requests";
    database.query(sql, (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).send("Error")
        } else {
            res.status(200).json(result);
        }
    })
})


// Reports endpoint: return booking counts per resource
app.get("/reports/resourceCounts", (req, res) => {
    const sql = `
        SELECT r.reference, r.name, COUNT(b.reference) AS bookings
        FROM resources r
        LEFT JOIN availabilities a ON a.resource = r.reference
        LEFT JOIN bookings b ON b.availability = a.reference
        GROUP BY r.reference, r.name
        ORDER BY bookings DESC
    `;

    database.query(sql, (err, result) => {
        if (err) {
            console.log("reports query error", err);
            res.status(500).send();
        } else {
            // return as array of { reference, name, bookings }
            res.status(200).json(result);
        }
    });
});


// Reports endpoint: return booking counts grouped by hour (e.g. '09:00')
app.get('/reports/timeCounts', (req, res) => {
    const sql = `
        SELECT DATE_FORMAT(a.start, '%H:00') AS hour_label, COUNT(b.reference) AS bookings
        FROM availabilities a
        LEFT JOIN bookings b ON b.availability = a.reference
        GROUP BY hour_label
        ORDER BY bookings DESC
    `;

    database.query(sql, (err, result) => {
        if (err) {
            console.log('timeCounts query error', err);
            res.status(500).send();
        } else {
            res.status(200).json(result);
        }
    });
});


app.get("/request", async (req, res) => {
    let { user, availability } = req.query
    if (availability == null) {
        let { start, end, resource } = req.query;
        start=formatDateTime(start)
        end=formatDateTime(end)

        if (start == null || end == null || resource == null) {
            res.status(500).send()
        } else {
            let sql = `INSERT INTO requests (user,start,end,resource) VALUES (?,?,?,?)`
            let params = [user, start, end, resource];
            database.query(sql, params, (err) => {
                if (err) {
                    console.log(err)
                    res.status(500).send()
                } else {
                    res.status(200).send()
                }
            })
        }

    } else if (user == null) {
        res.status(500).send("Invalid resource or user");
    } else if(availability && user){
        try{
            const roomAvailable = await hasRoom(availability);
            if (roomAvailable) {
                let sql = `INSERT INTO bookings (availability,user) VALUES (${availability},${user})`;
                database.query(sql, (err, result) => {
                    if(err){
                        console.log(err);
                        res.status(500).send("Failure");
                    }else{
                        res.status(200).send("Success");
                    }
                });
            } else {
                res.status(500).send("No available capacity");
            }
        }catch(err){
            console.log(err);
            res.status(500).send("Error checking availability");
        }
    }
});

app.get("/updateRequest", (req, res) => {
    console.log("Updating request.. implement checking credentials");
    let {reference, start, end, resource } = req.query;

    if (reference == null || start == null || end == null || resource == null) {
        res.status(500).send()
    } else {
        let sql = `UPDATE requests SET reference = ?, start = ?, end = ?, resource = ? WHERE reference = ?`
        let params = [reference, formatDateTime(start), formatDateTime(end), resource, reference]
        database.query(sql, params, (err) => {
            if (err) {
                console.log(err)
                res.status(500).send()
            } else {
                res.status(200).send();
            }
        })
    }
})

app.get("/availabilitiesWithBookings", (req, res) => {
    const sql = `
    SELECT a.reference, a.start, a.end, a.resource, a.auth, r.name as resource_name, b.user as booked_by
    FROM availabilities a
    LEFT JOIN resources r ON a.resource = r.reference
    LEFT JOIN bookings b ON a.reference = b.availability
    `;
    database.query(sql, (err, result) => {
        if (err) {
            console.log("availabilitiesWithBookings error: ", err);
            res.status(500).send();
        } else {
            res.status(200).json(result);
        }
    });
});

// Fallback routes (case-insensitive/path variants) in case client requests a slightly different URL
app.get(["/availabilitieswithbookings", "/api/availabilitiesWithBookings"], (req, res) => {
    const sql = `
    SELECT a.reference, a.start, a.end, a.resource, a.auth, r.name as resource_name, b.user as booked_by
    FROM availabilities a
    LEFT JOIN resources r ON a.resource = r.reference
    LEFT JOIN bookings b ON a.reference = b.availability
    `;
    database.query(sql, (err, result) => {
        if (err) {
            console.log("availabilitiesWithBookings (fallback) error: ", err);
            res.status(500).send();
        } else {
            res.status(200).json(result);
        }
    });
});
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
