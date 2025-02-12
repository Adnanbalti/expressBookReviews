const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// User login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ username }, "secretkey", { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", token });
});

// Add or update book review
regd_users.post("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    let token = req.headers.authorization?.split(" ")[1]; // Extract token

    if (!token) {
        return res.status(403).json({ message: "Unauthorized: No token provided" });
    }

    if (!review || typeof review !== "string") {
        return res.status(400).json({ message: "Invalid or missing review" });
    }

    try {
        const decoded = jwt.verify(token, "secretkey"); // Verify token
        const username = decoded.username;

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!books[isbn].reviews) {
            books[isbn].reviews = {}; // Ensure reviews exist
        }

        books[isbn].reviews[username] = review.trim(); // Ensure review is stored properly

        // Log updated book data
        console.log(`Review added by ${username}:`, review);
        console.log("Updated Book Reviews:", books[isbn].reviews);

        return res.status(200).json({ message: "Review added/updated successfully" });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});


// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Unauthorized access" });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    try {
        const decoded = jwt.verify(token, "secretkey");
        const username = decoded.username;

        console.log("Decoded Token:", decoded);
        
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
            return res.status(404).json({ message: "No reviews found for this book" });
        }

        console.log("Book Reviews:", books[isbn].reviews);
        console.log("Username from token:", username);

        if (!books[isbn].reviews[username]) {
            return res.status(404).json({ message: "Review not found for this user" });
        }

        // Delete the review
        delete books[isbn].reviews[username];

        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;