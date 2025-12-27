// ===============================
// Phase 1: Eye Tracker Calibration
// ===============================

let calibrationClicks = 0;
let calibrationActive = false;

const dots = Array.from(document.querySelectorAll(".dot"));

// Start calibration after consent
window.addEventListener("consentGiven", () => {
  if (calibrationActive) return;
  calibrationActive = true;

  console.log("Phase 1: Calibration started");

  calibrationClicks = 0;
  dots.forEach((dot) => dot.classList.remove("done"));

  // Ensure WebGazer is running (Phase 4 controls camera lifecycle)
  if (!webgazer.isReady()) {
    console.warn("WebGazer not ready yet; calibration will proceed anyway");
  }

  dots.forEach((dot) => {
    dot.onclick = () => handleDotClick(dot);
  });
});

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

function finishCalibration() {
  console.log("Phase 1: Calibration complete");

  // Hide calibration UI
  const calibrationEl = document.getElementById("calibration");
  if (calibrationEl) calibrationEl.style.display = "none";

  // Show checkout UI
  document.getElementById("checkout")?.classList.remove("hidden");

  calibrationActive = false;

  // Notify downstream phases
  window.dispatchEvent(new Event("calibrationComplete"));
}
