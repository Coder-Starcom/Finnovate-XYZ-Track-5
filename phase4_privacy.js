// ===============================
// Phase 4: Privacy & Camera 🔒
// ===============================

const consentModal = document.getElementById("consentModal");
const acceptBtn = document.getElementById("acceptConsent");
const cameraStatus = document.getElementById("cameraStatus");
const cameraHelp = document.getElementById("cameraHelp");
const cameraContainer = document.getElementById("cameraContainer");

let cameraActive = false;
let webgazerStarted = false;

// Privacy text
const privacyText = document.createElement("span");
privacyText.className = "glass-privacy-note"; // Use a class for styling
privacyText.innerText =
  "\nWe use your camera to detect where you are looking and to provide help. No images are stored. You can disable this any time.";

cameraContainer.appendChild(privacyText);

// Chatbot div defined but hidden; display handled by Phase 3
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
aiAssistant.style.display = "none";
document.body.appendChild(aiAssistant);

// Consent handling
acceptBtn.addEventListener("click", () => {
  consentModal.style.display = "none";
  console.log("User consent granted");
  window.dispatchEvent(new Event("consentGiven"));
});

// Camera control
async function startCamera() {
  if (webgazerStarted) return;

  await webgazer.setRegression("ridge").setTracker("clmtrackr").begin();
  webgazer.showVideo(false);
  webgazer.showFaceOverlay(false);
  webgazer.showFaceFeedbackBox(false);

  webgazerStarted = true;
  cameraActive = true;
  updateCameraIcon();
}

async function stopCamera() {
  if (!webgazerStarted) return;
  await webgazer.end();
  document
    .querySelectorAll(".webgazerGazeDot, .webgazerFaceOverlay")
    .forEach((el) => el.remove());
  webgazerStarted = false;
  cameraActive = false;
  updateCameraIcon();
}

cameraStatus.addEventListener("click", async () => {
  cameraActive ? stopCamera() : startCamera();
});

function updateCameraIcon() {
  cameraStatus.style.color = cameraActive ? "green" : "gray";
  cameraStatus.title = cameraActive
    ? "Camera active (click to stop)"
    : "Camera inactive (click to start)";
}

// Show help tooltip on hover
cameraContainer.addEventListener("mouseenter", () =>
  cameraHelp.classList.remove("hidden")
);
cameraContainer.addEventListener("mouseleave", () =>
  cameraHelp.classList.add("hidden")
);

// Auto-start camera after consent
window.addEventListener("consentGiven", startCamera);
