const menuLinks = document.querySelectorAll(".main-nav a");
const currentPage = window.location.pathname.split("/").pop() || "index.html";

menuLinks.forEach((link) => {
  const linkPage = link.getAttribute("href")?.replace("./", "");

  if (linkPage === currentPage) {
    menuLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  }
});

const helpBtn = document.getElementById("help-btn");
const feedbackBtn = document.getElementById("feedback-btn");

helpBtn?.addEventListener("click", () => {
  window.alert(
    "Help is coming soon.\n\nFor now, use the About page for context and the Search bar to explore topics."
  );
});

feedbackBtn?.addEventListener("click", () => {
  const subject = encodeURIComponent("Gender Data Portal feedback");
  const body = encodeURIComponent(
    "Hi,\n\nI have feedback about the Gender Data Portal:\n\n- \n\nThanks!"
  );
  window.location.href = `mailto:feedback@example.com?subject=${subject}&body=${body}`;
});

const eduToggle = document.querySelector(".card-toggle[data-open-edu='true']");
const eduAnchor = document.getElementById("edu-detail-anchor");
let eduMapRendered = false;
let eduMapEl = null;

function renderEduMap() {
  if (eduMapRendered) return;
  if (!window.Plotly || !eduMapEl) return;

  const locations = [
    "Turkey",
    "Germany",
    "France",
    "United States",
    "India",
    "China",
    "Brazil",
    "Angola",
    "Mali",
    "Chad",
  ];
  const scores = [0.986, 0.988, 1.0, 1.0, 0.971, 0.936, 1.0, 0.806, 0.796, 0.666];

  const data = [
    {
      type: "choropleth",
      locations,
      locationmode: "country names",
      z: scores,
      // Palette aligned to the site's purple/pink UI (low → light, high → dark).
      autocolorscale: false,
      reversescale: false,
      colorscale: [
        [0.0, "#fde7f1"],
        [0.25, "#f3bfd7"],
        [0.5, "#d77aa9"],
        [0.75, "#a63a73"],
        [1.0, "#6a0f3c"],
      ],
      zmin: 0.6,
      zmax: 1.0,
      marker: { line: { color: "rgba(255,255,255,0.85)", width: 0.7 } },
      colorbar: {
        title: "Score",
        tickcolor: "rgba(106, 15, 60, 0.85)",
        tickfont: { color: "rgba(106, 15, 60, 0.9)" },
        titlefont: { color: "rgba(106, 15, 60, 0.95)" },
        outlinecolor: "rgba(106, 15, 60, 0.25)",
        bgcolor: "rgba(253, 231, 241, 0.72)",
      },
    },
  ];

  const layout = {
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    geo: {
      showframe: false,
      showcoastlines: false,
      bgcolor: "rgba(0,0,0,0)",
      landcolor: "rgba(253, 231, 241, 0.52)",
      oceancolor: "rgba(106, 15, 60, 0.06)",
      showocean: true,
      lakecolor: "rgba(106, 15, 60, 0.06)",
      showlakes: true,
    },
  };

  window.Plotly.newPlot(eduMapEl, data, layout, { displayModeBar: false, responsive: true });
  eduMapRendered = true;
}

function ensureEduDetailCard() {
  if (!eduAnchor) return null;
  const existing = document.getElementById("edu-detail-card");
  if (existing) return existing;

  const card = document.createElement("article");
  card.className = "detail-card";
  card.id = "edu-detail-card";
  card.innerHTML = `
    <div class="detail-card-header">
      <h3>Access to education</h3>
      <button type="button" class="detail-close" aria-label="Close">×</button>
    </div>
    <p class="detail-lead">
      According to the World Economic Forum’s 2025 Global Gender Gap Report,
      gender equality in the educational participation sub-index has reached an
      advanced level globally. This index measures gender-based disparities in
      literacy rates and access to primary, secondary and tertiary education;
      the global average of 0.951 indicates that the gender gap in education has
      largely closed.
    </p>
    <p class="detail-lead">
      However, disparities between countries persist. Türkiye ranks 92nd with a
      score of 0.986 and is positioned close to the high-performing group. In
      contrast, inequality is more pronounced in countries, particularly in the
      Sub-Saharan Africa region.
    </p>
    <div class="map-wrap" role="region" aria-label="Education map">
      <div class="map-container">
        <div id="edu-map" class="plotly-map"></div>
      </div>
    </div>
  `;

  eduAnchor.appendChild(card);
  eduMapEl = card.querySelector("#edu-map");

  const closeBtn = card.querySelector(".detail-close");
  closeBtn?.addEventListener("click", () => removeEduDetailCard());

  return card;
}

