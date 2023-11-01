module.exports = function(app, shopData) {

    //validator:
    const { check, validationResult } = require('express-validator');

    //sanitiser
    const expressSanitizer = require('express-sanitizer');


    //sanitise:
    app.use(expressSanitizer());



    //redirect to the login part:
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    }

    //logout:
    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })


    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });

    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });

    //get and display the search-result
    app.get('/search-result', function (req,res) {
        let sqlquery = 
        "SELECT * FROM books WHERE name like '%" + req.query.keyword + "%'"; 
        db.query(sqlquery, (err, result) => {
            if (err) {res.send('Error');}
        //merges shopdata with new Available books:result
        let newData = Object.assign({}, shopData, {availableBooks:result});
        console.log(newData)
        //renders the page
        res.render("searchRes.ejs", newData)
        });
    })

    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered',[check('email').isEmail()], function (req,res) {
        //enter correct email or redirect back to register page
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register'); }
        else {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        
        const first = req.sanitize(req.body.first)//validates the first name
        const last = req.sanitize(req.body.last)//validates the last name
        const email = req.sanitize(req.body.email)//sanitises email
        const username = req.sanitize(req.body.username)//sanitises username

    bcrypt.hash(plainPassword, saltRounds).then(hashedPassword => {
        // Construct the SQL query after password hashing is complete
        let sqlquery = `INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;

        // Execute the query and handle the result
        db.query(sqlquery, [username, first, last, email, hashedPassword], (err, result) => {
            if (err) {
                res.redirect('./');
            } else {
            // Data inserted successfully:
            result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
            result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
            res.send(result);
            }
        });
        })
    }
    });

    //addbook write the name and price of the book
    app.get('/addbook', function(req,res){
        res.render('addbook.ejs', shopData)
    });

    //add bargain books page
    app.get('/bargainbooks', function (req,res) {
        let sqlquery = "SELECT * FROM books"; 
        db.query(sqlquery, (err, result) => {
        if (err) {res.redirect('./');}
        //merges shopdata with new Available books:result
        let newData = Object.assign({}, shopData, {availableBooks:result});
        //console.log(newData)
        res.render("bargainbooks.ejs", newData)   
        });                                                          
    });

    //bookadded add a new book
    app.post('/bookadded', function (req,res) {
    // saving data in database
        let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
        // execute sql query
        let newrecord = [req.body.name, req.body.price];
        db.query(sqlquery, newrecord, (err, result) => {
        if (err) {return console.error(err.message);}
        else
        res.send(' This book is added to database, name: '+ req.body.name
        + ' price '+ req.body.price);
        });
    });

    //adds a new route to display all books:
    app.get('/list',redirectLogin, function (req,res) {
        let sqlquery = "SELECT * FROM books"; 
        db.query(sqlquery, (err, result) => {
        if (err) {res.redirect('./');}
        //merges shopdata with new Available books:result
        let newData = Object.assign({}, shopData, {availableBooks:result});
        console.log(newData)
        res.render("list.ejs", newData)   
        });                                                          
    });

    //new route to display all the users
    app.get('/listusers',redirectLogin, function (req,res) {
        let sqlquery = "SELECT * FROM users"; 
        db.query(sqlquery, (err, result) => {
        if (err) {res.redirect('./');}
            //merges:
            let newData = Object.assign({}, shopData, {users:result});
            console.log(newData)
            res.render("listusers.ejs", newData)   
        });                                                          
    });

    //login page backend:
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);                                                                     
    }); 

    app.post('/loggedin', function (req,res) {
        //bcrypt stuff
        const bcrypt = require('bcrypt');

        const username = req.body.username;
        let hashedPassword;

        //sql query:
        let sqlquery = `SELECT hashedPassword FROM users WHERE username='${username}'`;
        
        //get the username for the database and compare the passwords:
        db.query(sqlquery, (err,response) =>{
            if(err){
                res.send('Username was not found!')
            }else{
                //username found successfully:
                hashedPassword = response[0].hashedPassword;

                console.log(hashedPassword)
                // Compare the password supplied with the password in the database
                 
                bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                    if (err) {
                        //error:
                        res.redirect('./');
                    }
                    else if (result == true) {  
                        // Save user session here, when login is successful
                        req.session.userId = req.body.username;

                        res.send(`Sucess! Your account has been found: ${username}`);
                    }
                    else {
                        res.send("Error, incorrect username or password")
                    }
                });
            }
        });
    });
    
}
