/* Page orchestration, navigation, motion preferences, and draggable scrapbook. */
(() => {
  const app = window.PortfolioApp,
    esc = app.escape;
  const spark =
    '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 3Q43 35 77 40Q43 44 40 77Q36 44 3 40Q36 35 40 3Z" fill="currentColor"/></svg>';
  const skills = document.querySelector("#skills");
  const chips = app.data.skills
    .map(
      (s) =>
        `<span class="skill-chip"><img src="assets/icons/${esc(app.data.skillIcons[s])}.svg" alt="" width="25" height="25">${esc(s)}</span>`,
    )
    .join("");
  skills.innerHTML = `<div class="skill-run">${chips}</div><div class="skill-run" aria-hidden="true">${chips}</div>`;
  const mask = document.createElement("div");
  mask.className = "marquee-window";
  skills.before(mask);
  mask.append(skills);
  document.querySelector("#certificates").innerHTML = app.data.certificates
    .map(
      (c, i) =>
        `<button type="button" class="cert" data-certificate="${i}" aria-label="View certificate: ${esc(c.name)}"><span>${esc(c.date)}</span><span class="cert-mark" aria-hidden="true">${spark}</span><h3>${esc(c.name)}</h3><p>${esc(c.issuer)}</p><span class="cert-view">View certificate ↗</span></button>`,
    )
    .join("");

  // IntersectionObserver keeps entrance effects and portrait cycling offscreen cheap.
  document.documentElement.classList.add("js-motion");
  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          reveal.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
  const frames = [...document.querySelectorAll(".portrait-frame")];
  let frameIndex = 0,
    portraitVisible = false,
    timer;
  function portraitTimer() {
    clearInterval(timer);
    if (app.paused || !portraitVisible || document.hidden) return;
    timer = setInterval(() => {
      frames[frameIndex].classList.remove("is-active");
      frameIndex = (frameIndex + 1) % frames.length;
      frames[frameIndex].classList.add("is-active");
    }, 1800);
  }
  new IntersectionObserver(([e]) => {
    portraitVisible = e.isIntersecting;
    portraitTimer();
  }).observe(document.querySelector(".portrait-frames"));
  // Sticky nav highlights the current chapter; hover previews another tab.
  const links = [...document.querySelectorAll(".nav nav a")],
    pill = document.querySelector(".nav-pill");
  let active = 0,
    hovering = false;
  function movePill(i) {
    const link = links[i];
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
    pill.classList.add("ready");
    links.forEach((a, n) => a.classList.toggle("active", n === i));
  }
  links.forEach((link, i) => {
    link.addEventListener("pointerenter", () => {
      hovering = true;
      movePill(i);
    });
    link.addEventListener("focus", () => movePill(i));
  });
  document.querySelector(".nav nav").addEventListener("pointerleave", () => {
    hovering = false;
    movePill(active);
  });
  document
    .querySelector(".nav nav")
    .addEventListener("focusout", () => movePill(active));
  const chapters = links.map((l) =>
    document.querySelector(l.getAttribute("href")),
  );
  const hero = document.querySelector(".hero"),
    board = document.querySelector(".board-content"),
    grid = document.querySelector(".board-grid");
  let queued = false;
  function update() {
    queued = false;
    const y = scrollY;
    document.documentElement.style.setProperty(
      "--reading",
      app.clamp(y / (document.documentElement.scrollHeight - innerHeight)),
    );
    active = 0;
    chapters.forEach((s, i) => {
      if (s.getBoundingClientRect().top < innerHeight * 0.45) active = i;
    });
    links.forEach((a, i) => {
      if (i === active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
    if (!hovering) movePill(active);
    if (!app.paused && y < hero.offsetHeight + innerHeight) {
      board.style.transform = `translateY(${y * 0.24}px) scale(${1 + y * 0.0001})`;
      board.style.opacity = app.clamp(1 - y / (hero.offsetHeight * 0.92));
      grid.style.transform = `translateY(${y * 0.13}px)`;
    }
    app.updateFlight();
  }
  app.requestUpdate = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener("scroll", app.requestUpdate, { passive: true });
  addEventListener("resize", app.requestUpdate);
  addEventListener("load", app.requestUpdate);
  document.fonts?.ready.then(app.requestUpdate);
  function motionState() {
    const wasPaused = app.paused,
      work = document.querySelector("#work"),
      rect = work.getBoundingClientRect();
    app.paused = app.reduced.matches;
    document.body.classList.toggle("motion-paused", app.paused);
    // Keep the current chapter in view when the tall flight becomes a static grid.
    if (wasPaused !== app.paused && rect.bottom < 0)
      window.scrollBy({
        top: work.getBoundingClientRect().bottom - rect.bottom,
        behavior: "instant",
      });
    else if (wasPaused !== app.paused && rect.top < 0)
      work.scrollIntoView({ behavior: "instant" });
    portraitTimer();
    app.requestUpdate();
  }
  app.reduced.addEventListener("change", motionState);
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("tab-hidden", document.hidden);
    portraitTimer();
  });
  motionState();
  // Drag with pointer capture; keyboard arrows provide the same interaction.
  let highest = 5;
  document.querySelectorAll(".hero .polaroid").forEach((card) => {
    let x = 0,
      y = 0,
      startX = 0,
      startY = 0,
      drag = false;
    const move = () => {
      x = app.clamp(
        x,
        -card.offsetLeft + 8,
        hero.clientWidth - card.offsetLeft - card.offsetWidth - 8,
      );
      y = app.clamp(
        y,
        -card.offsetTop + 8,
        hero.clientHeight - card.offsetTop - card.offsetHeight - 8,
      );
      card.style.setProperty("--dx", `${x}px`);
      card.style.setProperty("--dy", `${y}px`);
    };
    card.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      drag = true;
      startX = e.clientX - x;
      startY = e.clientY - y;
      card.setPointerCapture(e.pointerId);
      card.style.zIndex = ++highest;
    });
    card.addEventListener("pointermove", (e) => {
      if (!drag) return;
      x = e.clientX - startX;
      y = e.clientY - startY;
      move();
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((event) =>
      card.addEventListener(event, () => {
        drag = false;
      }),
    );
    card.addEventListener("keydown", (e) => {
      const dir = {
        ArrowLeft: [-10, 0],
        ArrowRight: [10, 0],
        ArrowUp: [0, -10],
        ArrowDown: [0, 10],
      }[e.key];
      if (!dir) return;
      e.preventDefault();
      x += dir[0];
      y += dir[1];
      move();
    });
    addEventListener("resize", move);
  });
})();
