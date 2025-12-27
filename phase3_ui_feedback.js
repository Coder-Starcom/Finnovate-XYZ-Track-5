// ===============================
// Phase 3: UI Feedback & Escalation
// ===============================

const CHATBOT_DELAY = 1000; // 1 min after tooltip
let chatbotTimer = 0;

// -------------------------------
// Immediate user response capture
// -------------------------------

// Radios (delivery + payment)
document.querySelectorAll('input[type="radio"]').forEach((input) => {
  input.addEventListener("change", () => {
    const section = input.closest(".zone");
    if (!section) return;

    const z = zones.find((z) => z.id === section.id);
    if (!z) return;

    z.userResponse = input.value || "selected";
    section.classList.add("confirmed");
    console.log(`User response recorded: ${z.id} → ${z.userResponse}`);
  });
});

// Terms checkbox
const termsCheckbox = document.querySelector('#terms input[type="checkbox"]');
if (termsCheckbox) {
  termsCheckbox.addEventListener("change", () => {
    const section = document.getElementById("terms");
    const z = zones.find((z) => z.id === "terms");
    if (!section || !z) return;

    z.userResponse = termsCheckbox.checked ? "accepted" : "unchecked";
    section.classList.toggle("confirmed", termsCheckbox.checked);
    console.log(`User response recorded: terms → ${z.userResponse}`);
  });
}

// Coupon input
const couponInput = document.querySelector('#coupon input[type="text"]');
const couponBtn = document.querySelector("#coupon button");
if (couponInput && couponBtn) {
  couponBtn.addEventListener("click", () => {
    const z = zones.find((z) => z.id === "coupon");
    if (!z) return;

    z.userResponse = couponInput.value || "-";
    document.getElementById("coupon").classList.add("confirmed");
    console.log(`User response recorded: coupon → ${z.userResponse}`);
  });
}

// -------------------------------
// Tooltip display & chatbot trigger
// -------------------------------
window.addEventListener("zoneThresholdReached", (e) => {
  const z = zones.find((z) => z.id === e.detail.zoneId);
  if (!z || z.tooltipShown) return;

  z.tooltipShown = true;

  // Show tooltip
  const tooltip = document.querySelector(`#${z.id} .tooltip`);
  if (tooltip) {
    tooltip.classList.remove("hidden");
    tooltip.style.animation = "pulse 1s infinite";
  }

  // Auto-expand collapsed ULs
  const collapsed = document.querySelector(`#${z.id} ul.collapsed`);
  if (collapsed) collapsed.classList.remove("collapsed");

  // Start chatbot timer if not already running
  if (!chatbotTimer) {
    chatbotTimer = setTimeout(() => {
      const chatbot = document.getElementById("chatbot");
      if (chatbot) {
        chatbot.style.display = "block";
        console.log("Chatbot displayed after 1 minute of sustained confusion");
      }
    }, CHATBOT_DELAY);
  }
});

// -------------------------------
// Payment button
// -------------------------------
const payBtn = document.getElementById("payNow");
if (payBtn) {
  payBtn.addEventListener("click", () => {
    if (
      !document.querySelector('input[name="delivery"]:checked') ||
      !document.querySelector('input[name="pay"]:checked') ||
      !document.querySelector('#terms input[type="checkbox"]').checked
    ) {
      console.warn("Payment blocked: form incomplete");
      return;
    }

    console.log("Payment completed");
    window.dispatchEvent(new Event("paymentCompleted"));
  });
}
