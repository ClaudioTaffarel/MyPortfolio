/* One-click burst: flat cards, perspective transforms, no WebGL or library. */
(() => {
  const app = window.PortfolioApp;
  const section = document.querySelector("#awards");
  const arena = document.querySelector(".burst-arena");
  const trigger = document.querySelector(".burst-trigger");
  const container = document.querySelector("#certificates");
  const cards = [...container.querySelectorAll("[data-certificate]")];
  const help = document.querySelector(".burst-help");
  const count = document.querySelector(".burst-count");
  let opened = false;
  let animations = [];
  count.textContent = `${String(cards.length).padStart(2, "0")} MILESTONES`;
  const transform = (x, y, rotate) =>
    `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0px) rotateZ(${rotate}deg) rotateY(0deg) scale(1)`;
  function layout(animate = false) {
    animations.forEach((animation) => animation.cancel());
    animations = [];
    const mobile = innerWidth <= 650;
    const rows = Math.ceil(cards.length / 2);
    section.style.setProperty("--mobile-award-height", `${550 + rows * 275}px`);
    cards.forEach((card, i) => {
      let x, y, rotation;
      if (mobile) {
        const column = i % 2,
          row = Math.floor(i / 2);
        x = (column ? 1 : -1) * (arena.clientWidth / 4);
        if (i === cards.length - 1 && cards.length % 2) x = 0;
        y = -arena.clientHeight / 2 + 135 + row * 275;
        rotation = i % 2 ? 3 : -3;
      } else {
        const angle = -Math.PI / 2 + i * ((Math.PI * 2) / cards.length);
        x = Math.cos(angle) * Math.min(innerWidth * 0.34, 485);
        y = Math.sin(angle) * 285;
        rotation = Math.sin(angle) * 9;
      }
      const end = transform(x, y, rotation);
      card.style.setProperty("--card-x", `${x}px`);
      card.style.setProperty("--card-y", `${y}px`);
      card.style.setProperty("--card-turn", `${rotation}deg`);
      if (opened && animate && !app.reduced.matches) {
        animations.push(
          card.animate(
            [
              {
                transform:
                  "translate(-50%, -50%) translate3d(0,0,-180px) rotateZ(-100deg) rotateY(160deg) scale(.08)",
                opacity: 0,
              },
              {
                offset: 0.55,
                transform: `translate(-50%,-50%) translate3d(${x * 1.09}px,${y * 1.09}px,100px) rotateZ(${rotation + 375}deg) rotateY(-24deg) scale(1.06)`,
                opacity: 1,
              },
              { transform: end, opacity: 1 },
            ],
            {
              duration: 1250,
              delay: i * 65,
              easing: "cubic-bezier(.2,.75,.25,1)",
              fill: "backwards",
            },
          ),
        );
      }
    });
  }
  trigger.addEventListener("click", () => {
    if (!opened) {
      opened = true;
      section.classList.add("is-open");
      container.inert = false;
      trigger.setAttribute("aria-expanded", "true");
      trigger.querySelector("span").innerHTML = "Make it<br />burst again";
      help.textContent = "Pick a card to see the certificate.";
    }
    layout(true);
  });
  // Focused cards remain still and on top. Escape is reserved for native modals.
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || app.reduced.matches) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty(
        "--hover-x",
        `${-(event.clientY - r.top - r.height / 2) * 0.06}deg`,
      );
      card.style.setProperty(
        "--hover-y",
        `${(event.clientX - r.left - r.width / 2) * 0.06}deg`,
      );
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--hover-x", "0deg");
      card.style.setProperty("--hover-y", "0deg");
    });
  });
  addEventListener("resize", () => layout());
  app.reduced.addEventListener("change", () => layout());
  layout();
})();
