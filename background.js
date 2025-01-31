let seizafestate = true;
let currentsensitivity = 2;
let activesites = ["YouTube", "YouTube Shorts"];
let customSensitivity = {
  redLevels: 0,
  greenLevels: 0,
  blueLevels: 0,
  whiteLevels: 0,
  blackLevels: 0,
  flashFrequency: 0,
  movingAverage: 0,
};
let miscSettings = [];
let customWarning = {
  primaryColor: "#6600ff",
  secondaryColor: "#bb00ff",
};
let currentActiveTabURL = null;
let currentActiveSite = null;

chrome.runtime.onStartup.addListener(() => {
  console.log("Service worker started");
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ seizafestate });
  chrome.storage.sync.set({ currentsensitivity });
  chrome.storage.sync.set({ nowplaying });
  chrome.storage.sync.set({ activesites });
  chrome.storage.sync.set({ customSensitivity });
  chrome.storage.sync.set({ customWarning });
  chrome.storage.sync.set({ miscSettings });
});

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (info.url) {
    chrome.tabs.sendMessage(tabId, {
      message: "urlchanged",
      url: info.url,
    });
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      var tabId = tabs[0].id;
      var tabURL = tabs[0].url;

      if (tabURL.includes("youtube.com/watch")) {
        currentActiveSite = "YouTube";
        currentActiveTabURL = tabURL;
      } else if (tabURL.includes("youtube.com/shorts")) {
        currentActiveSite = "YouTube Shorts";
        currentActiveTabURL = tabURL;
      } else {
        currentActiveSite = null;
        currentActiveTabURL = null;
      }

      console.log(currentActiveSite);

      chrome.storage.local.set({ currentActiveSite });
      chrome.storage.local.set({ currentActiveTabURL });

      chrome.tabs.sendMessage(tabId, {
        message: "tabchanged",
        url: tabURL,
      });
    }
  );
});
