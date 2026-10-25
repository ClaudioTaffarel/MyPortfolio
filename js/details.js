/* Certificate viewer and a layout-stable typewriter. No external dependency. */
(() => {
  const app = window.PortfolioApp;
  const dialog = document.querySelector("#certificate-dialog");
  const image = document.querySelector("#certificate-image");
  const note = document.querySelector(".certificate-placeholder-note");
  let opener;
  document.querySelectorAll("[data-certificate]").forEach((button) => {
    button.addEventListener("click", () => {
      const cert = app.data.certificates[Number(button.dataset.certificate)];
      opener = button;
      document.querySelector("#certificate-title").textContent = cert.name;
      document.querySelector("#certificate-meta").textContent =
        `${cert.issuer} · ${cert.date}`;
      const placeholder = !cert.image;
      image.src = cert.image || "assets/certificate-placeholder.svg";
      image.alt = placeholder
        ? "Blank certificate image placeholder"
        : cert.name;
      note.hidden = !placeholder;
      image.onerror = () => {
        image.onerror = null;
        image.src = "assets/certificate-placeholder.svg";
        image.alt = "Blank certificate image placeholder";
        note.textContent = "Certificate image is not available yet.";
        note.hidden = false;
      };
      note.textContent = "Certificate image coming soon.";
      dialog.showModal();
      document.body.classList.add("modal-open");
      dialog.scrollTop = 0;
    });
  });
  document
    .querySelector(".close-certificate")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const r = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom)
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    opener?.focus({ preventScroll: true });
  });
  // Independent timers pause offscreen and retain the full layout while typing.
  function typewriter(host, text, paint) {
    let count = text.length,
      deleting = true,
      visible = false,
      timer;
    function tick() {
      if (app.reduced.matches || !visible || document.hidden) return;
      count += deleting ? -1 : 1;
      paint(count);
      let delay = deleting ? 55 : 100;
      if (count === 0) {
        deleting = false;
        delay = 450;
      }
      if (count === text.length) {
        deleting = true;
        delay = 2800;
      }
      timer = setTimeout(tick, delay);
    }
    function restart() {
      clearTimeout(timer);
      count = text.length;
      deleting = true;
      paint(count);
      if (!app.reduced.matches && visible && !document.hidden)
        timer = setTimeout(tick, 2800);
    }
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    }).observe(host);
    app.reduced.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
  }
  const writer = document.querySelector(".typewriter-live");
  typewriter(writer.parentElement, "just code.", (n) => {
    writer.textContent = "just code.".slice(0, n);
  });
  const major = document.querySelector(".major-letters");
  const text = major.textContent;
  major.replaceChildren(
    ...Array.from(text, (char) => {
      const span = document.createElement("span");
      span.className = "major-character";
      span.textContent = char;
      return span;
    }),
  );
  const letters = [...major.children];
  typewriter(major, text, (n) =>
    letters.forEach((letter, i) => {
      letter.classList.toggle("is-typed", i < n);
      letter.classList.toggle("typing-cursor", i === Math.max(0, n - 1));
    }),
  );
})();
