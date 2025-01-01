var windowURL = window.location.toString();
var video = null;
var seizafeIntervalId = null;
const settings = {
  redLevels: 10,
  greenLevels: 20,
  blueLevels: 30,
  whiteLevels: 40,
  blackLevels: 50,
  flashFrequency: 60,
  movingAverage: 5,
};

// execute seizafe
seizafeScript();
const seizafeInstance = new Seizafe(settings);

// listen for messages sent from background.js then call seizafe script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "urlchanged") {
    // windowURL = request.url;
    seizafeScript();
  }

  if (request.message === "tabchanged") {
    seizafeScript();
  }

  if (request.message === "seizafeon") {
    // seizafeScript();
    // alert("seizafeon");
  } else if (request.message === "seizafeoff") {
    // seizafeScript();
    // alert("seizafeoff");
  }
});

function seizafeScript() {
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
      // drawSeizafeCanvas();
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
      // drawSeizafeCanvas();
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
    drawSeizafeCanvas();
  }
  drawSeizafeCanvas();
}

function drawSeizafeCanvas() {
  let seizafeDiv = document.getElementById("seizafe-debug-container");

  if (seizafeDiv) {
    seizafeDiv.remove(); // Remove the entire debug div if it exists
  } else {
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

    // Create the canvas inside the div for the moving graph
    const canvas = document.createElement("canvas");
    canvas.id = "seizafe-frame-canvas"; // Assign an ID for future checks
    seizafeDiv.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let dataPoints = []; // Store the data points for the graph
    const maxPoints = 100; // Number of data points to display at once
    const graphHeight = 100; // Height of the graph area
    const graphWidth = 500; // Width of the graph area
    let graphOffsetX = 0; // To move the graph as time progresses

    // Set canvas size
    canvas.width = graphWidth;
    canvas.height = graphHeight;

    // Function to draw the graph
    function drawGraph() {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the grid and axes (optional)
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, graphHeight);
      ctx.lineTo(graphWidth, graphHeight); // X-axis
      ctx.moveTo(0, 0);
      ctx.lineTo(0, graphHeight); // Y-axis
      ctx.stroke();

      // Draw the data points as a line graph
      ctx.strokeStyle = "#ff6600"; // Graph line color
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Iterate over the dataPoints array and plot the points
      dataPoints.forEach((point, index) => {
        const x = (graphOffsetX + index) % graphWidth; // Scroll the graph horizontally
        const y = graphHeight - point.value; // Invert Y-axis to fit the canvas
        if (index === 0) {
          ctx.moveTo(x, y); // Start the line at the first point
        } else {
          ctx.lineTo(x, y); // Draw lines between points
        }
      });
      ctx.stroke();
    }

    // Function to add new data point (you can change this based on the data you are processing)
    function updateGraph(seizafeAnalysis) {
      // Push the new data (e.g., avgRed, avgGreen, avgBlue)
      const seizureData = seizafeAnalysis; // Can be any numeric value like seizure risk level
      dataPoints.push({ value: seizureData });

      // Limit the number of data points to maxPoints
      if (dataPoints.length > maxPoints) {
        dataPoints.shift(); // Remove the oldest point
      }

      graphOffsetX += 5; // Move the graph to the right as time progresses

      // Draw the graph with updated data
      drawGraph();
    }

    // Simulate receiving new data from seizafeAnalysis (replace with your actual analysis data)
    setInterval(() => {
      // Assuming seizafeAnalysis returns a numeric value for seizure risk level
      const seizafeAnalysis = Math.random() * graphHeight; // Random value for demonstration
      updateGraph(seizafeAnalysis); // Update the graph with new data
    }, 100); // Update every 100ms (adjust as needed)
  }
}

// Unmount function to remove the canvas and stop the interval
function unmountSeizafeCanvas() {
  // alert("unmounting");
  const seizafeDiv = document.getElementById("seizafe-debug-container");
  if (seizafeDiv) {
    seizafeDiv.remove(); // Remove the entire debug div
  }

  if (seizafeIntervalId) {
    clearInterval(seizafeIntervalId); // Clear the interval to stop drawing frames
    seizafeIntervalId = null; // Reset the interval ID
  }
}
