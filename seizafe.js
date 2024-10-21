class Seizafe {
  constructor(settings) {
    // Initialize settings with default values if not provided
    this.settings = {
      redLevels: settings.redLevels || 0,
      greenLevels: settings.greenLevels || 0,
      blueLevels: settings.blueLevels || 0,
      whiteLevels: settings.whiteLevels || 0,
      blackLevels: settings.blackLevels || 0,
      flashFrequency: settings.flashFrequency || 0,
      movingAverage: settings.movingAverage || 0,
    };
  }

  // Method to process video frame input (r, g, b values)
  processFrame(r, g, b) {
    // Calculate luminosity using the TU-R BT.709 standard weighted formula (give users option to customize this weight)
    const luminosity = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return the RGB values along with the calculated luminosity
    return { r, g, b, luminosity };
  }
}
