// ===============================
// Phase 2: Gaze Tracking & Metrics
// ===============================

const REVISIT_THRESHOLD = 3;
const TOTAL_DWELL_THRESHOLD = 5000; // 15s in ms

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
        calcSaccadeDistance(x, y); // optional, for analytics

        zones.forEach((z) => {
            if (activeZone === z) {
                if (!z.lastInside) {
                    z.lastInside = true;
                    z.revisitCount++;
                    z.lastTimestamp = timestamp;
                    console.log(
                        `Gaze entered zone: ${z.id} (revisits: ${z.revisitCount})`
                    );
                }

                const delta = timestamp - (z.lastTimestamp || timestamp);
                z.lastTimestamp = timestamp;

                z.dwell += delta;
                z.totalDwell += delta;

                if (!z.tooltipShown) z.dwellBeforeHelp += delta;
                else z.dwellAfterHelp += delta;

                // Threshold reached → show tooltip in Phase 3
                if (
                    z.revisitCount >= REVISIT_THRESHOLD &&
                    z.totalDwell >= TOTAL_DWELL_THRESHOLD &&
                    !z.tooltipShown
                ) {
                    window.dispatchEvent(
                        new CustomEvent("zoneThresholdReached", {
                            detail: {
                                zoneId: z.id
                            },
                        })
                    );
                }
            } else if (z.lastInside) {
                z.lastInside = false;
                z.lastTimestamp = null;
                z.dwell = 0;
                console.log(`Gaze left zone: ${z.id}`);
            }
        });
    });
});