function removeEduDetailCard() {
  const existing = document.getElementById("edu-detail-card");
  if (existing) existing.remove();
  eduMapRendered = false;
  eduMapEl = null;
  eduToggle?.setAttribute("aria-expanded", "false");
}

function toggleEduDetail() {
  if (!eduToggle) return;
  const existing = document.getElementById("edu-detail-card");
  const isOpen = Boolean(existing);

  if (isOpen) {
    removeEduDetailCard();
    return;
  }

  eduToggle.setAttribute("aria-expanded", "true");
  const card = ensureEduDetailCard();
  if (!card) return;

  renderEduMap();
  setTimeout(() => window.Plotly?.Plots?.resize?.(eduMapEl), 50);
  card.scrollIntoView({ behavior: "smooth", block: "start" });
}

eduToggle?.addEventListener("click", toggleEduDetail);

window.addEventListener("resize", () => {
  if (!eduMapRendered) return;
  window.Plotly?.Plots?.resize?.(eduMapEl);
});

(function initCardLogoBackgroundRemoval() {
  // Disabled: image background removal can degrade illustration quality.
  return;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function rgbDist(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  async function removeGradientBackground(img, { tolerance = 34 } = {}) {
    if (!(img instanceof HTMLImageElement)) return;
    if (!img.complete) {
      await new Promise((resolve) => img.addEventListener("load", resolve, { once: true }));
    }

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;

    const idx = (x, y) => (y * w + x) * 4;
    const tl = idx(0, 0);
    const bl = idx(0, h - 1);
    const tr = idx(w - 1, 0);
    const br = idx(w - 1, h - 1);

    const bgTop = {
      r: Math.round((d[tl] + d[tr]) / 2),
      g: Math.round((d[tl + 1] + d[tr + 1]) / 2),
      b: Math.round((d[tl + 2] + d[tr + 2]) / 2),
    };
    const bgBottom = {
      r: Math.round((d[bl] + d[br]) / 2),
      g: Math.round((d[bl + 1] + d[br + 1]) / 2),
      b: Math.round((d[bl + 2] + d[br + 2]) / 2),
    };

    for (let y = 0; y < h; y += 1) {
      const t = h <= 1 ? 0 : clamp01(y / (h - 1));
      const br0 = Math.round(lerp(bgTop.r, bgBottom.r, t));
      const bg0 = Math.round(lerp(bgTop.g, bgBottom.g, t));
      const bb0 = Math.round(lerp(bgTop.b, bgBottom.b, t));

      for (let x = 0; x < w; x += 1) {
        const p = idx(x, y);
        const r = d[p];
        const g = d[p + 1];
        const b = d[p + 2];
        const a = d[p + 3];
        if (a === 0) continue;

        if (rgbDist(r, g, b, br0, bg0, bb0) <= tolerance) {
          d[p + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    img.src = canvas.toDataURL("image/png");
  }

  targets.forEach((img) => {
    // Keep the whole logo visible (no crop), while removing embedded gradient bg.
    removeGradientBackground(img, { tolerance: 34 }).catch(() => {});
  });
})();

(function initAboutPage() {
  const panel = document.getElementById("about-panel");
  const visionP = document.getElementById("about-panel-vision");
  const missionP = document.getElementById("about-panel-mission");
  const buttons = document.querySelectorAll(".about-card[data-about]");
  if (!panel || !visionP || !missionP || buttons.length === 0) return;

  const blocks = { vision: visionP, mission: missionP };
  let active = null;

  function syncUi() {
    buttons.forEach((btn) => {
      const key = btn.dataset.about;
      const on = key === active;
      btn.setAttribute("aria-expanded", on ? "true" : "false");
      btn.classList.toggle("is-active", on);
    });

    if (!active) {
      panel.setAttribute("hidden", "");
      visionP.setAttribute("hidden", "");
      missionP.setAttribute("hidden", "");
      return;
    }

    panel.removeAttribute("hidden");
    Object.entries(blocks).forEach(([k, el]) => {
      if (k === active) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.about;
      if (!key || !(key in blocks)) return;
      active = active === key ? null : key;
      syncUi();
    });
  });
})();
