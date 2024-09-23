let seizafestate = true;
let seizafesensitivity = 2.5;
let seizafeads = false;
// let nowplaying = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ seizafestate });
  chrome.storage.sync.set({ seizafesensitivity });
  chrome.storage.sync.set({ seizafeads });
  // chrome.storage.sync.set({ nowplaying });
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
  // console.log(activeInfo.tabId);
  // console.log(activeInfo);
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      var tabId = tabs[0].id;
      var tabURL = tabs[0].url;
      console.log(tabURL);

      chrome.tabs.sendMessage(tabId, {
        message: "tabchanged",
        url: tabURL,
      });
    }
  );
});

document.getElementById("primaryColor").addEventListener("input", function () {
  alert(this.value);
});
