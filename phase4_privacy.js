const consentModal = document.getElementById("consentModal");
const acceptBtn = document.getElementById("acceptConsent");
const cameraStatus = document.getElementById("cameraStatus");
const cameraHelp = document.getElementById("cameraHelp");
const cameraContainer = document.getElementById("cameraContainer");

let cameraActive = false;
let webgazerStarted = false;
let privacyEscalationTimer = null;

// -------------------------------
// Privacy text next to camera
// -------------------------------
const privacyText = document.createElement("span");
privacyText.innerText =
  "We use your camera to detect \n where you are looking and to provide help. \nNo images are stored. You can disable this any time.";
privacyText.style.fontSize = "10px"; // really small
privacyText.style.marginLeft = "5px";
cameraContainer.appendChild(privacyText);

// -------------------------------
// Chatbot / AI assistant setup (hidden initially)
// -------------------------------
const aiAssistant = document.createElement("div");
aiAssistant.id = "aiAssistant";
aiAssistant.innerHTML = `<p style="font-size:10px; margin:0;">Need help? Talk to our AI assistant!</p>`;
aiAssistant.style.position = "fixed";
aiAssistant.style.bottom = "10px";
aiAssistant.style.right = "10px";
aiAssistant.style.background = "#f9f9f9";
aiAssistant.style.border = "1px solid #ccc";
aiAssistant.style.padding = "6px";
aiAssistant.style.borderRadius = "6px";
aiAssistant.style.boxShadow = "0 0 4px rgba(0,0,0,0.2)";
aiAssistant.style.display = "none"; // hidden initially
document.body.appendChild(aiAssistant);

// -------------------------------
// Consent modal handling
// -------------------------------
acceptBtn.addEventListener("click", () => {
  consentModal.style.display = "none";
  console.log("Phase 4: User consent granted");
  window.dispatchEvent(new Event("consentGiven"));
});

// -------------------------------
// Camera start
// -------------------------------
async function startCamera() {
  if (webgazerStarted) return;

  console.log("Phase 4: Starting camera");

  await webgazer.setRegression("ridge").setTracker("clmtrackr").begin();

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

  await webgazer.end();

  // Clear previous gaze dots
  document
    .querySelectorAll(".webgazerGazeDot, .webgazerFaceOverlay")
    .forEach((el) => el.remove());

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
// Help tooltip on hover
// -------------------------------
cameraContainer.addEventListener("mouseenter", () =>
  cameraHelp.classList.remove("hidden")
);
cameraContainer.addEventListener("mouseleave", () =>
  cameraHelp.classList.add("hidden")
);

// -------------------------------
// Show chatbot only on confusion escalation
// -------------------------------
window.addEventListener("confusionDetected", () => {
  if (escalationTimer) return; // already counting

  escalationTimer = setTimeout(() => {
    console.log("Phase 4: AI Assistant popup triggered due to confusion");
    aiAssistant.style.display = "block";
  }, 15000); // 15 sec sustained confusion
});

// Auto-start camera after consent
window.addEventListener("consentGiven", startCamera);
