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
  var closeButton = document.querySelector("[data-menu-close]");

  if (!toggleButton || !panel) {
    return;
  }

  var isMenuOpen = false;
  var previousBodyOverflow = "";

  function renderMenuState() {
    toggleButton.setAttribute("aria-expanded", String(isMenuOpen));
    panel.classList.toggle("is_open", isMenuOpen);
    document.body.style.overflow = isMenuOpen ? "hidden" : previousBodyOverflow;
  }

  function openMenu() {
    if (isMenuOpen) {
      return;
    }
    isMenuOpen = true;
    previousBodyOverflow = document.body.style.overflow;
    panel.removeAttribute("hidden");

    // 표시 전환 후 다음 프레임에 클래스를 붙여 페이드 전환이 실제로 실행되게 합니다.
    window.requestAnimationFrame(function () {
      renderMenuState();
      var focusables = getFocusableElements(panel);
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    });
  }

  function closeMenu(shouldRestoreFocus) {
    if (!isMenuOpen) {
      return;
    }
    isMenuOpen = false;
    closeLanguageMenu();
    renderMenuState();

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

    var focusables = getFocusableElements(panel);
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

  toggleButton.addEventListener("click", openMenu);

  if (closeButton) {
    closeButton.addEventListener("click", function () {
      closeMenu(true);
    });
  }

  panel.addEventListener("keydown", handleMenuKeydown);

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
