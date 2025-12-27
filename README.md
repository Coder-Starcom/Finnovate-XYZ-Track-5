# 🛒 Checkout Eye-Tracking Project (Track 5)

Live Demo: [Eye-Tracking Project](https://finnovate-xyz-track-5.netlify.app)
Team (XYZ)

## 📑 Table of Contents

1. [Overview](#overview)
2. [Objectives](#objectives)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Phase-wise Implementation](#phase-wise-implementation)

   - [Phase 1: Calibration 🎯](#phase-1-calibration)
   - [Phase 2: Gaze Tracking & Metrics 👀](#phase-2-gaze-tracking--metrics)
   - [Phase 3: UI Feedback & Escalation 💡](#phase-3-ui-feedback--escalation)
   - [Phase 4: Privacy & Camera Management 🔒](#phase-4-privacy--camera-management)
   - [Phase 5: Heatmap & Metrics Visualization 📊](#phase-5-heatmap--metrics-visualization)

6. [Key Variables & Metrics](#key-variables--metrics)
7. [How to Run ▶️](#how-to-run)

---

## 📝 Overview

This project simulates a **checkout page** while tracking **user gaze in real-time** using **WebGazer.js**. It highlights:

- Confusion hotspots 🔥
- UI feedback & tooltips 💬
- Heatmap visualizations 📊
- CSV export of user metrics 💾

---

## 🎯 Objectives

- Track gaze and dwell times on **checkout elements**.
- Detect **confusion**: dwell > 5 sec & revisits ≥ 3.
- Provide **real-time guidance** with tooltips.
- Escalate to a **chatbot** after 15 sec of confusion.
- Ensure **local privacy**, no images stored.
- Generate **analytics**: heatmaps, metrics, and CSV reports.

---

## 💻 Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Eye Tracking:** WebGazer.js
- **Visualization:** Chart.js
- **Metrics Export:** CSV via Blob API
- **Privacy:** Local browser processing

---

## 📂 Project Structure

```
Finnovate/
├─ index.html
├─ style.css
├─ zones.js
├─ phase1_calibration.js
├─ phase2_tracking.js
├─ phase3_ui_feedback.js
├─ phase4_privacy.js
├─ phase5_heatmap.js
├─ README.md
```

---

## Phase-wise Implementation

### Phase 1: Calibration 🎯

**Goal:** Align gaze with screen coordinates.

**Snippet:**

```javascript
function handleDotClick(dot) {
  dot.classList.add("done");
  calibrationClicks++;
  const rect = dot.getBoundingClientRect();
  webgazer.recordScreenPosition(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );
  if (calibrationClicks === dots.length) finishCalibration();
}
```

**Flow:**

1. Show **9 calibration dots**.
2. Record gaze when user clicks a dot.
3. Trigger `calibrationComplete` event after all dots.

---

### Phase 2: Gaze Tracking & Metrics 👀

**Goal:** Detect gaze zones, dwell, revisits, and hotspots.

**Snippet:**

```javascript
const activeZone = detectZone(x, y);
zones.forEach((z) => {
  if (activeZone === z) {
    z.lastInside = true;
    z.revisitCount++;
    z.dwell += timestamp - z.lastTimestamp;
    if (z.dwell >= DWELL_THRESHOLD && z.revisitCount >= REVISIT_THRESHOLD) {
      z.confusion = true;
      window.dispatchEvent(
        new CustomEvent("confusionDetected", { detail: { zoneId: z.id } })
      );
    }
  } else {
    z.lastInside = false;
    z.dwell = 0;
  }
});
```

- Tracks **dwell time**, **revisits**, and triggers **confusionDetected** events.

---

### Phase 3: UI Feedback & Escalation 💡

**Goal:** Provide tooltips, auto-expand UI, and human escalation.

**Snippet:**

```javascript
window.addEventListener("confusionDetected", (e) => {
  const z = zones.find((zone) => zone.id === e.detail.zoneId);
  if (!z.uiHandled) {
    z.uiHandled = true;
    document.querySelector(`#${z.id} .tooltip`).classList.remove("hidden");
    escalationTimer = setTimeout(() => {
      document.getElementById("chatbot").classList.remove("hidden");
    }, ESCALATION_TIME);
  }
});
```

- **Tooltips** for zones
- **Escalation** after 15 seconds
- **User responses** are stored and highlighted: ✓ Saved

---

### Phase 4: Privacy & Camera Management 🔒

**Goal:** Consent-first tracking with camera control.

**Snippet:**

```javascript
acceptBtn.addEventListener("click", () => {
  consentModal.style.display = "none";
  window.dispatchEvent(new Event("consentGiven"));
});

cameraStatus.addEventListener("click", async () => {
  cameraActive ? stopCamera() : startCamera();
});
```

- **Consent modal** before calibration
- **Camera toggle** with eye icon
- **AI assistant** hidden until confusion

---

### Phase 5: Heatmap & Metrics Visualization 📊

**Goal:** Visualize attention and compute session metrics.

**Snippet:**

```javascript
heatmapDwell = new Chart(document.getElementById("heatmapChartDwell"), {
  type: "bar",
  data: {
    labels,
    datasets: [
      { label: "Before Help", data: dwellBefore },
      { label: "After Help", data: dwellAfter },
    ],
  },
});

heatmapRevisits = new Chart(document.getElementById("heatmapChartRevisits"), {
  type: "bar",
  data: { labels, datasets: [{ label: "Revisits", data: revisits }] },
});
```

**Metrics Computed:**

- Total session time ⏱
- Time before/after help 🕒
- Confusion events 🔥
- Average payment time 💳
- Before/After Help rate (%)

---

## 🔑 Key Variables & Metrics

| Variable                      | Purpose                      |
| ----------------------------- | ---------------------------- |
| `zones`                       | Array of interactive zones   |
| `dwellBeforeHelp`             | Gaze time before tooltip     |
| `dwellAfterHelp`              | Gaze time after tooltip      |
| `revisitCount`                | Number of zone entries       |
| `confusion`                   | Hotspot flag                 |
| `userResponse`                | Stores user selection        |
| `sessionStart` / `sessionEnd` | Timing for analytics         |
| `firstHelpTimestamp`          | Timestamp of first tooltip   |
| `ESCALATION_TIME`             | 15 sec threshold for chatbot |

---

## ▶️ How to Run

1. Open `index.html` in browser
2. Accept **Consent Modal** 🔒
3. Complete **9-dot calibration** 🎯
4. Interact with checkout page 👀
5. Observe **tooltips** and **AI escalation** 💡
6. Complete checkout → Heatmaps & CSV metrics generated 📊💾
