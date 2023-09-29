const qs = require("qs");
const axios = require("axios");

const authorize = async () => {
  return `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${process.env.ZOOM_OAUTH_REDIRECT_URI}`;
};

const redirect = async (code) => {
  var data = qs.stringify({
    code: code,
    grant_type: "authorization_code",
    redirect_uri: process.env.ZOOM_OAUTH_REDIRECT_URI,
  });

  var config = {
    method: "post",
    url: "https://zoom.us/oauth/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
        ).toString("base64"),
    },
    data: data,
  };

  // store access (1hr) and refresh token (15 yrs) in database
  var result = await axios(config)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.log(error);
    });

  console.log("RESULT IS: " + result);
  return result;
};

const meetings = async (filter) => {
  let meetingList = await axios({
    url: "https://api.zoom.us/v2/users/me/meetings",
    headers: {
      Authorization: "Bearer " + process.env.access_token,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });

  return meetingList.data;
};

const users = async (filter) => {
  let usersList = await axios({
    url: "https://api.zoom.us/v2/users",
    headers: {
      Authorization: "Bearer " + process.env.access_token,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(usersList.data);
  return usersList.data;
};

const updateUserSettings = async (userId, settings) => {
  let usersList = await axios({
    url: `https://api.zoom.us/v2/users/${userId}/settings`,
    headers: {
      Authorization: "Bearer " + process.env.access_token,
    },
    data: settings,
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(usersList.data);
  return usersList.data;
};

const getUserSettings = async (userId) => {
  let usersList = await axios({
    url: `https://api.zoom.us/v2/users/${userId}/settings`,
    headers: {
      Authorization: "Bearer " + process.env.access_token,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(usersList.data);
  return usersList.data;
};

const getVideoRecordings = async (meetingId) => {
  let videoRecordings = await axios({
    url: `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
    headers: {
      Authorization: "Bearer " + process.env.access_token,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  if (videoRecordings.data.participant_audio_files == undefined) {
    return [];
  }
  console.log(videoRecordings.data.participant_audio_files);
  return videoRecordings.data.participant_audio_files;
};

const getMeetingDetails = async (meetingId) => {
  let meetingDetails = await axios({
    url: `https://api.zoom.us/v2/meetings/${meetingId}`,
    headers: {
      Authorization: "Bearer " + process.env.access_token,
    },
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(meetingDetails.data);
  return meetingDetails.data;
};

const webhook = async (request, response) => {
  if (request.body.event === "endpoint.url_validation") {
    const hashForValidate = crypto
      .createHmac("sha256", "")
      .update(request.body.payload.plainToken)
      .digest("hex");

    response.status(200);
    return response.json({
      plainToken: request.body.payload.plainToken,
      encryptedToken: hashForValidate,
    });
  }
};

const inMeetingControls = async (meetingId) => {
  let meetingDetails = await axios
    .patch(
      `https://api.zoom.us/v2/live_meetings/${meetingId}/events`,
      {
        method: "recording.start",
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.access_token,
        },
      }
    )
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(meetingDetails);
  return meetingDetails;
};

module.exports = {
  authorize,
  redirect,
  meetings,
  updateUserSettings,
  users,
  getUserSettings,
  getVideoRecordings,
  getMeetingDetails,
  webhook,
  inMeetingControls,
};
