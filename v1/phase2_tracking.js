// ===============================
// Phase 2: Gaze Tracking & Metrics
// ===============================

const DWELL_THRESHOLD = 5000; // 5 seconds
const REVISIT_THRESHOLD = 3;

let trackingActive = false;

window.addEventListener("calibrationComplete", () => {
  if (trackingActive) return;
  trackingActive = true;

  console.log("Phase 2: Tracking started");

  webgazer.setGazeListener((data, timestamp) => {
    if (!data) return;

    const x = data.x;
    const y = data.y;

    const activeZone = detectZone(x, y);
    calcSaccadeDistance(x, y); // stored implicitly for future use

    zones.forEach((z) => {
      // -------------------------------
      // Gaze INSIDE zone
      // -------------------------------
      if (activeZone === z) {
        if (!z.lastInside) {
          z.lastInside = true;
          z.revisitCount++;
          z.entryTime = timestamp;
          z.lastTimestamp = timestamp;

          console.log(
            `Gaze entered zone: ${z.id} (revisits: ${z.revisitCount})`
          );
        }

        // Compute delta time
        const delta = timestamp - z.lastTimestamp;
        z.lastTimestamp = timestamp;

        // Accumulate dwell
        z.dwell += delta; // continuous dwell
        z.totalDwell += delta; // session dwell

        if (!z.tooltipShown) {
          z.dwellBeforeHelp += delta;
        } else {
          z.dwellAfterHelp += delta;
        }

        console.log(
          `Dwell ${z.id} | total=${Math.round(z.totalDwell)}ms ` +
            `before=${Math.round(z.dwellBeforeHelp)}ms ` +
            `after=${Math.round(z.dwellAfterHelp)}ms`
        );

        // Confusion detection
        if (
          z.dwell >= DWELL_THRESHOLD &&
          z.revisitCount >= REVISIT_THRESHOLD &&
          !z.confusion
        ) {
          z.confusion = true;

          console.warn(`Confusion hotspot detected: ${z.id}`);

          window.dispatchEvent(
            new CustomEvent("confusionDetected", {
              detail: {
                zoneId: z.id,
                dwell: z.dwell,
                revisits: z.revisitCount,
              },
            })
          );
        }
      }

      // -------------------------------
      // Gaze LEFT zone
      // -------------------------------
      else if (z.lastInside) {
        z.lastInside = false;
        z.entryTime = null;
        z.lastTimestamp = null;
        z.dwell = 0; // reset ONLY continuous dwell

        console.log(`Gaze left zone: ${z.id}`);
      }
    });
  });
});
