"use strict";

/* ==========================================================================
   common.js — 헤더 메뉴, 언어 선택, 섹션 페이저, 공통 상태 처리
   ========================================================================== */

var LANGUAGE_STORAGE_KEY = "n_seoul_tower_language";
var LANGUAGE_LABELS = { en: "English", ko: "Korean", ja: "Japanese", zh: "Chinese" };
var PENDING_LINK_MESSAGE = "연결할 페이지가 아직 확정되지 않았습니다.";

/* --------------------------------------------------------------------------
   공통 유틸
   -------------------------------------------------------------------------- */
function getFocusableElements(container) {
  var selector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
    ' textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.prototype.filter.call(container.querySelectorAll(selector), function (element) {
    return element.offsetParent !== null || element.getClientRects().length > 0;
  });
}

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* --------------------------------------------------------------------------
   확정되지 않은 링크 안내 (PRD 12.5 / AGENTS 10.6)
   -------------------------------------------------------------------------- */
function initPendingLinks() {
  var statusBox = document.querySelector("[data-link-status]");
  var hideTimer = null;

  function showPendingMessage() {
    if (!statusBox) {
      return;
    }
    statusBox.textContent = PENDING_LINK_MESSAGE;
    statusBox.classList.add("is_open");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(function () {
      statusBox.classList.remove("is_open");
      statusBox.textContent = "";
    }, 2600);
  }

  document.addEventListener("click", function handlePendingLinkClick(event) {
    var target = event.target.closest("[data-pending-link]");
    if (!target) {
      return;
    }
    event.preventDefault();
    showPendingMessage();
  });
}

/* --------------------------------------------------------------------------
   이미지 로드 실패 대체 처리 (PRD 12.4)
   -------------------------------------------------------------------------- */
function initImageFallback() {
  document.addEventListener(
    "error",
    function handleImageError(event) {
      var image = event.target;
      if (!image || image.tagName !== "IMG") {
        return;
      }
      var holder = image.closest(".media") || image.parentElement;
      if (holder) {
        holder.classList.add("has_error");
      }
      image.setAttribute("data-load-failed", "true");
    },
    true
  );
}

/* --------------------------------------------------------------------------
   글로벌 메뉴
   -------------------------------------------------------------------------- */
