// changeColor.addEventListener("click", async () => {
//   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     func: setPageBackgroundColor,
//   });
// });

// // The body of this function will be executed as a content script inside the
// // current page
// function setPageBackgroundColor() {
//   chrome.storage.sync.get("color", ({ color }) => {
//     document.body.style.backgroundColor = color;
//   });
// }

// Variable declarations
let currentsensitivity = 0;
const stateindicator_container = document.getElementById(
  "stateindicator_container"
);
const stateCheckbox = document.getElementById("seizafe_state");
const stateIndicatoron = document.getElementById("seizafe_stateindicatoron");
const stateIndicatoroff = document.getElementById("seizafe_stateindicatoroff");
const seizafe_eye_closed = document.getElementById("seizafe_eye_closed");
const seizafe_eye_open = document.getElementById("seizafe_eye_open");
const animationcontainer = document.getElementById("animationcontainer");
const currentlyPlayingBanner = document.getElementById(
  "currentlyPlayingBanner"
);
const nothingPlayingBanner = document.getElementById("nothingPlayingBanner");
const metaBanner = document.getElementById("metaBanner");
const videoPlayingSite = document.getElementById("videoPlayingSite");
const videoPlayingChannel = document.getElementById("videoPlayingChannel");
const videoPlayingTitle = document.getElementById("videoPlayingTitle");
const videoPlayingThumbnail = document.getElementById("videoPlayingThumbnail");
const activeSitesList = document.getElementById("activeSitesList");

// Sensitivity & other settings
const customsensitivity = document.getElementById("customsensitivity");
const bestsensitivity = document.getElementById("bestsensitivity");
const highsensitivity = document.getElementById("highsensitivity");
const optionslink = document.getElementById("optionslink");
// const adscheckbox = document.getElementById("adscheckbox");

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "&hellip;" : str;
}

// Seizafe animated stars
var animation = bodymovin.loadAnimation({
  container: document.getElementById("animationcontainer"),
  path: "../assets/starsanimation.json",
  renderer: "svg",
  loop: true,
  autoplay: true,
  name: "Seizafe Animation",
});

// Listen for seizafe toggle switch state
stateCheckbox.addEventListener("change", (event) => {
  if (event.currentTarget.checked) {
    toggleSeizafe(true);
  } else {
    toggleSeizafe(false);
  }
});

// Listen for seizafe gradient header click
stateindicator_container.addEventListener("click", (event) => {
  if (!stateCheckbox.checked) {
    stateCheckbox.checked = true;
    toggleSeizafe(true);
  } else {
    stateCheckbox.checked = false;
    toggleSeizafe(false);
  }
});

// Toggle seizafe state
function toggleSeizafe(state) {
  chrome.storage.sync.set({ seizafestate: state }, function () {
    if (state) {
      // Seizafe on
      stateIndicatoron.style.opacity = 1;
      stateIndicatoroff.style.opacity = 0;
      seizafe_eye_open.style.display = "inline";
      seizafe_eye_closed.style.display = "none";
      animationcontainer.style.display = "block";
      metaBanner.style.display = "block";
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: "seizafeon" });
      });
    } else {
      // Seizafe off
      stateIndicatoron.style.opacity = 0;
      stateIndicatoroff.style.opacity = 1;
      seizafe_eye_open.style.display = "none";
      seizafe_eye_closed.style.display = "inline";
      animationcontainer.style.display = "none";
      metaBanner.style.display = "none";
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: "seizafeoff" });
      });
    }
  });
}

function toggleNowPlaying(
  state,
  currentactivesite,
  platformurl,
  url,
  title,
  channel,
  thumbnail
) {
  // chrome.storage.sync.set({ nowplaying: state }, function () {
  if (state) {
    currentlyPlayingBanner.style.display = "block";
    nothingPlayingBanner.style.display = "none";
    // videoPlayingSite.innerHTML = currentactivesite;
    videoPlayingSite.innerHTML = platformurl;
    if (channel) {
      videoPlayingChannel.innerHTML = truncate(channel, 35);
    } else {
      videoPlayingChannel.innerHTML += "";
    }
    videoPlayingTitle.innerHTML = truncate(title, 60);
    videoPlayingThumbnail.style.backgroundImage = "url(" + thumbnail + ")";
  } else {
    currentlyPlayingBanner.style.display = "none";
    nothingPlayingBanner.style.display = "block";
    videoPlayingTitle.innerHTML = "";
    videoPlayingSite.innerHTML = "";
    videoPlayingSite.href = "";
    videoPlayingThumbnail.style.backgroundImage = "";
  }
  // });
}

