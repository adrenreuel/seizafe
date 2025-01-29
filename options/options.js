// shareBtn
document.getElementById("shareBtn").addEventListener("click", function () {
  // Copy to clipboard
  var copyLink =
    "https://chromewebstore.google.com/detail/seizafe-epilepsy-alert-fo/goageegpmdbgenkgkhfhnnjmgmgboegi";
  navigator.clipboard.writeText(copyLink);

  var snackbar = document.getElementById("snackbar");
  snackbar.className = "show";
  setTimeout(function () {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
});

// ACTIVE SITES
document.getElementById("youtube").addEventListener("change", function () {
  updateActiveSites("YouTube", this.checked);
});

document
  .getElementById("youtubeshorts")
  .addEventListener("change", function () {
    updateActiveSites("YouTube Shorts", this.checked);
  });

function updateActiveSites(site, value) {
  chrome.storage.sync.get(["activesites"], function (result) {
    let activesites = result.activesites;

    if (!activesites) {
      activesites = [];
    } else {
      activesites = result.activesites.toString().split(",");
    }

    if (value) {
      activesites.push(site);
    } else {
      activesites = activesites.filter((activeSite) => activeSite !== site);
      if (activesites.length == 0) {
        activesites = null;
      }
    }

    chrome.storage.sync.set({ activesites });
  });
}

function loadActiveSiteOptions() {
  chrome.storage.sync.get(["activesites"], function (result) {
    if (result.activesites) {
      result.activesites = result.activesites.toString().split(",");
      for (let site of result.activesites) {
        if (site != "") {
          site = site.replace(/\s/g, "");
          document.getElementById(site.toLowerCase()).checked = true;
        }
      }
    }
  });
}

// CUSTOM SENSITIVITY
// Initialize ranges array first
const ranges = [
  { id: "redRange", output: "redLevels", suffix: "%" },
  { id: "greenRange", output: "greenLevels", suffix: "%" },
  { id: "blueRange", output: "blueLevels", suffix: "%" },
  { id: "whiteRange", output: "whiteLevels", suffix: "%" },
  { id: "blackRange", output: "blackLevels", suffix: "%" },
  {
    id: "flashFrequencyRange",
    output: "flashFrequency",
    prefix: "≥ ",
    suffix: "Hz",
  },
  { id: "movingAverageRange", output: "movingAverage", suffix: "s" },
];

// Add event listeners
ranges.forEach((range) => {
  const element = document.getElementById(range.id);
  element.addEventListener("input", updateSensitivities);
});

// Update sensitivities
function updateSensitivities() {
  let customSensitivity = {};
  ranges.forEach(({ id, output, prefix = "", suffix = "" }) => {
    const rangeValue = document.getElementById(id).value;
    document.getElementById(
      output
    ).innerHTML = `${prefix}${rangeValue}${suffix}`;
    customSensitivity[output] = rangeValue;
  });
  chrome.storage.sync.set({
    customSensitivity,
  });
}

function loadSensitivityOptions() {
  chrome.storage.sync.get(["customSensitivity"], function (result) {
    if (result.customSensitivity) {
      for (let range of ranges) {
        document.getElementById(range.id).value =
          result.customSensitivity[range.output];
      }
    }
    updateSensitivities();
  });
}

// CUSTOM WARNING OVERLAY
// Change primary color
document
  .getElementById("primaryColor")
  .addEventListener("input", updateWarningOverlay);

// Change secondary color
document
  .getElementById("secondaryColor")
  .addEventListener("input", updateWarningOverlay);

// Update warning overlay
function updateWarningOverlay() {
  var primaryColor = document.getElementById("primaryColor").value;
  var secondaryColor = document.getElementById("secondaryColor").value;
  document.getElementById("primary_color").innerHTML = primaryColor;
  document.getElementById("secondary_color").innerHTML = secondaryColor;

  chrome.storage.sync.set({
    customWarning: {
      primaryColor,
      secondaryColor,
    },
  });
  // Apply selected colors with fixed opacities
  var customWarningOverlay = document.getElementById("customWarningOverlay");
  customWarningOverlay.style.background = `linear-gradient(
      0deg, 
      ${hexToRgba(primaryColor, 9)} 33%,
      ${hexToRgba(secondaryColor, 0.9)} 100%
    )`;
}

function loadWarningOverlayOptions() {
  chrome.storage.sync.get(["customWarning"], function (result) {
    if (result.customWarning) {
      document.getElementById("primaryColor").value =
        result.customWarning.primaryColor;
      document.getElementById("secondaryColor").value =
        result.customWarning.secondaryColor;
      updateWarningOverlay();
    }
  });
}

// Helper function to convert hex color to rgba with specified opacity
function hexToRgba(hex, opacity) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

document
  .getElementById("resetCustomWarning")
  .addEventListener("click", resetCustomWarning);

function resetCustomWarning() {
  document.getElementById("primaryColor").value = "#6600ff";
  document.getElementById("secondaryColor").value = "#bb00ff";
  updateWarningOverlay();
}

// MISC SETTINGS
document
  .getElementById("auditoryfeedback")
  .addEventListener("change", function () {
    updateActiveSites("Auditory Feedback", this.checked);
  });

document.getElementById("warnonce").addEventListener("change", function () {
  updateActiveSites("Warn Once", this.checked);
});

function updateMiscSettings(setting, value) {
  chrome.storage.sync.get(["miscSettings"], function (result) {
    let miscSettings = result.miscSettings;

    if (!miscSettings) {
      miscSettings = [];
    } else {
      miscSettings = result.miscSettings.toString().split(",");
    }

    if (value) {
      miscSettings.push(setting);
    } else {
      miscSettings = miscSettings.filter(
        (miscSetting) => miscSetting !== setting
      );
      if (miscSettings.length == 0) {
        miscSettings = null;
      }
    }

    chrome.storage.sync.set({ miscSettings });
  });
}

function loadMiscSettingsOptions() {
  chrome.storage.sync.get(["miscSettings"], function (result) {
    if (result.miscSettings) {
      result.miscSettings = result.miscSettings.toString().split(",");
      for (let setting of result.miscSettings) {
        if (setting != "") {
          setting = setting.replace(/\s/g, "");
          document.getElementById(setting.toLowerCase()).checked = true;
        }
      }
    }
  });
}

window.onload = function () {
  loadActiveSiteOptions();
  loadSensitivityOptions();
  loadWarningOverlayOptions();
  loadMiscSettingsOptions();
};
