require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Use the provided port or 3000 if not specified
const {
  authorize,
  redirect,
  meetings,
  users,
  updateUserSettings,
  getUserSettings,
  getVideoRecordings,
  getMeetingDetails,
} = require("./zoomHelper");

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

  // console.log("Get User Settings: \n\n\n\n");
  // getUserSettings("me");

  // // console.log("Update User Settings: \n\n\n\n");
  // // updateUserSettings("me", {
  // //   record_files_separately: {
  // //     active_speaker: true,
  // //     gallery_view: true,
  // //     shared_screen: true,
  // //   },
  // // });

  // console.log("Get Meeting Details: \n\n\n\n");
  // getMeetingDetails("9813659918");

  console.log("Get Video Recordings: \n\n\n\n");
  getVideoRecordings("9813659918");

  return res.json(data);
});

app.get("/meetings", async (req, res) => {
  let meetingList = await meetings();

  return res.json(meetingList);
});

app.get("/users", async (req, res) => {
  let usersList = await users();

  return res.json(usersList);
});

app.post("/users/:userId/settings", async (req, res) => {
  let settings = req.body;
  let userId = req.params.userId;
  let usersList = await updateUserSettings(userId, settings);

  return res.json(usersList);
});

app.get("/users/:userId/settings", async (req, res) => {
  let userId = req.params.userId;
  let usersList = await getUserSettings(userId);

  return res.json(usersList);
});

app.get("/meetings/:meetingId/recordings", async (req, res) => {
  let meetingId = req.params.meetingId;
  let recordings = await getVideoRecordings(meetingId);

  return res.json(recordings);
});

app.post("/users", async (req, res) => {});
