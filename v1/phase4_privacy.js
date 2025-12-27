// ===============================
// Phase 4: Privacy & Camera Control
// ===============================

const consentModal = document.getElementById("consentModal");
const acceptBtn = document.getElementById("acceptConsent");
const cameraStatus = document.getElementById("cameraStatus");
const cameraHelp = document.getElementById("cameraHelp");
const cameraContainer = document.getElementById("cameraContainer");

let cameraActive = false;
let webgazerStarted = false;

// -------------------------------
// Consent modal handling
// -------------------------------
acceptBtn.addEventListener("click", () => {
  consentModal.style.display = "none";
  console.log("Phase 4: User consent granted");

  // Fire consent event to start calibration or Phase 1
  window.dispatchEvent(new Event("consentGiven"));
});

// -------------------------------
// Camera start
// -------------------------------
async function startCamera() {
  if (webgazerStarted) return;

  console.log("Phase 4: Starting camera");

  await webgazer
    .setRegression("ridge")
    .setTracker("clmtrackr")
    .begin();

  webgazer.showVideo(false);
  webgazer.showFaceOverlay(false);
  webgazer.showFaceFeedbackBox(false);

  webgazerStarted = true;
  cameraActive = true;
  updateCameraIcon();
}

// -------------------------------
// Camera stop
// -------------------------------
async function stopCamera() {
  if (!webgazerStarted) return;

  console.log("Phase 4: Stopping camera");

  // Stop WebGazer fully and turn off LED
  await webgazer.end();

  // Clear previous gaze dots from DOM
  document.querySelectorAll(".webgazerGazeDot, .webgazerFaceOverlay")
    .forEach(el => el.remove());

  webgazerStarted = false;
  cameraActive = false;
  updateCameraIcon();
}

// -------------------------------
// Camera toggle via eye icon
// -------------------------------
cameraStatus.addEventListener("click", async () => {
  if (cameraActive) {
    await stopCamera();
  } else {
    await startCamera();
  }
});

// -------------------------------
// Update camera icon
// -------------------------------
function updateCameraIcon() {
  cameraStatus.style.color = cameraActive ? "green" : "gray";
  cameraStatus.title = cameraActive
    ? "Camera active (click to stop)"
    : "Camera inactive (click to start)";
}

// -------------------------------
// Help tooltip
// -------------------------------
cameraContainer.addEventListener("mouseenter", () => {
  cameraHelp.classList.remove("hidden");
});
cameraContainer.addEventListener("mouseleave", () => {
  cameraHelp.classList.add("hidden");
});

// -------------------------------
// Auto-start camera after consent
// -------------------------------
window.addEventListener("consentGiven", startCamera);
