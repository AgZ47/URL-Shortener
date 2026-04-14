const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const Url = require("./Models/Url");

let nanoid;
import("nanoid").then((module) => {
  nanoid = module.nanoid;
});

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

mongoose
  .connect(process.env.MONGODB)
  .then(() => console.log("MongoDB: Connected!"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) return res.status(400).json("Invalid URL");

  try {
    let url = await Url.findOne({ longUrl });

    if (url) {
      return res.json(url);
    } else {
      const urlCode = nanoid(8);
      url = new Url({ longUrl, urlCode });
      await url.save();
      return res.json(url);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });
    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json("No URL found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port: ${process.env.PORT}`);
});
