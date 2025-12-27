// ===============================
// Phase 3: UI Feedback & Escalation
// ===============================

const ESCALATION_TIME = 15000; // 15 seconds (single source here)
let escalationTimer = null;

// -------------------------------
// Form validation
// -------------------------------
function formIsValid() {
  const delivery = document.querySelector('input[name="delivery"]:checked');
  const payment = document.querySelector('input[name="pay"]:checked');
  const terms = document.querySelector(
    '#terms input[type="checkbox"]'
  )?.checked;

  return Boolean(delivery && payment && terms);
}

// -------------------------------
// Confusion → UI feedback
// -------------------------------
window.addEventListener("confusionDetected", (e) => {
  const { zoneId } = e.detail;
  const z = zones.find((zone) => zone.id === zoneId);
  if (!z || z.uiHandled) return;

  z.uiHandled = true;
  z.tooltipShown = true;

  console.warn(`Phase 3: UI help triggered for ${zoneId}`);

  // Tooltip
  const tooltip = document.querySelector(`#${zoneId} .tooltip`);
  if (tooltip) {
    tooltip.classList.remove("hidden");
    tooltip.style.animation = "pulse 1s infinite";
  }

  // Auto-expand collapsed content
  const collapsed = document.querySelector(`#${zoneId} ul.collapsed`);
  if (collapsed) collapsed.classList.remove("collapsed");

  // Start escalation timer ONCE
  if (!escalationTimer) {
    escalationTimer = setTimeout(() => {
      console.warn("Phase 3: Human escalation triggered");
      document.getElementById("chatbot")?.classList.remove("hidden");
    }, ESCALATION_TIME);
  }
});

// -------------------------------
// Interactive form feedback
// -------------------------------

// Radios (delivery + payment)
document.querySelectorAll('input[type="radio"]').forEach((input) => {
  input.addEventListener("change", () => {
    const section = input.closest(".zone");
    if (!section) return;

    section.classList.add("confirmed");
    console.log(`User confirmed selection in ${section.id}`);
  });
});

// Terms checkbox
const termsCheckbox = document.querySelector('#terms input[type="checkbox"]');
if (termsCheckbox) {
  termsCheckbox.addEventListener("change", () => {
    const termsSection = document.getElementById("terms");
    if (!termsSection) return;

    termsSection.classList.toggle("confirmed", termsCheckbox.checked);
    console.log("Terms accepted:", termsCheckbox.checked);
  });
}

// -------------------------------
// Payment action
// -------------------------------
const payBtn = document.getElementById("payNow");
if (payBtn) {
  payBtn.addEventListener("click", () => {
    if (!formIsValid()) {
      console.warn("Payment blocked: form incomplete");
      return;
    }

    console.log("Phase 3: Payment completed");
    window.dispatchEvent(new Event("paymentCompleted"));
  });
}
