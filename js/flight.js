/* Native scrolling + CSS perspective. No scroll hijacking or WebGL dependency.
   Photos sit at different Z depths; the user's scroll moves the camera.
   Tweak DISTANCE / START / travel for a slower or longer flight. */
(() => {
  const app = window.PortfolioApp,
    esc = app.escape;
  const section = document.querySelector("#work"),
    stage = section.querySelector(".sky-stage");
  const world = document.querySelector("#projects"),
    nav = document.querySelector("#flight-nav");
  const intro = section.querySelector(".sky-intro"),
    caption = section.querySelector(".flight-caption");
  const DISTANCE = 1100,
    START = 900;
  const travel = START + (app.data.projects.length - 1) * DISTANCE + 200;
  // Preserve similar scroll time per project when the content array grows.
  section.style.setProperty(
    "--flight-height",
    `${Math.max(3, app.data.projects.length + 2.2) * 100}svh`,
  );
  section.style.setProperty(
    "--flight-mobile-height",
    `${Math.max(3, app.data.projects.length + 1.2) * 100}svh`,
  );
  let current = -1,
    progress = 0,
    pointerX = 0,
    pointerY = 0;
  world.innerHTML = app.data.projects
    .map(
      (p, i) =>
        `<article class="flight-card"><button data-project="${i}" aria-label="Explore ${esc(p.title)}"><div class="flight-image"><img src="${esc(p.image)}" alt="${esc(p.title)} project preview" decoding="async"></div><h3>${esc(p.title)}</h3><div class="card-meta"><span>PROJECT / ${String(i + 1).padStart(2, "0")}</span><span>TAKE A CLOSER LOOK ↗</span></div></button></article>`,
    )
    .join("");
  nav.innerHTML = app.data.projects
    .map(
      (p, i) =>
        `<button aria-label="Fly to ${esc(p.title)}" data-flight="${i}">${String(i + 1).padStart(2, "0")}</button>`,
    )
    .join("");
  const cards = [...world.children];
  cards.forEach((card, i) =>
    card
      .querySelector("button")
      .addEventListener("click", (e) => app.openProject(i, e.currentTarget)),
  );
  nav.querySelectorAll("button").forEach((b, i) =>
    b.addEventListener("click", () => {
      const target = (START + i * DISTANCE) / travel;
      window.scrollTo({
        top: section.offsetTop + target * (section.offsetHeight - innerHeight),
        behavior: app.paused ? "instant" : "smooth",
      });
    }),
  );
  document
    .querySelector("#flight-open")
    .addEventListener("click", (e) =>
      app.openProject(Math.max(0, current), e.currentTarget),
    );
  stage.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || app.paused) return;
    pointerX = (e.clientX / innerWidth - 0.5) * 12;
    pointerY = (e.clientY / innerHeight - 0.5) * 8;
    app.requestUpdate?.();
  });
  stage.addEventListener("pointerleave", () => {
    pointerX = pointerY = 0;
    app.requestUpdate?.();
  });
  app.updateFlight = () => {
    if (app.paused) {
      cards.forEach((c) => {
        c.inert = false;
        c.querySelector("button").tabIndex = 0;
      });
      return;
    }
    const rect = section.getBoundingClientRect();
    progress = app.clamp(-rect.top / (section.offsetHeight - innerHeight));
    stage.style.setProperty("--flight", progress);
    stage.style.setProperty("--sun-scale", 1 + progress * 0.9);
    intro.style.opacity = app.clamp(1 - progress / 0.14);
    intro.style.transform = `scale(${1 + progress * 4}) translateY(${-progress * 100}px)`;
    const mobile = innerWidth <= 650;
    let nearest = 0,
      nearestDistance = Infinity;
    cards.forEach((card, i) => {
      const z = -START - i * DISTANCE + progress * travel;
      const distance = Math.abs(z);
      if (distance < nearestDistance) {
        nearest = i;
        nearestDistance = distance;
      }
      const x = mobile ? 0 : (i % 2 ? -1 : 1) * -innerWidth * 0.235;
      const y = mobile ? -10 : (i % 2 ? -1 : 1) * 500 * app.clamp(-z / 800);
      const rotation = (i % 2 ? 1 : -1) * (mobile ? 5 : 8);
      const alpha =
        z > 250
          ? app.clamp(1 - (z - 250) / 330)
          : app.clamp(1 + z / 1800, 0.06, 1);
      card.style.transform = `translate(-50%,-50%) translate3d(${x + pointerX}px,${y + pointerY}px,${z}px) rotateZ(${rotation}deg) rotateY(${mobile ? 0 : i % 2 ? -8 : 8}deg)`;
      card.style.opacity = alpha;
      card.style.visibility = z >= 620 ? "hidden" : "visible";
      const enabled = z > -580 && z < 400;
      card.style.pointerEvents = enabled ? "auto" : "none";
      card.inert = !enabled;
      card.querySelector("button").tabIndex = enabled ? 0 : -1;
    });
    if (nearest !== current) {
      current = nearest;
      const p = app.data.projects[current];
      document.querySelector("#flight-category").textContent = p.category;
      document.querySelector("#flight-title").textContent = p.title;
      document.querySelector("#flight-description").textContent = p.intro;
      caption.classList.toggle("on-left", current % 2 === 1);
      nav.querySelectorAll("button").forEach((b, i) => {
        b.classList.toggle("active", i === current);
        b.setAttribute("aria-pressed", String(i === current));
      });
    }
    const visibility =
      app.clamp(1 - nearestDistance / 700) * app.clamp((progress - 0.07) * 12);
    caption.style.opacity = visibility;
    caption.style.transform = `translateY(${(1 - visibility) * 25}px)`;
    caption.inert = visibility < 0.15;
  };
})();
