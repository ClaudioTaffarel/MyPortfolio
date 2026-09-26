const data = window.PORTFOLIO;
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const safeURL = (value) => (/^(https?:\/\/)/i.test(value) ? value : "");
document.querySelector("#skills").innerHTML = data.skills
  .map(
    (s, i) =>
      `<span class="skill-chip" style="--tilt:${i % 2 ? 1 : -1}deg"><img src="assets/icons/${data.skillIcons[s]}.svg" alt="" width="25" height="25">${s === "HTML & CSS" ? '<img class="secondary-icon" src="assets/icons/css3.svg" alt="" width="25" height="25">' : ""}${escapeHTML(s)}</span>`,
  )
  .join("");
document.querySelector("#projects").innerHTML = data.projects
  .map(
    (p, i) =>
      `<article class="project-card" data-direction="${i % 2 ? 1 : -1}"><button class="project-button" data-project="${i}" aria-label="Read about ${escapeHTML(p.title)}"><div class="project-art ${p.color}" style="--tilt:${i % 2 ? 1.5 : -1.5}deg;--photo-position:${["25% center", "right center", "center bottom", "left top"][i]}"><div class="art-top"><span>SELECTED PROJECT / ${p.cover}</span><span>CT. STUDIO</span></div><div class="art-title">${escapeHTML(p.title)}</div><div class="art-bottom"><span>${escapeHTML(p.category.split(" · ")[0])}</span><b>↗</b></div><img src="${escapeHTML(p.image)}" alt="Illustrative workspace photo for ${escapeHTML(p.title)}" data-project-image hidden></div><div class="project-meta"><h3>${escapeHTML(p.title)}</h3><span aria-hidden="true">↗</span></div></button><p>${escapeHTML(p.intro)}</p><div class="tags">${p.tags.map((t) => `<span>${escapeHTML(t)}</span>`).join("")}</div></article>`,
  )
  .join("");
document.querySelectorAll("[data-project-image]").forEach((img) => {
  const loaded = () => {
    img.hidden = false;
    img.parentElement.classList.add("has-photo");
  };
  img.addEventListener("load", loaded);
  img.addEventListener("error", () => img.remove());
  if (img.complete && img.naturalWidth) loaded();
});
document.querySelector("#certificates").innerHTML = data.certificates
  .map(
    (c, i) =>
      `<article class="cert reveal" style="--tilt:${i % 2 ? 1.5 : -1.5}deg;--delay:${i * 70}ms"><span>${escapeHTML(c.date)}</span><span class="cert-mark" aria-hidden="true">✳</span><h3>${escapeHTML(c.name)}</h3><p>${escapeHTML(c.issuer)}</p></article>`,
  )
  .join("");
document.querySelector("#year").textContent = new Date().getFullYear();
const dialog = document.querySelector("#project-dialog");
let opener;
document.querySelectorAll("[data-project]").forEach((button) =>
  button.addEventListener("click", () => {
    const p = data.projects[button.dataset.project];
    opener = button;
    document.querySelector("#dialog-content").innerHTML =
      `<span class="eyebrow">${escapeHTML(p.category)}</span><h2 id="dialog-title">${escapeHTML(p.title)}</h2><span class="detail-date">${escapeHTML(p.date)}</span><p>${escapeHTML(p.description)}</p><h3>My contribution</h3><ul>${p.contributions.map((c) => `<li>${escapeHTML(c)}</li>`).join("")}</ul><div class="detail-tools">${escapeHTML(p.tools)}</div><div class="detail-links">${safeURL(p.demo) ? `<a href="${escapeHTML(p.demo)}" target="_blank" rel="noreferrer">Live project ↗</a>` : ""}${safeURL(p.repository) ? `<a href="${escapeHTML(p.repository)}" target="_blank" rel="noreferrer">View code ↗</a>` : ""}</div>`;
    const cover = button.querySelector("[data-project-image]");
    if (cover && !cover.hidden) {
      const im = document.createElement("img");
      im.src = cover.src;
      im.alt = cover.alt;
      im.className = "detail-image";
      document.querySelector("#dialog-content h3").before(im);
    }
    dialog.showModal();
    document.body.classList.add("modal-open");
  }),
);
const close = () => dialog.close();
document.querySelector(".close-dialog").addEventListener("click", close);
dialog.addEventListener("click", (e) => {
  const r = dialog.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  opener?.focus();
});
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let paused = reduced.matches;
const motionButton = document.querySelector(".motion-toggle");
const frames = [...document.querySelectorAll(".portrait-frame")];
const portrait = document.querySelector(".portrait-frames");
let frameIndex = 0,
  portraitVisible = false,
  portraitTimer = null;
