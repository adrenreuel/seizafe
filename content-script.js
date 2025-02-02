var windowURL = window.location.toString();
var video = null;
var videoID = null;
var seizafeIntervalId = null;

// Defaults
const settings = {
  redLevels: 10,
  greenLevels: 20,
  blueLevels: 30,
  whiteLevels: 40,
  blackLevels: 50,
  flashFrequency: 2,
  movingAverage: 5,
};

// Initialize variables
const dataPoints = {
  r: [],
  g: [],
  b: [],
  luminosity: [],
};

let graphOffsetX = 0; // Offset for scrolling effect
const maxPoints = 100; // Maximum number of data points displayed
const flashTimeWindow = 5000;

// execute seizafe
seizafeSiteRouter();
const seizafeInstance = new Seizafe(settings);

// listen for messages sent from background.js then call seizafe script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "urlchanged") {
    // windowURL = request.url;
    seizafeSiteRouter();
    // alert("urlchanged");
  }

  if (request.message === "tabchanged") {
    seizafeSiteRouter();
    // alert("tabchanged");
  }

  if (request.message === "seizafeon") {
    // seizafeSiteRouter();
    // alert("seizafeon");
  } else if (request.message === "seizafeoff") {
    // seizafeSiteRouter();
    // alert("seizafeoff");
  }
});

function seizafeSiteRouter() {
  //YOUTUBE
  if (windowURL.includes("youtube.com/watch")) {
    // Function to extract video details
    function extractVideoDetails() {
      videoID = windowURL.split("v=")[1].split("&")[0];
      var videoThumbnail = "https://img.youtube.com/vi/" + videoID + "/0.jpg";

      chrome.storage.local.set({ platformURL: "youtube.com" });
      chrome.storage.local.set({ videoURL: windowURL });
      chrome.storage.local.set({ thumbnail: videoThumbnail });

      const observer = new MutationObserver((mutations, obs) => {
        const videoTitle = document.querySelector(
          "#above-the-fold h1.style-scope.ytd-watch-metadata"
        );
        const channelName = document.querySelector("#channel-name");

        if (videoTitle) {
          chrome.storage.local.set({ videoTitle: videoTitle.innerText });
        }

        if (channelName) {
          chrome.storage.local.set({ channelName: channelName.innerText });
        }

        // Stop observing once both elements are found
        if (videoTitle && channelName) {
          obs.disconnect();
        }
      });

      // Observe changes in the body (or a more specific parent element if known)
      observer.observe(document.body, { childList: true, subtree: true });

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
        // video.style.border = "5px solid #6600ff";
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
      videoID = windowURL.split("shorts/")[1].split("&")[0];
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
        // video.style.border = "5px solid #6600ff";
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
  // let warningDiv = document.getElementById("warning-overlay");

  // if (warningDiv) {
  //   warningDiv.remove();
  // }

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

    // Make the entire div moveable
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    // Ensure the div sticks to the edges of the window
    function keepInBounds() {
      const rect = seizafeDiv.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (rect.top < 0) seizafeDiv.style.top = "0px";
      if (rect.left < 0) seizafeDiv.style.left = "0px";
      if (rect.right > windowWidth)
        seizafeDiv.style.left = windowWidth - rect.width - 20 + "px";
      if (rect.bottom > windowHeight)
        seizafeDiv.style.top = windowHeight - rect.height + "px";
    }

    // Make the div draggable
    seizafeDiv.addEventListener("mousedown", function (e) {
      isDragging = true;
      offset.x = e.offsetX;
      offset.y = e.offsetY;
      seizafeDiv.style.cursor = "grabbing"; // Change cursor while dragging
      document.body.style.userSelect = "none"; // Prevent text selection
    });

    document.addEventListener("mouseup", function () {
      if (isDragging) {
        isDragging = false;
        seizafeDiv.style.cursor = "grab"; // Revert cursor when not dragging
        document.body.style.userSelect = ""; // Re-enable text selection
        keepInBounds(); // Adjust position after dragging ends
      }
    });

    document.addEventListener("mousemove", function (e) {
      if (isDragging) {
        // Calculate new position and move the div
        seizafeDiv.style.top = e.clientY - offset.y + "px";
        seizafeDiv.style.left = e.clientX - offset.x + "px";
      }
    });

    // Adjust position on window resize to keep the div within bounds
    window.addEventListener("resize", keepInBounds);

    // Initial check to ensure the div starts within bounds
    keepInBounds();

    // Add the Seizafe debug title
    const debugText = document.createElement("p");
    debugText.innerText = "Seizafe Spectral Graph";
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

      // Analyze video and show warning if necessary
      function analyzeVideo(video, seizureAnalysis) {
        if (detectSpike()) {
          showWarningOverlay(video);
        }
      }

      // Run analysis on video
      analyzeVideo(video, seizafeAnalysis);
    }

    startDrawing();

    // Draw frame every 50ms (Customizable)
    function startDrawing() {
      seizafeIntervalId = setInterval(drawFrame, flashTimeWindow / maxPoints);
    }

    function stopDrawing() {
      // clearInterval(seizafeIntervalId);
      unmountSeizafeCanvas();
    }

    function clearDrawing() {
      stopDrawing();
      dataPoints.r = [];
      dataPoints.g = [];
      dataPoints.b = [];
      dataPoints.luminosity = [];
      startDrawing();
    }

    // Check if video is playing or paused and start/stop drawing accordingly
    video.addEventListener("play", startDrawing);
    video.addEventListener("pause", stopDrawing);
    video.addEventListener("ended", stopDrawing);
    // add listener for video scrubbing
    video.addEventListener("seeked", clearDrawing);

    // Add checker for video scrubbing?

    // Pause video if strobe detected
  }
}

