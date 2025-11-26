const express = require("express")
const mysql = require("mysql")
const cors = require("cors");
const multer = require('multer');
const upload = multer();
const cookieParser = require("cookie-parser"); // Make sure you install it


const app = express();
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:8080", "credentials": true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger to help diagnose 404s from the client
app.use((req, res, next) => {
    console.log((new Date()).toLocaleString(), req.method, req.originalUrl);
    next();
});

let credentials = {};

function generateKey(user) {
    let res = Math.floor(Math.random() * 1E32);
    credentials[res] = user;
    return res;
}

function authenticate(req, res, next) {
    //console.log(credentials)
    const key = req.cookies.credentials;
    if (key && credentials[key]) {
        // Attach user info to request for downstream use
        req.user = credentials[key];
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
}

// Example: Protect an admin-only route
function requireAdmin(req, res, next) {
    // req.user is the user reference (from credentials)
    const userRef = req.user;
    const sql = `SELECT admin FROM users WHERE reference = ?`;
    database.query(sql, [userRef], (err, result) => {
        if (!err && result.length > 0 && result[0].admin) {
            next();
        } else {
            res.status(403).send("Forbidden: Admins only");
        }
    });
}

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
        // Ensure audit table exists for recording admin events (availability creation etc.)
        const createAuditSql = `
            CREATE TABLE IF NOT EXISTS audit_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_type VARCHAR(80) NOT NULL,
                availability_ref INT NULL,
                resource INT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        database.query(createAuditSql, (err) => {
            if (err) console.error('Failed to ensure audit_events table exists:', err);
            else console.log('audit_events table ready');
        });
        
    }
});


app.get("/signup", (req, res) => {
    //console.log(req.query);
    let { netname, firstName, lastName, email, role, password } = req.query;
    let params = [netname, firstName, lastName, email, (role == "admin") ? 1 : 0, password]
    console.log(req.cookies)
    let sql = `INSERT INTO users (netname,name,last_name,email,admin,password) VALUES (?,?,?,?,?,?)`
    database.query(sql, params, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send();
        } else {
            res.cookie("credentials", generateKey(result.insertId), {
                maxAge: 3600E3,
                httpOnly: true, // The cookie will not be available to Console on browser through document.cookiessecure: false, // use true if using https
                secure: true
            });
            res.status(200).send();
        }
    })
})

app.get("/login", (req, res) => {
    let netname = req.query.netname;
    let password = req.query.password;

    if (netname == null || password == null) {
        res.status(500).send();
    } else {
        let sql = `SELECT password, admin, reference FROM users WHERE netname = '${netname}'`
        database.query(sql, (err, result) => {
            if (!err && result.length > 0) {

                
                res.cookie("credentials", generateKey(result[0].reference), {
                    maxAge: 3600E3,
                    httpOnly: true, // The cookie will not be available to Console on browser through document.cookiessecure: false, // use true if using https
                    secure: true
                });
                
                res.status(200).json([result[0].password == password, result[0].admin, result[0].reference]);
            } else {
                res.status(200).send(false);
            }
        })
    }
})


app.get("/logout", authenticate, (req, res) => {
    // Remove the credentials from the in-memory store
    const key = req.cookies.credentials;
    if (key) {
        delete credentials[key];
    }
    // Clear the cookie (make sure to match the cookie options used in /login)
    res.clearCookie("credentials");
    res.status(200).send("Logged out");
});






app.get("/booksData", authenticate, (req, res) => {
    let user = req.user;

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



app.get("/requestsData", authenticate, (req, res) => {
    let user = req.user;

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

app.get("/userdata", authenticate, (req, res) => {
    let user = req.user;
    let sql = `SELECT name, last_name, email, address, phone FROM users WHERE reference = '${user}'`
    database.query(sql, (err, result) => {
        if (err) {
            res.status(500).send();
        } else {
            res.status(200).json(result);
        }
    })
})

app.get("/submituserdata", authenticate, (req, res) => {
    let field = req.query.field;
    if (field != null && !field.includes(" ") && !field.toLowerCase().includes("netname")) {
        let sql = `UPDATE users SET ${req.query.field} = '${req.query.value}' WHERE netname='${req.user}'`
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


app.post("/createResource", authenticate, requireAdmin, upload.single('image'), (req, res) => {
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

app.get("/resourceImage/:id", authenticate, (req, res) => {
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

app.get("/createAvailability", authenticate, requireAdmin, (req, res) => {
    
    let { resource, start, end, auth } = req.query;

    if (resource == null || start == null || end == null || auth == null) {
        res.status(500).send("Invalid inputs");
    } else {
        start = formatDateTime(start)
        end = formatDateTime(end)
        // Use parameterized insert so we can get insertId and record an audit event
        const sql = `INSERT INTO availabilities (resource,start,end,auth) VALUES (?, ?, ?, ?)`;
        const params = [resource, start, end, auth];
        database.query(sql, params, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send();
            } else {
                const availRef = result.insertId;
                // record audit event
                const details = JSON.stringify({ start, end });
                const auditSql = `INSERT INTO audit_events (event_type, availability_ref, resource, details) VALUES (?, ?, ?, ?)`;
                database.query(auditSql, ['availability_created', availRef, resource, details], (err) => {
                    if (err) console.error('Failed to insert audit event:', err);
                    // reply to client regardless of audit insert result
                    res.status(200).send();
                });
            }
        });
    }


})

app.get("/deleteAvailability", authenticate, requireAdmin, (req, res) => {
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

app.get("/updateAvailability", authenticate, requireAdmin, (req, res) => {
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

app.get("/updateResource", authenticate, requireAdmin, (req, res) => {
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

app.get("/deleteResource", authenticate, requireAdmin, (req, res) => {
    console.log("Deleting resource.. implement checking credentials (ADMIN ONLY)")
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

app.get("/deleteRequest", authenticate, (req, res) => {
    console.log("Deleting request.. implement checking credentials (ADMIN ONLY)")
    let { reference } = req.query;

    function deleteRequest() {
        let sql = `DELETE FROM requests WHERE reference = ${reference}`
        database.query(sql, (err) => {
            if (err) {
                res.status(404).send();
            } else {
                res.status(200).send();
            }
        })
    }

    let sql = `SELECT admin FROM users WHERE reference = ?`;
    database.query(sql, [req.user], (err, result) => {
        if (!err && result.length > 0 && result[0].admin) {
            // The user is an admin
            deleteRequest();
            //res.status(200).send();
        } else {
            // Not admin; are they the creator of the request?
            let sql = "SELECT user FROM requests WHERE reference = ?"
            database.query(sql, [reference], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send();
                } else {
                    let reqUser = result[0].user;
                    if (reqUser == req.user) {
                        // Allowed to delete
                        deleteRequest();
                        //res.status(200).send();
                    } else {
                        // Not allowed
                        res.status(403).send();
                    }
                }
            })
        }
    });
})

app.get("/approveRequest", authenticate, requireAdmin, (req, res) => {
    console.log("Approving request.. implement checking credentials (ADMIN ONLY)")
    // 1. All that matters is the request reference
    let { request } = req.query;
    // 2. Get the request
    let sql = `SELECT * FROM requests WHERE reference = ?`
    database.query(sql, [request], (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).send();
        } else {
            // 3. Is the availability null (custom)
            result = result[0]
            if (result.availability == null) {
                // Yes: make an availability and book that availability
                let sql = `INSERT INTO availabilities (resource,start,end,auth) VALUES (?,?,?,1)`
                database.query(sql, [result.resource, result.start, result.end], (err, newAv) => {
                    if (err) {
                        console.log(err)
                        res.status(500).send()
                    } else {
                        // Successfully created, now book it
                        let sql = `INSERT INTO bookings (user,availability,start,end) VALUES (?,?,?,?)`
                        database.query(sql, [result.user, newAv.insertId, result.start, result.end], (err) => {
                            if (err) {
                                console.log(err)
                                res.status(500).send()
                            } else {
                                // Delete the request
                                let sql = `DELETE FROM requests WHERE reference = ?`
                                database.query(sql, [request], (err) => {
                                    if (err) {
                                        console.log(err)
                                        res.status(500).send();
                                    } else {
                                        // Completed with no failure
                                        res.status(200).send()
                                    }
                                })
                            }
                        })
                    }
                })
            } else {
                // No: Create a booking
                let sql = `INSERT INTO bookings (user,availability,start,end) VALUES (?,?,?,?)`
                database.query(sql, [result.user, result.availability, result.start, result.end], (err) => {
                    if (err) {
                        console.log(err)
                        res.status(500).send()
                    } else {
                        // Delete the request
                        let sql = `DELETE FROM requests WHERE reference = ?`
                        database.query(sql, [request], (err) => {
                            if (err) {
                                console.log(err)
                                res.status(500).send();
                            } else {
                                // Completed with no failure
                                res.status(200).send()
                            }
                        })
                    }
                })
            }
        }
    })

})

app.get("/deleteBooking", authenticate, requireAdmin, (req, res) => {
    console.log("Deleting booking.. implement checking credentials (USER ONLY)")
    console.log("Deleting booking.. IMPLEMENT CAPACITY")
    let { reference } = req.query;

    function deleteBooking() {
        let sql = `DELETE FROM bookings WHERE reference = ${reference}`
        database.query(sql, (err) => {
            if (err) {
                res.status(404).send();
            } else {
                res.status(200).send();
            }
        })
    }

    let sql = `SELECT admin FROM users WHERE reference = ?`;
    database.query(sql, [req.user], (err, result) => {
        if (!err && result.length > 0 && result[0].admin) {
            // The user is an admin
            deleteBooking();
        } else {
            // Not admin; are they the creator of the request?
            let sql = "SELECT user FROM bookings WHERE reference = ?"
            database.query(sql, [reference], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send();
                } else {
                    let reqUser = result[0].user;
                    if (reqUser == req.user) {
                        // Allowed to delete
                        deleteBooking();
                    } else {
                        // Not allowed
                        res.status(403).send();
                    }
                }
            })
        }
    });
})

app.get("/resources", authenticate, (req, res) => {
    let sql = "SELECT reference,name,description,location,capacity,blocked FROM resources";
    database.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error");
        } else {
            res.status(200).json(result);
        }
    })
})

app.get("/availabilities", authenticate, (req, res) => {
    let sql = "SELECT * FROM availabilities";
    database.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error");
        } else {
            res.status(200).json(result);
        }
    })
})

app.get("/requests", authenticate, requireAdmin, (req, res) => {
    console.log("Obtaining requests.. implement checking credentials (ADMIN ONLY)")
    let sql = "SELECT requests.*, users.netname, resources.name FROM requests INNER JOIN users ON requests.user = users.reference INNER JOIN resources ON requests.resource = resources.reference";
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
app.get("/reports/resourceCounts", authenticate, (req, res) => {
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
app.get('/reports/timeCounts', authenticate, (req, res) => {
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


app.get("/request", authenticate, (req, res) => {
    let { reference, start, end } = req.query
    let user = req.user;
    //console.log(start, end)
    if (reference != null) {
        if (user == null) {
            res.status(500).send()
        } else if (start != null && end != null) {
            // Specific range on an existing availability
            start = new Date(formatDateTime(start))
            end = new Date(formatDateTime(end))

            let sql = `SELECT start, end, auth FROM availabilities WHERE reference = ?`
            database.query(sql, [reference], (err, result) => {
                if (err) {
                    console.log(err)
                    res.status(500).send()
                } else {
                    //console.log(result)
                    let aStart = result[0].start;
                    let aEnd = result[0].end;

                    if (start >= aStart && start < aEnd && end > start && end <= aEnd) {
                        console.log("Valid request")
                        // Create booking
                        // Need to check auth to decide whether to request or book
                        let auth = result[0].auth;
                        if (auth) {
                            // Make a request
                            createRequest(reference, user, [start, end])
                            res.status(200).send()
                        } else {
                            // Make a booking
                            bookAvailability(reference, user, [start, end]);
                            res.status(200).send()

                        }
                    } else {
                        // No existing availabilities satisfy the range requested (custom request)
                        let { resource } = req.query

                        if (resource) {
                            customRequest(user, resource, start, end)
                            res.status(200).send();
                        } else {
                            res.status(500).send();
                        }

                    }
                }
            })
        } else {
            // Full range of the availability
            let sql = `SELECT auth FROM availabilities WHERE reference = ?`
            database.query(sql, [reference], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send();
                } else {
                    if (result[0].auth) {
                        // Create a request (full range)
                        createRequest(reference, user)
                        res.status(200).send();
                    } else {
                        // Create a booking (full range)
                        bookAvailability(reference, user)
                        res.status(200).send();
                    }
                }
            })
        }
    } else {
        // Create a new custom request
        let { resource } = req.query;
        if (resource == null) {
            res.status(500).send();
        } else {
            customRequest(user, resource, start, end);
            res.status(200).send()
        }
    }
})


function availabilityHasRoom(availability, callback) {
    let sql = `
        SELECT 
            r.capacity, 
            COUNT(b.reference) AS count
        FROM availabilities a
        INNER JOIN resources r ON a.resource = r.reference
        LEFT JOIN bookings b ON b.availability = a.reference
        WHERE a.reference = ?
    `;

    database.query(sql, [availability], (err, result) => {
        if (err) {
            callback(false)
        } else {
            callback(result[0].count < result[0].capacity);
        }
    })
}

function hasRoom(resource, start, end, callback) {
    // Overlap: start < end && end > start
    
    let sql = `SELECT COUNT(b.reference) AS count, r.capacity FROM resources r 
    LEFT JOIN availabilities a ON a.resource = r.reference
    LEFT JOIN bookings b ON b.availability = a.reference
    WHERE r.reference = ?
        AND b.end > ?
        AND b.start < ?`;

    database.query(sql, [resource, start, end], (err, result) => {
       
        if (err) {
            callback(false)
        } else if (callback) {
            callback(result[0].count < result[0].capacity);
        }
    })
}


// Making a request, assuming the availabiltiy exists
function createRequest(availability, user, range = null) {
    console.log("CREATE REQUEST")
    //	availability	user	start	end (request format)
    if (range) {
        let [start, end] = range;
        let sql = `INSERT INTO requests (availability,user,start,end) VALUES (?,?,?,?)`
        database.query(sql, [availability, user, start, end], (err) => {
            if (err) console.log(err);
        })
    } else {
        let sql = `INSERT INTO requests (availability,user,start,end) SELECT ?, ?, start, end FROM availabilities WHERE reference = ?`
        database.query(sql, [availability, user, availability], (err) => {
            if (err) console.log(err);
        })
    }
}


// Accepted custom requests create an availability with capacity 1
function customRequest(user, resource, start, end) {
    console.log("CUSTOM REQUEST")
    let sql = `INSERT INTO requests (user,resource,start,end) VALUES (?,?,?,?)`
    database.query(sql, [user, resource, start, end], (err) => {
        if (err) console.log(err);
    })
}

function bookAvailability(availability, user, range = null) {
    console.log("BOOK AVAILABILITY")

    let sql = `SELECT resource FROM availabilities WHERE reference = ?`
    database.query(sql, [availability], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            let resource = result[0].resource;
            //if (hasRoom(resource, range)) {
            if (range) {
                // Specific range
                let [start, end] = range;
                hasRoom(resource, start, end, (room) => {
                    //console.log()
                    if (room) {
                        let sql = `INSERT INTO bookings (availability,user,start,end) VALUES (?,?,?,?)`

                        database.query(sql, [availability, user, start, end], (err) => {
                            if (err) console.log(err);
                        })
                    } else {
                        console.log("Resource request: No more room")
                    }
                });
            } else {
                // Full range
                
                availabilityHasRoom(availability, (room) => {
                    if (room) {
                        let sql = `INSERT INTO bookings (availability, user, start, end) SELECT ?, ?, start, end FROM availabilities WHERE reference = ?`
                        database.query(sql, [availability, user, availability], (err) => {
                            if (err) console.log(err)
                        })
                    } else {
                        console.log("Availability request: No more room")
                    }
                })
            }
            
        }
    })

    
}

app.get("/updateRequest", authenticate, (req, res) => {
    console.log("Updating request.. implement checking credentials");
    let { reference, start, end, resource } = req.query;

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


app.get("/bookings-history", authenticate, (req, res) => {
    const sql = `
        SELECT 
            b.reference,
            b.availability,
            b.user,
            b.start,
            b.end,
            u.netname,
            u.name as user_name,
            u.last_name
        FROM bookings b
        LEFT JOIN users u ON b.user = u.reference
        ORDER BY b.start DESC
    `;

    database.query(sql, (err, result) => {
        if (err) {
            console.log("bookings-history query error", err);
            res.status(500).send();
        } else {
            res.status(200).json(result);
        }
    });
});

// Admin history endpoint - returns audit events (newest first)
app.get("/request-history", authenticate, (req, res) => {
    const sql = `
        SELECT r.*,
        u.netname,
        u.name,
        u.last_name,
        processor.netname as process_by_netname, 
        res.name as resouce_name
        FROM requests r
        LEFT JOIN users u ON r.user = u.reference
        LEFT JOIN users Processor ON r.processed_by = processor.reference
        LEFT JOIN resrouces res ON r.resource = res.reference
        WHERE r.status != 'pending'
        ORDER BY r.processed_at DESC
        `;
    database.query(sql, (err, result) => {
        if (err) {
            console.error('Failed to query audit_events:', err);
            res.status(500).send();
        } else {
            res.status(200).json(result);
        }
    });
});





app.listen(3000, () => { console.log("Server is running on port 3000") });
