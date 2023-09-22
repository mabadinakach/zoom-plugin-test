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

  console.log(meetingList.data);
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
}

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
}

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
}

const getVideoRecordings = async () => {
  let videoRecordings = await axios({
    url: `https://api.zoom.us/v2/videosdk/recordings`,
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
  console.log(videoRecordings.data);
  return videoRecordings.data;
}


module.exports = {
  authorize,
  redirect,
  meetings,
  updateUserSettings,
  users,
  getUserSettings,
  getVideoRecordings,
};
