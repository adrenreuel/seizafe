var windowURL = window.location.toString();
seizafe();

// listen for messages sent from background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "urlchanged") {
    windowURL = request.url;
    // alert("URL Changed " + windowURL);
    seizafe();
  }

  // if (request.message === "tabchanged") {
  //   alert("tabchanged");
  // }

  // if (request.message === "seizafeon") {
  //   seizafe();
  // } else if (request.message === "seizafeoff") {
  //   seizafe();
  // }
});

// function observeTitle() {
// var target = document.querySelector(".ytd-watch-metadata");
// // create an observer instance
// var observer = new MutationObserver(function (mutations) {
//   mutations.forEach(function (mutation) {
//     alert(mutation.type);
//   });
// });
// // configuration of the observer:
// var config = { attributes: true, childList: true, characterData: true };
// // pass in the target node, as well as the observer options
// observer.observe(target, config);
// }

function seizafe() {
  //YOUTUBE
  if (windowURL.includes("youtube.com/watch")) {
    // alert("Youtube: " + windowURL);
    var videoID = windowURL.split("v=")[1];
    var videoThumbnail = "https://img.youtube.com/vi/" + videoID + "/0.jpg";

    var videoTitle = document.querySelector("h1.ytd-watch-metadata");
    var channelName = document.querySelector("#channel-name");

    chrome.storage.local.set({ platformURL: "youtube.com" });
    chrome.storage.local.set({ videoURL: windowURL });
    chrome.storage.local.set({ thumbnail: videoThumbnail });

    if (videoTitle) {
      chrome.storage.local.set({ videoTitle: videoTitle.innerText });
    }
    if (channelName) {
      chrome.storage.local.set({ channelName: channelName.innerText });
    }

    var video = document.querySelector("video");
    var videoparent = video.parentNode;
    var videoparentparent = videoparent.parentNode;

    chrome.storage.sync.get(["seizafestate"], function (result) {
      if (result.seizafestate) {
        video.style.border = "5px solid #6600ff";
      } else {
        video.style.border = "none";
      }
    });

    // alert(videoparentparent.id);
    // Youtube previewvideo container
    var previewvideo = document.getElementById("inline-preview-player");
    // Youtube movie container
    var movievideo = document.getElementById("movie_player");
    // Youtube shorts container
    var shortsvideo = document.getElementById("shorts-player");
  }

  //YOUTUBE SHORTS
  else if (windowURL.includes("youtube.com/shorts")) {
    // var video = document.querySelector("video");
    // alert("Youtube Shorts: " + windowURL);

    var shortPlayingContainer = document.querySelector(
      "ytd-reel-video-renderer[is-active]"
    );
    var videoTitle = shortPlayingContainer.querySelector(
      "yt-formatted-string.ytd-reel-player-header-renderer"
    );
    var channelName = shortPlayingContainer.querySelector("#channel-name");

    chrome.storage.local.set({ platformURL: "youtube.com/shorts" });
    chrome.storage.local.set({ videoURL: windowURL });

    // document.title on change set videoTitle
    chrome.storage.local.set({ videoTitle: document.title });

    if (channelName) {
      chrome.storage.local.set({ channelName: channelName.innerText });
    }

    // alert(videoTitle[videoTitle.length - 1].innerText);
    // alert(shortPlayingContainer.length);
  } else {
    // alert("unsupported");
  }
}
