// ===============================
// Phase 5: Heatmap & Analytics
// ===============================

let heatmapChart = null;
let sessionStart = null;
let sessionEnd = null;
let firstHelpTimestamp = null;

// -------------------------------
// Track session start / end
// -------------------------------
window.addEventListener("calibrationComplete", () => {
  sessionStart = performance.now();
});

window.addEventListener("paymentCompleted", () => {
  sessionEnd = performance.now();

  console.log("Phase 5: Payment completed, generating heatmap");
  renderHeatmap();
  exportCSV();
});

// -------------------------------
// Track first help timestamp
// -------------------------------
window.addEventListener("confusionDetected", (e) => {
  if (!firstHelpTimestamp) {
    firstHelpTimestamp = performance.now();
  }
});

// -------------------------------
// Normalize dwell by session duration
// -------------------------------
function getSessionDuration() {
  return sessionEnd && sessionStart ? sessionEnd - sessionStart : 1;
}

function normalize(value) {
  return Math.round((value / getSessionDuration()) * 1000) / 1000;
}

// -------------------------------
// Render Chart.js heatmap
// -------------------------------
function renderHeatmap() {
  const labels = zones.map((z) => z.id);
  const dwellBeforeHelp = zones.map((z) => Math.round(z.dwellBeforeHelp || 0));
  const dwellAfterHelp = zones.map((z) => Math.round(z.dwellAfterHelp || 0));
  const revisits = zones.map((z) => z.revisitCount);

  const canvas = document.getElementById("heatmapChart");
  const ctx = canvas.getContext("2d");

  if (heatmapChart) heatmapChart.destroy();

  heatmapChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Dwell Before Tooltip (ms)",
          data: dwellBeforeHelp,
          backgroundColor: "rgba(255,99,132,0.5)",
        },
        {
          label: "Dwell After Tooltip (ms)",
          data: dwellAfterHelp,
          backgroundColor: "rgba(54,162,235,0.5)",
        },
        {
          label: "Revisits",
          data: revisits,
          backgroundColor: "rgba(255,206,86,0.5)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "User Attention Before vs After Assistance",
        },
      },
    },
  });
}

// -------------------------------
// Compute conversion metrics
// -------------------------------
function getConversionMetrics() {
  const totalTime = sessionEnd - sessionStart;
  const timeBeforeHelp = firstHelpTimestamp
    ? firstHelpTimestamp - sessionStart
    : totalTime;
  const timeAfterHelp = firstHelpTimestamp
    ? sessionEnd - firstHelpTimestamp
    : 0;

  return {
    totalTime: Math.round(totalTime),
    beforeHelp: Math.round(timeBeforeHelp),
    afterHelp: Math.round(timeAfterHelp),
    reductionPct: firstHelpTimestamp
      ? Math.round((timeAfterHelp / totalTime) * 100)
      : 0,
  };
}

// -------------------------------
// Export CSV report
// -------------------------------
function exportCSV() {
  const rows = [
    [
      "Zone",
      "Total Dwell (ms)",
      "Dwell Before Help (ms)",
      "Dwell After Help (ms)",
      "Normalized Total",
      "Revisits",
    ],
  ];

  zones.forEach((z) => {
    rows.push([
      z.id,
      Math.round(z.totalDwell),
      Math.round(z.dwellBeforeHelp),
      Math.round(z.dwellAfterHelp),
      normalize(z.totalDwell),
      z.revisitCount,
    ]);
  });

  const metrics = getConversionMetrics();
  rows.push([]);
  rows.push(["Conversion Metrics"]);
  rows.push(["Total Time (ms)", metrics.totalTime]);
  rows.push(["Before Help (ms)", metrics.beforeHelp]);
  rows.push(["After Help (ms)", metrics.afterHelp]);
  rows.push(["After Help %", metrics.reductionPct]);

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "eye_tracking_metrics.csv";
  a.click();

  console.log("Phase 5: CSV exported");
}
