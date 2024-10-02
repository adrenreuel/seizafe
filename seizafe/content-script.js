var windowURL = window.location.toString();
var video = null;
seizafe();

// listen for messages sent from background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "urlchanged") {
    windowURL = request.url;
    seizafe();
  }

  if (request.message === "tabchanged") {
    seizafe();
  }

  if (request.message === "seizafeon") {
    // seizafe();
    // alert("seizafeon");
  } else if (request.message === "seizafeoff") {
    // seizafe();
    // alert("seizafeoff");
  }
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
    // Function to extract video details
    function extractVideoDetails() {
      var videoID = windowURL.split("v=")[1].split("&")[0];
      var videoThumbnail = "https://img.youtube.com/vi/" + videoID + "/0.jpg";

      var videoTitle = document.querySelector(
        "#above-the-fold h1.style-scope.ytd-watch-metadata"
      );
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
      // updateCanvas();
    }

    // Initial extraction
    extractVideoDetails();

    // Set up a MutationObserver to detect changes in video title or channel name
    var targetNode = document.querySelector("#above-the-fold");
    var config = { childList: true, subtree: true };

    var observer = new MutationObserver(function (mutationsList, observer) {
      for (var mutation of mutationsList) {
        if (mutation.type === "childList") {
          extractVideoDetails();
        }
      }
    });

    if (targetNode) {
      observer.observe(targetNode, config);
    }

    video = document.querySelector("video");

    chrome.storage.sync.get(["seizafestate"], function (result) {
      if (result.seizafestate) {
        video.style.border = "5px solid #6600ff";
      } else {
        video.style.border = "none";
      }
    });
  }

  //YOUTUBE SHORTS
  else if (windowURL.includes("youtube.com/shorts")) {
    // var video = document.querySelector("video");

    var shortPlayingContainer = document.querySelector(
      "ytd-reel-video-renderer[is-active]"
    );
    var videoTitle = shortPlayingContainer.querySelector(
      "yt-formatted-string.ytd-reel-player-header-renderer"
    );
    var channelName = shortPlayingContainer.querySelector("#channel-name");

    function extractVideoDetails() {
      // var videoID = windowURL.split("v=")[1].split("&")[0];
      var videoID = windowURL.split("shorts/")[1].split("&")[0];
      var videoThumbnail = "https://img.youtube.com/vi/" + videoID + "/0.jpg";

      var videoTitle = document.querySelector(
        "#above-the-fold h1.style-scope.ytd-watch-metadata"
      );
      var channelName = document.querySelector("#channel-name");

      chrome.storage.local.set({ platformURL: "youtube.com/shorts" });
      chrome.storage.local.set({ videoURL: windowURL });
      chrome.storage.local.set({ thumbnail: videoThumbnail });

      if (videoTitle) {
        chrome.storage.local.set({ videoTitle: videoTitle.innerText });
      }

      if (channelName) {
        chrome.storage.local.set({ channelName: channelName.innerText });
      }
      // updateCanvas();
    }

    // Initial extraction
    extractVideoDetails();

    // Set up a MutationObserver to detect changes in video title or channel name
    var targetNode = document.querySelector("#above-the-fold");
    var config = { childList: true, subtree: true };

    var observer = new MutationObserver(function (mutationsList, observer) {
      for (var mutation of mutationsList) {
        if (mutation.type === "childList") {
          extractVideoDetails();
        }
      }
    });

    if (targetNode) {
      observer.observe(targetNode, config);
    }

    chrome.storage.local.set({ platformURL: "youtube.com/shorts" });
    chrome.storage.local.set({ videoURL: windowURL });

    // document.title on change set videoTitle
    chrome.storage.local.set({ videoTitle: document.title });

    if (channelName) {
      chrome.storage.local.set({ channelName: channelName.innerText });
    }

    video = document.querySelector("video");

    chrome.storage.sync.get(["seizafestate"], function (result) {
      if (result.seizafestate) {
        video.style.border = "5px solid #6600ff";
      } else {
        video.style.border = "none";
      }
    });

    // alert(videoTitle[videoTitle.length - 1].innerText);
    // alert(shortPlayingContainer.length);
  } else {
    // alert("unsupported");
    // chrome.storage.local unset all
    chrome.storage.local.set({ platformURL: null });
    chrome.storage.local.set({ videoURL: null });
    chrome.storage.local.set({ videoTitle: null });
    chrome.storage.local.set({ channelName: null });
    chrome.storage.local.set({ thumbnail: null });
    video = null;
    // updateCanvas();
  }
  updateCanvas();
}

