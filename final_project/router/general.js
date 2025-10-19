const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const findByTitle = (books, title) =>
    Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());

const findByAuthors = (books, author) =>
    Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "Username already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Username & Password are not provided." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = Number(req.params.isbn);

    if (!isbn)
        return res.status(400).json({ message: "No ISBN number!" });

    const book = books[isbn];

    if (!book)
        return res.status(404).json({ message: "Book is not found!" });

    return res.json(book);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    if (!author)
        return res.status(400).json({ message: "No Author!" });

    const book = findByAuthors(books, author);

    if (!book)
        return res.status(200).json({ message: "Book has not been found by the author name!" })

    return res.json(book);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    if (!title)
        return res.status(400).json({ message: "No Title!" });

    const book = findByTitle(books, title);

    if (!book)
        return res.status(200).json({ message: "Book has not been found by the title!" })

    return res.json(book);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = Number(req.params.isbn);

    if (!isbn)
        return res.status(400).json({ message: "No ISBN number!" });

    const book = books[isbn];

    if (!book)
        return res.status(404).json({ message: "Book is not found!" });

    return res.json(book.reviews);
});

public_users.get('/books', function (req, res) {
    return new Promise((resolve, reject) => {
        resolve(books);
    }).then(books => res.json(books))
        .catch(error => res.status(500).json({ error: error.message }));
});

// Get book details based on ISBN with promises
public_users.get('/books/isbn/:isbn', function (req, res) {
    return new Promise((resolve, reject) => {
        const isbn = Number(req.params.isbn);
        if (!isbn) return reject(new Error("No ISBN number!"));

        const book = books[isbn];
        if (!book) return reject(new Error("Book not found!"));

        resolve(book);
    }).then(book => res.json(book))
        .catch(error => res.status(500).json({ error: error.message }));
});

// Get book details based on author with promises
public_users.get('/books/author/:author', function (req, res) {
    return new Promise((resolve, reject) => {
        const author = req.params.author;
        if (!author) return reject(new Error("No Author!"));

        const book = findByAuthors(books, author);
        if (!book) return reject(new Error("Book has not been found by the author name!"));

        resolve(book);
    }).then(book => res.json(book))
        .catch(error => res.status(500).json({ error: error.message }));
});

// Get all books based on title with promises
public_users.get('/books/title/:title', function (req, res) {
    return new Promise((resolve, reject) => {
        const title = req.params.title;
        if (!title) return reject(new Error("No Title!"));

        const book = findByTitle(books, title);
        if (!book) return reject(new Error("Book has not been found by the title!"));

        resolve(book);
    }).then(book => res.json(book))
        .catch(error => res.status(500).json({ error: error.message }));
});

module.exports.general = public_users;
