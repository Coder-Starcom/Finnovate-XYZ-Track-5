// ===============================
// Zone State Definitions
// ===============================
const zones = [
  createZone("price"),
  createZone("coupon"),
  createZone("delivery"),
  createZone("payment"),
  createZone("terms"),
];

function createZone(id) {
  return {
    id,

    // Dwell metrics
    dwell: 0, // continuous dwell (current visit)
    totalDwell: 0, // total dwell (entire session)
    dwellBeforeHelp: 0, // Phase 5 metric
    dwellAfterHelp: 0, // Phase 5 metric

    // Temporal tracking
    entryTime: null,
    lastTimestamp: null,
    lastInside: false,

    // Behavioral metrics
    revisitCount: 0,
    confusion: false,

    // UI / experiment state
    tooltipShown: false,
    uiHandled: false,
  };
}

// ===============================
// Gaze Tracking Helpers
// ===============================
let lastGaze = { x: null, y: null };

// Detect which zone the gaze is currently in
function detectZone(x, y) {
  for (const z of zones) {
    const el = document.getElementById(z.id);
    if (!el) continue;

    const rect = el.getBoundingClientRect();
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      return z;
    }
  }
  return null;
}

// Calculate saccade distance between gaze points
function calcSaccadeDistance(x, y) {
  if (lastGaze.x === null) {
    lastGaze = { x, y };
    return 0;
  }

  const dx = x - lastGaze.x;
  const dy = y - lastGaze.y;

  lastGaze = { x, y };
  return Math.sqrt(dx * dx + dy * dy);
}

// ===============================
// Optional: Reset zone metrics
// (useful if restarting experiment)
// ===============================
function resetZones() {
  zones.forEach((z) => {
    z.dwell = 0;
    z.totalDwell = 0;
    z.dwellBeforeHelp = 0;
    z.dwellAfterHelp = 0;
    z.entryTime = null;
    z.lastTimestamp = null;
    z.lastInside = false;
    z.revisitCount = 0;
    z.confusion = false;
    z.tooltipShown = false;
    z.uiHandled = false;
  });

  lastGaze = { x: null, y: null };
  console.log("Zones reset");
}
