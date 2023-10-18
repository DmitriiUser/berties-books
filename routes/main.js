module.exports = function(app, shopData) {

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
    app.post('/registered', function (req,res) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        
        const first = req.body.first;
        const last = req.body.last;
        const email = req.body.email;
        const username = req.body.username;

    bcrypt.hash(plainPassword, saltRounds).then(hashedPassword => {
        // Construct the SQL query after password hashing is complete
        let sqlquery = `INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)`;

        // Execute the query and handle the result
        db.query(sqlquery, [username, first, last, email, hashedPassword], (err, result) => {
            if (err) {
            res.redirect('./');
            } else {
            // Data inserted successfully
            result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
            result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
            res.send(result);
            }
        });
        })
        .catch(error => {
        // Handle password hashing errors
        // For example, you can redirect the user to an error page or provide an error message.
        res.redirect('./error');
        });
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
    app.get('/list', function (req,res) {
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
    app.get('/listusers', function (req,res) {
        let sqlquery = "SELECT * FROM users"; 
        db.query(sqlquery, (err, result) => {
        if (err) {res.redirect('./');}
            //merges:
            let newData = Object.assign({}, shopData, {users:result});
            console.log(newData)
            res.render("listusers.ejs", newData)   
        });                                                          
    });


    
}
