/* cosmic-hud.js — Cosmic HUD Web Components (vanilla, zero deps, shadow DOM).
   Pairs with cosmic-hud.css (:root tokens pierce the shadow boundary).
   Components: <hud-starfield> <hud-panel> <hud-gauge> <hud-graph>
               <hud-heatmap> <hud-stat>
   Data shape for graphs/sparklines: [{"t": epochSeconds, "v": number}, ...]
   (matches matrix /api/history). */

(() => {
  "use strict";

  const css = String.raw;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const cvar = (el, name, fb) =>
    (getComputedStyle(el).getPropertyValue(name) || "").trim() || fb;

  const ACCENTS = {
    cyan:    { c: "--hud-cyan",   glow: "rgba(34,211,238,.55)" },
    violet:  { c: "--hud-violet", glow: "rgba(139,92,246,.55)" },
    magenta: { c: "--hud-brand",  glow: "rgba(192,38,211,.55)" },
    ok:      { c: "--hud-ok",     glow: "rgba(52,211,153,.5)"  },
    warn:    { c: "--hud-warn",   glow: "rgba(251,191,36,.5)"  },
    crit:    { c: "--hud-crit",   glow: "rgba(251,113,133,.55)"},
  };
  const accentOf = (el) => ACCENTS[el.getAttribute("accent") || "cyan"] || ACCENTS.cyan;

  /* ============================ <hud-starfield> ========================== */
  class HudStarfield extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>
        :host{position:fixed;inset:0;z-index:0;pointer-events:none;display:block}
        canvas{width:100%;height:100%;display:block}
      </style><canvas></canvas>`;
      this._cv = root.querySelector("canvas");
      this._stars = [];
      this._resize = this._resize.bind(this);
      addEventListener("resize", this._resize);
      this._resize();
      this._tick = this._tick.bind(this);
      this._raf = requestAnimationFrame(this._tick);
    }
    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      removeEventListener("resize", this._resize);
    }
    _resize() {
      const d = Math.min(devicePixelRatio || 1, 2);
      this._cv.width = innerWidth * d;
      this._cv.height = innerHeight * d;
      this._d = d;
      const density = +this.getAttribute("density") || 140;
      this._stars = Array.from({ length: density }, () => ({
        x: Math.random() * this._cv.width,
        y: Math.random() * this._cv.height,
        r: (Math.random() * 1.1 + 0.25) * d,
        z: Math.random() * 0.6 + 0.2,           // parallax depth
        tw: Math.random() * Math.PI * 2,         // twinkle phase
        cyan: Math.random() < 0.22,
      }));
    }
    _tick(ts) {
      const cx = this._cv.getContext("2d");
      const { width: w, height: h } = this._cv;
      cx.clearRect(0, 0, w, h);
      for (const s of this._stars) {
        s.x -= s.z * 0.06 * this._d;            // slow drift
        if (s.x < -2) s.x = w + 2;
        const a = 0.35 + 0.45 * Math.abs(Math.sin(ts / 1600 + s.tw));
        cx.beginPath();
        cx.arc(s.x, s.y, s.r, 0, 7);
        cx.fillStyle = s.cyan
          ? `rgba(103,232,249,${a})`
          : `rgba(242,240,251,${a * 0.8})`;
        cx.shadowBlur = s.cyan ? 6 * this._d : 0;
        cx.shadowColor = "rgba(34,211,238,.8)";
        cx.fill();
        cx.shadowBlur = 0;
      }
      this._raf = requestAnimationFrame(this._tick);
    }
  }

  /* ============================== <hud-panel> ============================ */
  class HudPanel extends HTMLElement {
    connectedCallback() {
      const a = accentOf(this);
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${css`
        :host{display:block;position:relative}
        .p{
          position:relative;
          background:
            linear-gradient(160deg, var(--hud-glass-fill-2), var(--hud-glass-fill) 45%),
            var(--hud-panel);
          backdrop-filter: blur(var(--hud-glass-blur)) saturate(140%);
          -webkit-backdrop-filter: blur(var(--hud-glass-blur)) saturate(140%);
          border:1px solid var(--hud-glass-stroke);
          border-radius: var(--hud-radius);
          box-shadow: 0 0 0 1px rgba(34,211,238,.05) inset,
                      0 8px 40px rgba(0,0,0,.55),
                      0 0 24px rgba(124,58,237,.14);
          padding:18px 20px 20px;
          overflow:hidden;
        }
        .p::before{ /* glass top hairline */
          content:"";position:absolute;top:0;left:8%;right:8%;height:1px;
          background:linear-gradient(90deg,transparent,rgba(103,232,249,.45),transparent);
        }
        .corner{position:absolute;width:14px;height:14px;pointer-events:none;opacity:.8}
        .corner i{position:absolute;background:var(${a.c})}
        .corner i.h{width:14px;height:1.5px}.corner i.v{width:1.5px;height:14px}
        .tl{top:7px;left:7px}.tr{top:7px;right:7px;transform:scaleX(-1)}
        .bl{bottom:7px;left:7px;transform:scaleY(-1)}.br{right:7px;bottom:7px;transform:scale(-1)}
        header{display:flex;align-items:center;gap:10px;margin-bottom:14px}
        .dot{width:7px;height:7px;border-radius:50%;background:var(${a.c});
             box-shadow:0 0 10px var(${a.c})}
        h3{margin:0;font:600 11px/1 var(--hud-display);letter-spacing:.22em;
           text-transform:uppercase;color:var(--hud-txt-dim)}
        .rule{flex:1;height:1px;background:linear-gradient(90deg,var(--hud-glass-stroke),transparent)}
      `}</style>
      <div class="p">
        <span class="corner tl"><i class="h"></i><i class="v"></i></span>
        <span class="corner tr"><i class="h"></i><i class="v"></i></span>
        <span class="corner bl"><i class="h"></i><i class="v"></i></span>
        <span class="corner br"><i class="h"></i><i class="v"></i></span>
        <header part="header">
          <span class="dot"></span><h3>${this.getAttribute("title") || ""}</h3><span class="rule"></span>
        </header>
        <slot></slot>
      </div>`;
    }
  }

  /* ============================== <hud-gauge> ============================ */
  class HudGauge extends HTMLElement {
    static get observedAttributes() { return ["value"]; }
    connectedCallback() {
      this._min = +(this.getAttribute("min") ?? 0);
      this._max = +(this.getAttribute("max") ?? 100);
      const size = +(this.getAttribute("size") ?? 150);
      const a = accentOf(this);
      const root = this.attachShadow({ mode: "open" });
      const R = 62, CIRC = 2 * Math.PI * R;
      root.innerHTML = `<style>${css`
        :host{display:inline-block}
        .wrap{position:relative;width:${size}px;height:${size}px}
        svg{width:100%;height:100%;transform:rotate(135deg)}
        .track{fill:none;stroke:rgba(255,255,255,.07);stroke-width:9;stroke-linecap:round}
        .ticks{fill:none;stroke:rgba(183,177,210,.18);stroke-width:2;stroke-dasharray:1 10.1}
        .arc{fill:none;stroke:url(#g);stroke-width:9;stroke-linecap:round;
             filter:drop-shadow(0 0 6px ${a.glow});
             transition:stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)}
        .tip{fill:#fff;filter:drop-shadow(0 0 6px var(${a.c}))}
        .center{position:absolute;inset:0;display:flex;flex-direction:column;
                align-items:center;justify-content:center;gap:2px}
        .val{font:700 ${Math.round(size * 0.19)}px/1 var(--hud-mono);
             font-variant-numeric:tabular-nums;color:var(--hud-txt);
             text-shadow:var(--hud-glow-text)}
        .val small{font-size:.55em;color:var(--hud-txt-dim);font-weight:600}
        .lbl{font:600 9px/1 var(--hud-display);letter-spacing:.2em;
             text-transform:uppercase;color:var(--hud-txt-faint)}
      `}</style>
      <div class="wrap">
        <svg viewBox="0 0 150 150">
          <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stop-color="${cvar(this, "--hud-cyan", "#22d3ee")}"/>
            <stop offset="55%" stop-color="${cvar(this, "--hud-violet", "#8b5cf6")}"/>
            <stop offset="100%" stop-color="${cvar(this, "--hud-brand", "#c026d3")}"/>
          </linearGradient></defs>
          <circle class="ticks" cx="75" cy="75" r="70"/>
          <circle class="track" cx="75" cy="75" r="${R}"
                  stroke-dasharray="${CIRC * 0.75} ${CIRC}"/>
          <circle class="arc" cx="75" cy="75" r="${R}"
                  stroke-dasharray="${CIRC * 0.75} ${CIRC}"
                  stroke-dashoffset="${CIRC * 0.75}"/>
          <circle class="tip" r="4.5" cx="75" cy="75" opacity="0"/>
        </svg>
        <div class="center">
          <div class="val"><span id="v">–</span><small>${this.getAttribute("unit") || ""}</small></div>
          <div class="lbl">${this.getAttribute("label") || ""}</div>
        </div>
      </div>`;
      this._R = R; this._CIRC = CIRC;
      this._render(+this.getAttribute("value") || 0);
    }
    attributeChangedCallback(_, __, nv) { if (this.shadowRoot) this._render(+nv || 0); }
    _render(val) {
      const root = this.shadowRoot;
      const frac = clamp((val - this._min) / (this._max - this._min || 1), 0, 1);
      const span = this._CIRC * 0.75;
      root.querySelector(".arc").style.strokeDashoffset = String(span * (1 - frac));
      const ang = (135 + 270 * frac) * Math.PI / 180;
      const tip = root.querySelector(".tip");
      // svg is pre-rotated 135deg, so compute in unrotated space then rotate back
      const a0 = 270 * frac * Math.PI / 180;
      tip.setAttribute("cx", String(75 + this._R * Math.cos(a0)));
      tip.setAttribute("cy", String(75 + this._R * Math.sin(a0)));
      tip.setAttribute("opacity", frac > 0.01 ? "1" : "0");
      root.getElementById("v").textContent =
        Number.isInteger(val) ? String(val) : val.toFixed(1);
      const sem = this.getAttribute("semantic");
      if (sem === "auto") {
        const w = +(this.getAttribute("warn") ?? 75), c = +(this.getAttribute("crit") ?? 90);
        const col = val >= c ? "var(--hud-crit)" : val >= w ? "var(--hud-warn)" : "var(--hud-txt)";
        root.querySelector(".val").style.color = col;
      }
    }
  }

  /* ============================== <hud-graph> ============================ */
  class HudGraph extends HTMLElement {
    connectedCallback() {
      const h = +(this.getAttribute("height") || 120);
      const a = accentOf(this);
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${css`
        :host{display:block}
        .box{position:relative;height:${h}px}
        canvas{width:100%;height:100%;display:block}
        .cap{display:flex;justify-content:space-between;margin-top:6px;
             font:500 10px/1 var(--hud-mono);color:var(--hud-txt-faint)}
        .now{color:var(${a.c});text-shadow:0 0 8px ${a.glow};
             font-weight:700;font-variant-numeric:tabular-nums}
      `}</style>
      <div class="box"><canvas></canvas></div>
      <div class="cap"><span id="range"></span><span class="now" id="now"></span></div>`;
      this._cv = root.querySelector("canvas");
      this._accent = a;
      const attr = this.getAttribute("points");
      if (attr) { try { this.data = JSON.parse(attr); } catch { this.data = []; } }
      const src = this.getAttribute("src");
      if (src) this._poll(src, +(this.getAttribute("refresh") || 0));
      this._ro = new ResizeObserver(() => this._draw(1));
      this._ro.observe(this._cv);
      if (this.data) this._animate();
    }
    disconnectedCallback() { this._ro?.disconnect(); clearInterval(this._iv); }
    set data(pts) { this._pts = (pts || []).filter(p => Number.isFinite(+p.v)); }
    get data() { return this._pts; }
    async _poll(src, refresh) {
      const load = async () => {
        try {
          const r = await fetch(src); const j = await r.json();
          this.data = j.points || j; this._animate();
        } catch { /* offline demo — keep whatever we have */ }
      };
      await load();
      if (refresh > 0) this._iv = setInterval(load, refresh * 1000);
    }
    _animate() {
      const t0 = performance.now(), DUR = 700;
      const step = (t) => {
        const k = clamp((t - t0) / DUR, 0, 1);
        this._draw(1 - Math.pow(1 - k, 3));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    _draw(prog = 1) {
      const cv = this._cv, cx = cv.getContext("2d");
      const d = Math.min(devicePixelRatio || 1, 2);
      const W = cv.clientWidth * d, H = cv.clientHeight * d;
      if (cv.width !== W) cv.width = W;
      if (cv.height !== H) cv.height = H;
      cx.clearRect(0, 0, W, H);
      const pts = this._pts || [];
      // grid
      cx.strokeStyle = "rgba(183,177,210,.10)"; cx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = (H / 4) * i;
        cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke();
      }
      if (pts.length < 2) return;
      const vs = pts.map(p => +p.v);
      let lo = Math.min(...vs), hi = Math.max(...vs);
      if (this.hasAttribute("min")) lo = +this.getAttribute("min");
      if (this.hasAttribute("max")) hi = +this.getAttribute("max");
      if (hi === lo) hi = lo + 1;
      const pad = H * 0.10;
      const X = i => (i / (pts.length - 1)) * W;
      const Y = v => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2);
      const n = Math.max(2, Math.floor(pts.length * prog));
      const color = cvar(this, this._accent.c, "#22d3ee");
      // area fill
      cx.beginPath(); cx.moveTo(X(0), Y(vs[0]));
      for (let i = 1; i < n; i++) cx.lineTo(X(i), Y(vs[i]));
      cx.lineTo(X(n - 1), H); cx.lineTo(0, H); cx.closePath();
      const g = cx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, color + "33"); g.addColorStop(1, color + "00");
      cx.fillStyle = g; cx.fill();
      // neon line
      cx.beginPath(); cx.moveTo(X(0), Y(vs[0]));
      for (let i = 1; i < n; i++) cx.lineTo(X(i), Y(vs[i]));
      cx.strokeStyle = color; cx.lineWidth = 2 * d;
      cx.shadowBlur = 10 * d; cx.shadowColor = color;
      cx.stroke(); cx.shadowBlur = 0;
      // live dot
      const lx = X(n - 1), ly = Y(vs[n - 1]);
      cx.beginPath(); cx.arc(lx, ly, 3.5 * d, 0, 7);
      cx.fillStyle = "#fff"; cx.shadowBlur = 12 * d; cx.shadowColor = color;
      cx.fill(); cx.shadowBlur = 0;
      // captions
      const unit = this.getAttribute("unit") || "";
      this.shadowRoot.getElementById("now").textContent =
        `${vs[vs.length - 1].toFixed(1)}${unit}`;
      const spanS = pts[pts.length - 1].t - pts[0].t;
      const rng = spanS >= 86000 ? `${Math.round(spanS / 3600)}h` :
                  spanS >= 3500 ? `${Math.round(spanS / 3600)}h` :
                  `${Math.round(spanS / 60)}m`;
      this.shadowRoot.getElementById("range").textContent =
        `${this.getAttribute("label") || ""} · ${rng}`;
    }
  }

  /* ============================= <hud-heatmap> =========================== */
  class HudHeatmap extends HTMLElement {
    connectedCallback() {
      const cols = +(this.getAttribute("cols") || 12);
      let vals = [];
      try { vals = JSON.parse(this.getAttribute("values") || "[]"); } catch {}
      const root = this.attachShadow({ mode: "open" });
      const lo = Math.min(...vals, 0), hi = Math.max(...vals, 1);
      const ramp = (f) => {
        // 0 -> deep violet-black, .5 -> purple, 1 -> cyan glow
        const stops = [
          [10, 6, 32], [76, 29, 149], [124, 58, 237], [34, 211, 238], [165, 243, 252],
        ];
        const x = clamp(f, 0, 1) * (stops.length - 1);
        const i = Math.min(Math.floor(x), stops.length - 2), k = x - i;
        const c = stops[i].map((s, j) => Math.round(s + (stops[i + 1][j] - s) * k));
        return `rgb(${c[0]},${c[1]},${c[2]})`;
      };
      root.innerHTML = `<style>${css`
        :host{display:block}
        .g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px}
        .c{aspect-ratio:1;border-radius:4px;position:relative;cursor:default;
           transition:transform .15s}
        .c:hover{transform:scale(1.25);z-index:2;outline:1px solid rgba(103,232,249,.6)}
        .c[title]{}
      `}</style>
      <div class="g">${vals.map((v, i) => {
        const f = (v - lo) / (hi - lo || 1);
        const glow = f > 0.55 ? `box-shadow:0 0 ${4 + f * 10}px ${ramp(f)};` : "";
        return `<span class="c" title="${v}" style="background:${ramp(f)};${glow}"></span>`;
      }).join("")}</div>`;
    }
  }

  /* =============================== <hud-stat> ============================ */
  class HudStat extends HTMLElement {
    connectedCallback() {
      const a = accentOf(this);
      const delta = this.getAttribute("delta");
      const dNum = parseFloat(delta);
      const dCls = !delta ? "" : dNum > 0 ? "up" : dNum < 0 ? "down" : "flat";
      let spark = [];
      try { spark = JSON.parse(this.getAttribute("points") || "[]"); } catch {}
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${css`
        :host{display:block}
        .t{position:relative;padding:2px 0 0}
        .lbl{font:600 9px/1 var(--hud-display);letter-spacing:.22em;
             text-transform:uppercase;color:var(--hud-txt-faint);margin-bottom:8px}
        .row{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
        .val{font:700 30px/1 var(--hud-mono);font-variant-numeric:tabular-nums;
             color:var(--hud-txt);text-shadow:var(--hud-glow-text)}
        .unit{font:600 12px/1 var(--hud-mono);color:var(--hud-txt-dim)}
        .chip{font:700 10px/1 var(--hud-mono);padding:3px 7px;border-radius:99px}
        .up{color:var(--hud-ok);background:rgba(52,211,153,.12);
            box-shadow:0 0 10px rgba(52,211,153,.25)}
        .down{color:var(--hud-crit);background:rgba(251,113,133,.12);
              box-shadow:0 0 10px rgba(251,113,133,.25)}
        .flat{color:var(--hud-txt-dim);background:rgba(255,255,255,.06)}
        .bar{height:2px;margin-top:12px;border-radius:2px;
             background:linear-gradient(90deg,var(${a.c}),transparent);
             box-shadow:0 0 8px ${a.glow}}
        canvas{position:absolute;right:0;top:14px;width:84px;height:30px;opacity:.9}
      `}</style>
      <div class="t">
        <div class="lbl">${this.getAttribute("label") || ""}</div>
        <div class="row">
          <span class="val">${this.getAttribute("value") ?? "–"}</span>
          <span class="unit">${this.getAttribute("unit") || ""}</span>
          ${delta ? `<span class="chip ${dCls}">${dNum > 0 ? "▲" : dNum < 0 ? "▼" : "•"} ${delta}</span>` : ""}
        </div>
        ${spark.length > 1 ? `<canvas></canvas>` : ""}
        <div class="bar"></div>
      </div>`;
      if (spark.length > 1) {
        const cv = root.querySelector("canvas"), cx = cv.getContext("2d");
        const d = 2; cv.width = 84 * d; cv.height = 30 * d;
        const vs = spark.map(p => +(p.v ?? p));
        const lo = Math.min(...vs), hi = Math.max(...vs) || 1;
        const color = cvar(this, a.c, "#22d3ee");
        cx.beginPath();
        vs.forEach((v, i) => {
          const x = (i / (vs.length - 1)) * cv.width;
          const y = cv.height - 3 - ((v - lo) / (hi - lo || 1)) * (cv.height - 6);
          i ? cx.lineTo(x, y) : cx.moveTo(x, y);
        });
        cx.strokeStyle = color; cx.lineWidth = 1.6 * d;
        cx.shadowBlur = 6 * d; cx.shadowColor = color; cx.stroke();
      }
    }
  }

  customElements.define("hud-starfield", HudStarfield);
  customElements.define("hud-panel", HudPanel);
  customElements.define("hud-gauge", HudGauge);
  customElements.define("hud-graph", HudGraph);
  customElements.define("hud-heatmap", HudHeatmap);
  customElements.define("hud-stat", HudStat);
})();