function restartPortrait() {
  clearInterval(portraitTimer);
  portraitTimer = null;
  if (paused || reduced.matches || !portraitVisible || document.hidden) return;
  portraitTimer = setInterval(() => {
    const next = (frameIndex + 1) % frames.length;
    if (!frames[next].complete || !frames[next].naturalWidth) return;
    frames[frameIndex].classList.remove("is-active");
    frames[next].classList.add("is-active");
    frameIndex = next;
  }, 1000);
}
new IntersectionObserver(
  (entries) => {
    portraitVisible = entries[0].isIntersecting;
    restartPortrait();
  },
  { threshold: 0.15 },
).observe(portrait);
function motionState() {
  const off = paused || reduced.matches;
  document.body.classList.toggle("motion-paused", off || document.hidden);
  motionButton.setAttribute("aria-pressed", String(off));
  motionButton.textContent = off ? "Resume motion ▷" : "Pause motion Ⅱ";
  motionButton.disabled = reduced.matches;
  if (reduced.matches) {
    motionButton.textContent = "Reduced motion enabled";
    frames.forEach((f, i) => f.classList.toggle("is-active", i === 0));
    frameIndex = 0;
  }
  restartPortrait();
  updateScroll();
}
motionButton.addEventListener("click", () => {
  paused = !paused;
  motionState();
});
reduced.addEventListener("change", () => {
  paused = reduced.matches;
  motionState();
});
document.addEventListener("visibilitychange", motionState);
if (!reduced.matches) {
  document.documentElement.classList.add("js-motion");
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}
const hero = document.querySelector(".hero"),
  board = document.querySelector(".board-content"),
  grid = document.querySelector(".board-grid"),
  pencil = document.querySelector(".pencil-wrap");
const cards = [...document.querySelectorAll(".project-card")];
let queued = false;
function updateScroll() {
  queued = false;
  if (reduced.matches || paused) {
    board.style.transform = "";
    grid.style.transform = "";
    pencil.style.transform = "";
    board.style.opacity = "";
    cards.forEach((c) => {
      c.style.setProperty("--slide-x", "0px");
      c.style.setProperty("--slide-opacity", "1");
    });
    return;
  }
  const y = Math.max(0, -hero.getBoundingClientRect().top);
  if (y < hero.offsetHeight + 100) {
    board.style.transform = `translateY(${y * 0.32}px)`;
    grid.style.transform = `translateY(${y * 0.12}px)`;
    pencil.style.transform = `translateY(${y * 0.11}px) rotate(${-18 + y * 0.035}deg)`;
    board.style.opacity = String(
      Math.max(0.1, 1 - y / (hero.offsetHeight * 0.95)),
    );
  }
  const vh = window.innerHeight;
  const travel = Math.min(420, window.innerWidth * 0.48);
  cards.forEach((card) => {
    const top = card.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, (vh * 0.96 - top) / (vh * 0.63)));
    const eased = progress * progress * (3 - 2 * progress);
    card.style.setProperty(
      "--slide-x",
      `${(1 - eased) * travel * Number(card.dataset.direction)}px`,
    );
    card.style.setProperty("--slide-opacity", String(0.18 + 0.82 * eased));
  });
}
function scheduleScroll() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(updateScroll);
  }
}
window.addEventListener("scroll", scheduleScroll, { passive: true });
window.addEventListener("resize", scheduleScroll);
window.addEventListener("load", scheduleScroll);
motionState();
let highest = 5;
document.querySelectorAll(".polaroid").forEach((card) => {
  let x = 0,
    y = 0,
    startX = 0,
    startY = 0,
    drag = false;
  const move = () => {
    const hr = hero.getBoundingClientRect();
    const left = card.offsetLeft,
      top = card.offsetTop;
    x = Math.max(
      -left + 8,
      Math.min(x, hr.width - left - card.offsetWidth - 8),
    );
    y = Math.max(
      -top + 8,
      Math.min(y, hr.height - top - card.offsetHeight - 8),
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
  const stop = () => {
    drag = false;
  };
  card.addEventListener("pointerup", stop);
  card.addEventListener("pointercancel", stop);
  card.addEventListener("lostpointercapture", stop);
  card.addEventListener("keydown", (e) => {
    const dirs = {
      ArrowLeft: [-10, 0],
      ArrowRight: [10, 0],
      ArrowUp: [0, -10],
      ArrowDown: [0, 10],
    };
    if (!dirs[e.key]) return;
    e.preventDefault();
    x += dirs[e.key][0];
    y += dirs[e.key][1];
    card.style.zIndex = ++highest;
    move();
  });
});