function initGlobalMenu() {
  var toggleButton = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-menu-panel]");
  var header = document.querySelector(".site_header");
  var toggleLabel = document.querySelector("[data-menu-toggle-label]");

  if (!toggleButton || !panel) {
    return;
  }

  var isMenuOpen = false;
  var previousBodyOverflow = "";

  /* 스크롤 잠금.
     overflow: hidden 으로 스크롤바가 사라지면 뷰포트 폭이 넓어져
     오른쪽 정렬된 토글 버튼이 그만큼 밀립니다.
     실제로 늘어난 폭을 재서 --scrollbar_gap 으로 보정합니다.
     (scrollbar-gutter: stable 을 지원하면 폭이 변하지 않아 보정값은 0 입니다.) */
  function lockBodyScroll() {
    // 기준은 뷰포트가 아니라 실제 본문 흐름 요소여야 합니다.
    // documentElement.clientWidth 는 스크롤바가 사라지면 항상 늘어나서
    // scrollbar-gutter 가 이미 폭을 잡아준 경우에도 중복 보정하게 됩니다.
    var sensor = document.querySelector(".site_wrapper") || document.body;
    var widthBefore = sensor.getBoundingClientRect().width;

    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    var gap = Math.round(sensor.getBoundingClientRect().width - widthBefore);
    if (gap > 0) {
      document.documentElement.style.setProperty("--scrollbar_gap", gap + "px");
    }
  }

  function unlockBodyScroll() {
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.removeProperty("--scrollbar_gap");
  }

  function renderMenuState() {
    toggleButton.setAttribute("aria-expanded", String(isMenuOpen));
    // 햄버거 ↔ X 변형은 CSS(stroke-dasharray / rotate)가 담당합니다.
    toggleButton.classList.toggle("is_open", isMenuOpen);
    panel.classList.toggle("is_open", isMenuOpen);

    if (header) {
      header.classList.toggle("is_menu_open", isMenuOpen);
    }
    if (toggleLabel) {
      toggleLabel.textContent = isMenuOpen ? "Close menu" : "Open menu";
    }
  }

  /* 토글 버튼은 오버레이 위에 남아 닫기 버튼을 겸하므로 포커스 순환에 포함합니다.
     시각 순서(언어 선택 → 토글 → 메뉴 본문)에 맞춰 언어 영역 다음에 끼워 넣습니다. */
  function getMenuFocusables() {
    var focusables = getFocusableElements(panel);
    var lastLanguageIndex = -1;

    focusables.forEach(function (element, index) {
      if (element.closest(".language_selector")) {
        lastLanguageIndex = index;
      }
    });

    focusables.splice(lastLanguageIndex + 1, 0, toggleButton);
    return focusables;
  }

  function openMenu() {
    if (isMenuOpen) {
      return;
    }
    isMenuOpen = true;
    // 폭 보정을 먼저 적용해 오버레이가 그려지는 순간 위치가 어긋나지 않게 합니다.
    lockBodyScroll();
    panel.removeAttribute("hidden");

    // 표시 전환 직후 강제 리플로우로 전환 시작점을 확보한 뒤 클래스를 붙입니다.
    // (requestAnimationFrame 은 탭이 비활성일 때 실행되지 않아 상태가 멈출 수 있습니다.)
    void panel.offsetWidth;
    renderMenuState();

    var focusables = getFocusableElements(panel);
    if (focusables.length > 0) {
      focusables[0].focus();
    }
  }

  function handleMenuToggle() {
    if (isMenuOpen) {
      closeMenu(true);
      return;
    }
    openMenu();
  }

  function closeMenu(shouldRestoreFocus) {
    if (!isMenuOpen) {
      return;
    }
    isMenuOpen = false;
    closeLanguageMenu();
    renderMenuState();
    unlockBodyScroll();

    // 트랜지션이 끝난 뒤 숨김 처리해 포커스 대상에서 제외 (AGENTS 10.1)
    window.setTimeout(
      function () {
        if (!isMenuOpen) {
          panel.setAttribute("hidden", "");
        }
      },
      isReducedMotion() ? 0 : 320
    );

    if (shouldRestoreFocus !== false) {
      toggleButton.focus();
    }
  }

  function handleMenuKeydown(event) {
    if (!isMenuOpen) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    var focusables = getMenuFocusables();
    if (focusables.length === 0) {
      return;
    }

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---- 언어 선택 ---- */
  var languageButton = panel.querySelector("[data-language-button]");
  var languageMenu = panel.querySelector("[data-language-menu]");
  var languageCurrentText = panel.querySelector("[data-language-current]");
  var isLanguageMenuOpen = false;

  function renderLanguageMenuState() {
    if (!languageButton || !languageMenu) {
      return;
    }
    languageButton.setAttribute("aria-expanded", String(isLanguageMenuOpen));
    if (isLanguageMenuOpen) {
      languageMenu.removeAttribute("hidden");
    } else {
      languageMenu.setAttribute("hidden", "");
    }
  }

  function closeLanguageMenu() {
    if (!isLanguageMenuOpen) {
      return;
    }
    isLanguageMenuOpen = false;
    renderLanguageMenuState();
  }

  function handleLanguageMenuToggle() {
    isLanguageMenuOpen = !isLanguageMenuOpen;
    renderLanguageMenuState();
  }

  function renderSelectedLanguage(languageCode) {
    var label = LANGUAGE_LABELS[languageCode];
    if (!label || !languageMenu) {
      return;
    }
    if (languageCurrentText) {
      languageCurrentText.textContent = label;
    }
    Array.prototype.forEach.call(languageMenu.querySelectorAll("[data-language]"), function (option) {
      var isSelected = option.getAttribute("data-language") === languageCode;
      option.setAttribute("aria-current", String(isSelected));
    });
  }

  function readStoredLanguage() {
    var stored = null;
    try {
      stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      return null;
    }
    if (typeof stored !== "string") {
      return null;
    }
    return Object.prototype.hasOwnProperty.call(LANGUAGE_LABELS, stored) ? stored : null;
  }

  function handleLanguageSelect(event) {
    var option = event.target.closest("[data-language]");
    if (!option) {
      return;
    }
    var languageCode = option.getAttribute("data-language");
    if (!Object.prototype.hasOwnProperty.call(LANGUAGE_LABELS, languageCode)) {
      return;
    }
    // 실제 다국어 URL 구조가 확정되지 않아 선택 상태만 유지합니다 (PRD 13.5)
    renderSelectedLanguage(languageCode);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    } catch (error) {
      /* 저장 불가 환경에서도 선택 상태는 유지 */
    }
    closeLanguageMenu();
    if (languageButton) {
      languageButton.focus();
    }
  }

  if (languageButton && languageMenu) {
    languageButton.addEventListener("click", handleLanguageMenuToggle);
    languageMenu.addEventListener("click", handleLanguageSelect);
    renderSelectedLanguage(readStoredLanguage() || "en");
  }

  toggleButton.addEventListener("click", handleMenuToggle);

  panel.addEventListener("keydown", handleMenuKeydown);
  toggleButton.addEventListener("keydown", handleMenuKeydown);

  panel.addEventListener("click", function handleOutsideClick(event) {
    if (event.target === panel) {
      closeMenu(true);
      return;
    }
    if (isLanguageMenuOpen && !event.target.closest(".language_selector")) {
      closeLanguageMenu();
    }
  });
}