// function detectSpike() {
//   if (dataPoints.luminosity.length < settings.movingAverage) return false;

//   let windowSize = settings.movingAverage;
//   let latestIndex = dataPoints.luminosity.length - 1;
//   let avg = 0;

//   for (let i = latestIndex - windowSize; i < latestIndex; i++) {
//     avg += Math.abs(dataPoints.luminosity[i + 1] - dataPoints.luminosity[i]);
//   }
//   avg /= windowSize; // Get average rate of change
//   console.log(avg);

//   return avg > settings.flashFrequency; // User-defined threshold
// }

function detectSpike() {
  if (dataPoints.luminosity.length < settings.movingAverage) return false;

  let windowSize = settings.movingAverage;
  let totalChange = 0;
  let latestIndex = dataPoints.luminosity.length - 1;

  for (let i = latestIndex - windowSize; i < latestIndex; i++) {
    totalChange +=
      Math.abs(dataPoints.r[i + 1] - dataPoints.r[i]) +
      Math.abs(dataPoints.g[i + 1] - dataPoints.g[i]) +
      Math.abs(dataPoints.b[i + 1] - dataPoints.b[i]) +
      Math.abs(dataPoints.luminosity[i + 1] - dataPoints.luminosity[i]);
  }

  // Normalize across all 4 channels
  let avgChange = totalChange / (windowSize * 4);
  console.log(avgChange);

  return avgChange > settings.flashFrequency;
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

  // Add axis labels
  ctx.fillStyle = "#ffffff";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";

  // X-axis label
  ctx.fillText("Time", graphCanvas.width / 2, graphCanvas.height - 5);

  // Y-axis label (rotated)
  ctx.save();
  ctx.translate(10, graphCanvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Intensity", 0, 0);
  ctx.restore();

  // Define colors for each data line
  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffffff"]; // Red, Green, Blue, White

  // Draw each data set
  ["r", "g", "b", "luminosity"].forEach((key, dataIndex) => {
    ctx.strokeStyle = colors[dataIndex];
    ctx.lineWidth = 2;
    ctx.beginPath();

    dataPoints[key].forEach((point, index) => {
      // Calculate X position
      const x = index * (graphCanvas.width / maxPoints);

      // Normalize Y position based on fixed max value of 255
      const y = graphCanvas.height - (point / 255) * graphCanvas.height;

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
  const currentTime = Date.now();

  // Extract data point values
  const values = {
    r: seizafeAnalysis.r || 0,
    g: seizafeAnalysis.g || 0,
    b: seizafeAnalysis.b || 0,
    luminosity: seizafeAnalysis.luminosity || 0,
  };

  Object.keys(values).forEach((key) => {
    dataPoints[key].push(values[key]);

    // Limit the number of data points to maxPoints
    if (dataPoints[key].length > maxPoints) {
      dataPoints[key].shift(); // Remove the oldest point
    }
  });

  // Reset graphOffsetX and clear graph when reaching the end
  if (dataPoints.r.length >= maxPoints) {
    graphOffsetX = 0;
    dataPoints.r = [];
    dataPoints.g = [];
    dataPoints.b = [];
    dataPoints.luminosity = [];
  }

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

// Function to inject content-script styles once
function injectStyles() {
  if (!document.getElementById("seizafe-font")) {
    const fontLink = document.createElement("link");
    fontLink.id = "seizafe-font";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }

  // import font awesome
  if (!document.getElementById("seizafe-fontawesome")) {
    const fontAwesomeLink = document.createElement("link");
    fontAwesomeLink.id = "seizafe-fontawesome";
    fontAwesomeLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
    fontAwesomeLink.rel = "stylesheet";
    document.head.appendChild(fontAwesomeLink);
  }

  if (!document.getElementById("seizafe-style")) {
    // Default colors
    let primaryColor = "#6600ff";
    let secondaryColor = "#bb00ff";

    // Fetch custom warning colors from storage asynchronously
    chrome.storage.sync.get(["customWarning"], function (result) {
      if (result.customWarning) {
        // Set to custom primary and secondary colors if available
        primaryColor = result.customWarning.primaryColor;
        secondaryColor = result.customWarning.secondaryColor;
      }
      // After colors are fetched, inject the styles
      injectWarningStyle(primaryColor, secondaryColor);
    });
  }

  // Function to inject the styles after fetching custom colors
  function injectWarningStyle(primaryColor, secondaryColor) {
    const warningStyle = document.createElement("style");
    warningStyle.id = "seizafe-style";
    warningStyle.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 0.9; } }
            @keyframes fadeOut { from { opacity: 0.9; } to { opacity: 0; } }
        
            .seizafe-warning {
              font-family: 'Montserrat', sans-serif !important;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(0deg, ${primaryColor} 33%, ${secondaryColor} 100%);
              z-index: 9999;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              color: #ffffff;
              text-align: center;
              opacity: 0;
              animation: fadeIn 0.5s forwards;
            }
            .seizafe-warning.fade-out { animation: fadeOut 0.5s forwards; }
        
            .seizafe-checkbox-container {
              display: flex;
              align-items: center;
              margin-top: 15px;
            }
            .seizafe-checkbox {
              margin-right: 10px;
              transform: scale(1.2);
            }
            .seizafe-options-link {
              color: #FFD700;
              text-decoration: underline;
              margin-top: 10px;
              font-size: 14px;
              cursor: pointer;
            }
          `;
    document.head.appendChild(warningStyle);
  }
}

// Function to create the warning overlay
function showWarningOverlay(video) {
  // Ensure styles are injected
  injectStyles();

  // Check if the user has already dismissed warnings for this video
  const videoId = video.src || window.location.href;
  const lastDismissTime = localStorage.getItem(
    `seizafe_lastDismiss_${videoId}`
  );
  const currentTime = Date.now();

  // If the user dismissed the warning in the last 10 seconds, do not show it again
  if (lastDismissTime && currentTime - lastDismissTime < 10 * 1000) {
    console.log("Skipping warning: Dismissed within last 10 seconds.");
    return;
  }

  // Check if the user has dismissed warnings for the rest of this video
  if (localStorage.getItem(`seizafe_skip_${videoId}`)) {
    return;
  }

  // Ensure the video container exists
  const videoContainer = video.parentElement || video;

  // Delete any existing warning divs
  const existingWarningDiv = document.querySelector(".seizafe-warning");
  if (existingWarningDiv) {
    existingWarningDiv.remove();
  }

  // Create overlay div
  let warningDiv = document.createElement("div");
  warningDiv.classList.add("seizafe-warning");

  // Add warning content
  warningDiv.innerHTML = `
    <img src="${chrome.runtime.getURL(
      "assets/seizafe_eye.png"
    )}" style="width: 100px; margin-bottom: 10px;" />
    <h1 style="font-size: 36px; margin-bottom: 10px;">Seizure Warning!</h1>
    <span style="font-size: 18px; max-width: 80%; line-height: 1.5;">
      The following content may potentially trigger seizures.
    </span>
    
    <div class="seizafe-checkbox-container">
      <input type="checkbox" id="seizafe-dismiss-checkbox" class="seizafe-checkbox">
      <label for="seizafe-dismiss-checkbox">Don't warn me again for the rest of this video</label>
    </div>

    <span style="font-size: 14px; margin-top: 60px;">
      <i class="fas fa-keyboard"></i> Click here or hit [space] to dismiss this warning
    </span>
  `;

  // Ensure video container allows absolute positioning
  const parentContainer = videoContainer.parentElement;
  if (parentContainer) {
    parentContainer.style.position = "relative";
    parentContainer.insertBefore(warningDiv, parentContainer.firstChild);
  } else {
    document.body.appendChild(warningDiv);
  }

  // Pause video
  video.pause();

  // Event listeners for dismissing the warning
  warningDiv.addEventListener("click", removeWarningOverlay);
  // change warningDiv opacity on mouseover
  warningDiv.addEventListener("mouseover", function () {
    warningDiv.style.opacity = 1;
  });
  warningDiv.addEventListener("mouseout", function () {
    warningDiv.style.opacity = 0.9;
  });

  // Dismiss warning on space or escape key press
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === " " || event.key === "Escape") {
        removeWarningOverlay();
      }
    },
    { once: true }
  );

  // Prevent clicking the checkbox or label from dismissing the warning
  const checkboxContainer = document.querySelector(
    ".seizafe-checkbox-container"
  );
  checkboxContainer.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevents click from reaching warningDiv
  });
}

// Function to remove warning and resume video
function removeWarningOverlay() {
  const videoId = video.src || window.location.href;
  const warningDiv = document.querySelector(".seizafe-warning");
  const checkbox = document.getElementById("seizafe-dismiss-checkbox");

  // Store the timestamp when the warning is dismissed
  localStorage.setItem(`seizafe_lastDismiss_${videoId}`, Date.now());

  if (checkbox && checkbox.checked) {
    localStorage.setItem(`seizafe_skip_${videoId}`, "true");
  }

  warningDiv.classList.add("fade-out");
  setTimeout(() => warningDiv.remove(), 500); // Remove after animation
  video.play();
}