function updateCanvas() {
  // SEIZAFE DEBUG CANVAS
  let seizafeDiv = document.getElementById("seizafe-debug-container");

  if (!seizafeDiv) {
    // Create the div container if it doesn't exist
    seizafeDiv = document.createElement("div");
    seizafeDiv.id = "seizafe-debug-container"; // Assign an ID for future checks
    seizafeDiv.style.position = "fixed";
    seizafeDiv.style.top = "0";
    seizafeDiv.style.right = "0";
    seizafeDiv.style.zIndex = "9999";
    seizafeDiv.style.outline = "5px dotted #6600ff";
    seizafeDiv.style.cursor = "grab"; // Change cursor to indicate draggable
    seizafeDiv.style.backgroundColor = "#1d1d1db8";
    seizafeDiv.style.padding = "10px";
    seizafeDiv.style.borderRadius = "5px";
    document.body.appendChild(seizafeDiv);

    // Add the Seizafe debug text
    const debugText = document.createElement("p");
    debugText.innerText = "SEIZAFE - DEBUG MODE";
    debugText.style.color = "#ffffff";
    debugText.style.margin = "0";
    debugText.style.fontWeight = "bold";
    seizafeDiv.appendChild(debugText);

    // Create the canvas inside the div
    const canvas = document.createElement("canvas");
    canvas.id = "seizafe-frame-canvas"; // Assign an ID for future checks
    seizafeDiv.appendChild(canvas);

    // Get the video dimensions and calculate the aspect ratio
    var aspectRatio = video.videoWidth / video.videoHeight;

    // Set the minimum dimensions
    var minWidth = 200;
    var minHeight = 100;

    // Determine the new canvas size based on the aspect ratio
    if (aspectRatio > 1) {
      // Landscape video
      canvas.width = Math.max(video.videoWidth / 10, minWidth);
      canvas.height = canvas.width / aspectRatio; // Maintain aspect ratio
    } else {
      // Portrait or square video
      canvas.height = Math.max(video.videoHeight / 10, minHeight);
      canvas.width = canvas.height * aspectRatio; // Maintain aspect ratio
    }

    // Ensure minimum height is not less than 50px
    if (canvas.height < minHeight) {
      canvas.height = minHeight;
      canvas.width = minHeight * aspectRatio; // Adjust width to maintain aspect ratio
    }

    // Ensure minimum width is not less than 100px
    if (canvas.width < minWidth) {
      canvas.width = minWidth;
      canvas.height = minWidth / aspectRatio; // Adjust height to maintain aspect ratio
    }

    seizafeDiv.style.width = canvas.width + "px";
    var ctx = canvas.getContext("2d");

    // Draw video frame to canvas
    function drawFrame() {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // Make the entire div moveable
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    seizafeDiv.addEventListener("mousedown", function (e) {
      isDragging = true;
      offset.x = e.offsetX;
      offset.y = e.offsetY;
      seizafeDiv.style.cursor = "grabbing"; // Change cursor while dragging
      document.body.style.userSelect = "none"; // Prevent text selection
    });

    document.addEventListener("mouseup", function () {
      isDragging = false;
      seizafeDiv.style.cursor = "grab"; // Revert cursor when not dragging
      document.body.style.userSelect = ""; // Re-enable text selection
    });

    document.addEventListener("mousemove", function (e) {
      if (isDragging) {
        // Calculate new position and move the entire div
        seizafeDiv.style.top = e.clientY - offset.y + "px";
        seizafeDiv.style.left = e.clientX - offset.x + "px";
      }
    });

    // Draw frame every 100ms (Customizable)
    setInterval(drawFrame, 100);
  } else {
    // alert("canvas removed");
    // Remove canvas if it already exists
    // canvas.remove();
  }
}
