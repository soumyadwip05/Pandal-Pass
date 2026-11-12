/* ==========================================================
   PandalPass — data, itinerary engine and page wiring.
   No styles here: all visuals live in style.css.
   Each page sets <body data-page="..."> and runs its init.
   ========================================================== */
(function () {
  "use strict";

  /* ---------- Sample data (planning estimates, not live) ---------- */
  var PANDALS = [
    { id: 1, name: "Tala Park Pratyay", area: "Tala", tagline: "Contemporary art theme", tags: ["insta", "iconic"], crowd: "moderate", x: 175, y: 38 },
    { id: 2, name: "Kumartuli Park", area: "Kumartuli", tagline: "Artisan roots · Classic", tags: ["iconic", "family"], crowd: "moderate", x: 190, y: 78 },
    { id: 3, name: "Ahiritola Sarbojanin", area: "Ahiritola", tagline: "Riverside · Classic", tags: ["family", "quiet"], crowd: "moderate", x: 165, y: 102 },
    { id: 4, name: "Hatibagan Nabin Pally", area: "Hatibagan", tagline: "Heritage lanes", tags: ["iconic", "energy"], crowd: "heavy", x: 220, y: 128 },
    { id: 5, name: "Manicktala Chaltabagan", area: "Manicktala", tagline: "Folk craft showcase", tags: ["family", "insta"], crowd: "heavy", x: 240, y: 165 },
    { id: 6, name: "College Square", area: "College Street", tagline: "Bookish & classic", tags: ["iconic", "family"], crowd: "heavy", x: 170, y: 178 },
    { id: 7, name: "Santosh Mitra Sangha", area: "Wellington", tagline: "Grand-scale spectacle", tags: ["iconic", "insta", "energy"], crowd: "heavy", x: 205, y: 215 },
    { id: 8, name: "Mohammad Ali Park", area: "Central Kolkata", tagline: "Traditional ritual", tags: ["iconic", "family"], crowd: "heavy", x: 190, y: 238 },
    { id: 9, name: "Sreebhumi Sporting", area: "Lake Town", tagline: "Themed marvel", tags: ["iconic", "insta", "energy"], crowd: "heavy", x: 320, y: 95 },
    { id: 10, name: "Baguiati Welfare", area: "Baguiati", tagline: "Neighbourhood warmth", tags: ["family", "quiet"], crowd: "low", x: 312, y: 150 },
    { id: 11, name: "Salt Lake FD Block", area: "Salt Lake", tagline: "Light installations", tags: ["insta", "energy"], crowd: "moderate", x: 290, y: 195 },
    { id: 12, name: "Suruchi Sangha", area: "New Alipore", tagline: "Elegant minimalism", tags: ["quiet", "insta"], crowd: "moderate", x: 90, y: 330 },
    { id: 13, name: "Behala Club", area: "Behala", tagline: "Community favourite", tags: ["family", "quiet"], crowd: "low", x: 110, y: 440 },
    { id: 14, name: "Tollygunge Agrani", area: "Tollygunge", tagline: "Retro lanes", tags: ["quiet", "family"], crowd: "low", x: 150, y: 455 },
    { id: 15, name: "Ballygunge Cultural", area: "Ballygunge", tagline: "Elegant & traditional", tags: ["iconic", "family"], crowd: "moderate", x: 225, y: 340 },
    { id: 16, name: "Singhi Park", area: "Ballygunge", tagline: "Crowd-favourite theme", tags: ["iconic", "insta", "energy"], crowd: "heavy", x: 300, y: 332 },
    { id: 17, name: "Deshapriya Park", area: "Ballygunge", tagline: "Massive scale", tags: ["iconic", "energy"], crowd: "heavy", x: 262, y: 352 },
    { id: 18, name: "Maddox Square", area: "Ballygunge", tagline: "Neighbourhood classic", tags: ["family", "quiet"], crowd: "moderate", x: 247, y: 372 },
    { id: 19, name: "Badamtala Ashar Sangha", area: "Kalighat", tagline: "Award-winning themes", tags: ["iconic", "insta"], crowd: "moderate", x: 205, y: 385 },
    { id: 20, name: "Chetla Agrani", area: "Chetla", tagline: "Riverside ritual", tags: ["quiet", "family"], crowd: "low", x: 190, y: 405 },
    { id: 21, name: "Jodhpur Park", area: "Jodhpur Park", tagline: "Theme wizardry", tags: ["insta", "iconic"], crowd: "heavy", x: 262, y: 425 },
    { id: 22, name: "Babubagan Sarbojanin", area: "Dhakuria", tagline: "Lakeside glow", tags: ["insta", "quiet"], crowd: "moderate", x: 285, y: 445 },
    { id: 23, name: "Naktala Udayan", area: "Naktala", tagline: "Lively dhaak & dance", tags: ["energy", "family"], crowd: "moderate", x: 285, y: 482 },
    { id: 24, name: "Hindustan Club", area: "Gariahat", tagline: "Crowd-puller", tags: ["energy", "iconic"], crowd: "heavy", x: 308, y: 300 },
    { id: 25, name: "Park Circus Sarbojanin", area: "Park Circus", tagline: "Cultural melange", tags: ["family", "energy"], crowd: "moderate", x: 262, y: 262 },
    { id: 26, name: "Dum Dum Park Tarun Sangha", area: "Dum Dum", tagline: "Folk-art theme", tags: ["energy", "family"], crowd: "moderate", x: 262, y: 55 }
  ];

  var STARTS = [
    { name: "Barasat", x: 235, y: 12 }, { name: "Salt Lake", x: 300, y: 175 },
    { name: "Sector V", x: 335, y: 205 }, { name: "New Town", x: 340, y: 120 },
    { name: "Dum Dum", x: 270, y: 70 }, { name: "Shyambazar", x: 200, y: 105 },
    { name: "Esplanade", x: 205, y: 250 }, { name: "Howrah", x: 120, y: 190 },
    { name: "Park Circus", x: 255, y: 275 }, { name: "Garia", x: 235, y: 505 },
    { name: "Tollygunge", x: 185, y: 470 }, { name: "Behala", x: 95, y: 470 }
  ];

  var FOODS = [
    { icon: "🍛", name: "Pujo Bhog Stall", kind: "Khichuri · labra · payesh", area: "Kumartuli", price: 180 },
    { icon: "🥟", name: "Phuchka & Chaat Lane", kind: "Street snacks", area: "College Street", price: 90 },
    { icon: "🍢", name: "Kathi Roll Corner", kind: "Egg & chicken rolls", area: "Park Circus", price: 140 },
    { icon: "🐟", name: "Bengali Thali House", kind: "Fish curry · rice · mishti", area: "Ballygunge", price: 320 },
    { icon: "🥘", name: "Mughlai Parantha Dhaba", kind: "Late-night classic", area: "Esplanade", price: 200 },
    { icon: "🍮", name: "Mishti Mandir", kind: "Sandesh · rosogolla · mishti doi", area: "Gariahat", price: 120 },
    { icon: "🍜", name: "Chinese Tangra Bites", kind: "Chowmein · chilli chicken", area: "Tollygunge", price: 220 },
    { icon: "☕", name: "Cha & Cutlet Adda", kind: "Kolkata cutlet & cha", area: "Salt Lake", price: 100 }
  ];

  var VIBES = [
    { id: "iconic", icon: "⭐", label: "Iconic pandals" },
    { id: "insta", icon: "📸", label: "Instagram-worthy" },
    { id: "quiet", icon: "🌿", label: "Less crowded" },
    { id: "family", icon: "👨‍👩‍👧", label: "Family friendly" },
    { id: "energy", icon: "🔥", label: "High-energy" }
  ];
  var TIMES = [
    { hours: 4, count: 3 }, { hours: 6, count: 4 }, { hours: 8, count: 5 }
  ];
  var MODES = [
    { id: "metro", icon: "🚇", label: "Metro preferred" },
    { id: "auto_metro", icon: "🛺", label: "Auto + Metro" },
    { id: "walk", icon: "🚶", label: "More walking" },
    { id: "cab", icon: "🚕", label: "Cab friendly" }
  ];

  var GLYPHS = ["🛕", "🪔", "🌺", "🎨", "✨"];
  var CROWD_BASE = { low: 8, moderate: 20, heavy: 38 };
  var CROWD_LABEL = { low: "Low", moderate: "Moderate", heavy: "Heavy" };
  var TAG_LABEL = { iconic: "Iconic", insta: "Instagram", quiet: "Low crowd", family: "Family", energy: "High energy" };

  var KEY_PREFS = "pandalpass.prefs";
  var KEY_PASS = "pandalpass.pass";
  var DEFAULT_PREFS = { start: "Barasat", vibes: ["iconic", "insta", "quiet"], hours: 6, mode: "auto_metro", food: true };

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ } }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function mapX(p) { return p.x * 2; }

  function fmtClock(mins) {
    var m = Math.round(mins) % 1440, h = Math.floor(m / 60), mm = m % 60;
    var ap = h >= 12 ? "PM" : "AM", h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + pad(mm) + " " + ap;
  }
  function fmtDur(mins) { var h = Math.floor(mins / 60), m = Math.round(mins % 60); return h ? h + "h " + m + "m" : m + "m"; }

  function toast(msg) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { el.classList.remove("is-visible"); }, 2400);
  }

  /* ---------- Itinerary engine ---------- */
  function legFor(from, to, mode) {
    var km = dist(from, to) * 0.05;
    var type, icon, mins, walkKm = 0, cost;
    if (mode === "cab") { type = "Cab"; icon = "🚕"; mins = 6 + km * 3; cost = 60 + km * 18; }
    else if (mode === "walk" && km < 1.5) { type = "Walk"; icon = "🚶"; mins = km * 13; walkKm = km; cost = 0; }
    else if (mode === "auto_metro" && km < 4) { type = "Auto"; icon = "🛺"; mins = 6 + km * 3.2; cost = 30 + km * 10; }
    else { type = "Metro + walk"; icon = "🚇"; mins = 10 + km * 3; walkKm = 0.3; cost = 20; }
    return { type: type, icon: icon, mins: Math.max(5, Math.round(mins)), walkKm: walkKm, cost: cost, km: km };
  }

  function generate(prefs) {
    var start = STARTS.filter(function (s) { return s.name === prefs.start; })[0] || STARTS[0];
    var count = (TIMES.filter(function (t) { return t.hours === prefs.hours; })[0] || TIMES[1]).count;

    var scored = PANDALS.map(function (p) {
      var s = 0;
      p.tags.forEach(function (t) { if (prefs.vibes.indexOf(t) !== -1) s += 3; });
      if (prefs.vibes.indexOf("quiet") !== -1) s += p.crowd === "low" ? 3 : p.crowd === "moderate" ? 1 : -1;
      s -= dist(p, start) / 70;
      return { p: p, score: s };
    }).sort(function (a, b) { return b.score - a.score; });

    var chosen = scored.slice(0, count).map(function (o) { return o.p; });
    var ordered = [], cur = start, pool = chosen.slice();
    while (pool.length) {
      pool.sort(function (a, b) { return dist(cur, a) - dist(cur, b); });
      cur = pool.shift();
      ordered.push(cur);
    }

    var clock = 18 * 60 + 30, items = [], walkKm = 0, cost = 0, prev = start, totalTravel = 0;
    items.push({ kind: "start", time: clock, name: start.name });

    ordered.forEach(function (p, i) {
      var leg = legFor(prev, p, prefs.mode);
      clock += leg.mins; walkKm += leg.walkKm; cost += leg.cost; totalTravel += leg.mins;
      items.push({ kind: "leg", leg: leg });
      var wait = CROWD_BASE[p.crowd] + (p.id % 3) * 2, stay = 24 + (p.id % 3) * 2;
      items.push({ kind: "pandal", time: clock, index: i + 1, p: p, wait: wait, stay: stay });
      clock += wait + stay;
      prev = p;

      if (prefs.food && i === Math.min(1, ordered.length - 2)) {
        var food = FOODS[(p.id + 2) % FOODS.length];
        var walkLeg = { type: "Walk", icon: "🚶", mins: 8, walkKm: 0.6, cost: 0, km: 0.6, label: "600m" };
        items.push({ kind: "leg", leg: walkLeg });
        clock += 8; walkKm += 0.6;
        items.push({ kind: "food", time: clock, food: food });
        clock += 45;
      }
    });

    var total = clock - (18 * 60 + 30);
    var heavyCount = ordered.filter(function (p) { return p.crowd === "heavy"; }).length;
    return {
      prefs: prefs,
      startPoint: start,
      pandalIds: ordered.map(function (p) { return p.id; }),
      items: items,
      totalMins: total,
      walkKm: Math.round(walkKm * 10) / 10,
      cost: Math.round(cost / 10) * 10,
      crowd: heavyCount >= 2 ? "High" : heavyCount === 1 ? "Moderate" : "Low",
      foodStops: prefs.food ? 1 : 0,
      travelMins: totalTravel
    };
  }

  function getPrefs() {
    var saved = read(KEY_PREFS, null);
    if (!saved || typeof saved !== "object") return clone(DEFAULT_PREFS);
    var prefs = clone(DEFAULT_PREFS);
    Object.keys(DEFAULT_PREFS).forEach(function (key) {
      if (saved[key] !== undefined) prefs[key] = saved[key];
    });
    if (!Array.isArray(prefs.vibes)) prefs.vibes = clone(DEFAULT_PREFS.vibes);
    return prefs;
  }
  function getPass() {
    var p = read(KEY_PASS, null);
    if (!p || !p.prefs || !Array.isArray(p.pandalIds) || !Array.isArray(p.items)) {
      p = generate(getPrefs());
      write(KEY_PASS, p);
    }
    return p;
  }
  function byId(id) { return PANDALS.filter(function (p) { return p.id === id; })[0]; }
  function crowdBadge(c) { return '<span class="badge badge--' + c + '">' + CROWD_LABEL[c] + "</span>"; }
  function thumbClass(id) { return "pcard__thumb--" + "abcde".charAt(id % 5); }
  function tagList(tags) {
    return '<div class="pcard__tags">' + tags.map(function (t) {
      return '<span class="tag">' + (TAG_LABEL[t] || t) + "</span>";
    }).join("") + "</div>";
  }

  function pandalCard(p) {
    return '<article class="pcard">' +
      '<div class="pcard__thumb ' + thumbClass(p.id) + '" aria-hidden="true">' + GLYPHS[p.id % GLYPHS.length] + "</div>" +
      '<div class="pcard__body">' +
        '<div class="pcard__top"><div class="pcard__name">' + p.name + "</div>" + crowdBadge(p.crowd) + "</div>" +
        '<div class="pcard__tag">' + p.tagline + "</div>" +
        '<div class="pcard__meta">' + p.area + " · planning estimate</div>" +
        tagList(p.tags) +
      "</div></article>";
  }

  function pandalRow(p, meta) {
    return '<article class="pcard pcard--row">' +
      '<div class="pcard__thumb ' + thumbClass(p.id) + '" aria-hidden="true">' + GLYPHS[p.id % GLYPHS.length] + "</div>" +
      '<div class="pcard__body">' +
        '<div class="pcard__top"><div class="pcard__name">' + p.name + "</div>" + crowdBadge(p.crowd) + "</div>" +
        '<div class="pcard__tag">' + p.tagline + "</div>" +
        '<div class="pcard__meta">' + meta + "</div>" +
      "</div></article>";
  }

  function foodRow(f) {
    return '<article class="fcard">' +
      '<div class="fcard__icon" aria-hidden="true">' + f.icon + "</div>" +
      "<div>" +
        '<div class="fcard__name">' + f.name + "</div>" +
        '<div class="fcard__meta">' + f.kind + " · " + f.area + "</div>" +
        '<div class="fcard__price">≈ ₹' + f.price + " / person</div>" +
      "</div></article>";
  }

  /* ---------- Shared shell ---------- */
  function initCommon() {
    var header = $("[data-header]");
    var toggle = $("[data-nav-toggle]");
    if (header && toggle) {
      function close() {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
      toggle.addEventListener("click", function () {
        var open = header.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$(".site-nav a", header).forEach(function (link) { link.addEventListener("click", close); });
      document.addEventListener("click", function (e) {
        if (header.classList.contains("is-open") && !header.contains(e.target)) close();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
      });
    }
  }

  /* ---------- Page: Home ---------- */
  function initHome() {
    $("#stat-pandals").textContent = PANDALS.length;
    $("#stat-starts").textContent = STARTS.length;
    $("#stat-foods").textContent = FOODS.length;

    var picks = [9, 6, 17, 23].map(byId);
    $("#home-picks").innerHTML = picks.map(pandalCard).join("");
    $("#home-foods").innerHTML = FOODS.slice(0, 3).map(foodRow).join("");
  }

  /* ---------- Page: Planner ---------- */
  function initPlanner() {
    var prefs = getPrefs();
    var step = 1, TOTAL = 4;
    var steps = $$("[data-step]");
    var bars = $$(".progress__bar");
    var label = $("#step-label");
    var next = $("#next-btn");
    var back = $("#back-btn");

    function optionHTML(selected, icon, text, meta) {
      return '<span class="option__main"><span aria-hidden="true">' + icon + "</span><span>" + text + "</span></span>" +
        (meta ? '<span class="option__meta">' + meta + "</span>" : "") +
        '<span class="option__check" aria-hidden="true">✓</span>';
    }

    function renderStart() {
      var box = $("#opts-start");
      box.innerHTML = "";
      STARTS.forEach(function (s) {
        var on = prefs.start === s.name;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "option" + (on ? " is-selected" : "");
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.innerHTML = '<span class="option__main"><span aria-hidden="true">📍</span><span>' + s.name + '</span></span><span class="option__check" aria-hidden="true">✓</span>';
        b.addEventListener("click", function () { prefs.start = s.name; renderStart(); updateSummary(); });
        box.appendChild(b);
      });
    }

    function renderVibes() {
      var box = $("#opts-vibe");
      box.innerHTML = "";
      VIBES.forEach(function (v) {
        var on = prefs.vibes.indexOf(v.id) !== -1;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "option" + (on ? " is-selected" : "");
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.innerHTML = optionHTML(on, v.icon, v.label);
        b.addEventListener("click", function () {
          var i = prefs.vibes.indexOf(v.id);
          if (i === -1) prefs.vibes.push(v.id); else prefs.vibes.splice(i, 1);
          renderVibes(); updateSummary(); updateNext();
        });
        box.appendChild(b);
      });
    }

    function renderTime() {
      var box = $("#opts-time");
      box.innerHTML = "";
      TIMES.forEach(function (t) {
        var on = prefs.hours === t.hours;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "option" + (on ? " is-selected" : "");
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.innerHTML = optionHTML(on, "⏱", t.hours + " hours", "~" + t.count + " pandals");
        b.addEventListener("click", function () { prefs.hours = t.hours; renderTime(); updateSummary(); });
        box.appendChild(b);
      });
    }

    function renderMode() {
      var box = $("#opts-mode");
      box.innerHTML = "";
      MODES.forEach(function (m) {
        var on = prefs.mode === m.id;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "option" + (on ? " is-selected" : "");
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.innerHTML = optionHTML(on, m.icon, m.label);
        b.addEventListener("click", function () { prefs.mode = m.id; renderMode(); updateSummary(); });
        box.appendChild(b);
      });
      var row = $("#food-toggle");
      row.classList.toggle("is-on", !!prefs.food);
      row.setAttribute("aria-checked", prefs.food ? "true" : "false");
      updateSummary();
    }

    function updateSummary() {
      $("#sum-start").textContent = prefs.start;
      var labels = VIBES.filter(function (v) { return prefs.vibes.indexOf(v.id) !== -1; })
        .map(function (v) { return v.label; });
      $("#sum-vibes").textContent = labels.length ? labels.join(", ") : "None yet";
      $("#sum-time").textContent = prefs.hours + " hours";
      var mode = MODES.filter(function (m) { return m.id === prefs.mode; })[0];
      $("#sum-mode").textContent = mode ? mode.label : "—";
      $("#sum-food").textContent = prefs.food ? "Included" : "Skipped";
    }

    function updateNext() {
      next.disabled = step === 2 && prefs.vibes.length === 0;
    }

    function show() {
      steps.forEach(function (s) { s.hidden = Number(s.getAttribute("data-step")) !== step; });
      bars.forEach(function (b, i) { b.classList.toggle("is-done", i < step); });
      label.textContent = "Step " + step + " of " + TOTAL;
      next.textContent = step === TOTAL ? "Generate my Pujo Pass ✨" : "Next";
      next.className = "btn " + (step === TOTAL ? "btn--wine" : "btn--dark");
      updateNext();
      updateSummary();
    }

    $("#food-toggle").addEventListener("click", function () {
      prefs.food = !prefs.food;
      renderMode();
    });

    next.addEventListener("click", function () {
      if (step < TOTAL) { step++; show(); return; }
      write(KEY_PREFS, prefs);
      write(KEY_PASS, generate(prefs));
      window.location.href = "pass.html";
    });

    back.addEventListener("click", function () {
      if (step > 1) { step--; show(); } else { window.location.href = "index.html"; }
    });

    renderStart(); renderVibes(); renderTime(); renderMode(); show();
  }

  /* ---------- Page: Pass ---------- */
  function initPass() {
    var pass = getPass();
    var prefs = pass.prefs;
    var pandalCount = pass.pandalIds.length;

    $("#pass-line").textContent = prefs.hours + " hours · " + pandalCount + " pandals · " +
      pass.foodStops + " food stop" + (pass.foodStops === 1 ? "" : "s");

    $("#m-total").textContent = fmtDur(pass.totalMins);
    $("#m-walk").textContent = pass.walkKm + " km";
    $("#m-cost").textContent = "₹" + pass.cost;

    var html = "";
    pass.items.forEach(function (it) {
      if (it.kind === "start") {
        html += '<li class="tl-row"><div class="tl-time">' + fmtClock(it.time).replace(" ", "<br>") + '</div>' +
          '<div class="tl-rail"><span class="tl-dot tl-dot--start"></span></div>' +
          '<div class="tl-content"><div class="tl-start">📍 Start — ' + it.name + "<small>Meeting point</small></div></div></li>";
      } else if (it.kind === "leg") {
        var l = it.leg;
        var text = l.label ? l.label + " • " + l.mins + " min" : l.type + " • " + l.mins + " min";
        html += '<li class="tl-row"><div class="tl-time"></div><div class="tl-rail"></div>' +
          '<div class="tl-content"><span class="leg">' + l.icon + " " + text + "</span></div></li>";
      } else if (it.kind === "pandal") {
        var p = it.p;
        html += '<li class="tl-row"><div class="tl-time">' + fmtClock(it.time).replace(" ", "<br>") +
          '<span class="tl-index">' + pad(it.index) + "</span></div>" +
          '<div class="tl-rail"><span class="tl-dot"></span></div><div class="tl-content">' +
          pandalRow(p, "Wait: " + it.wait + "m · Stay: " + it.stay + "m") +
          "</div></li>";
      } else if (it.kind === "food") {
        html += '<li class="tl-row"><div class="tl-time">' + fmtClock(it.time).replace(" ", "<br>") + '</div>' +
          '<div class="tl-rail"><span class="tl-dot tl-dot--food"></span></div><div class="tl-content">' +
          '<a class="food-card" href="food.html"><div class="food-card__top"><span class="food-card__name">🍽 ' + it.food.name + '</span><span class="badge badge--food">Food stop</span></div>' +
          '<div class="food-card__meta">' + it.food.kind + " · ₹" + it.food.price + '/person</div><span class="food-card__link">View food options ›</span></a></div></li>';
      }
    });
    $("#timeline").innerHTML = html;

    $("#s-pandals").textContent = pandalCount;
    $("#s-food").textContent = pass.foodStops;
    $("#s-walk").textContent = pass.walkKm + " km";
    $("#s-time").textContent = fmtDur(pass.travelMins);
    $("#s-crowd").textContent = "🔥 Crowd: " + pass.crowd;
    $("#s-food-pill").hidden = !pass.foodStops;

    $("#share-btn").addEventListener("click", function () {
      var names = pass.pandalIds.map(function (id) { return byId(id).name; }).join(" → ");
      var text = "My Pujo Pass: " + pass.startPoint.name + " → " + names + " (" + fmtDur(pass.totalMins) + ")";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          toast("Itinerary copied to clipboard");
        }, function () {
          toast("Couldn't copy — take a screenshot instead");
        });
      } else {
        toast("Couldn't copy — take a screenshot instead");
      }
    });
  }

  /* ---------- Page: Route map ---------- */
  var SVG_NS = "http://www.w3.org/2000/svg";
  function svgEl(name, attrs, parent) {
    var el = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }

  function initRoute() {
    var pass = getPass();
    var routeLayer = $("#layer-route"), markerLayer = $("#layer-markers");
    var start = pass.startPoint;
    var markers = {};

    $("#route-summary").textContent = pass.pandalIds.length + " pandals · " + fmtDur(pass.totalMins) +
      " · " + pass.walkKm + " km walking · crowd, time and cost are estimates.";

    var pts = [start].concat(pass.pandalIds.map(byId)).map(function (p) { return mapX(p) + "," + p.y; }).join(" ");
    svgEl("polyline", { "class": "map__route", points: pts }, routeLayer);

    function makeMarker(p, onRoute, number, labelText) {
      var g = svgEl("g", {
        "class": "marker" + (onRoute ? " is-route" : " is-dim"),
        tabindex: "0",
        role: "button",
        "aria-label": p.name
      }, markerLayer);
      svgEl("circle", { cx: mapX(p), cy: p.y - 8, r: onRoute ? 15 : 11, "class": "marker__bubble" }, g);
      var t = svgEl("text", { x: mapX(p), y: p.y - 8, "class": onRoute ? "marker__num" : "marker__glyph" }, g);
      t.textContent = onRoute ? String(number) : "🛕";
      if (p.crowd) svgEl("circle", { cx: mapX(p), cy: p.y + 7, r: 4, "class": "marker__dot--" + p.crowd }, g);
      var lb = svgEl("text", { x: mapX(p), y: p.y + 22, "class": "marker__label", "text-anchor": "middle" }, g);
      lb.textContent = labelText;
      return g;
    }

    function markActive(key) {
      Object.keys(markers).forEach(function (k) {
        markers[k].classList.toggle("is-active", k === key);
      });
      $$("#route-list button").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-stop") === key);
      });
    }

    function showStop(p, order, isStart) {
      $("#stop-name").textContent = p.name;
      $("#stop-area").textContent = p.area;
      $("#stop-tag").textContent = p.tagline;
      $("#stop-crowd").innerHTML = isStart
        ? '<span class="badge badge--food">Start point</span>'
        : crowdBadge(p.crowd);
      $("#stop-order").textContent = isStart ? "Meeting point" : order !== -1 ? "Stop " + (order + 1) + " on your route" : "Not on your route";
      markActive(isStart ? "start" : p.id);
      if (window.innerWidth <= 1020) {
        var panel = $(".stop-detail");
        if (panel) panel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    var startInfo = { name: start.name, area: "Meeting point", tagline: "Your night begins here. Gather the group and head to the first pandal." };
    var sg = makeMarker({ name: start.name, x: start.x, y: start.y }, true, "★", "Start");
    sg.setAttribute("aria-label", "Start at " + start.name);
    markers.start = sg;
    function openStart() { showStop(startInfo, -1, true); }
    sg.addEventListener("click", openStart);
    sg.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStart(); } });

    PANDALS.forEach(function (p) {
      var order = pass.pandalIds.indexOf(p.id);
      var onRoute = order !== -1;
      var g = makeMarker(p, onRoute, order + 1, p.name.split(" ")[0]);
      markers[p.id] = g;
      function open() { showStop(p, order, false); }
      g.addEventListener("click", open);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });

    var listHTML = '<li><button type="button" data-stop="start"><span class="route-list__num">★</span><span><strong>' + start.name + '</strong><small>Start · meeting point</small></span></button></li>';
    pass.pandalIds.forEach(function (id, i) {
      var p = byId(id);
      listHTML += '<li><button type="button" data-stop="' + id + '"><span class="route-list__num">' + (i + 1) + '</span><span><strong>' + p.name + '</strong><small>' + p.area + '</small></span></button></li>';
    });
    $("#route-list").innerHTML = listHTML;

    $("#route-list").addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-stop]");
      if (!btn) return;
      var key = btn.getAttribute("data-stop");
      if (key === "start") { openStart(); return; }
      var p = byId(Number(key));
      if (p) showStop(p, pass.pandalIds.indexOf(p.id), false);
    });

    $("#locate-btn").addEventListener("click", function () {
      sg.classList.add("is-located");
      setTimeout(function () { sg.classList.remove("is-located"); }, 1400);
      toast("Centred on " + start.name);
    });
  }

  /* ---------- Page: Explore ---------- */
  function initExplore() {
    var current = "all";
    var filters = [{ id: "all", label: "All pandals" }].concat(VIBES.map(function (v) {
      return { id: v.id, label: v.icon + " " + v.label };
    }));
    var bar = $("#filters"), list = $("#list");

    function render() {
      bar.innerHTML = "";
      filters.forEach(function (f) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "filter" + (f.id === current ? " is-selected" : "");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", f.id === current ? "true" : "false");
        b.textContent = f.label;
        b.addEventListener("click", function () { current = f.id; render(); });
        bar.appendChild(b);
      });

      var items = PANDALS.filter(function (p) { return current === "all" || p.tags.indexOf(current) !== -1; });
      $("#count").textContent = items.length + " pandal" + (items.length === 1 ? "" : "s") + " across Kolkata";
      list.innerHTML = items.length
        ? items.map(pandalCard).join("")
        : '<p class="list-empty">No pandals match this filter.</p>';
    }
    render();
  }

  /* ---------- Page: Food ---------- */
  function initFood() {
    $("#list").innerHTML = FOODS.map(foodRow).join("");
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initCommon();
    var page = document.body.getAttribute("data-page");
    var inits = { home: initHome, planner: initPlanner, pass: initPass, route: initRoute, explore: initExplore, food: initFood };
    if (inits[page]) inits[page]();
  });
})();
