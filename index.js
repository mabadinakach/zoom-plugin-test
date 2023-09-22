require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Use the provided port or 3000 if not specified
const { authorize, redirect, meetings } = require("./zoomHelper");

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/zoomauth", async (req, res) => {
  console.log("redirecting to zoom");
  return res.redirect(encodeURI(authorize()));
});

app.get("/redirect", async (req, res) => {
  const { data } = await redirect(req.query.code);

  process.env.access_token = data.access_token;
  return res.json(data);
});

app.get("/meetings", async (req, res) => {
  let meetingList = await meetings();

  return res.json(meetingList);
});

app.post("/meetings", async (req, res) => {});
