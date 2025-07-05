const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Utility to check if a username already exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Utility to check if credentials match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// ✅ Task 7: Login registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ username }, 'your_jwt_secret_key_here', { expiresIn: '1h' });

  // Store JWT and username in session
  req.session.accessToken = token;
  req.session.username = username;

  return res.status(200).json({ message: "Login successful", token });
});

// ✅ Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required." });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully." });
});

// ✅ Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  const reviews = books[isbn].reviews;

  if (!reviews[username]) {
    return res.status(404).json({ message: "No review found from this user." });
  }

  delete reviews[username];

  return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
