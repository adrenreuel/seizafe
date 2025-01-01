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
// Initialize variables
// Initialize data storage
const dataPoints = {
  r: [],
  g: [],
  b: [],
  luminosity: [],
};
const maxValue = {
  r: 1,
  g: 1,
  b: 1,
  luminosity: 1,
};
let graphOffsetX = 0; // Offset for scrolling effect
const maxPoints = 50; // Maximum number of data points displayed

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
  // SEIZAFE DEBUG CANVAS
  let seizafeDiv = document.getElementById("seizafe-debug-container");

  if (seizafeDiv) {
    seizafeDiv.remove(); // Remove the entire debug div
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

    // Create the canvas inside the div
    const canvas = document.createElement("canvas");
    canvas.id = "seizafe-frame-canvas"; // Assign an ID for future checks
    seizafeDiv.appendChild(canvas);

    // Create graph canvas inside the div
    const graphCanvas = document.createElement("canvas");
    graphCanvas.id = "seizafe-graph-canvas"; // Assign an ID for future checks
    seizafeDiv.appendChild(graphCanvas);
    graphCanvas.width = 200;
    graphCanvas.height = 100;
    graphCanvas.style.backgroundColor = "#1d1d1db8";
    graphCanvas.style.borderRadius = "5px";

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

      // Get the image data from the canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data; // This is a flat array of all pixel data [r, g, b, a, r, g, b, a, ...]

      let totalRed = 0;
      let totalGreen = 0;
      let totalBlue = 0;
      let totalPixels = 0;

      // Loop through every pixel (r, g, b, a) in the data array
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]; // Red value
        const g = data[i + 1]; // Green value
        const b = data[i + 2]; // Blue value

        // Sum up the red, green, and blue values
        totalRed += r;
        totalGreen += g;
        totalBlue += b;

        totalPixels++; // Count the number of pixels
      }

      // Calculate the average values for red, green, and blue
      const avgRed = parseFloat((totalRed / totalPixels).toFixed(2));
      const avgGreen = parseFloat((totalGreen / totalPixels).toFixed(2));
      const avgBlue = parseFloat((totalBlue / totalPixels).toFixed(2));

      // Pass the average RGB values to the Seizafe class's processFrame method
      const seizafeAnalysis = seizafeInstance.processFrame(
        avgRed,
        avgGreen,
        avgBlue
      );

      updateGraph(graphCanvas, seizafeAnalysis); // Update the graph with the new data point
      console.log(seizafeAnalysis);
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

    // Draw frame every 50ms (Customizable)
    seizafeIntervalId = setInterval(drawFrame, 50);
  }
}

// Function to draw the graph
function drawGraph(graphCanvas) {
  const ctx = graphCanvas.getContext("2d");

  // Clear the canvas
  ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

  // Draw the grid and axes
  ctx.strokeStyle = "#313131"; // Light gray for grid lines
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let i = 0; i <= graphCanvas.height; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(graphCanvas.width, i);
    ctx.stroke();
  }

  // Vertical grid lines
  for (let i = 0; i <= graphCanvas.width; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, graphCanvas.height);
    ctx.stroke();
  }

  // Define colors for each data line
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffffff"]; // Red, Green, Blue, Orange

  // Draw each data set
  ["r", "g", "b", "luminosity"].forEach((key, dataIndex) => {
    ctx.strokeStyle = colors[dataIndex];
    ctx.lineWidth = 2;
    ctx.beginPath();

    dataPoints[key].forEach((point, index) => {
      // Calculate X position with scrolling effect
      const x =
        (graphOffsetX + index * (graphCanvas.width / maxPoints)) %
        graphCanvas.width;

      // Normalize Y position based on max value
      const y =
        graphCanvas.height - (point / maxValue[key]) * graphCanvas.height;

      if (index === 0) {
        ctx.moveTo(x, y); // Start the line at the first point
      } else {
        ctx.lineTo(x, y); // Draw lines between points
      }
    });
    ctx.stroke(); // Render the graph line
  });
}

// Function to add new data point and redraw the graph
function updateGraph(graphCanvas, seizafeAnalysis) {
  // Extract data point values
  const values = {
    r: seizafeAnalysis.r || 0,
    g: seizafeAnalysis.g || 0,
    b: seizafeAnalysis.b || 0,
    luminosity: seizafeAnalysis.luminosity || 0,
  };

  // Update maxValue dynamically for scaling
  Object.keys(values).forEach((key) => {
    if (values[key] > maxValue[key]) {
      maxValue[key] = values[key];
    }

    // Add new data point
    dataPoints[key].push(values[key]);

    // Limit the number of data points to maxPoints
    if (dataPoints[key].length > maxPoints) {
      dataPoints[key].shift(); // Remove the oldest point
    }
  });

  graphOffsetX += graphCanvas.width / maxPoints; // Increment offset for scrolling effect

  // Redraw the graph with updated data
  drawGraph(graphCanvas);
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
