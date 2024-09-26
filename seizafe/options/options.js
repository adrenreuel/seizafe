// ACTIVE SITES
document.getElementById("youtube").addEventListener("change", function () {
  updateActiveSite("youtube", this.value);
});

document
  .getElementById("youtubeshorts")
  .addEventListener("change", function () {
    updateActiveSite("youtubeshorts", this.value);
  });

function updateActiveSite(site, value) {
  alert(site);
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
  ranges.forEach(({ id, output, prefix = "", suffix = "" }) => {
    const rangeValue = document.getElementById(id).value;
    document.getElementById(
      output
    ).innerHTML = `${prefix}${rangeValue}${suffix}`;
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
  var customWarningOverlay = document.getElementById("customWarningOverlay");

  // Apply selected colors with fixed opacities
  customWarningOverlay.style.background = `linear-gradient(
      0deg, 
      ${hexToRgba(primaryColor, 0.8)} 33%,
      ${hexToRgba(secondaryColor, 0.2)} 100%
    )`;
}

// Helper function to convert hex color to rgba with specified opacity
function hexToRgba(hex, opacity) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

window.onload = function () {
  updateSensitivities();
  updateWarningOverlay();
};
