const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });

    return !!userswithsamename.length;
}


/** 
 * Check if the user with the given username and password exists
 */
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });

    return !!validusers.length;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
   const username = req.body.username;
   const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {

        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = { accessToken, username };

        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = Number(req.params.isbn);
    const stars = Number(req.body.stars);
    const message = req.body.message;

    if (!isbn)
      return res.status(400).json({message: "No ISBN number!"});
  
    const book = books[isbn];

     if (!book)
      return res.status(404).json({message: "Book is not found!"});

    const username = req.session.authorization.username;

     if (!username)
      return res.status(404).json({message: "Username is not found in the session!"});

    book.reviews[username] = { stars, message};

    return res.json({ message: "Review has been added.", review: books[isbn].reviews[username] });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = Number(req.params.isbn);
   
    if (!isbn)
      return res.status(400).json({message: "No ISBN number!"});
  
    const book = books[isbn];

     if (!book)
      return res.status(404).json({message: "Book is not found!"});

    const username = req.session.authorization.username;

     if (!username)
      return res.status(404).json({message: "Username is not found in the session!"});

    delete book.reviews[username];

    return res.json({ message: "Review has been deleted." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
