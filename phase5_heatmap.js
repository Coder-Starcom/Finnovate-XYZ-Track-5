// ===============================
// Phase 5: Heatmap & Metrics
// ===============================

let heatmapDwell = null;
let heatmapRevisits = null;

let sessionStart = null;
let sessionEnd = null;
let firstHelpTimestamp = null;

// -------------------------------
// Track session timing
// -------------------------------
window.addEventListener("calibrationComplete", () => {
  sessionStart = performance.now();
});

window.addEventListener("paymentCompleted", () => {
  sessionEnd = performance.now();

  console.log("Phase 5: Payment completed, generating heatmaps and metrics");

  renderCharts();
  exportCSV();
});

// -------------------------------
// Track first tooltip/help display
// -------------------------------
window.addEventListener("confusionDetected", () => {
  if (!firstHelpTimestamp) {
    firstHelpTimestamp = performance.now();
  }
});

// -------------------------------
// Compute normalized dwell
// -------------------------------
function getSessionDuration() {
  return sessionEnd && sessionStart ? sessionEnd - sessionStart : 1;
}

function normalize(value) {
  return Math.round((value / getSessionDuration()) * 1000) / 1000;
}

// -------------------------------
// Compute conversion & help metrics
// -------------------------------
function computeMetrics() {
  const totalTime = sessionEnd - sessionStart;
  const firstHelpTime = firstHelpTimestamp || sessionEnd;
  const beforeHelpTime = firstHelpTime - sessionStart;
  const afterHelpTime = sessionEnd - firstHelpTime;

  const confusionEvents = zones.filter((z) => z.confusion).length;
  const avgPaymentTime = totalTime; // single user; can extend for multi-user

  const beforeAfterRate = firstHelpTime
    ? ((beforeHelpTime / totalTime) * 100).toFixed(1)
    : 0;

  return {
    totalTime: Math.round(totalTime),
    beforeHelpTime: Math.round(beforeHelpTime),
    afterHelpTime: Math.round(afterHelpTime),
    confusionEvents,
    avgPaymentTime: Math.round(avgPaymentTime),
    beforeAfterRate,
  };
}

// -------------------------------
// Render separate charts
// -------------------------------
function renderCharts() {
  const labels = zones.map((z) => z.id);
  const dwellBefore = zones.map((z) => Math.round(z.dwellBeforeHelp));
  const dwellAfter = zones.map((z) => Math.round(z.dwellAfterHelp));
  const revisits = zones.map((z) => z.revisitCount);

  // Destroy old charts
  if (heatmapDwell) heatmapDwell.destroy();
  if (heatmapRevisits) heatmapRevisits.destroy();

  // Dwell chart
  heatmapDwell = new Chart(
    document.getElementById("heatmapChartDwell").getContext("2d"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Dwell Before Help (ms)",
            data: dwellBefore,
            backgroundColor: "rgba(255,99,132,0.5)",
          },
          {
            label: "Dwell After Help (ms)",
            data: dwellAfter,
            backgroundColor: "rgba(54,162,235,0.5)",
          },
        ],
      },
      options: {
        plugins: { title: { display: true, text: "Zone Dwell Times" } },
      },
    }
  );

  // Revisits chart
  heatmapRevisits = new Chart(
    document.getElementById("heatmapChartRevisits").getContext("2d"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Revisits",
            data: revisits,
            backgroundColor: "rgba(255,206,86,0.5)",
          },
        ],
      },
      options: { plugins: { title: { display: true, text: "Zone Revisits" } } },
    }
  );
}

// -------------------------------
// Export CSV including metrics
// -------------------------------
function exportCSV() {
  const rows = [
    [
      "Zone",
      "Dwell Before Help",
      "Dwell After Help",
      "Revisits",
      "User Response",
    ],
  ];
  zones.forEach((z) => {
    rows.push([
      z.id,
      z.dwellBeforeHelp,
      z.dwellAfterHelp,
      z.revisitCount,
      z.userResponse || "",
    ]);
  });

  const metrics = computeMetrics();
  rows.push([]);
  rows.push(["Experiment Metrics"]);
  rows.push(["Total Time (ms)", metrics.totalTime]);
  rows.push(["Time Before Help (ms)", metrics.beforeHelpTime]);
  rows.push(["Time After Help (ms)", metrics.afterHelpTime]);
  rows.push(["Confusion Events", metrics.confusionEvents]);
  rows.push(["Average Payment Time (ms)", metrics.avgPaymentTime]);
  rows.push(["Before/After Help %", metrics.beforeAfterRate]);

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "eye_tracking_metrics.csv";
  a.click();

  console.log("Phase 5: CSV exported");
}
