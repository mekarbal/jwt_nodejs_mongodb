require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Book = require("./models/books");
const User = require("./models/users");
const jwt = require("jsonwebtoken");

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Bonjour Je suis You codeur",
  });
});

//login one
app.post("/login", async (req, res) => {
  var phone = req.body.phone;
  var password = req.body.password;

  await User.findOne({ phone: phone }).then((user) => {
    if (user.password == password) {
      jwt.sign({ user: user }, "secretkey", (err, token) => {
        res.json({
          token: token,
        });
      });
    }
  });
});

function verifyToken(req, res, next) {
  //Get auth header value

  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    req.token = bearerHeader;

    next();
  } else {
    console.log(res);
    res.sendStatus(403);
  }
}

//books
//Getting all
app.get("/getBooks", verifyToken, async (req, res) => {
  console.log(req.token);
  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const books = await Book.find();
        res.json(books);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  });
});
//Getting one
app.get("/getBookById/:id", getBook, (req, res) => {
  res.send(res.book);
});
//Creating one
app.post("/postBook", verifyToken, async (req, res) => {
  const book = new Book({
    name: req.body.name,
    author: req.body.author,
    price: req.body.price,
  });

  jwt.verify(req.token, "secretkey", async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      try {
        const newBook = await book.save();
        res.status(201).json(newBook);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  });

  //
});
//Updating one
app.patch("/updateBook/:id", getBook, async (req, res) => {
  if (req.body.name != null) {
    res.book.name = req.body.name;
  }
  if (req.body.author != null) {
    res.book.author = req.body.author;
  }
  if (req.body.price != null) {
    res.book.price = req.body.price;
  }

  try {
    const updatedBook = await res.book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//Deleting one
app.delete("/deleteBook/:id", getBook, async (req, res) => {
  try {
    await res.book.remove();
    res.json({ message: "Deleted Book" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getBook(req, res, next) {
  try {
    book = await Book.findById(req.params.id);
    if (book == null) {
      return res.status(404).json({ message: "Cannot find book" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.book = book;
  next();
}

//Users
//Getting all
app.get("/getUsers", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//Getting one
app.get("/getUserById/:id", getUser, (req, res) => {
  res.send(res.user);
});
//Creating one
app.post("/", async (req, res) => {
  const user = new User({
    name: req.body.name,
    phone: req.body.phone,
    password: req.body.password,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//Updating one
app.patch("/updateUser/:id", getUser, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.phone != null) {
    res.user.phone = req.body.phone;
  }
  if (req.body.password != null) {
    res.user.password = req.body.password;
  }

  try {
    const updaterUser = await res.user.save();
    res.json(updaterUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//Deleting one
app.delete("/deleteUser/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: "Deleted User" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function getUser(req, res, next) {
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "Cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.user = user;
  next();
}

app.listen(3000, () => console.log("Server Started on port 3000"));

module.exports = app;
