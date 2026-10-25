/* Project detail modal. Edit images and text in content.js, not here. */
window.PortfolioApp = {
  data: window.PORTFOLIO,
  escape: (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    ),
  clamp: (v, min = 0, max = 1) => Math.min(max, Math.max(min, v)),
  reduced: matchMedia("(prefers-reduced-motion: reduce)"),
  paused: false,
};
(() => {
  const app = window.PortfolioApp,
    esc = app.escape;
  const dialog = document.querySelector("#project-dialog");
  const content = document.querySelector("#dialog-content");
  let opener,
    slides = [],
    index = 0,
    touchStart = null;
  function setSlide(next) {
    index = app.clamp(next, 0, slides.length - 1);
    content.querySelector(".gallery-track").style.transform =
      `translateX(${-100 * index}%)`;
    content.querySelector(".gallery-count").textContent =
      `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    content.querySelector(".gallery-caption").textContent =
      slides[index].caption || slides[index].alt || "";
    content.querySelector('[data-step="-1"]').disabled = index === 0;
    content.querySelector('[data-step="1"]').disabled =
      index === slides.length - 1;
    content.querySelectorAll("[data-thumb]").forEach((el, n) => {
      el.setAttribute("aria-current", String(n === index));
      if (n === index)
        el.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "instant",
        });
    });
    content
      .querySelectorAll(".gallery-slide")
      .forEach((el, n) => el.setAttribute("aria-hidden", String(n !== index)));
  }
  app.openProject = (id, trigger = document.activeElement) => {
    const p = app.data.projects[id];
    if (!p) return;
    opener = trigger;
    slides = p.gallery?.length
      ? p.gallery
      : [{ src: p.image, alt: p.title, caption: "Project overview" }];
    const links = [
      ["Live project", p.demo],
      ["View code", p.repository],
    ].filter(([, url]) => /^https?:\/\//i.test(url || ""));
    content.innerHTML = `
      <div class="gallery-shell" role="region" aria-label="Project image gallery" aria-roledescription="carousel">
        <div class="gallery-viewport"><div class="gallery-track">${slides.map((s, n) => `<figure class="gallery-slide" role="group" aria-label="Image ${n + 1} of ${slides.length}"><img src="${esc(s.src)}" alt="${esc(s.alt || p.title)}" draggable="false"></figure>`).join("")}</div></div>
        <div class="gallery-controls"><button data-step="-1" aria-label="Previous image">←</button><span class="gallery-count" aria-live="polite"></span><button data-step="1" aria-label="Next image">→</button></div>
        <p class="gallery-caption"></p>
        <div class="gallery-thumbs" aria-label="Choose image">${slides.map((s, n) => `<button data-thumb="${n}" aria-label="Show image ${n + 1}: ${esc(s.alt || p.title)}"><img src="${esc(s.src)}" alt=""></button>`).join("")}</div>
      </div>
      <div class="project-story"><span class="eyebrow">${esc(p.category)}</span><h2 id="dialog-title">${esc(p.title)}</h2><span class="detail-date">${esc(p.date)}</span>
      <div class="story-columns"><div><h3>The idea</h3><p>${esc(p.description)}</p><div class="detail-tools">${esc(p.tools)}</div></div><div><h3>My contribution</h3><ul>${p.contributions.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div></div>
      <div class="detail-links">${links.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join("")}</div></div>`;
    content
      .querySelectorAll("[data-step]")
      .forEach((b) =>
        b.addEventListener("click", () =>
          setSlide(index + Number(b.dataset.step)),
        ),
      );
    content
      .querySelectorAll("[data-thumb]")
      .forEach((b) =>
        b.addEventListener("click", () => setSlide(Number(b.dataset.thumb))),
      );
    const viewport = content.querySelector(".gallery-viewport");
    viewport.addEventListener("pointerdown", (e) => {
      touchStart = { x: e.clientX, y: e.clientY };
    });
    viewport.addEventListener("pointerup", (e) => {
      if (!touchStart) return;
      const dx = e.clientX - touchStart.x,
        dy = e.clientY - touchStart.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
        setSlide(index + (dx < 0 ? 1 : -1));
      touchStart = null;
    });
    viewport.addEventListener("pointercancel", () => {
      touchStart = null;
    });
    dialog.showModal();
    document.body.classList.add("modal-open");
    setSlide(0);
    dialog.scrollTop = 0;
    document.querySelector(".close-dialog").focus({ preventScroll: true });
  };
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setSlide(index + (e.key === "ArrowRight" ? 1 : -1));
    }
  });
  document
    .querySelector(".close-dialog")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    const r = dialog.getBoundingClientRect();
    if (
      e.target === dialog &&
      (e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    opener?.focus({ preventScroll: true });
  });
})();
