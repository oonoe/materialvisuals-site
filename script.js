/* =========================================================
   Material Visuals — логика сайта
   ========================================================= */
(function () {
  "use strict";

  const CFG = window.MATERIALVISUALS || {};
  const socials = CFG.socials || {};
  const screenshots = CFG.screenshots || [];

  /* ---------------- утилиты ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let toastTimer = null;
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3600);
  }

  /* ---------------- версии из конфига ---------------- */
  if (CFG.version) $$("[data-version]").forEach((n) => (n.textContent = CFG.version));
  if (CFG.mcVersion) $$("[data-mc-version]").forEach((n) => (n.textContent = CFG.mcVersion));

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- кнопки скачивания ---------------- */
  const downloadUrl = (CFG.downloadUrl || "").trim();

  $$("[data-download]").forEach((btn) => {
    if (downloadUrl) {
      btn.setAttribute("href", downloadUrl);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");
    } else {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        toast("Ссылка на скачивание скоро появится, следи за обновлениями.");
      });
    }
  });

  /* ---------------- соцсети ---------------- */
  const socialMeta = [
    { key: "discord", label: "Discord" },
    { key: "telegram", label: "Telegram" },
    { key: "youtube", label: "YouTube" },
    { key: "support", label: "Поддержка" },
  ];

  const socialsBox = $("#socials");
  if (socialsBox) {
    const items = socialMeta.filter((s) => (socials[s.key] || "").trim());
    if (items.length) {
      socialsBox.innerHTML = items
        .map(
          (s) =>
            `<a class="social" href="${socials[s.key]}" target="_blank" rel="noopener">${s.label}</a>`
        )
        .join("");
    } else {
      socialsBox.innerHTML = `<span class="social" style="opacity:.55;cursor:default">Ссылки скоро</span>`;
    }
  }

  $$("[data-social]").forEach((a) => {
    const url = (socials[a.getAttribute("data-social")] || "").trim();
    if (url) {
      a.setAttribute("href", url);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    } else {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        toast("Ссылка на поддержку появится чуть позже");
      });
    }
  });

  /* ---------------- галерея ---------------- */
  const grid = $("#gallery-grid");
  if (grid) {
    screenshots.forEach((shot, i) => {
      const fig = document.createElement("figure");
      fig.className = "shot";
      if (shot.wide) fig.classList.add("shot--wide");
      fig.style.margin = "0";

      const img = document.createElement("img");
      img.src = shot.src;
      img.alt = shot.title || `Скриншот ${i + 1}`;
      img.loading = "lazy";

      const cap = document.createElement("figcaption");
      cap.className = "shot__caption";
      cap.textContent = shot.title || `Скриншот ${i + 1}`;

      img.addEventListener("error", () => {
        fig.classList.add("shot--placeholder");
        fig.innerHTML = `<div><b>${shot.title || "Скриншот " + (i + 1)}</b><span>положи файл: ${shot.src}</span></div>`;
      });

      fig.append(img, cap);
      fig.addEventListener("click", () => {
        if (fig.classList.contains("shot--placeholder")) return;
        openLightbox(shot.src, shot.title || "");
      });

      grid.appendChild(fig);
    });
  }

  /* ---------------- лайтбокс ---------------- */
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightbox-img");
  const lightboxCap = $("#lightbox-caption");

  function openLightbox(src, caption) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightboxCap.textContent = caption;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  if (lightbox) {
    $(".lightbox__close", lightbox).addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ---------------- шапка при скролле ---------------- */
  const header = $("#header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------- мобильное меню ---------------- */
  const burger = $("#burger");
  const nav = $("#nav");

  function closeNav() {
    nav?.classList.remove("is-open");
    burger?.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
  }

  burger?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  $$(".nav__link").forEach((l) => l.addEventListener("click", closeNav));

  /* ---------------- активный пункт навигации ---------------- */
  const sections = ["features", "compare", "gallery", "download", "changelog", "faq"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          $$(".nav__link").forEach((l) => {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------------- FAQ-аккордеон ---------------- */
  $$(".faq__item").forEach((item) => {
    const q = $(".faq__q", item);
    const a = $(".faq__a", item);
    if (!q || !a) return;

    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      $$(".faq__item.is-open").forEach((other) => {
        other.classList.remove("is-open");
        $(".faq__a", other).style.maxHeight = null;
        $(".faq__q", other).setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------------- появление блоков ---------------- */
  const revealEls = $$("[data-reveal]");
  revealEls.forEach((el) => {
    const delay = el.getAttribute("data-delay");
    if (delay) el.style.setProperty("--d", delay + "ms");
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- подсветка карточек курсором ---------------- */
  $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ---------------- прогресс чтения страницы ---------------- */
  const progress = $("#scroll-progress");
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  /* ---------------- параллакс фона героя ---------------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroBg = $(".hero__bg");

  if (heroBg && !reduceMotion) {
    let ticking = false;
    const moveBg = () => {
      ticking = false;
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = "scale(1.06) translate3d(0," + (y * 0.22).toFixed(1) + "px,0)";
      }
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(moveBg);
        }
      },
      { passive: true }
    );

    // лёгкий сдвиг от курсора на десктопе
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener(
        "pointermove",
        (e) => {
          const dx = (e.clientX / window.innerWidth - 0.5) * 14;
          const dy = (e.clientY / window.innerHeight - 0.5) * 10;
          heroBg.style.backgroundPosition = "calc(50% + " + dx.toFixed(1) + "px) calc(32% + " + dy.toFixed(1) + "px)";
        },
        { passive: true }
      );
    }
  }

  /* ---------------- свет, следующий за курсором ---------------- */
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const cursorGlow = $("#cursor-glow");

  if (cursorGlow && finePointer && !reduceMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let curX = targetX;
    let curY = targetY;
    let started = false;

    const tick = () => {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      cursorGlow.style.transform = "translate3d(" + curX + "px," + curY + "px,0)";
      requestAnimationFrame(tick);
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        cursorGlow.classList.add("is-on");
        if (!started) {
          started = true;
          curX = targetX;
          curY = targetY;
          tick();
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", () => cursorGlow.classList.remove("is-on"));
    document.addEventListener("pointerenter", () => cursorGlow.classList.add("is-on"));
  }

  /* ---------------- магнитные кнопки ---------------- */
  if (finePointer && !reduceMotion) {
    $$(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform =
          "translate(" + (dx * 10).toFixed(1) + "px," + (dy * 7 - 2).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------------- переключатель темы ---------------- */
  (() => {
    const btns = $$("[data-theme-set]");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!btns.length) return;

    const apply = (theme, save) => {
      document.documentElement.setAttribute("data-theme", theme);
      btns.forEach((b) => {
        const on = b.dataset.themeSet === theme;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-checked", String(on));
      });
      if (meta) meta.setAttribute("content", theme === "light" ? "#f3f6fb" : "#05070d");
      if (save) {
        try {
          localStorage.setItem("mv-theme", theme);
        } catch (e) {}
      }
    };

    let saved = null;
    try {
      saved = localStorage.getItem("mv-theme");
    } catch (e) {}
    apply(saved === "light" ? "light" : "dark", false);

    btns.forEach((b) => b.addEventListener("click", () => apply(b.dataset.themeSet, true)));
  })();

})();
