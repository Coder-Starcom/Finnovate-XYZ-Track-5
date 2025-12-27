// ===============================
// zones.js – Zone definitions + helper functions
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
    dwell: 0,
    totalDwell: 0,
    dwellBeforeHelp: 0,
    dwellAfterHelp: 0,
    entryTime: null,
    lastTimestamp: null,
    lastInside: false,
    revisitCount: 0,
    confusion: false,
    tooltipShown: false,
    uiHandled: false,
    userResponse: null,
  };
}

let lastGaze = { x: null, y: null };

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

// Reset function (useful for restarting camera/session)
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
    z.userResponse = null;
  });
  lastGaze = { x: null, y: null };
}
