const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");
require("dotenv").config();

// Upload Image
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors({ origin: "https://test-fullstack-frontend-two.vercel.app" }));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/dist')));

// Catch-all handler to serve index.html for React routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


// List
app.get("/", (req, res) => {
  UserModel.find({})
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

// Find
app.get("/getUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findById({ _id: id })
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

// Create
app.post("/createUser", async (req, res) => {
  try {
    const user = await UserModel.create(req.body);
    console.log("User Created:", user);
    res.json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update
app.put("/updateUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findByIdAndUpdate(
    { _id: id },
    { name: req.body.name, email: req.body.email }
  )
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

// Delete
app.delete("/deleteUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findByIdAndDelete({ _id: id })
    .then((res) => res.json(res))
    .catch((err) => res.json(err));
});

//! Upload Image
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

//! New Upload Image Route
app.post(
  "/updateUserWithImage/:id",
  upload.single("file"),
  async (req, res) => {
    const { name, email } = req.body;
    const { id } = req.params;

    const updateFields = { name, email };
    if (req.file) {
      updateFields.image = req.file.filename;
    }

    try {
      const updatedUser = await UserModel.findByIdAndUpdate(id, updateFields, {
        new: true,
      });
      res.json(updatedUser);
    } catch (err) {
      console.error("Error updating user with image:", err);
      res.status(500).json({ error: "Failed to update user with image" });
    }
  }
);
//! Upload Image

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to mongoDB successfully!");
    app.listen(process.env.PORT, () => {
      console.log(`Node API app is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
