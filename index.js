require("dotenv").config();
const crypto = require('crypto')

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
  webhook
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

  const meetingsList = await meetings()
  console.log(meetingsList)

  // console.log("Get Video Recordings: \n\n\n\n");
  // getVideoRecordings("9813659918");

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

app.post("/webhooks", async (req, res) => {
  var response

  console.log(req.headers)
  console.log(req.body)

  // construct the message string
  const message = `v0:${req.headers['x-zm-request-timestamp']}:${JSON.stringify(req.body)}`

  const hashForVerify = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest('hex')

  // hash the message string with your Webhook Secret Token and prepend the version semantic
  const signature = `v0=${hashForVerify}`
  console.log(signature)

  // you validating the request came from Zoom https://marketplace.zoom.us/docs/api-reference/webhook-reference#notification-structure
  if (req.headers['x-zm-signature'] === signature) {

    // Zoom validating you control the webhook endpoint https://marketplace.zoom.us/docs/api-reference/webhook-reference#validate-webhook-endpoint
    if(req.body.event === 'endpoint.url_validation') {
      const hashForValidate = crypto.createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(req.body.payload.plainToken).digest('hex')

      response = {
        message: {
          plainToken: req.body.payload.plainToken,
          encryptedToken: hashForValidate
        },
        status: 200
      }

      console.log(response.message)

      res.status(response.status)
      res.json(response.message)
    } else {
      response = { message: 'Authorized request to Zoom Webhook sample.', status: 200 }

      console.log(response.message)

      res.status(response.status)
      res.json(response)

      // business logic here, example make API request to Zoom or 3rd party

    }
  } else {

    response = { message: 'Unauthorized request to Zoom Webhook sample.', status: 401 }

    console.log(response.message)

    res.status(response.status)
    res.json(response)
  }
});