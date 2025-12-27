// ===============================
// Phase 1: Eye Tracker Calibration
// ===============================

let calibrationClicks = 0;
let calibrationActive = false;
const dots = Array.from(document.querySelectorAll(".dot"));

// Start calibration after user consent
window.addEventListener("consentGiven", () => {
  if (calibrationActive) return;

  // --- ADD THIS SECTION ---
  webgazer.params.showVideo = false;
  webgazer.params.showFaceOverlay = false;
  webgazer.params.showFaceFeedbackBox = false;

  // If WebGazer is already running, force hide the elements
  webgazer.showVideo(false).showFaceOverlay(false).showFaceFeedbackBox(false);
  calibrationActive = true;

  console.log("Phase 1: Calibration started");

  calibrationClicks = 0;
  dots.forEach((dot) => dot.classList.remove("done"));

  // Ensure WebGazer is running (Phase 4 manages camera lifecycle)
  if (!webgazer.isReady()) {
    console.warn("WebGazer not ready yet; calibration will proceed anyway");
  }

  dots.forEach((dot) => {
    dot.onclick = () => handleDotClick(dot);
  });
});

// Handle dot clicks
function handleDotClick(dot) {
  if (dot.classList.contains("done")) return;

  dot.classList.add("done");
  calibrationClicks++;

  const rect = dot.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  webgazer.recordScreenPosition(cx, cy);

  console.log(`Calibration dot recorded: ${calibrationClicks}/${dots.length}`);

  if (calibrationClicks === dots.length) {
    finishCalibration();
  }
}

// Finish calibration
function finishCalibration() {
  console.log("Phase 1: Calibration complete");

  // Hide calibration overlay
  const calibrationEl = document.getElementById("calibration");
  if (calibrationEl) calibrationEl.style.display = "none";

  // Show checkout page
  document.getElementById("checkout")?.classList.remove("hidden");

  calibrationActive = false;

  // Notify downstream phases (Phase 2 tracking)
  window.dispatchEvent(new Event("calibrationComplete"));
}