//Seizafe script
// function seizafeScript() {
//   alert("hi");
// }

// Listen for sensitivity setting changes
customsensitivity.addEventListener("click", (event) => {
  seizafe_eye_open.src = "../assets/seizafe_eye_low.png";
  chrome.storage.sync.set({ currentsensitivity: 1 }, function () {
    currentsensitivity = 1;
    animation.setSpeed(1);
  });
  updateOptionsLink(1);
});

bestsensitivity.addEventListener("click", (event) => {
  seizafe_eye_open.src = "../assets/seizafe_eye.png";
  chrome.storage.sync.set({ currentsensitivity: 2 }, function () {
    currentsensitivity = 2;
    animation.setSpeed(2.5);
  });
  updateOptionsLink(2);
});

highsensitivity.addEventListener("click", (event) => {
  seizafe_eye_open.src = "../assets/seizafe_eye_high.png";
  chrome.storage.sync.set({ currentsensitivity: 3 }, function () {
    currentsensitivity = 3;
    animation.setSpeed(0.5);
  });
  updateOptionsLink(5);
});

function updateOptionsLink(setting) {
  if (setting == 1) {
    optionslink.innerHTML =
      "<i class='fas fa-cog'></i> Customize Sensitivity HERE!";
  } else {
    optionslink.innerHTML = "<i class='fas fa-cog'></i> More Options";
  }
}

optionslink.addEventListener("click", (event) => {
  if (currentsensitivity == 1) {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("options/options.html#customsensitivity"),
    });
  } else {
    chrome.runtime.openOptionsPage();
  }
});

videoPlayingSite.addEventListener("click", (event) => {
  chrome.tabs.create({ active: true, url: videoPlayingSite.href });
});

// Get seizafe synced settings
chrome.storage.sync.get(["seizafestate"], function (result) {
  if (result.seizafestate) {
    stateCheckbox.checked = true;
    toggleSeizafe(true);
  } else {
    stateCheckbox.checked = false;
    toggleSeizafe(false);
  }
});

chrome.storage.sync.get(["currentsensitivity"], function (result) {
  if (result.currentsensitivity == 1) {
    customsensitivity.click();
  } else if (result.currentsensitivity == 2) {
    highsensitivity.click();
  } else {
    bestsensitivity.click();
  }
  currentsensitivity = result.currentsensitivity;
});

chrome.storage.sync.get(["activesites"], function (result) {
  if (result.activesites && result.activesites.length > 0) {
    activeSitesList.innerHTML = result.activesites.join(" | ");
  } else {
    activeSitesList.innerHTML =
      "<i class='fas fa-exclamation-circle'></i> No active sites";
  }
});

// Function to toggle the "Now Playing" display
function updateNowPlaying(data) {
  console.log(data);
  // if (data.videoURL == null || data.currentActiveSite == null) {
  if (data.videoURL == null) {
    toggleNowPlaying(false, null);
  } else {
    toggleNowPlaying(
      true,
      data.currentActiveSite,
      data.platformURL,
      data.videoURL,
      data.videoTitle,
      data.channelName,
      data.thumbnail
    );
  }
}

// Initial load when the popup is opened
chrome.storage.local.get(
  [
    "currentActiveSite",
    "platformURL",
    "videoURL",
    "videoTitle",
    "channelName",
    "thumbnail",
  ],
  function (data) {
    updateNowPlaying(data);
  }
);

// Listen for changes in chrome.storage.local
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === "local") {
    // First, get the current values from chrome.storage.local
    chrome.storage.local.get(
      [
        "currentActiveSite",
        "platformURL",
        "videoURL",
        "videoTitle",
        "channelName",
        "thumbnail",
      ],
      function (currentData) {
        // Merge the changes with the current values
        for (let key in changes) {
          currentData[key] = changes[key].newValue;
        }

        // Pass the updated data to updateNowPlaying
        updateNowPlaying(currentData);
      }
    );
  }
});
