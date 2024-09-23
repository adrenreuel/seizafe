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
const videoPlayingURL = document.getElementById("videoPlayingURL");
const videoPlayingTitle = document.getElementById("videoPlayingTitle");

// Sensitivity & other settings
const lowsensitivity = document.getElementById("lowsensitivity");
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
  path: "assets/starsanimation.json",
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

function toggleNowPlaying(state, platformurl, url, title, channel) {
  // chrome.storage.sync.set({ nowplaying: state }, function () {
  if (state) {
    currentlyPlayingBanner.style.display = "block";
    nothingPlayingBanner.style.display = "none";
    videoPlayingURL.innerHTML = platformurl;
    videoPlayingURL.href = url;
    if (channel) {
      videoPlayingURL.innerHTML += " | " + truncate(channel, 35);
    } else {
      videoPlayingURL.innerHTML += "";
    }
    videoPlayingTitle.innerHTML = truncate(title, 60);
  } else {
    currentlyPlayingBanner.style.display = "none";
    nothingPlayingBanner.style.display = "block";
    videoPlayingTitle.innerHTML = "";
    videoPlayingURL.innerHTML = "";
    videoPlayingURL.href = "";
  }
  // });
}

//Seizafe script
// function seizafeScript() {
//   alert("hi");
// }

// Listen for sensitivity setting changes
lowsensitivity.addEventListener("click", (event) => {
  seizafe_eye_open.src = "assets/seizafe_eye_low.png";
  chrome.storage.sync.set({ seizafesensitivity: 1 }, function () {
    animation.setSpeed(1);
  });
});

bestsensitivity.addEventListener("click", (event) => {
  seizafe_eye_open.src = "assets/seizafe_eye.png";
  chrome.storage.sync.set({ seizafesensitivity: 2.5 }, function () {
    animation.setSpeed(2.5);
  });
});

highsensitivity.addEventListener("click", (event) => {
  seizafe_eye_open.src = "assets/seizafe_eye_high.png";
  chrome.storage.sync.set({ seizafesensitivity: 5 }, function () {
    animation.setSpeed(5);
  });
});

optionslink.addEventListener("click", (event) => {
  chrome.runtime.openOptionsPage();
});

videoPlayingURL.addEventListener("click", (event) => {
  chrome.tabs.create({ active: true, url: videoPlayingURL.href });
});

// Listen for advertisement checkbox state
// adscheckbox.addEventListener("click", (event) => {
//   chrome.storage.sync.set({ seizafeads: adscheckbox.checked }, function () {});
// });

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

chrome.storage.sync.get(["seizafesensitivity"], function (result) {
  if (result.seizafesensitivity == 1) {
    lowsensitivity.click();
  } else if (result.seizafesensitivity == 5) {
    highsensitivity.click();
  } else {
    bestsensitivity.click();
  }
});

// chrome.storage.sync.get(["seizafeads"], function (result) {
//   adscheckbox.checked = result.seizafeads;
// });

chrome.storage.local.get(
  ["platformURL", "videoURL", "videoTitle", "channelName"],
  function (data) {
    if (typeof data.videoTitle == "undefined") {
      toggleNowPlaying(false, null);
    } else {
      toggleNowPlaying(
        true,
        data.platformURL,
        data.videoURL,
        data.videoTitle,
        data.channelName
      );
    }
  }
);
