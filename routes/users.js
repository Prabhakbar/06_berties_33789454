// Create a new router
const express = require("express")
const router = express.Router()

const bcrypt = require('bcrypt')
const saltRounds = 10

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {

        // If on university server, redirect there
        if (req.headers.host.includes("doc.gold.ac.uk")) {
            return res.redirect("/usr/435/users/login");
        }

        // Otherwise you're on localhost
        return res.redirect("/users/login");
    }
    next();
};

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', function (req, res, next) {
    // saving data in database
    const plainPassword = req.body.password;

    // Hash the password
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        // Handle any error from bcrypt
        if (err) {
            return next(err);
        }

        let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
        
        let newrecord = [
            req.body.username,
            req.body.first,
            req.body.last,
            req.body.email,
            hashedPassword  // Use the new hashed password
        ];

        // Execute the query, just like in your /bookadded example
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                return next(err); // Pass the database error along
            }

            let response_message = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email
            
            response_message += ' Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword

            // Only send the response ONCE
            res.send(response_message); 

        });
    });
    
});

router.get('/list', redirectLogin, function (req, res, next) {
        // Query to fetch non-sensitive user data (no hashedPassword)
        let sqlquery = "SELECT first_name, last_name, email, username FROM users"; 

        // Execute the query using the injected 'db' object
        db.query(sqlquery, (err, result) => {
            if (err) {
                return next(err);
            }

            // Render the 'listusers.ejs' view, passing the user data as 'users'
            res.render('listusers.ejs', { users: result }); 
        });
    });

    router.get('/login', function (req, res, next) {
    // Renders the 'login.ejs' file.
    // Assuming 'shopData' is available via app.locals or passed here.
    res.render('login.ejs'); 
})

router.post('/loggedin', function (req, res, next) {
    const { username, password } = req.body;

    // 1. Query the database to get the stored hashed password for the submitted username
    let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";
    
    db.query(sqlquery, [username], (err, result) => {
        if (err) {
            return next(err); // Pass the database error
        }

        // Check if a user with that username exists
        if (result.length === 0) {
            // User not found, send failure message
            return res.send('Login Failed: Invalid username or password.');
        }

        // The hashed password retrieved from the database
        const hashedPassword = result[0].hashedPassword;

        // 2. Compare the supplied password with the password in the database
        bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
            if (err) {
                // TODO: Handle bcrypt error
                console.error("Bcrypt comparison error:", err);
                return next(err); 
            }
            
            // Note: bcrypt.compare result is a boolean (true/false)
            else if (result === true) {
            // Save user session here, when login is successful
            req.session.userId = req.body.username;
                // TODO: Send message (Login Successful)
                res.send(`Login Successful! Welcome back, ${username}.`);
            }
            else {
                // TODO: Send message (Login Failed)
                res.send('Login Failed: Invalid username or password.');


            }
        });
    });
});

// Export the router object so index.js can access it
module.exports = router
