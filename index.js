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
  res.send(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>URL Shrinker</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-4 text-gray-800">URL Shrinker</h1>
            
            <div class="flex flex-col gap-4">
                <input type="url" id="longUrl" placeholder="Paste your long link here..." 
                    class="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button onclick="shortenUrl()" 
                    class="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                    Shorten
                </button>
            </div>

            <div id="result" class="mt-6 hidden">
                <p class="text-sm text-gray-600">Your shortened link:</p>
                <div class="flex items-center gap-2 mt-2">
                    <input type="text" id="shortenedCode" readonly 
                        class="bg-gray-50 border p-2 rounded w-full text-blue-600 font-mono">
                    <button onclick="copyToClipboard()" class="text-xs bg-gray-200 px-2 py-1 rounded">Copy</button>
                </div>
            </div>
        </div>

        <script>
            async function shortenUrl() {
                const longUrl = document.getElementById('longUrl').value;
                const resultDiv = document.getElementById('result');
                const shortInput = document.getElementById('shortenedCode');

                if (!longUrl) return alert("Please enter a URL");

                try {
                    const response = await fetch('/shorten', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ longUrl })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        resultDiv.classList.remove('hidden');
                        // Constructs the full URL using the current browser location
                        shortInput.value = window.location.origin + '/' + data.urlCode;
                    } else {
                        alert("Error: " + data);
                    }
                } catch (err) {
                    console.error(err);
                    alert("Something went wrong");
                }
            }

            function copyToClipboard() {
                const copyText = document.getElementById("shortenedCode");
                copyText.select();
                document.execCommand("copy");
                alert("Copied to clipboard!");
            }
        </script>
    </body>
    </html>
  `,
  );
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
