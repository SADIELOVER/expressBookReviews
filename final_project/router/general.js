const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ✅ POST /register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully." });
});

public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  const booksByAuthor = [];

  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push({ isbn: isbn, ...books[isbn] });
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const matchingBooks = [];

  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks.push({ isbn: isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
