const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// ✅ Task 6: Register new user
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

// ✅ Task 1: Get all books (sync)
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// ✅ Task 2: Get book by ISBN (sync)
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// ✅ Task 3: Get books by author (sync)
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = [];

  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author) {
      booksByAuthor.push({ isbn: isbn, ...books[isbn] });
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// ✅ Task 4: Get books by title (sync)
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const matchingBooks = [];

  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title) {
      matchingBooks.push({ isbn: isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// ✅ Task 5: Get book reviews
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


// ------------------
// ✅ TASK 10-13: Async/Await Routes
// ------------------

// ✅ Task 10: Get all books (async/await)
public_users.get('/async/books', async (req, res) => {
  try {
    const booksPromise = new Promise((resolve, reject) => {
      resolve(books);
    });
    const bookList = await booksPromise;
    res.status(200).json(bookList);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// ✅ Task 11: Get book by ISBN (async/await)
public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const bookPromise = new Promise((resolve, reject) => {
      books[isbn] ? resolve(books[isbn]) : reject("Book not found");
    });
    const book = await bookPromise;
    res.status(200).json(book);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// ✅ Task 12: Get books by author (async/await)
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();
  try {
    const authorPromise = new Promise((resolve, reject) => {
      const result = [];
      for (let isbn in books) {
        if (books[isbn].author.toLowerCase() === author) {
          result.push({ isbn, ...books[isbn] });
        }
      }
      result.length ? resolve(result) : reject("No books found for this author");
    });
    const bookList = await authorPromise;
    res.status(200).json(bookList);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

// ✅ Task 13: Get books by title (async/await)
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title.toLowerCase();
  try {
    const titlePromise = new Promise((resolve, reject) => {
      const result = [];
      for (let isbn in books) {
        if (books[isbn].title.toLowerCase() === title) {
          result.push({ isbn, ...books[isbn] });
        }
      }
      result.length ? resolve(result) : reject("No books found with this title");
    });
    const bookList = await titlePromise;
    res.status(200).json(bookList);
  } catch (err) {
    res.status(404).json({ message: err });
  }
});

module.exports.general = public_users;
