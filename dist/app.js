(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const ticketDialog = document.getElementById("ticketDialog");
  const ticketOpen = document.getElementById("ticketOpen");
  const heroTicketOpen = document.getElementById("heroTicketOpen");
  const ticketClose = document.getElementById("ticketClose");
  const ticketDone = document.getElementById("ticketDone");
  if (ticketDialog) {
    [ticketOpen, heroTicketOpen].forEach((button) => button?.addEventListener("click", () => {
      closeMenu();
      ticketDialog.showModal();
    }));
    [ticketClose, ticketDone].forEach((button) => button?.addEventListener("click", () => ticketDialog.close()));
    ticketDialog.addEventListener("click", (event) => {
      if (event.target === ticketDialog) ticketDialog.close();
    });
  }

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 45);
  }
  updateHeader();

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka navigasi");
    mainNav.classList.remove("open");
  }
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Tutup navigasi" : "Buka navigasi");
    mainNav.classList.toggle("open", open);
  });
  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target) && menuToggle.getAttribute("aria-expanded") === "true") closeMenu();
  });

  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .09, rootMargin: "0px 0px -35px 0px" });
    reveals.forEach((el) => observer.observe(el));
  }

  const hero = document.querySelector(".hero");
  const heroCentral = document.getElementById("heroCentral");
  if (hero && heroCentral && !reduceMotion && matchMedia("(pointer:fine)").matches) {
    hero.addEventListener("pointermove", (event) => {
      const r = hero.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - .5;
      const y = (event.clientY - r.top) / r.height - .5;
      heroCentral.style.setProperty("--hero-parallax-x", (x * -11).toFixed(1) + "px");
      heroCentral.style.setProperty("--hero-parallax-y", (y * -9).toFixed(1) + "px");
      hero.style.setProperty("--bg-shift-x", (x * 13).toFixed(1) + "px");
      hero.style.setProperty("--bg-shift-y", (y * 10).toFixed(1) + "px");
    });
    hero.addEventListener("pointerleave", () => {
      heroCentral.style.setProperty("--hero-parallax-x", "0px");
      heroCentral.style.setProperty("--hero-parallax-y", "0px");
      hero.style.setProperty("--bg-shift-x", "0px");
      hero.style.setProperty("--bg-shift-y", "0px");
    });
  }

  // Aftermovie runs on its own; scrolling affects only the video frame's size.
  const storyScroll = document.getElementById("storyScroll");
  const storyVideo = document.getElementById("storyVideo");
  const storyShell = document.getElementById("storyVideoShell");
  const lineupSection = document.querySelector(".lineup-cover-stack > .lineup");
  const rundownSection = document.getElementById("schedule");
  let rafPending = false;

  if (reduceMotion) {
    storyVideo.removeAttribute("autoplay");
    storyVideo.pause();
  } else {
    storyVideo.play().catch(() => { /* poster stays visible if autoplay is blocked */ });
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  // The extended lineup can be taller than the screen. Pin its bottom edge
  // while the next section rises over it, rather than hiding any artist rows.
  function updateLineupPin() {
    if (!lineupSection) return;
    const offset = Math.min(0, window.innerHeight - lineupSection.offsetHeight);
    lineupSection.style.setProperty("--lineup-pin-top", Math.round(offset) + "px");
  }
  updateLineupPin();
  document.fonts?.ready.then(updateLineupPin);
  if ("ResizeObserver" in window && lineupSection) {
    new ResizeObserver(updateLineupPin).observe(lineupSection);
  }

  function updateVideoFrame() {
    rafPending = false;
    updateHeader();
    if (rundownSection && !reduceMotion) {
      const coverTop = rundownSection.getBoundingClientRect().top;
      const coverProgress = clamp((window.innerHeight - coverTop) / (window.innerHeight * .95), 0, 1);
      rundownSection.style.setProperty("--rundown-content-offset", ((1 - coverProgress) * 38).toFixed(1) + "px");
    }
    const rect = storyScroll.getBoundingClientRect();
    const distance = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / distance, 0, 1);
    if (!reduceMotion) {
      const eased = progress * progress * (3 - 2 * progress);
      const shrink = window.innerWidth <= 600 ? .045 : .09;
      storyShell.style.setProperty("--video-scale", (1 - eased * shrink).toFixed(4));
      storyShell.style.setProperty("--video-radius", (eased * (window.innerWidth <= 600 ? 18 : 30)).toFixed(1) + "px");
    }
  }
  function requestUpdate() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateVideoFrame);
    }
  }
  window.addEventListener("scroll", requestUpdate, { passive:true });
  window.addEventListener("resize", () => { updateLineupPin(); requestUpdate(); });
  updateVideoFrame();

  // DWP-inspired lineup: the artist cutout floats beside the pointer and
  // eases into its position. Touch devices keep a portrait inside each row.
  const lineupWall = document.getElementById("lineupWall");
  const lineupPreview = document.getElementById("lineupCursorPreview");
  if (lineupWall && lineupPreview) {
    const artists = Array.from(lineupWall.querySelectorAll(".lineup-artist"));
    const previewPhotos = Array.from(lineupPreview.querySelectorAll(".lineup-preview-photo"));
    const previewName = document.getElementById("lineupPreviewName");
    const canHover = matchMedia("(hover:hover) and (pointer:fine)").matches;
    // Keep the first screen light, then warm the hover portraits as Line Up approaches.
    if (canHover && "IntersectionObserver" in window) {
      const photoObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        previewPhotos.forEach((photo) => {
          if (!photo.hasAttribute("src")) photo.src = photo.dataset.src;
        });
        observer.disconnect();
      }, { rootMargin:"750px 0px", threshold:0 });
      photoObserver.observe(lineupWall);
    }
    let activeArtist = null;
    let targetX = -500, targetY = -500;
    let currentX = -500, currentY = -500;
    let previewFrame = 0;

    function paintPreview() {
      previewFrame = 0;
      currentX += (targetX - currentX) * .23;
      currentY += (targetY - currentY) * .23;
      lineupPreview.style.transform = `translate3d(${currentX.toFixed(2)}px,${currentY.toFixed(2)}px,0)`;
      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .45) {
        previewFrame = requestAnimationFrame(paintPreview);
      }
    }

    function pointPreview(x, y) {
      const width = lineupPreview.offsetWidth;
      const height = lineupPreview.offsetHeight;
      const gap = 30;
      targetX = x + width + gap + 12 > innerWidth ? x - width - gap : x + gap;
      targetX = clamp(targetX, 12, Math.max(12, innerWidth - width - 12));
      targetY = clamp(y - height * .36, 12, Math.max(12, innerHeight - height - 12));
      if (!lineupPreview.classList.contains("is-visible") || reduceMotion) {
        currentX = targetX;
        currentY = targetY;
        lineupPreview.style.transform = `translate3d(${currentX}px,${currentY}px,0)`;
      } else if (!previewFrame) {
        previewFrame = requestAnimationFrame(paintPreview);
      }
    }

    function showArtist(button, x, y) {
      if (!canHover) return;
      if (activeArtist !== button) {
        activeArtist = button;
        artists.forEach((artist) => {
          const selected = artist === button;
          artist.classList.toggle("is-active", selected);
          artist.setAttribute("aria-pressed", String(selected));
        });
        previewPhotos.forEach((photo) => {
          const isActive = photo.dataset.for === button.dataset.artist;
          if (isActive && !photo.hasAttribute("src")) photo.src = photo.dataset.src;
          photo.classList.toggle("is-active", isActive);
        });
        lineupPreview.style.setProperty("--preview-color", button.dataset.color);
        lineupPreview.dataset.type = button.dataset.type || "cutout";
        previewName.textContent = button.querySelector(".lineup-artist-label").textContent;
      }
      pointPreview(x, y);
      lineupPreview.classList.add("is-visible");
    }

    function hideArtist() {
      activeArtist = null;
      artists.forEach((artist) => {
        artist.classList.remove("is-active");
        artist.setAttribute("aria-pressed", "false");
      });
      lineupPreview.classList.remove("is-visible");
      if (previewFrame) cancelAnimationFrame(previewFrame);
      previewFrame = 0;
    }

    artists.forEach((button) => {
      button.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") showArtist(button, event.clientX, event.clientY);
      });
      button.addEventListener("pointermove", (event) => {
        if (event.pointerType === "mouse") showArtist(button, event.clientX, event.clientY);
      }, { passive:true });
      button.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse" && !event.relatedTarget?.closest?.(".lineup-artist")) hideArtist();
      });
      button.addEventListener("focus", () => {
        if (!canHover) return;
        const rect = button.getBoundingClientRect();
        showArtist(button, rect.left + rect.width * .55, rect.top + rect.height * .5);
      });
      button.addEventListener("blur", () => {
        if (canHover && activeArtist === button) hideArtist();
      });
      button.addEventListener("click", () => {
        if (canHover) return;
        const selected = !button.classList.contains("is-tapped");
        artists.forEach((artist) => {
          const enabled = artist === button && selected;
          artist.classList.toggle("is-tapped", enabled);
          artist.classList.toggle("is-active", enabled);
          artist.setAttribute("aria-pressed", String(enabled));
        });
      });
    });
    lineupWall.addEventListener("pointerleave", hideArtist);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeArtist) {
        hideArtist();
        if (lineupWall.contains(document.activeElement)) document.activeElement.blur();
      }
    });
  }

  const scheduleData = {
    "1": [
      ["15.00", "Open Gate", "Gerbang festival, booth kuliner, dan area aktivitas dibuka."],
      ["15.30", "Festival Warm-up", "Musik pembuka dan pemanasan suasana festival."],
      ["16.15", "Ngabuburit Session", "Aktivitas komunitas dan penampilan sore."],
      ["17.45", "Persiapan Buka Puasa", "Waktu bersiap dan menuju area berbuka."],
      ["18.05", "Buka Bersama", "Menikmati hidangan bersama, mengikuti waktu Magrib setempat."],
      ["19.00", "Main Stage", "Rangkaian penampilan malam di panggung utama."],
      ["20.30", "Closing Set", "Penampilan penutup Hari 01."]
    ],
    "2": [
      ["15.00", "Open Gate", "Gerbang festival, booth kuliner, dan area aktivitas dibuka."],
      ["15.30", "Afternoon Session", "Sesi pembuka dan hiburan sore Hari 02."],
      ["16.15", "Community Session", "Ruang berkumpul, aktivitas, dan penampilan komunitas."],
      ["17.45", "Persiapan Buka Puasa", "Waktu bersiap dan menuju area berbuka."],
      ["18.05", "Buka Bersama", "Menikmati hidangan bersama, mengikuti waktu Magrib setempat."],
      ["19.00", "Night Performances", "Rangkaian penampilan malam Hari 02."],
      ["20.30", "Closing Performance", "Penampilan penutup rangkaian festival."]
    ]
  };
  const timeline = document.getElementById("timelineList");
  const rundownDayLabel = document.getElementById("rundownDayLabel");
  const dayTabs = Array.from(document.querySelectorAll(".day-tab"));
  let selectedDay = "1";
  function renderSchedule(day) {
    selectedDay = day;
    timeline.innerHTML = "";
    scheduleData[day].forEach((event, index) => {
      const row = document.createElement("div");
      row.className = "timeline-item";
      const time = document.createElement("span");
      time.className = "timeline-time";
      time.textContent = event[0];
      const content = document.createElement("div");
      const title = document.createElement("strong");
      title.className = "timeline-title";
      title.textContent = event[1];
      const description = document.createElement("span");
      description.className = "timeline-desc";
      description.textContent = event[2];
      content.append(title, description);
      const number = document.createElement("span");
      number.className = "timeline-num";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(index + 1).padStart(2, "0");
      row.append(time, content, number);
      timeline.append(row);
    });
    dayTabs.forEach((button) => {
      const active = button.dataset.day === day;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    timeline.setAttribute("aria-labelledby", day === "1" ? "day1Tab" : "day2Tab");
    rundownDayLabel.textContent = String(day).padStart(2, "0");
  }
  renderSchedule(selectedDay);
  dayTabs.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (button.dataset.day === selectedDay) return;
      timeline.classList.add("updating");
      setTimeout(() => {
        renderSchedule(button.dataset.day);
        timeline.classList.remove("updating");
      }, reduceMotion ? 0 : 160);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const next = dayTabs[(index + 1) % 2];
        next.focus();
        next.click();
      }
    });
  });

  // Food Market: one scrollable row of tenant identities, not food-photo products.
  // Order CTAs are intentionally omitted until verified order URLs are supplied.
  const marketGrid = document.getElementById("foodMarketGrid");
  const marketPrev = document.getElementById("foodMarketPrev");
  const marketNext = document.getElementById("foodMarketNext");
  const tenantCatalog = Array.isArray(window.KLBB_TENANTS) ? window.KLBB_TENANTS : [];

  if (marketGrid && tenantCatalog.length) {
    const featuredSlugs = [
      "bowlle", "rena-foodies", "se-indonesia", "bakso-rusuk-solo-39",
      "ayam-pak-gembus", "tebubu", "lawson", "burger-bangor",
      "hokben", "shihlin-taiwan-street-snacks", "chatime", "mujigae",
      "pisang-madu-pasti", "jagiya-korean-food"
    ];
    const featured = featuredSlugs
      .map((slug) => tenantCatalog.find((tenant) => tenant.slug === slug))
      .filter(Boolean);
    const visibleTenants = featured.length ? featured : tenantCatalog.filter((tenant) => tenant.logo).slice(0, 14);

    visibleTenants.forEach((tenant) => {
      const card = document.createElement("a");
      card.className = "food-market-card";
      card.href = "./tenants.html#" + encodeURIComponent(tenant.slug);
      card.setAttribute("aria-label", "Lihat tenant " + tenant.name);
      const media = document.createElement("div");
      media.className = "food-market-photo";
      media.style.setProperty("--tenant-bg", tenant.background || "#fff4dc");
      if (tenant.logo) {
        const logo = document.createElement("img");
        logo.src = tenant.logo;
        logo.alt = "Logo " + tenant.name;
        logo.loading = "lazy";
        logo.decoding = "async";
        logo.addEventListener("error", () => {
          const fallback = document.createElement("span");
          fallback.className = "food-market-wordmark";
          fallback.textContent = tenant.name;
          logo.replaceWith(fallback);
        }, { once: true });
        media.append(logo);
      } else {
        const fallback = document.createElement("span");
        fallback.className = "food-market-wordmark";
        fallback.textContent = tenant.name;
        media.append(fallback);
      }
      const body = document.createElement("div");
      body.className = "food-market-card-body";
      const title = document.createElement("h3");
      title.textContent = tenant.name;
      const action = document.createElement("span");
      action.textContent = "KENALI TENANT";
      action.className = "food-market-card-action";
      action.setAttribute("aria-hidden", "true");
      const arrow = document.createElement("span");
      arrow.textContent = "↗";
      arrow.className = "food-market-card-arrow";
      arrow.setAttribute("aria-hidden", "true");
      body.append(title, action, arrow);
      card.append(media, body);
      marketGrid.append(card);
    });

    function updateMarketArrows() {
      const maxScroll = Math.max(0, marketGrid.scrollWidth - marketGrid.clientWidth);
      if (marketPrev) marketPrev.disabled = marketGrid.scrollLeft <= 3;
      if (marketNext) marketNext.disabled = marketGrid.scrollLeft >= maxScroll - 3;
    }
    function scrollMarket(direction) {
      const card = marketGrid.querySelector(".food-market-card");
      const step = card ? card.getBoundingClientRect().width + 19 : 240;
      marketGrid.scrollBy({ left: direction * step * 2, behavior: reduceMotion ? "auto" : "smooth" });
    }
    if (marketPrev) marketPrev.addEventListener("click", () => scrollMarket(-1));
    if (marketNext) marketNext.addEventListener("click", () => scrollMarket(1));
    marketGrid.addEventListener("scroll", updateMarketArrows, { passive: true });
    window.addEventListener("resize", updateMarketArrows, { passive: true });
    requestAnimationFrame(updateMarketArrows);
  }

})();