/* --------------------------------------------------------------------------
   family site 드롭다운
   -------------------------------------------------------------------------- */
function initFamilySite() {
  var button = document.querySelector("[data-family-button]");
  var menu = document.querySelector("[data-family-menu]");

  if (!button || !menu) {
    return;
  }

  var isFamilyMenuOpen = false;

  function renderFamilyMenuState() {
    button.setAttribute("aria-expanded", String(isFamilyMenuOpen));
    if (isFamilyMenuOpen) {
      menu.removeAttribute("hidden");
    } else {
      menu.setAttribute("hidden", "");
    }
  }

  function closeFamilyMenu(shouldRestoreFocus) {
    if (!isFamilyMenuOpen) {
      return;
    }
    isFamilyMenuOpen = false;
    renderFamilyMenuState();
    if (shouldRestoreFocus) {
      button.focus();
    }
  }

  button.addEventListener("click", function handleFamilyToggle() {
    isFamilyMenuOpen = !isFamilyMenuOpen;
    renderFamilyMenuState();
  });

  document.addEventListener("click", function handleFamilyOutsideClick(event) {
    if (!isFamilyMenuOpen) {
      return;
    }
    if (!event.target.closest(".family_site")) {
      closeFamilyMenu(false);
    }
  });

  document.addEventListener("keydown", function handleFamilyEscape(event) {
    if (event.key === "Escape") {
      closeFamilyMenu(true);
    }
  });
}

/* --------------------------------------------------------------------------
   섹션 페이저 (PRD 8.4 / 10.5)
   -------------------------------------------------------------------------- */
function initScrollPager() {
  var pager = document.querySelector("[data-scroll-pager]");
  if (!pager) {
    return;
  }

  var items = Array.prototype.slice.call(pager.querySelectorAll("[data-pager-item]"));
  var sections = items
    .map(function (item) {
      var id = item.getAttribute("href");
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length === 0) {
    pager.remove();
    return;
  }

  function renderActiveSection(activeSection) {
    items.forEach(function (item, index) {
      var isActive = sections[index] === activeSection;
      item.classList.toggle("is_active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "true");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  var observer = new IntersectionObserver(
    function handleSectionIntersect(entries) {
      var visible = entries
        .filter(function (entry) {
          return entry.isIntersecting;
        })
        .sort(function (a, b) {
          return b.intersectionRatio - a.intersectionRatio;
        });

      if (visible.length > 0) {
        renderActiveSection(visible[0].target);
      }
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });

  renderActiveSection(sections[0]);
}

/* --------------------------------------------------------------------------
   init
   -------------------------------------------------------------------------- */
function initCommon() {
  initPendingLinks();
  initImageFallback();
  initGlobalMenu();
  initFamilySite();
  initScrollPager();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCommon);
} else {
  initCommon();
}
