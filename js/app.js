document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     UTILITY: unified pointer handler
     Fires exactly once per interaction regardless of whether the
     device fires touch events, mouse events, or both (hybrid
     devices). Using 'pointerup' avoids the 300ms tap delay on
     mobile without needing meta viewport tricks, and prevents
     the double-fire bug (touchend + click) that plagued the
     previous version.
  ============================================================ */

  function onTap(el, fn, options = {}) {
    if (!el) return;

    // Track whether a move happened so we don't fire on scroll
    let moved = false;
    let startX = 0;
    let startY = 0;

    el.addEventListener("pointerdown", (e) => {
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
    }, { passive: true });

    el.addEventListener("pointermove", (e) => {
      if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) {
        moved = true;
      }
    }, { passive: true });

    el.addEventListener("pointerup", (e) => {
      if (moved) return;
      fn(e);
    }, options.capture ? { capture: true } : {});
  }

  /* ============================================================
     STATE
  ============================================================ */

  let state = "splash"; // splash | work | page | viewer
  let activeProject = null;
  let activeType = "image"; // image | video
  let currentIndex = 1;
  let lastFocusedCard = null; // for returning focus on viewer close

const projects = {
    "on-seeing":   14,
    "in-passing":  15,
    "meanwhile":   12,
    "on-thin-air": 14,  // Added with your count
    "in-transit":  1,
  };
  
  const vimeoIds = {
    "in-transit": ["1164968539"],
  };

  const projectTexts = {
    "on-seeing": {
      en: `<p>An observation of attention as it wavers and returns, as if it's breathing. These images are made without pursuit, often in moments when looking becomes detached from intention. Particles of gestures, temporary alignments, peripheral events… no arrangements or repetition is present here. The series explores what emerges when perception is allowed to remain incomplete, when the act of seeing is less about recognition and more about encounter. One could call it distraction, and maybe I do.</p>`,
      pt: `<p>Uma observação da atenção enquanto ela expande e contrai, como se respirasse. Estas imagens são feitas sem busca, muitas vezes em momentos em que o olhar se desprende da intenção. Partículas de gestos, alinhamentos temporários, acontecimentos periféricos… sem arranjos ou repetição. A série explora o que surge quando deixamos a percepção ser incompleta, quando o ato de ver é menos sobre reconhecer e mais sobre encontrar algo. Poderíamos chamar isso de distração, e talvez eu chame.</p>`,
    },
    "in-passing": {
      en: `<p>Photographs made while moving: walking, waiting, crossing, from the passenger seat, from any type of moving seat. The work resists fixation and instead follows what appears briefly along the way. Figures dissolve into architecture, shadows interrupt surfaces, glances go unanswered. What remains is a record of transition rather than arrival (is there such a thing, after all?), a trace of things encountered but not possessed.</p>`,
      pt: `<p>Fotografias feitas enquanto me movo: caminhando, esperando, atravessando, sentada no banco do passageiro, sentada em um banco qualquer, de coisa que move ou não (todas movem). O trabalho resiste à fixação e, ao invés, segue o que surge brevemente ao longo do caminho. Figuras se dissolvem na arquitetura, sombras interrompem superfícies, olhares ficam sem resposta. O que permanece é a transição, já que a chegada, talvez, não exista. Um vestígio do que foi encontro e nunca posse.</p>`,
    },
    "meanwhile": {
      en: `<p>Made across intervals of distraction and pause, this series gathers scenes that exist beside declared events. Nothing announces itself as central. Light shifts, bodies lean, structures hold. The images operate in the space between occurrences, where duration stretches and narrative loosens. It is most probably not about climax, as perspective allows you to shuffle importance. I guess it's about the quiet continuity of the ordinary.</p>`,
      pt: `<p>Feita nos intervalos entre distração e pausa, esta série reúne cenas que existem um pouco à margem do que se reconhece como acontecimento. Nada se percebe como central. A luz se desloca, corpos se inclinam, estruturas sustentam. As imagens operam no espaço entre ocorrências, onde a duração se alonga e a narrativa se afrouxa. Muito provavelmente não se trata de clímax, já que a perspectiva permite embaralhar a importância das coisas. Talvez seja apenas a continuidade silenciosa do ordinário.</p>`,
    },
"on-thin-air": {
      en: `<p>Captured from the suspension of flight, where the ground recedes into abstraction and gravity feels like a suggestion rather than a law. In this thin air, forms lose their weight and time stretches into a continuous present. The window isolates clouds that behave like geology and landscapes that flatten into pure texture, stripped of scale and utility. There is no arrival here, only the prolonged duration of being held aloft. It is a view from the interval, aloof from the busy arrangements below, where the world continues unaware of the silence above. Here, seeing is a form of drifting.</p>`,
      pt: `<p>Capturadas da suspensão do voo, onde o chão recua para a abstração e a gravidade parece mais sugestão que lei. Neste ar rarefeito, as formas perdem o peso e o tempo se estica num presente contínuo. A janela isola nuvens que se comportam como geologia e paisagens que se achatam em pura textura, despojadas de escala e utilidade. Não há chegada aqui, apenas a duração prolongada de estar suspensa. É um olhar do intervalo, alheio aos arranjos lá embaixo, onde o mundo segue sem notar o silêncio acima. Aqui, ver é uma forma de derivar.</p>`,
    },    
    "in-transit": {
      en: `<p>The attempt with these moving images is that it doesn't necessarily depart or arrive. They remain in passage: sometimes through the motion of the camera, other times through a voice, a current of air, a subtle shift in the frame… What moves is not always visible; it may be breath, light, a pulse beneath the surface of things.</p><p>The work inhabits a middle state. It does not advance toward resolution, nor does it settle. It continues. In this continuity, attention drifts and gathers, and movement becomes less an event than a condition of being.</p>`,
      pt: `<p>A tentativa com estas imagens em movimento é que não partam, necessariamente, e nem cheguem. Elas permanecem em passagem: às vezes pelo movimento da câmera, às vezes por uma voz, uma corrente de ar, um deslocamento sutil no enquadramento… O que se move nem sempre é visível; pode ser respiração, luz, um pulsar sob a superfície das coisas.</p><p>O trabalho habita um estado intermediário. Ele não avança em direção à resolução, e nem se acomoda. Ele continua. Nessa continuidade, a atenção deriva e se recompõe, e o movimento deixa de ser acontecimento para tornar-se condição de ser.</p>`,
    },
  };

  /* ============================================================
     ELEMENTS
  ============================================================ */

  const body          = document.body;
  const splash        = document.getElementById("splash");
  const enterBtn      = document.getElementById("enter");
  const viewer        = document.getElementById("viewer");
  const viewerBackdrop = document.getElementById("viewer-backdrop");
  const viewerContent = document.getElementById("viewer-content");
  const viewerImg     = document.getElementById("viewer-img");
  const counter       = document.getElementById("counter");

  /* ============================================================
     HELPERS
  ============================================================ */

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function removeVimeoIframe() {
    if (!viewerContent) return;
    const iframe = viewerContent.querySelector("iframe");
    if (iframe) iframe.remove();
  }

  function hardResetViewerMedia() {
    removeVimeoIframe();
    if (viewerImg) {
      viewerImg.hidden = false;
      viewerImg.removeAttribute("src");
      viewerImg.removeAttribute("alt");
      viewerImg.classList.remove("loading");
    }
    if (counter) counter.textContent = "";
  }

  /* ============================================================
     SESSION INTRO TRACKING
  ============================================================ */

  const INTRO_SEEN_KEY = "seen_project_intros_v1";

  function resetSessionIntrosIfRequested() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("resetIntro") === "1") {
        sessionStorage.removeItem(INTRO_SEEN_KEY);
      }
    } catch (_) {}
  }

  resetSessionIntrosIfRequested();

  function getSeenMap() {
    try {
      const raw = sessionStorage.getItem(INTRO_SEEN_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }

  function setSeen(project) {
    try {
      const map = getSeenMap();
      map[project] = 1;
      sessionStorage.setItem(INTRO_SEEN_KEY, JSON.stringify(map));
    } catch (_) {}
  }

  function hasSeen(project) {
    return getSeenMap()[project] === 1;
  }

  /* ============================================================
     VIEWER INTRO OVERLAY
  ============================================================ */

  let viewerIntroActive = false;
  let viewerIntroEl = null;

  function ensureViewerIntroEl() {
    if (viewerIntroEl) return viewerIntroEl;
    if (!viewer) return null;

    const el = document.createElement("div");
    el.id = "viewer-intro";
    el.hidden = true;

    // Tapping the overlay enters — but NOT if tapping inside the card
    // (to allow PT toggle button to work without entering)
    onTap(el, (e) => {
      if (state !== "viewer" || !viewerIntroActive) return;
      // If the tap was on the inner card or its children, ignore
      const inner = el.querySelector(".viewer-intro-inner");
      if (inner && inner.contains(e.target)) return;
      enterViewerFromIntro();
    });

    viewer.appendChild(el);
    viewerIntroEl = el;
    return el;
  }

  function removeViewerIntro() {
    if (!viewerIntroEl) return;
    viewerIntroEl.hidden = true;
    viewerIntroEl.innerHTML = "";
    viewerIntroActive = false;
  }

  function showViewerIntro(project) {
    const el = ensureViewerIntroEl();
    if (!el) return false;

    const data = projectTexts[project];
    if (!data) return false;

    const STORAGE_KEY = `pt_project_${project}`;
    let ptOpen = false;
    try {
      ptOpen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch (_) {}

    el.innerHTML = `
      <div class="viewer-intro-inner">
        <div class="viewer-intro-en">${data.en}</div>
        <div class="viewer-intro-actions">
          <button type="button" class="viewer-intro-pt-toggle" aria-expanded="${ptOpen}">Português</button>
          <div class="viewer-intro-hint">Tap anywhere to enter</div>
        </div>
        <div class="viewer-intro-pt" ${ptOpen ? "" : "hidden"}>${data.pt}</div>
      </div>
    `;

    const btn     = el.querySelector(".viewer-intro-pt-toggle");
    const ptBlock = el.querySelector(".viewer-intro-pt");

    if (btn && ptBlock) {
      // Use onTap so it works on all devices without firing twice
      onTap(btn, (e) => {
        e.stopPropagation();
        ptBlock.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        try { localStorage.setItem(STORAGE_KEY, "1"); } catch (_) {}
      });
    }

    viewerIntroActive = true;
    el.hidden = false;

    if (viewerImg) viewerImg.hidden = true;
    if (counter) {
      counter.textContent = "";
      counter.hidden = true;
    }

    return true;
  }

  function enterViewerFromIntro() {
    if (!activeProject) return;
    setSeen(activeProject);
    removeViewerIntro();
    if (counter) counter.hidden = false;
    renderMedia();
  }

  /* ============================================================
     SPLASH
  ============================================================ */

  function enterWork() {
    state = "work";
    if (splash) splash.hidden = true;
    body.classList.remove("locked");
  }

  onTap(enterBtn, enterWork);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    onTap(btn, () => {
      const target = btn.dataset.nav;
      if (target === "work") {
        enterWork();
      } else {
        state = "page";
        body.classList.remove("locked");
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ============================================================
     WORK CARDS
  ============================================================ */

  document.querySelectorAll("[data-project]").forEach((card) => {
    onTap(card, () => {
      const project = card.dataset.project;
      const type    = card.dataset.type || "image";
      if (!project) return;
      lastFocusedCard = card;
      openViewer(project, type);
    });
  });

  /* ============================================================
     VIEWER: OPEN / CLOSE
  ============================================================ */

  function openViewer(project, type) {
    state         = "viewer";
    activeProject = project;
    activeType    = type || "image";
    currentIndex  = 1;

    body.classList.add("locked");
    if (viewer) {
      viewer.hidden = false;
      // Move focus into viewer for keyboard users
      viewer.focus();
    }

    hardResetViewerMedia();
    removeViewerIntro();

    const needsIntro = !hasSeen(activeProject);
    const didShow    = needsIntro ? showViewerIntro(activeProject) : false;

    if (didShow) return;

    if (counter) counter.hidden = false;
    renderMedia();
  }

  function closeViewer() {
    state = "work";
    removeViewerIntro();
    hardResetViewerMedia();
    if (viewer) viewer.hidden = true;
    body.classList.remove("locked");

    // Return focus to the card that opened the viewer
    if (lastFocusedCard) {
      lastFocusedCard.focus();
      lastFocusedCard = null;
    }
  }

  /* ============================================================
     VIEWER: RENDER MEDIA
  ============================================================ */

  function updateCounter() {
    if (!counter || !activeProject) return;
    const total = projects[activeProject] ?? 0;
    counter.textContent = `${currentIndex} / ${total || "?"}`;
  }

  function renderMedia() {
    if (!activeProject) return;
    updateCounter();

    // VIDEO (Vimeo)
    if (activeType === "video") {
      if (!viewerContent) return;
      if (viewerImg) viewerImg.hidden = true;

      removeVimeoIframe();

      if (counter) counter.textContent = "Loading…";

      const videoId = vimeoIds[activeProject]?.[currentIndex - 1];
      if (!videoId) {
        if (counter) counter.textContent = "Video unavailable";
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.src = `https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0&portrait=0`;
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("title", activeProject);

      iframe.addEventListener("load", () => {
        updateCounter();
      });

      viewerContent.insertBefore(iframe, counter || null);
      return;
    }

    // IMAGE
    removeVimeoIframe();
    if (!viewerImg) return;

    viewerImg.hidden = false;

    const total    = projects[activeProject] ?? 0;
    const file     = `${pad2(currentIndex)}.jpeg`;
    const src      = `images/${activeProject}/${file}`;

    // Soft-focus loading state: blurry → sharp as image loads
    viewerImg.classList.add("loading");
    viewerImg.alt = `${activeProject} — image ${currentIndex} of ${total}`;

    viewerImg.onload = () => {
      viewerImg.classList.remove("loading");
      // Preload next image silently
      if (currentIndex < total) {
        const pre = new Image();
        pre.src = `images/${activeProject}/${pad2(currentIndex + 1)}.jpeg`;
      }
    };

    viewerImg.onerror = () => {
      viewerImg.classList.remove("loading");
      viewerImg.hidden = true;
      if (counter) counter.textContent = "Image unavailable";
    };

    viewerImg.src = src;
  }

  function nextItem() {
    const total = projects[activeProject] ?? 0;
    if (!total) return;
    if (currentIndex < total) {
      currentIndex += 1;
      renderMedia();
    } else {
      closeViewer();
    }
  }

  function prevItem() {
    if (currentIndex > 1) {
      currentIndex -= 1;
      renderMedia();
    }
  }

  /* ============================================================
     VIEWER: CLOSE ON BACKDROP TAP
  ============================================================ */

  onTap(viewerBackdrop, () => {
    if (state !== "viewer") return;
    closeViewer();
  });

  /* ============================================================
     VIEWER: KEYBOARD
  ============================================================ */

  window.addEventListener("keydown", (e) => {
    if (state !== "viewer") return;

    if (viewerIntroActive) {
      if (e.key === "Escape") { closeViewer(); return; }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enterViewerFromIntro();
        return;
      }
      if (["ArrowRight","ArrowDown","PageDown","ArrowLeft","ArrowUp","PageUp"].includes(e.key)) {
        e.preventDefault();
      }
      return;
    }

    if (e.key === "Escape") { closeViewer(); return; }
    if (["ArrowRight","ArrowDown","PageDown"].includes(e.key)) { nextItem(); return; }
    if (["ArrowLeft","ArrowUp","PageUp"].includes(e.key))      { prevItem(); return; }
  });

  /* ============================================================
     VIEWER: SWIPE (touch/pointer — unified, no double-fire)

     Uses pointer events so it works on:
       • iOS Safari (touch)
       • Android Chrome (touch)
       • Surface / iPad with stylus (pointer)
       • Desktop mouse drag (pointer)

     The key fix over the old version: we track pointerdown /
     pointermove / pointerup on viewerContent directly rather than
     mixing touchstart/touchmove/touchend + click, which caused
     the double-fire and missed-tap bugs on hybrid devices.
  ============================================================ */

  if (viewerContent) {
    let pStartX = 0;
    let pStartY = 0;
    let pLastX  = 0;
    let pLastY  = 0;
    let pActive = false;

    const TAP_MAX   = 14; // px — up to this = tap
    const SWIPE_MIN = 40; // px — at least this horizontal = swipe

    viewerContent.addEventListener("pointerdown", (e) => {
      if (state !== "viewer") return;
      if (viewerIntroActive) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      pStartX = pLastX = e.clientX;
      pStartY = pLastY = e.clientY;
      pActive = true;

      // Capture so we get pointermove/up even if pointer leaves element
      viewerContent.setPointerCapture(e.pointerId);
    }, { passive: true });

    viewerContent.addEventListener("pointermove", (e) => {
      if (!pActive) return;
      pLastX = e.clientX;
      pLastY = e.clientY;
    }, { passive: true });

    viewerContent.addEventListener("pointerup", (e) => {
      if (!pActive || state !== "viewer" || viewerIntroActive) {
        pActive = false;
        return;
      }

      pActive = false;

      const dx = pLastX - pStartX;
      const dy = pLastY - pStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      const tag = e.target?.tagName?.toLowerCase?.() || "";
      const onIframe = tag === "iframe" || !!e.target.closest?.("iframe");
      const onImage  = viewerImg && e.target === viewerImg;
      const onMedia  = onIframe || onImage;

      // TAP on media → advance (images only; don't interfere with video controls)
      if (absDx <= TAP_MAX && absDy <= TAP_MAX) {
        if (onIframe) return;           // let Vimeo handle its own taps
        nextItem();
        return;
      }

      // SWIPE — only if clearly horizontal and on media
      if (!onMedia) return;
      if (absDx < SWIPE_MIN || absDx < absDy) return;

      if (dx < 0) nextItem();
      else prevItem();
    }, { passive: true });

    // Click outside media (not on image, not on iframe) → close
    viewerContent.addEventListener("pointerup", (e) => {
      if (!pActive && state === "viewer" && !viewerIntroActive) {
        const dx = pLastX - pStartX;
        const dy = pLastY - pStartY;
        if (Math.abs(dx) > TAP_MAX || Math.abs(dy) > TAP_MAX) return;

        const tag = e.target?.tagName?.toLowerCase?.() || "";
        const onIframe = tag === "iframe" || !!e.target.closest?.("iframe");
        const onImage  = viewerImg && e.target === viewerImg;

        if (!onIframe && !onImage) closeViewer();
      }
    }, { passive: true });
  }

  /* ============================================================
     PARALLAX (desktop / fine pointer only)
     Skipped automatically on touch devices and when user
     prefers reduced motion.
  ============================================================ */

  const hasFinePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (hasFinePointer && !prefersReducedMotion) {
    document.querySelectorAll(".card").forEach((card) => {
      const img = card.querySelector(".card-media img");
      if (!img) return;

      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        img.style.transform = `scale(1.06) translate(${x * 12}px, ${y * 8}px)`;
      });

      card.addEventListener("mouseleave", () => {
        img.style.transform = "scale(1.03) translate(0,0)";
      });
    });
  }

  /* ============================================================
     ABOUT: PORTUGUESE REVEAL (persist, open-once)
  ============================================================ */

  const ptReveal = document.getElementById("pt-reveal");
  const aboutPt  = document.getElementById("about-pt");
  const PT_KEY   = "about_pt_open";

  function openPortugueseAbout() {
    if (!aboutPt || !ptReveal) return;
    aboutPt.hidden = false;
    ptReveal.setAttribute("aria-expanded", "true");
    try { localStorage.setItem(PT_KEY, "1"); } catch (_) {}
  }

  try {
    if (localStorage.getItem(PT_KEY) === "1") openPortugueseAbout();
  } catch (_) {}

  if (ptReveal && aboutPt) {
    onTap(ptReveal, () => {
      if (!aboutPt.hidden) return; // open-once
      openPortugueseAbout();
    });
  }

});
