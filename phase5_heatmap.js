// ===============================
// Phase 5: Heatmap & Metrics Display
// ===============================

let heatmapDwell = null;
let heatmapRevisits = null;
let sessionStart = null;
let sessionEnd = null;

// Metrics container
const metricsContainer = document.createElement("div");
metricsContainer.style.maxWidth = "600px";
metricsContainer.style.margin = "10px auto";
document.body.appendChild(metricsContainer);

// Track session start
window.addEventListener("calibrationComplete", () => {
  sessionStart = performance.now();
});

window.addEventListener("paymentCompleted", () => {
  sessionEnd = performance.now();
  console.log("Rendering charts and metrics");
  renderCharts();
  renderMetricsTable();
});

// Helper: ms → s
function msToSec(ms) {
  return (ms / 1000).toFixed(1);
}

// Render charts
function renderCharts() {
  const labels = zones.map((z) => z.id);
  const dwellBefore = zones.map((z) => msToSec(z.dwellBeforeHelp));
  const dwellAfter = zones.map((z) => msToSec(z.dwellAfterHelp));
  const revisits = zones.map((z) => z.revisitCount);

  if (heatmapDwell) heatmapDwell.destroy();
  if (heatmapRevisits) heatmapRevisits.destroy();

  heatmapDwell = new Chart(
    document.getElementById("heatmapChartDwell").getContext("2d"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Before Help (s)",
            data: dwellBefore,
            backgroundColor: "rgba(255,99,132,0.5)",
          },
          {
            label: "After Help (s)",
            data: dwellAfter,
            backgroundColor: "rgba(54,162,235,0.5)",
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Zone Dwell Times",
          },
        },
      },
    }
  );

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
      options: {
        plugins: {
          title: {
            display: true,
            text: "Zone Revisits",
          },
        },
      },
    }
  );
}

// Render metrics table
function renderMetricsTable() {
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.innerHTML = `
    <tr style="background:#2f80ed;color:white">
      <th style="padding:5px;border:1px solid #ccc">Zone</th>
      <th style="padding:5px;border:1px solid #ccc">Dwell Before Help (s)</th>
      <th style="padding:5px;border:1px solid #ccc">Dwell After Help (s)</th>
      <th style="padding:5px;border:1px solid #ccc">Revisits</th>
      <th style="padding:5px;border:1px solid #ccc">User Response</th>
    </tr>
  `;

  zones.forEach((z) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="padding:5px;border:1px solid #ccc">${z.id}</td>
      <td style="padding:5px;border:1px solid #ccc">${msToSec(
        z.dwellBeforeHelp
      )}</td>
      <td style="padding:5px;border:1px solid #ccc">${msToSec(
        z.dwellAfterHelp
      )}</td>
      <td style="padding:5px;border:1px solid #ccc">${z.revisitCount}</td>
      <td style="padding:5px;border:1px solid #ccc">${
        z.userResponse || "-"
      }</td>
    `;
    table.appendChild(row);
  });

  metricsContainer.innerHTML = "";
  metricsContainer.appendChild(table);
}
