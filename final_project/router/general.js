const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    return res.status(200).json(books);
});

// Fetch books using axios only when requested
public_users.get("/fetch", async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    if (book) {
        return res.status(200).json(book);
    }
    return res.status(404).json({ message: "Book not found" });
});

// Fetch book details based on ISBN using axios only when requested
public_users.get('/fetch/isbn/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
    }
});


// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const authorBooks = Object.values(books).filter(book => book.author === req.params.author);
    if (authorBooks.length > 0) {
        return res.status(200).json(authorBooks);
    }
    return res.status(404).json({ message: "No books found by this author" });
});

// Fetch books by author using axios when requested
public_users.get('/fetch/author/:author', async (req, res) => {
    try {
        const response = await axios.get(`https://adnanqasmi26-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${req.params.author}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Get book details based on title
public_users.get('/title/:title', (req, res) => {
    const book = Object.values(books).find(book => book.title === req.params.title);
    if (book) {
        return res.status(200).json(book);
    }
    return res.status(404).json({ message: "Book not found" });
});

// Fetch book details by title using axios when requested
public_users.get('/fetch/title/:title', async (req, res) => {
    try {
        const response = await axios.get(`https://adnanqasmi26-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/${req.params.title}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book by title", error: error.message });
    }
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    console.log("Fetching reviews for book:", req.params.isbn);
    console.log("Current book data:", books[req.params.isbn]); // Debug log

    const book = books[req.params.isbn];
    if (book && book.reviews) {
        return res.status(200).json(book.reviews);
    }
    return res.status(404).json({ message: "No reviews found for this book" });
});


module.exports.general = public_users;
