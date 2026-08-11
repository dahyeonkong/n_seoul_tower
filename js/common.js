"use strict";

/* ==========================================================================
   common.js — 헤더 메뉴, 언어 선택, 섹션 페이저, 공통 상태 처리
   ========================================================================== */

var LANGUAGE_STORAGE_KEY = "n_seoul_tower_language";
var LANGUAGE_LABELS = { en: "English", ko: "Korean", ja: "Japanese", zh: "Chinese" };

var LENIS_VERSION = "1.3.25";
var LENIS_SCRIPT_URL = "https://unpkg.com/lenis@" + LENIS_VERSION + "/dist/lenis.min.js";
var LENIS_STYLE_URL = "https://unpkg.com/lenis@" + LENIS_VERSION + "/dist/lenis.css";
var lenisInstance = null;
var lenisLoadPromise = null;
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
   Lenis smooth scroll
   -------------------------------------------------------------------------- */
function loadLenisAssets() {
  if (window.Lenis) {
    return Promise.resolve(true);
  }

  if (lenisLoadPromise) {
    return lenisLoadPromise;
  }

  if (!document.querySelector('[data-lenis-style]')) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = LENIS_STYLE_URL;
    stylesheet.setAttribute("data-lenis-style", "");
    document.head.appendChild(stylesheet);
  }

  lenisLoadPromise = new Promise(function (resolve) {
    var script = document.querySelector('[data-lenis-script]');

    function handleLenisLoad() {
      resolve(typeof window.Lenis === "function");
    }

    function handleLenisError() {
      resolve(false);
    }

    if (!script) {
      script = document.createElement("script");
      script.src = LENIS_SCRIPT_URL;
      script.defer = true;
      script.setAttribute("data-lenis-script", "");
      script.addEventListener("load", handleLenisLoad, { once: true });
      script.addEventListener("error", handleLenisError, { once: true });
      document.head.appendChild(script);
      return;
    }

    if (window.Lenis) {
      handleLenisLoad();
      return;
    }

    script.addEventListener("load", handleLenisLoad, { once: true });
    script.addEventListener("error", handleLenisError, { once: true });
  });

  return lenisLoadPromise;
}

function destroySmoothScroll() {
  if (!lenisInstance) {
    return;
  }

  lenisInstance.destroy();
  lenisInstance = null;
}

function initSmoothScroll() {
  if (isReducedMotion() || lenisInstance) {
    return;
  }

  loadLenisAssets().then(function (isLoaded) {
    if (!isLoaded || isReducedMotion() || lenisInstance) {
      return;
    }

    lenisInstance = new window.Lenis({
      autoRaf: true,
      autoToggle: true,
      anchors: true,
      allowNestedScroll: true
    });

    if (document.body.style.overflow === "hidden") {
      lenisInstance.stop();
    }
  });
}

function initMotionPreference() {
  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  function handleMotionPreferenceChange(event) {
    if (event.matches) {
      destroySmoothScroll();
      return;
    }

    initSmoothScroll();
  }

  if (typeof motionPreference.addEventListener === "function") {
    motionPreference.addEventListener("change", handleMotionPreferenceChange);
  } else if (typeof motionPreference.addListener === "function") {
    motionPreference.addListener(handleMotionPreferenceChange);
  }

  initSmoothScroll();
}
/* --------------------------------------------------------------------------
   서브페이지 공통 헤더
   마크업은 이 템플릿 한 곳에서 관리하고 현재 URL에 맞춰 활성 링크만 설정합니다.
   -------------------------------------------------------------------------- */
function getSubHeaderMarkup() {
  return `
<header class="site_header site_header_sub">
      <div class="page_container site_header_inner">
        <a class="brand_logo" href="../index.html" aria-label="N Seoul Tower home">
          <img src="../assets/nst_logo_defalut.svg" alt="" width="43" height="43">
        </a>

        <!-- Desktop subpage navigation -->
        <nav class="site_gnb" aria-label="Main menu">
          <ul class="site_gnb_list">
            <li class="site_gnb_group">
              <a class="site_gnb_title" href="./brand_story.html">tower story</a>
              <ul class="site_gnb_lnb">
                <li><a class="site_gnb_link" href="./brand_story.html">brand story</a></li>
                <li><button class="site_gnb_link" type="button" data-pending-link aria-disabled="true">history</button>
                </li>
              </ul>
            </li>
            <li class="site_gnb_group">
              <a class="site_gnb_title" href="./restaurant_n_burger.html">explore</a>
              <ul class="site_gnb_lnb">
                <li><a class="site_gnb_link" href="./restaurant_n_burger.html">restaurants</a></li>
                <li><a class="site_gnb_link" href="./n_gift_shop.html">N gift shop</a></li>
                <li><button class="site_gnb_link" type="button" data-pending-link
                    aria-disabled="true">amenities</button></li>
                <li><a class="site_gnb_link" href="./floor_guide.html">floor guide</a></li>
              </ul>
            </li>
            <li class="site_gnb_group">
              <a class="site_gnb_title" href="./visitor_guide.html">visit</a>
              <ul class="site_gnb_lnb">
                <li><button class="site_gnb_link" type="button" data-pending-link aria-disabled="true">Hours &amp;
                    Tickets</button></li>
                <li><a class="site_gnb_link" href="./visitor_guide.html">visitor guide</a></li>
              </ul>
            </li>
            <li class="site_gnb_group txt_gray">
              <p class="site_gnb_title">events</p>
            </li>
            <li class="site_gnb_group txt_gray">
              <p class="site_gnb_title">support</p>
              <ul class="site_gnb_lnb">
                <li><button class="site_gnb_link" type="button" data-pending-link aria-disabled="true">notice &amp;
                    news</button></li>
                <li><button class="site_gnb_link" type="button" data-pending-link aria-disabled="true">FAQ / contact
                    us</button></li>
              </ul>
            </li>
          </ul>

          <a class="book_now_btn" href="https://naver.me/x0UEXKKZ" target="_blank" rel="noopener noreferrer">Book Now</a>

          <div class="site_gnb_language">
            <button class="site_gnb_language_button" type="button" data-language-button aria-expanded="false"
              aria-controls="header_language_menu">
              <span data-language-current>English</span>
              <img src="../assets/icon/icon_chevron_down_dark.svg" alt="" width="20" height="20">
              <span class="visually_hidden">Change language</span>
            </button>
            <ul class="site_gnb_language_menu" id="header_language_menu" data-language-menu hidden>
              <li><button class="site_gnb_language_option" type="button" data-language="en"
                  aria-current="true">English</button></li>
              <li><button class="site_gnb_language_option" type="button" data-language="ko">Korean</button></li>
              <li><button class="site_gnb_language_option" type="button" data-language="ja">Japanese</button></li>
              <li><button class="site_gnb_language_option" type="button" data-language="zh">Chinese</button></li>
            </ul>
          </div>
        </nav>
        <button class="menu_toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="global_menu">
          <svg class="menu_toggle_icon" viewBox="0 0 40 40" fill="currentColor" aria-hidden="true" focusable="false">
            <path class="menu_toggle_bar menu_toggle_bar_top"
              d="M13.2201 8.75786C13.6122 8.73215 14.1638 8.74854 14.5647 8.74873L16.9757 8.74952L24.5234 8.74926L31.5781 8.74912L33.8633 8.74911C34.2621 8.74909 34.6754 8.74368 35.0736 8.75739C35.3029 8.76528 35.5551 8.86073 35.7406 8.99694C36.01 9.19463 36.1879 9.49307 36.2334 9.82411C36.3334 10.5386 35.8289 11.1569 35.1219 11.2444C34.7602 11.2726 34.2127 11.257 33.8383 11.2568L31.6121 11.2562L24.559 11.2562L17.0156 11.2564L14.5868 11.2574C14.1572 11.2576 13.7295 11.266 13.2985 11.2496C12.2629 11.2101 11.721 10.0355 12.3559 9.2183C12.5929 8.91332 12.8454 8.81067 13.2201 8.75786Z" />
            <path class="menu_toggle_bar menu_toggle_bar_middle"
              d="M4.90152 18.7566C5.49424 18.73 6.21084 18.749 6.81463 18.749L10.3771 18.7491L21.2264 18.7491H30.4393L33.4262 18.7486C33.8725 18.7486 34.3191 18.7468 34.7652 18.7493C35.1607 18.7515 35.4463 18.768 35.7652 19.0166C36.0264 19.2187 36.1963 19.5166 36.2373 19.8443C36.2785 20.1705 36.1883 20.4994 35.9865 20.7588C35.7564 21.0515 35.474 21.1994 35.1086 21.2465C34.5719 21.275 33.873 21.2566 33.3254 21.2566L30.1414 21.2568L20.3223 21.2564H10.1164L6.78197 21.2572C6.1999 21.2574 5.61889 21.2572 5.03681 21.2521C4.40519 21.2469 3.85435 20.8263 3.7642 20.1877C3.71644 19.8447 3.80783 19.497 4.01799 19.2218C4.25316 18.9169 4.53303 18.8044 4.90152 18.7566Z" />
            <path class="menu_toggle_bar menu_toggle_bar_bottom"
              d="M19.9016 28.7567C20.8455 28.7163 22.0254 28.7493 22.9889 28.7493L28.8801 28.7491H33.0131L34.3523 28.7493C34.8449 28.7497 35.3227 28.6895 35.7408 28.9969C36.0098 29.1948 36.1873 29.493 36.233 29.8237C36.335 30.5538 35.8231 31.1549 35.1086 31.2465C34.7658 31.2649 34.3643 31.2565 34.018 31.2565L32.2586 31.2567L26.791 31.2565L22.2465 31.2569L20.8231 31.2571C20.7117 31.2571 20.5988 31.2588 20.4885 31.2577C20.0619 31.253 19.6234 31.2895 19.2668 31.0106C18.9881 30.7926 18.8093 30.5295 18.7622 30.1764C18.7166 29.8344 18.8107 29.4887 19.0231 29.217C19.2588 28.9129 19.5313 28.8063 19.9016 28.7567Z" />
          </svg>
          <span class="visually_hidden" data-menu-toggle-label>Open menu</span>
        </button>
      </div>
    </header>

    <!-- Mobile and tablet global menu -->
    <div class="global_menu" id="global_menu" data-menu-panel hidden>
      <div class="mobile_global_menu">
        <a class="mobile_menu_brand" href="../index.html">N SEOUL TOWER</a>
        <nav class="mobile_menu_nav" aria-label="Mobile main menu">
          <ul class="mobile_menu_list">
            <li class="mobile_menu_item">
              <button class="mobile_menu_toggle" type="button" data-mobile-menu-toggle aria-expanded="false" aria-controls="mobile_menu_tower_story">
                <span class="mobile_menu_label">tower story</span>
                <span class="mobile_menu_arrow" aria-hidden="true"></span>
              </button>
              <ul class="mobile_menu_submenu" id="mobile_menu_tower_story" hidden>
                <li><a class="mobile_menu_sublink" href="./brand_story.html">brand story</a></li>
                <li><button class="mobile_menu_sublink" type="button" disabled>history</button></li>
              </ul>
            </li>
            <li class="mobile_menu_item">
              <button class="mobile_menu_toggle" type="button" data-mobile-menu-toggle aria-expanded="false" aria-controls="mobile_menu_explore">
                <span class="mobile_menu_label">explore</span>
                <span class="mobile_menu_arrow" aria-hidden="true"></span>
              </button>
              <ul class="mobile_menu_submenu" id="mobile_menu_explore" hidden>
                <li><a class="mobile_menu_sublink" href="./restaurant_n_burger.html">restaurants</a></li>
                <li><a class="mobile_menu_sublink" href="./n_gift_shop.html">N gift shop</a></li>
                <li><button class="mobile_menu_sublink" type="button" disabled>amenities</button></li>
                <li><a class="mobile_menu_sublink" href="./floor_guide.html">floor guide</a></li>
              </ul>
            </li>
            <li class="mobile_menu_item">
              <button class="mobile_menu_toggle" type="button" data-mobile-menu-toggle aria-expanded="false" aria-controls="mobile_menu_visit">
                <span class="mobile_menu_label">visit</span>
                <span class="mobile_menu_arrow" aria-hidden="true"></span>
              </button>
              <ul class="mobile_menu_submenu" id="mobile_menu_visit" hidden>
                <li><button class="mobile_menu_sublink" type="button" disabled>Hours &amp; Tickets</button></li>
                <li><a class="mobile_menu_sublink" href="./visitor_guide.html">visitor guide</a></li>
              </ul>
            </li>
            <li class="mobile_menu_item">
              <button class="mobile_menu_toggle" type="button" disabled aria-disabled="true">
                <span class="mobile_menu_label">events</span>
                <span class="mobile_menu_arrow" aria-hidden="true"></span>
              </button>
            </li>
            <li class="mobile_menu_item">
              <button class="mobile_menu_toggle" type="button" data-mobile-menu-toggle aria-expanded="false" aria-controls="mobile_menu_support">
                <span class="mobile_menu_label">support</span>
                <span class="mobile_menu_arrow" aria-hidden="true"></span>
              </button>
              <ul class="mobile_menu_submenu" id="mobile_menu_support" hidden>
                <li><button class="mobile_menu_sublink" type="button" disabled>notice &amp; news</button></li>
                <li><button class="mobile_menu_sublink" type="button" disabled>FAQ / contact us</button></li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>

      <div class="page_container global_menu_head">
        <div class="language_selector">
          <button class="language_button" type="button" data-language-button aria-expanded="false"
            aria-controls="language_menu">
            <span data-language-current>English</span>
            <img src="../assets/icon/icon_chevron_down.svg" alt="" width="20" height="20">
            <span class="visually_hidden">Change language</span>
          </button>
          <ul class="language_menu" id="language_menu" data-language-menu hidden>
            <li><button class="language_option" type="button" data-language="en" aria-current="true">English</button>
            </li>
            <li><button class="language_option" type="button" data-language="ko" disabled>Korean</button></li>
            <li><button class="language_option" type="button" data-language="ja" disabled>Japanese</button></li>
            <li><button class="language_option" type="button" data-language="zh" disabled>Chinese</button></li>
          </ul>
        </div>
      </div>

      <div class="page_container global_menu_body">
        <div class="menu_brand">
          <div class="menu_brand_logo">
            <a class="menu_brand_home" href="../index.html">
              <img src="../assets/nst_logo_gray.svg" alt="" width="219" height="136">
              <p class="menu_brand_name"><span>N</span> SEOUL TOWER</p>
            </a>
          </div>
          <a class="book_btn" href="https://naver.me/x0UEXKKZ" target="_blank" rel="noopener noreferrer">
            <img src="../assets/icon/icon_ticket.svg" alt="" width="24" height="24">
            buy ticket
          </a>
        </div>

        <nav class="gnb" aria-label="Main menu">
          <div class="gnb_group">
            <p class="gnb_title">tower story</p>
            <ul class="gnb_lnb">
              <li><a class="gnb_link" href="./brand_story.html">brand story</a></li>
              <li><button class="gnb_link" type="button" data-pending-link aria-disabled="true">history</button></li>
            </ul>
          </div>
          <div class="gnb_group">
            <p class="gnb_title">explore</p>
            <ul class="gnb_lnb">
              <li><a class="gnb_link" href="./restaurant_n_burger.html">restaurants</a></li>
              <li><a class="gnb_link" href="./n_gift_shop.html">N gift shop</a></li>
              <li><button class="gnb_link" type="button" data-pending-link aria-disabled="true">amenities</button></li>
              <li><a class="gnb_link" href="./floor_guide.html">floor guide</a></li>
            </ul>
          </div>
          <div class="gnb_group">
            <p class="gnb_title">visit</p>
            <ul class="gnb_lnb">
              <li><button class="gnb_link" type="button" data-pending-link aria-disabled="true">Hours &amp;
                  Tickets</button></li>
              <li><a class="gnb_link" href="./visitor_guide.html">visitor guide</a></li>
            </ul>
          </div>
          <div class="gnb_group">
            <p class="gnb_title">events</p>
          </div>
          <div class="gnb_group">
            <p class="gnb_title">support</p>
            <ul class="gnb_lnb">
              <li><button class="gnb_link" type="button" data-pending-link aria-disabled="true">notice &amp;
                  news</button></li>
              <li><button class="gnb_link" type="button" data-pending-link aria-disabled="true">FAQ / contact
                  us</button></li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
`;
}

function renderSubHeader() {
  var mount = document.querySelector("[data-sub-header]");
  if (!mount) {
    return;
  }

  mount.insertAdjacentHTML("beforebegin", getSubHeaderMarkup());

  var currentPath = window.location.pathname;
  Array.prototype.forEach.call(
    document.querySelectorAll(".site_gnb_link[href], .gnb_link[href]"),
    function (link) {
      var targetPath = new URL(link.href, window.location.href).pathname;
      if (targetPath === currentPath) {
        link.setAttribute("aria-current", "page");
      }
    }
  );

  mount.remove();
}

/* --------------------------------------------------------------------------
   스크롤 방향 반응형 고정 헤더
   아래로 이동하면 숨기고, 위로 이동하는 즉시 다시 표시합니다.
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  var header = document.querySelector(".site_header");
  if (!header) {
    return;
  }

  var lastScrollPosition = Math.max(window.scrollY, 0);
  var isFrameRequested = false;

  function renderHeaderScrollState() {
    var currentScrollPosition = Math.max(window.scrollY, 0);
    var isAtTop = currentScrollPosition <= 1;
    var isMenuOpen = header.classList.contains("is_menu_open");

    header.classList.toggle("is_scrolled", !isAtTop);

    if (isAtTop || isMenuOpen) {
      header.classList.remove("is_hidden");
    } else if (
      currentScrollPosition > lastScrollPosition &&
      currentScrollPosition > header.offsetHeight
    ) {
      header.classList.add("is_hidden");
    } else if (currentScrollPosition < lastScrollPosition) {
      header.classList.remove("is_hidden");
    }

    lastScrollPosition = currentScrollPosition;
    isFrameRequested = false;
  }

  function handleHeaderScroll() {
    if (isFrameRequested) {
      return;
    }
    isFrameRequested = true;
    window.requestAnimationFrame(renderHeaderScrollState);
  }

  renderHeaderScrollState();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
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

/* --------------------------------------------------------------------------
   탭이 있는 서브페이지 첫 화면 → 다음 섹션 이동
   첫 화면에서 아래로 한 번 스크롤하면 탭 다음 콘텐츠로 이동합니다.
   -------------------------------------------------------------------------- */
function initSubpageSectionJump() {
  var hero = document.querySelector(".subpage_hero.has_scroll_indicator");
  var tabs = document.querySelector(".subpage_tabs");
  var nextSection = tabs ? tabs.nextElementSibling : null;

  if (!hero || !tabs || !nextSection) {
    return;
  }

  var JUMP_LOCK_TIME = 900;
  var SWIPE_THRESHOLD = 24;
  var isJumping = false;
  var unlockTimer = 0;
  var touchStartY = 0;

  function canJump() {
    return !isJumping && window.scrollY <= 12 && document.body.style.overflow !== "hidden";
  }

  function unlockJump() {
    isJumping = false;
  }

  function scrollToNextSection() {
    isJumping = true;
    window.clearTimeout(unlockTimer);
    unlockTimer = window.setTimeout(unlockJump, JUMP_LOCK_TIME);

    if (lenisInstance && typeof lenisInstance.scrollTo === "function") {
      lenisInstance.scrollTo(nextSection, { lock: true, onComplete: unlockJump });
      return;
    }

    nextSection.scrollIntoView({
      behavior: isReducedMotion() ? "auto" : "smooth",
      block: "start"
    });
  }

  function handleSubpageWheel(event) {
    if (event.ctrlKey || event.deltaY <= 0 || !canJump()) {
      return;
    }

    event.preventDefault();
    scrollToNextSection();
  }

  function handleSubpageTouchStart(event) {
    touchStartY = event.touches[0].clientY;
  }

  function handleSubpageTouchMove(event) {
    if (!canJump() || touchStartY - event.touches[0].clientY < SWIPE_THRESHOLD) {
      return;
    }

    event.preventDefault();
    scrollToNextSection();
  }

  window.addEventListener("wheel", handleSubpageWheel, { passive: false });
  window.addEventListener("touchstart", handleSubpageTouchStart, { passive: true });
  window.addEventListener("touchmove", handleSubpageTouchMove, { passive: false });
}

/* --------------------------------------------------------------------------
   언어 선택
   메뉴 오버레이와 서브 페이지 헤더가 같은 동작을 쓰므로 한 곳에서 처리합니다.
   마크업이 달라도 [data-language-button] 의 부모를 기준으로 삼습니다.
   -------------------------------------------------------------------------- */
var languageSelectors = [];

function initLanguageSelector(button) {
  var container = button.parentElement;
  var menu = container ? container.querySelector("[data-language-menu]") : null;
  var currentText = container ? container.querySelector("[data-language-current]") : null;
  var isLanguageMenuOpen = false;

  if (!menu) {
    return null;
  }

  function renderLanguageMenuState() {
    button.setAttribute("aria-expanded", String(isLanguageMenuOpen));
    if (isLanguageMenuOpen) {
      menu.removeAttribute("hidden");
    } else {
      menu.setAttribute("hidden", "");
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
    var requestedOption = menu.querySelector('[data-language="' + languageCode + '"]');

    if (requestedOption && requestedOption.disabled) {
      languageCode = "en";
    }

    var label = LANGUAGE_LABELS[languageCode];
    if (!label) {
      return;
    }
    if (currentText) {
      currentText.textContent = label;
    }
    Array.prototype.forEach.call(menu.querySelectorAll("[data-language]"), function (option) {
      var isSelected = option.getAttribute("data-language") === languageCode;
      option.setAttribute("aria-current", String(isSelected));
    });
  }

  function handleLanguageSelect(event) {
    var option = event.target.closest("[data-language]");
    if (!option || option.disabled) {
      return;
    }
    var languageCode = option.getAttribute("data-language");
    if (!Object.prototype.hasOwnProperty.call(LANGUAGE_LABELS, languageCode)) {
      return;
    }
    // 실제 다국어 URL 구조가 확정되지 않아 선택 상태만 유지합니다 (PRD 13.5)
    // 한 페이지에 선택기가 둘(헤더 GNB, 오버레이 메뉴)이라 표시를 함께 맞춥니다.
    applySelectedLanguage(languageCode);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    } catch (error) {
      /* 저장 불가 환경에서도 선택 상태는 유지 */
    }
    closeLanguageMenu();
    button.focus();
  }

  button.addEventListener("click", handleLanguageMenuToggle);
  menu.addEventListener("click", handleLanguageSelect);
  renderSelectedLanguage(readStoredLanguage() || "en");

  return {
    close: closeLanguageMenu,
    render: renderSelectedLanguage,
    contains: function (node) {
      return container.contains(node);
    }
  };
}

function applySelectedLanguage(languageCode) {
  languageSelectors.forEach(function (selector) {
    selector.render(languageCode);
  });
}

function closeAllLanguageMenus() {
  languageSelectors.forEach(function (selector) {
    selector.close();
  });
}

function initLanguageSelectors() {
  languageSelectors = Array.prototype.map
    .call(document.querySelectorAll("[data-language-button]"), initLanguageSelector)
    .filter(Boolean);

  if (languageSelectors.length === 0) {
    return;
  }

  document.addEventListener("click", function handleLanguageOutsideClick(event) {
    languageSelectors.forEach(function (selector) {
      if (!selector.contains(event.target)) {
        selector.close();
      }
    });
  });

  document.addEventListener("keydown", function handleLanguageEscape(event) {
    if (event.key === "Escape") {
      closeAllLanguageMenus();
    }
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
  var mobileMenuToggles = Array.prototype.slice.call(
    panel.querySelectorAll("[data-mobile-menu-toggle]")
  );

  function closeMobileMenuGroups(exceptButton) {
    mobileMenuToggles.forEach(function (button) {
      if (button === exceptButton) {
        return;
      }

      var submenuId = button.getAttribute("aria-controls");
      var submenu = submenuId ? document.getElementById(submenuId) : null;
      button.setAttribute("aria-expanded", "false");
      if (submenu) {
        submenu.hidden = true;
      }
    });
  }

  function handleMobileMenuToggle(event) {
    var button = event.currentTarget;
    var submenuId = button.getAttribute("aria-controls");
    var submenu = submenuId ? document.getElementById(submenuId) : null;

    if (!submenu) {
      return;
    }

    var willOpen = button.getAttribute("aria-expanded") !== "true";
    closeMobileMenuGroups(willOpen ? button : null);
    button.setAttribute("aria-expanded", String(willOpen));
    submenu.hidden = !willOpen;
  }

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

    if (lenisInstance) {
      lenisInstance.stop();
    }

    var gap = Math.round(sensor.getBoundingClientRect().width - widthBefore);
    if (gap > 0) {
      document.documentElement.style.setProperty("--scrollbar_gap", gap + "px");
    }
  }

  function unlockBodyScroll() {
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.removeProperty("--scrollbar_gap");

    if (lenisInstance && !isReducedMotion()) {
      lenisInstance.start();
    }
  }

  function renderMenuState() {
    toggleButton.setAttribute("aria-expanded", String(isMenuOpen));
    // 햄버거 ↔ X 변형은 CSS(stroke-dasharray / rotate)가 담당합니다.
    toggleButton.classList.toggle("is_open", isMenuOpen);
    panel.classList.toggle("is_open", isMenuOpen);

    if (header) {
      header.classList.toggle("is_menu_open", isMenuOpen);
      if (isMenuOpen) {
        header.classList.remove("is_hidden");
      }
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
    closeAllLanguageMenus();
    closeMobileMenuGroups();
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

  toggleButton.addEventListener("click", handleMenuToggle);

  mobileMenuToggles.forEach(function (button) {
    button.addEventListener("click", handleMobileMenuToggle);
  });

  panel.addEventListener("keydown", handleMenuKeydown);
  toggleButton.addEventListener("keydown", handleMenuKeydown);

  panel.addEventListener("click", function handleOutsideClick(event) {
    if (event.target === panel) {
      closeMenu(true);
    }
  });
}

/* --------------------------------------------------------------------------
   공통 푸터 (Figma 987:7708 하단)
   모든 페이지가 같은 마크업을 복사해 쓰던 것을 하나로 모았습니다.
   전 페이지가 완전히 같은 푸터를 씁니다. 맨 위로 이동은 퀵 메뉴가 담당합니다.
   -------------------------------------------------------------------------- */
var FAMILY_SITE_GROUPS = [
  {
    title: "CJ그룹",
    links: [{ label: "CJ주식회사", href: "https://www.cj.net" }]
  },
  {
    title: "식품&식품서비스",
    links: [
      { label: "CJ제일제당", href: "https://www.cj.co.kr" },
      { label: "CJ푸드빌", href: "https://www.cjfoodville.co.kr" },
      { label: "CJ프레시웨이", href: "https://www.cjfreshway.com" }
    ]
  },
  {
    title: "생명공학",
    links: [
      { label: "CJ제일제당 BIO사업부문", href: "https://www.cj.co.kr" },
      { label: "CJ Feed&Care", href: "https://www.cjfeedncare.co.kr" }
    ]
  },
  {
    title: "물류 & 신유통",
    links: [
      { label: "CJ대한통운", href: "https://www.cjlogistics.com" },
      { label: "CJ대한통운 건설부문", href: "https://www.cjlogistics.com" },
      { label: "CJ올리브영", href: "https://www.oliveyoung.co.kr" },
      { label: "CJ올리브네트웍스", href: "https://www.cjolivenetworks.co.kr" },
      { label: "CJ ENM 커머스부문", href: "https://www.cjenm.com" }
    ]
  },
  {
    title: "엔터테인먼트&미디어",
    links: [
      { label: "CJ ENM 엔터테인먼트부문", href: "https://www.cjenm.com" },
      { label: "CJ CGV", href: "https://www.cgv.co.kr" },
      { label: "CJ파워캐스트", href: "https://www.cjpowercast.com" }
    ]
  }
];

var FOOTER_SNS_ITEMS = [
  { name: "Facebook", icon: "icon/sns/sns1.png" },
  { name: "Instagram", icon: "icon/sns/sns2.png" },
  { name: "YouTube", icon: "icon/sns/sns3.png" }
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getFamilySiteMarkup(assetPath) {
  var groups = FAMILY_SITE_GROUPS.map(function (group) {
    var links = group.links
      .map(function (link) {
        return (
          '<a class="family_site_link" href="' + link.href + '" target="_blank" ' +
          'rel="noopener noreferrer">' + escapeHtml(link.label) + "</a>"
        );
      })
      .join("");

    return (
      '<div class="family_site_group">' +
      '<p class="family_site_group_title">' + escapeHtml(group.title) + "</p>" +
      links +
      "</div>"
    );
  }).join("");

  return (
    '<div class="family_site">' +
    '<button class="family_site_button" type="button" data-family-button ' +
    'aria-expanded="false" aria-controls="family_site_menu">' +
    "family site" +
    '<img src="' + assetPath + 'icon/icon_chevron_down.svg" alt="" width="24" height="24" loading="lazy">' +
    "</button>" +
    '<div class="family_site_menu" id="family_site_menu" data-family-menu hidden>' +
    groups +
    "</div>" +
    "</div>"
  );
}

function getFooterSnsMarkup(assetPath) {
  return FOOTER_SNS_ITEMS.map(function (item) {
    return (
      "<li>" +
      /* TODO: 공식 SNS 채널 주소가 확정되면 button 을 a 로 바꿉니다. */
      '<button class="footer_sns_link" type="button" data-pending-link aria-disabled="true">' +
      '<img src="' + assetPath + item.icon + '" alt="" width="24" height="24" loading="lazy">' +
      '<span class="visually_hidden">' + item.name + "</span>" +
      "</button>" +
      "</li>"
    );
  }).join("");
}

function getFooterMarkup(assetPath) {
  var homePath = window.location.pathname.indexOf("/pages/") !== -1
    ? "../index.html"
    : "./index.html";

  return (
    '<footer class="site_footer" data-quick-dark>' +
    '<div class="page_container site_footer_inner">' +
    '<div class="footer_top">' +
    '<a class="footer_logo" href="' + homePath + '" aria-label="N Seoul Tower home">' +
    '<img src="' + assetPath + 'nst_logo_defalut.svg" alt="" width="80" height="107" loading="lazy">' +
    "</a>" +
    "</div>" +

    '<div class="footer_body">' +
    '<div class="footer_info">' +
    '<address class="footer_info_list">' +
    '<p class="footer_info_row">Business Registration Number: 312-81-42519</p>' +
    '<p class="footer_info_row">' +
    "<span>CEO: Lee Geon-il</span>" +
    '<span class="footer_divider" aria-hidden="true"></span>' +
    "<span>Chief Privacy Officer: Kim Jae-wan</span>" +
    "</p>" +
    '<p class="footer_info_row">Address: N Seoul Tower, 105, Namsangongwon-gil, Yongsan-gu, Seoul</p>' +
    '<p class="footer_info_row">' +
    '<a href="tel:+82234559277">Tel : 02) 3455 - 9277, 9288</a>' +
    '<span class="footer_divider" aria-hidden="true"></span>' +
    '<a href="mailto:helpmaster@cj.net">Email : helpmaster@cj.net</a>' +
    "</p>" +
    "</address>" +
    getFamilySiteMarkup(assetPath) +
    "</div>" +

    '<div class="footer_service">' +
    '<h2 class="footer_service_title">customer service</h2>' +
    /* TODO: FAQ / Contact Us 페이지가 확정되면 실제 주소로 교체합니다. */
    '<div class="footer_service_btn_wrap">' +
    '<a class="footer_service_btn" href="#top">FAQ</a>' +
    '<a class="footer_service_btn" href="#top">Contact Us</a>' +
    '</div>' +
    "</div>" +
    "</div>" +

    '<div class="footer_bottom">' +
    '<div class="footer_bottom_row">' +
    '<p class="footer_copyright">© 2026. ALL RIGHTS RESERVED BY SEOUL TOWER</p>' +
    '<ul class="footer_sns">' + getFooterSnsMarkup(assetPath) + "</ul>" +
    "</div>" +
    "</div>" +
    "</div>" +
    "</footer>"
  );
}

function renderCommonFooter() {
  var mount = document.querySelector("[data-common-footer]");
  if (!mount) {
    return;
  }

  mount.insertAdjacentHTML("beforebegin", getFooterMarkup(getCommonAssetPath()));
  mount.remove();
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
   플로팅 퀵 메뉴 (Figma 987:7708)
   -------------------------------------------------------------------------- */
/* 시안의 링은 10도 간격 36칸이고 "CLICK ME" 8글자 뒤에 빈칸 4개가 붙어 3번 반복됩니다. */
var QUICK_RING_UNIT = "CLICK ME    ";
var QUICK_RING_REPEAT = 3;
var QUICK_RING_STEP = 10;
/* 첫 글자가 9시 방향에서 시작해 시계 방향으로 돕니다 (987:6688 이 -90도). */
var QUICK_RING_START = -90;

/* 페이지별로 달라지는 섹션 링크만 이 설정에서 관리합니다. */
var QUICK_MENU_SECTIONS_BY_PAGE = {
  "brand_story.html": [
    { label: "about", href: "#brand_about" },
    { label: "tower data", href: "#tower_data" }
  ],
  "index.html": [
    { label: "main", href: "#hero_section" },
    { label: "events", href: "#events_section" },
    { label: "course", href: "#course_section" },
    { label: "n pass", href: "#pass_section" },
    { label: "n gift shop", href: "#gift_section" },
    { label: "custom goods", href: "#goods_section" }
  ],
  "floor_guide.html": [
    { label: "F5", href: "#floor_f5" },
    { label: "T1", href: "#floor_t1" },
    { label: "T2", href: "#floor_t2" },
    { label: "T3", href: "#floor_t3" },
    { label: "T4", href: "#floor_t4" },
    { label: "T5", href: "#floor_t5" },
    { label: "T7", href: "#floor_t7" }
  ],
  "n_gift_shop.html": [],
  "restaurant_n_burger.html": [
    { label: "about", href: "#burger_info" },
    { label: "gallery", href: "#burger_gallery" },
    { label: "best menu", href: "#burger_best" },
    { label: "full menu", href: "#burger_menu" }
  ],
  "visitor_guide.html": [
    { label: "by bus", href: "#by_bus" },
    { label: "by cable car", href: "#by_cable_car" },
    { label: "city tour bus", href: "#by_city_tour_bus" },
    { label: "by cars", href: "#by_cars" },
    { label: "recommended courses", href: "#panel_recommended_courses" }
  ]
};

function getCurrentPageFileName() {
  var fileName = window.location.pathname.split("/").pop();
  return fileName ? fileName.toLowerCase() : "index.html";
}

function getCommonAssetPath() {
  var scripts = Array.prototype.slice.call(document.scripts);
  var commonScript = scripts.filter(function (script) {
    return /\/js\/common\.js(?:\?|$)/.test(script.src);
  })[0];

  if (commonScript) {
    return new URL("../assets/", commonScript.src).href;
  }

  return window.location.pathname.indexOf("/pages/") !== -1 ? "../assets/" : "./assets/";
}

function getQuickSectionMenuMarkup(sections, assetPath) {
  if (sections.length === 0) {
    return "";
  }

  var links = sections
    .map(function (section) {
      return '<li><a class="quick_section_link" href="' + section.href + '">' + section.label + "</a></li>";
    })
    .join("");

  return (
    '<div class="quick_section">' +
    '<button class="quick_action" type="button" data-quick-section-button aria-expanded="false" ' +
    'aria-controls="quick_section_menu">' +
    '<img src="' + assetPath + 'icon/quick/sections.svg" alt="" width="36" height="36">' +
    '<span class="visually_hidden">Move to a section</span>' +
    "</button>" +
    '<nav class="quick_section_menu" id="quick_section_menu" data-quick-section-menu ' +
    'aria-label="Sections on this page" hidden>' +
    '<button class="quick_section_close" type="button" data-quick-section-close>' +
    '<img src="' + assetPath + 'icon/icon_close.svg" alt="" width="18" height="18">' +
    '<span class="visually_hidden">Close section menu</span>' +
    "</button>" +
    '<p class="quick_section_title">quick menu</p>' +
    '<ul class="quick_section_list">' + links + "</ul>" +
    "</nav>" +
    "</div>"
  );
}

/* 챗봇 패널 — 버튼 옆(데스크톱 기준 왼쪽)으로 펼쳐집니다.
   실제 상담 연결이 없으므로 문의 버튼은 비활성 상태로 둡니다 (AGENTS 10.6). */
var isChatbotSubPage = window.location.pathname.indexOf("/pages/") !== -1;
var chatbotLinks = {
  hours: isChatbotSubPage ? "../index.html#hero_section" : "#hero_section",
  tickets: "https://naver.me/x0UEXKKZ",
  restaurants: isChatbotSubPage ? "./restaurant_n_burger.html" : "./pages/restaurant_n_burger.html",
  giftShop: isChatbotSubPage ? "./n_gift_shop.html" : "./pages/n_gift_shop.html",
  transport: isChatbotSubPage
    ? "./visitor_guide.html#panel_getting_here"
    : "./pages/visitor_guide.html#panel_getting_here"
};

var chatbotData = {
  hours: {
    userMessage: "Hour",
    descriptions: ["N SEOUL TOWER is open 365 days a year."],
    sections: [
      {
        title: "Observatory Hours",
        items: [
          { label: "Weekdays", value: "10:00 AM – 10:30 PM" },
          { label: "Weekends & Holidays", value: "10:00 AM – 11:00 PM" }
        ]
      }
    ],
    notes: [
      "Last admission to the Observatory is 30 minutes before closing.",
      "Operating hours may change depending on weather conditions or operating schedules."
    ],
    buttons: [{ text: "View Hours", url: chatbotLinks.hours }]
  },
  tickets: {
    userMessage: "Tickets",
    sections: [
      {
        title: "Observatory Admission",
        items: [
          { label: "Adult (Age 13+)", value: "KRW 29,000" },
          { label: "Child (Age 3–12)", value: "KRW 23,000" },
          { label: "Senior (Age 65+)", value: "KRW 23,000" }
        ]
      }
    ],
    notes: [
      "Children under 36 months can enter free of charge when accompanied by a guardian, limited to one child per guardian.",
      "For ticket information and admission details, please check the ticket page."
    ],
    buttons: [
      { text: "Book Tickets", url: chatbotLinks.tickets, isExternal: true }
    ]
  },
  restaurants: {
    userMessage: "Restaurants",
    descriptions: ["We have several dining options at N Seoul Tower."],
    sections: [
      {
        title: "Locations",
        items: [
          { label: "N Burger", value: "Tower 1F" },
          { label: "n.Grill", value: "Tower 7F" },
          { label: "Hancook Korean Grill & Dine", value: "Tower 3F" },
          { label: "The Place Dining", value: "Tower 2F" },
          { label: "Durumi Bunsik", value: "Tower 1F" },
          { label: "N Terrace", value: "Tower 1F" },
          { label: "N Sweet Bar", value: "Tower 5F" }
        ]
      }
    ],
    notes: ["For more details, please visit our Restaurants page."],
    buttons: [{ text: "Go to Restaurants Page", url: chatbotLinks.restaurants }]
  },
  giftShop: {
    userMessage: "N Gift Shop",
    descriptions: [
      "Looking for a special souvenir from N SEOUL TOWER?",
      "Visit the N Gift Shop to discover unique souvenirs and special items inspired by Seoul and N SEOUL TOWER."
    ],
    sections: [
      {
        title: "Locations & Hours",
        items: [
          { label: "PLAZA 5F", value: "10:00 AM – 10:00 PM" },
          {
            label: "Tower 1F",
            value: ["Weekdays: 10:00 AM – 10:30 PM", "Weekends & Holidays: 10:00 AM – 11:00 PM"]
          },
          {
            label: "Tower 5F",
            value: ["Weekdays: 10:00 AM – 10:30 PM", "Weekends & Holidays: 10:00 AM – 11:00 PM"]
          }
        ]
      }
    ],
    buttons: [{ text: "Go to N Gift Shop", url: chatbotLinks.giftShop }]
  },
  transport: {
    userMessage: "Location & Transport",
    descriptions: ["N SEOUL TOWER is located on Namsan Mountain in the heart of Seoul."],
    sections: [
      {
        title: "Address",
        items: [{ value: ["105 Namsangongwon-gil,", "Yongsan-gu, Seoul"] }]
      }
    ],
    notes: [
      "General vehicle access to Namsan has been restricted, so we recommend using public transportation or nearby parking facilities.",
      "How would you like to get here?"
    ],
    options: [
      { key: "bus", label: "By Bus" },
      { key: "cableCar", label: "By Cable Car" },
      { key: "cityTourBus", label: "By Seoul City Tour Bus" },
      { key: "car", label: "By Car" }
    ]
  },
  bus: {
    userMessage: "By Bus",
    sections: [
      {
        title: "Namsan Sunhwan Shuttle Bus",
        groups: [
          {
            title: "Bus 01A",
            items: [
              { label: "Operating Hours", value: "6:30 AM – 11:00 PM" },
              { label: "Interval", value: "About every 9 minutes" },
              { label: "Fare", value: "KRW 1,500" }
            ]
          },
          {
            title: "Bus 01B",
            items: [
              { label: "Operating Hours", value: "6:30 AM – 11:00 PM" },
              { label: "Interval", value: "About every 14 minutes" },
              { label: "Fare", value: "KRW 1,500" }
            ]
          }
        ]
      }
    ],
    notes: [
      "You can board near Chungmuro Station (Lines 3 & 4) or Dongguk University Station (Line 3).",
      "Transportation card is required."
    ],
    buttons: [{ text: "Back to Transport Options", action: "transportOptions" }]
  },
  cableCar: {
    userMessage: "By Cable Car",
    sections: [
      {
        title: "Namsan Cable Car",
        items: [{ label: "Operating Hours", value: "10:00 AM – 11:00 PM" }],
        groups: [
          {
            title: "Adult",
            items: [
              { label: "Round Trip", value: "KRW 15,000" },
              { label: "One Way", value: "KRW 12,000" }
            ]
          },
          {
            title: "Child",
            items: [
              { label: "Round Trip", value: "KRW 11,500" },
              { label: "One Way", value: "KRW 9,000" }
            ]
          }
        ]
      }
    ],
    notes: [
      "From Myeong-dong Station (Line 4), Exit 3, walk about 10–15 minutes toward the cable car boarding area.",
      "Operating hours may change depending on weather conditions."
    ],
    buttons: [{ text: "Back to Transport Options", action: "transportOptions" }]
  },
  cityTourBus: {
    userMessage: "By Seoul City Tour Bus",
    descriptions: ["Explore Seoul and visit N SEOUL TOWER with the Seoul City Tour Bus."],
    sections: [
      {
        title: "Downtown, Palaces & Namsan Course",
        items: [
          { label: "First Bus", value: "9:20 AM" },
          { label: "Last Bus", value: "4:50 PM" },
          { label: "Interval", value: "About every 30 minutes" }
        ]
      },
      {
        title: "Han River & Namsan Night Tour",
        items: [
          { label: "Departure", value: "7:00 PM" },
          { label: "May – August", value: "7:30 PM" },
          {
            label: "Departure Point",
            value: "In front of Donghwa Duty Free near Gwanghwamun Station (Line 5), Exit 6."
          }
        ]
      }
    ],
    buttons: [{ text: "Back to Transport Options", action: "transportOptions" }]
  },
  car: {
    userMessage: "By Car",
    descriptions: [
      "General vehicle access to Namsan has been restricted since May 1, 2005.",
      "If you are arriving by car, please use a nearby parking lot and continue to N SEOUL TOWER by shuttle bus or on foot."
    ],
    sections: [
      {
        title: "Nearby Parking",
        list: [
          "Seoul Square Parking Lot",
          "National Theater of Korea Parking Lot",
          "Namsan Cable Car Parking Lot",
          "Namsan Park Parking Lot"
        ]
      }
    ],
    buttons: [
      { text: "Back to Transport Options", action: "transportOptions" },
      { text: "View Getting Here", url: chatbotLinks.transport }
    ]
  },
};

function getQuickChatbotCategoriesMarkup() {
  return (
    '<div class="quick_chatbot_categories" data-chatbot-options aria-label="Chatbot question categories">' +
    '<button class="quick_chatbot_category" type="button" data-chatbot-category="hours">Hour</button>' +
    '<button class="quick_chatbot_category" type="button" data-chatbot-category="tickets">Tickets</button>' +
    '<button class="quick_chatbot_category" type="button" data-chatbot-category="restaurants">Restaurants</button>' +
    '<button class="quick_chatbot_category" type="button" data-chatbot-category="giftShop">N Gift Shop</button>' +
    '<button class="quick_chatbot_category" type="button" data-chatbot-category="transport">Location &amp; Transport</button>' +
    "</div>"
  );
}

function getQuickChatbotMarkup(assetPath, hasDummyResponses) {
  return (
    '<section class="quick_chatbot" id="quick_chatbot_panel" data-chatbot-panel ' +
    'role="dialog" aria-modal="false" aria-labelledby="quick_chatbot_title" hidden>' +
    '<header class="quick_chatbot_header">' +
    '<div class="quick_chatbot_brand" aria-hidden="true">' +
    '<span class="quick_chatbot_brand_eyebrow">WELCOME TO</span>' +
    '<span class="quick_chatbot_brand_name">N SEOUL TOWER</span>' +
    "</div>" +
    '<button class="quick_chatbot_close" type="button" data-chatbot-close>' +
    '<img src="' + assetPath + 'icon/icon_close.svg" alt="" width="36" height="36">' +
    '<span class="visually_hidden">Close chatbot</span>' +
    "</button>" +
    '<img class="quick_chatbot_avatar" src="' + assetPath + 'icon/chatbot.png" alt="" width="56" height="56">' +
    '<p class="quick_chatbot_name" id="quick_chatbot_title">N Seoul Tower</p>' +
    '<p class="quick_chatbot_status">How can we help you?</p>' +
    "</header>" +
    '<div class="quick_chatbot_body" data-chatbot-messages role="log" aria-live="polite">' +
    '<article class="quick_chatbot_message quick_chatbot_message_initial">' +
    '<img class="quick_chatbot_message_avatar" src="' + assetPath + 'icon/chatbot.png" alt="" width="32" height="32">' +
    '<div class="quick_chatbot_message_content">' +
    '<div class="quick_chatbot_greeting_bubble">' +
    '<p class="quick_chatbot_message_name">N Seoul Tower</p>' +
    '<p class="quick_chatbot_message_text">Hello, this is N Seoul Tower.</p>' +
    '<p class="quick_chatbot_message_text">Select the type of your question and our chatbot will guide you.</p>' +
    "</div>" +
    (hasDummyResponses
      ? getQuickChatbotCategoriesMarkup()
      : '<button class="quick_chatbot_cta" type="button" data-pending-link aria-disabled="true">Ask a question</button>') +
    "</div>" +
    "</article>" +
    "</div>" +
    "</section>"
  );
}

function getQuickMenuMarkup(sections, assetPath, hasDummyResponses) {
  return (
    '<div class="quick_menu" data-quick-menu>' +
    '<div class="quick_menu_actions" id="quick_menu_actions" data-quick-actions hidden>' +
    '<div class="quick_chat">' +
    '<button class="quick_action quick_chat_toggle" type="button" data-chatbot-toggle ' +
    'aria-expanded="false" aria-controls="quick_chatbot_panel">' +
    '<img class="quick_chat_icon" src="' + assetPath + 'icon/quick/chat.svg" alt="" width="36" height="36">' +
    '<img class="quick_chat_icon quick_chat_icon_close" src="' + assetPath + 'icon/icon_close.svg" ' +
    'alt="" width="36" height="36">' +
    '<span class="visually_hidden" data-chatbot-toggle-label>Open chatbot</span>' +
    '<span class="quick_action_tip" aria-hidden="true">Ask me anything!</span>' +
    "</button>" +
    getQuickChatbotMarkup(assetPath, hasDummyResponses) +
    "</div>" +
    getQuickSectionMenuMarkup(sections, assetPath) +
    '<a class="quick_action" href="#top">' +
    '<img src="' + assetPath + 'icon/quick/arrow_up.svg" alt="" width="36" height="36">' +
    '<span class="visually_hidden">Back to top</span>' +
    "</a>" +
    "</div>" +
    '<button class="quick_toggle" type="button" data-quick-toggle aria-expanded="false" ' +
    'aria-controls="quick_menu_actions">' +
    '<img class="quick_toggle_image" src="' + assetPath + 'icon/chatbot.png" alt="" width="96" height="96">' +
    '<span class="quick_toggle_ring" data-quick-ring aria-hidden="true"></span>' +
    '<span class="visually_hidden" data-quick-toggle-label>Open quick menu</span>' +
    "</button>" +
    "</div>"
  );
}

function renderCommonQuickMenu() {
  var mount = document.querySelector("[data-quick-menu-mount]");
  if (!mount) {
    return;
  }

  var pageName = getCurrentPageFileName();
  var sections = QUICK_MENU_SECTIONS_BY_PAGE[pageName] || [];
  mount.insertAdjacentHTML(
    "beforebegin",
    getQuickMenuMarkup(sections, getCommonAssetPath(), true)
  );
  mount.remove();
}

function renderQuickMenuRing(ring) {
  var text = "";
  var fragment = document.createDocumentFragment();
  var index;

  for (index = 0; index < QUICK_RING_REPEAT; index += 1) {
    text += QUICK_RING_UNIT;
  }

  for (index = 0; index < text.length; index += 1) {
    var letter = text.charAt(index);
    if (letter === " ") {
      continue;
    }

    var char = document.createElement("span");
    char.className = "quick_toggle_char";
    char.style.setProperty("--quick_char_angle", QUICK_RING_START + index * QUICK_RING_STEP + "deg");
    char.textContent = letter;
    fragment.appendChild(char);
  }

  ring.appendChild(fragment);
}

/* 공통 푸터와 data-quick-dark 영역 위에서는 CLICK ME 글자가 묻히므로 밝은 색으로 바꿉니다.
   스크롤마다 위치를 재지 않도록, 관찰 영역을 토글 버튼이 놓인 가로 띠로 좁힌
   IntersectionObserver 로 겹침을 판정합니다 (AGENTS 7.2). */
function initQuickMenuContrast(quickMenu, toggleButton) {
  var darkAreas = Array.prototype.slice.call(
    document.querySelectorAll(".site_footer, [data-quick-dark]")
  );

  if (darkAreas.length === 0 || !("IntersectionObserver" in window)) {
    return;
  }

  var overlappingAreas = [];
  var observer = null;
  var resizeTimer = null;

  function renderContrastState() {
    quickMenu.classList.toggle("is_on_dark", overlappingAreas.length > 0);
  }

  function handleDarkIntersect(entries) {
    entries.forEach(function (entry) {
      var index = overlappingAreas.indexOf(entry.target);

      if (entry.isIntersecting && index === -1) {
        overlappingAreas.push(entry.target);
      } else if (!entry.isIntersecting && index !== -1) {
        overlappingAreas.splice(index, 1);
      }
    });

    renderContrastState();
  }

  /* 관찰 기준은 메뉴 전체가 아니라 토글 버튼입니다.
     펼치면 메뉴 높이가 커지지만 CLICK ME 링은 항상 토글 안에 있습니다. */
  function observeDarkAreas() {
    if (observer) {
      observer.disconnect();
    }

    var rect = toggleButton.getBoundingClientRect();
    var topInset = Math.round(rect.top);
    var bottomInset = Math.round(window.innerHeight - rect.bottom);

    overlappingAreas = [];
    observer = new IntersectionObserver(handleDarkIntersect, {
      rootMargin: -topInset + "px 0px " + -bottomInset + "px 0px",
      threshold: 0
    });

    darkAreas.forEach(function (area) {
      observer.observe(area);
    });
  }

  function handleContrastResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(observeDarkAreas, 200);
  }

  observeDarkAreas();
  window.addEventListener("resize", handleContrastResize);
}

function initQuickMenu() {
  var quickMenu = document.querySelector("[data-quick-menu]");
  if (!quickMenu) {
    return;
  }

  var toggleButton = quickMenu.querySelector("[data-quick-toggle]");
  var actions = quickMenu.querySelector("[data-quick-actions]");
  var toggleLabel = quickMenu.querySelector("[data-quick-toggle-label]");
  var ring = quickMenu.querySelector("[data-quick-ring]");
  var topAction = actions ? actions.querySelector('.quick_action[href="#top"]') : null;
  var sectionButton = quickMenu.querySelector("[data-quick-section-button]");
  var sectionMenu = quickMenu.querySelector("[data-quick-section-menu]");
  var sectionClose = quickMenu.querySelector("[data-quick-section-close]");
  var sectionItems = [];
  var chatbotToggle = quickMenu.querySelector("[data-chatbot-toggle]");
  var chatbotPanel = quickMenu.querySelector("[data-chatbot-panel]");
  var chatbotToggleLabel = quickMenu.querySelector("[data-chatbot-toggle-label]");
  var chatbotClose = quickMenu.querySelector("[data-chatbot-close]");
  var chatbotMessages = quickMenu.querySelector("[data-chatbot-messages]");

  if (!toggleButton || !actions) {
    return;
  }

  var hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  var mobileChatbotMediaQuery = window.matchMedia("(max-width: 833px)");

  var isQuickMenuOpen = false;
  var isSectionMenuOpen = false;
  var isChatbotOpen = false;
  var isTopActionVisible = false;
  var isTopActionFrameRequested = false;
  var isQuickSectionFrameRequested = false;
  var isChatbotReplyPending = false;

  /* 맨 위로 이동 버튼은 전체 스크롤 거리의 20%를 넘긴 뒤 노출합니다. */
  if (topAction) {
    topAction.classList.add("quick_top_action");
    topAction.hidden = true;
    quickMenu.insertBefore(topAction, toggleButton);

    function renderTopActionVisibility() {
      var maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      var scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      var shouldShowTopAction = scrollProgress >= 0.2;

      if (shouldShowTopAction !== isTopActionVisible) {
        isTopActionVisible = shouldShowTopAction;
        topAction.hidden = !isTopActionVisible;
      }

      isTopActionFrameRequested = false;
    }

    function requestTopActionRender() {
      if (isTopActionFrameRequested) {
        return;
      }
      isTopActionFrameRequested = true;
      window.requestAnimationFrame(renderTopActionVisibility);
    }

    renderTopActionVisibility();
    window.addEventListener("scroll", requestTopActionRender, { passive: true });
    window.addEventListener("resize", requestTopActionRender);
    window.addEventListener("load", requestTopActionRender);
  }

  if (ring) {
    renderQuickMenuRing(ring);
    initQuickMenuContrast(quickMenu, toggleButton);
  }

  /* 이동할 섹션이 없는 페이지에서는 버튼을 남기지 않습니다 (AGENTS 10.4). */
  if (sectionButton && sectionMenu && sectionMenu.querySelectorAll("[href]").length === 0) {
    sectionButton.parentElement.remove();
    sectionButton = null;
    sectionMenu = null;
  }

  function renderQuickSectionCurrent() {
    var markerPosition = window.scrollY + window.innerHeight * 0.35;
    var visibleItems = sectionItems.filter(function (item) {
      return item.target.getClientRects().length > 0 && !item.target.closest("[hidden]");
    });
    var activeItem = visibleItems.length > 0 ? visibleItems[0] : null;

    visibleItems.forEach(function (item) {
      var targetTop = item.target.getBoundingClientRect().top + window.scrollY;
      if (targetTop <= markerPosition) {
        activeItem = item;
      }
    });

    sectionItems.forEach(function (item) {
      var isCurrent = item === activeItem;
      item.link.classList.toggle("is_active", isCurrent);
      if (isCurrent) {
        item.link.setAttribute("aria-current", "location");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });

    isQuickSectionFrameRequested = false;
  }

  function requestQuickSectionRender() {
    if (isQuickSectionFrameRequested) {
      return;
    }
    isQuickSectionFrameRequested = true;
    window.requestAnimationFrame(renderQuickSectionCurrent);
  }

  if (sectionMenu) {
    sectionItems = Array.prototype.map
      .call(sectionMenu.querySelectorAll('.quick_section_link[href^="#"]'), function (link) {
        return {
          link: link,
          target: document.getElementById(link.hash.slice(1))
        };
      })
      .filter(function (item) {
        return item.target;
      });

    if (sectionItems.length > 0) {
      renderQuickSectionCurrent();
      window.addEventListener("scroll", requestQuickSectionRender, { passive: true });
      window.addEventListener("resize", requestQuickSectionRender);
      window.addEventListener("load", requestQuickSectionRender);

      document.addEventListener("click", function handleGuideTabQuickSection(event) {
        if (event.target.closest("[data-guide-tab]")) {
          requestQuickSectionRender();
        }
      });
      window.addEventListener("hashchange", requestQuickSectionRender);
    }
  }

  function renderSectionMenuState() {
    if (!sectionButton || !sectionMenu) {
      return;
    }
    sectionButton.setAttribute("aria-expanded", String(isSectionMenuOpen));
    sectionMenu.hidden = !isSectionMenuOpen;
  }

  function closeSectionMenu() {
    if (!isSectionMenuOpen) {
      return;
    }
    isSectionMenuOpen = false;
    renderSectionMenuState();
  }

  function renderChatbotState() {
    if (!chatbotToggle || !chatbotPanel) {
      return;
    }
    chatbotToggle.setAttribute("aria-expanded", String(isChatbotOpen));
    chatbotPanel.hidden = !isChatbotOpen;
    chatbotPanel.setAttribute(
      "aria-modal",
      String(isChatbotOpen && mobileChatbotMediaQuery.matches)
    );
    quickMenu.classList.toggle("is_chatbot_open", isChatbotOpen);
    document.body.classList.toggle(
      "has_mobile_chatbot",
      isChatbotOpen && mobileChatbotMediaQuery.matches
    );
    if (chatbotToggleLabel) {
      chatbotToggleLabel.textContent = isChatbotOpen ? "Close chatbot" : "Open chatbot";
    }
  }

  function scrollChatbotToLatest() {
    if (!chatbotMessages) {
      return;
    }

    window.requestAnimationFrame(function renderLatestChatbotMessage() {
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    });
  }

  function setChatbotCategoriesDisabled(isDisabled) {
    if (!chatbotMessages) {
      return;
    }

    Array.prototype.forEach.call(
      chatbotMessages.querySelectorAll("[data-chatbot-category]"),
      function (button) {
        var category = button.dataset.chatbotCategory;
        button.disabled = isDisabled || !chatbotData[category];
      }
    );
  }

  function appendChatbotUserMessage(message) {
    var article = document.createElement("article");
    var name = document.createElement("p");
    var text = document.createElement("p");

    article.className = "quick_chatbot_message quick_chatbot_message_user";
    name.className = "quick_chatbot_message_name";
    name.textContent = "User";
    text.className = "quick_chatbot_message_text";
    text.textContent = message;
    article.append(name, text);
    chatbotMessages.append(article);
    scrollChatbotToLatest();
  }

  function appendChatbotValue(parent, value) {
    var values = Array.isArray(value) ? value : [value];

    values.forEach(function (line) {
      var span = document.createElement("span");
      span.textContent = line;
      parent.append(span);
    });
  }

  function appendChatbotItems(parent, items) {
    if (!items || items.length === 0) {
      return;
    }

    var list = document.createElement("dl");
    list.className = "quick_chatbot_facts";

    items.forEach(function (item) {
      var row = document.createElement("div");
      var value = document.createElement("dd");

      row.className = "quick_chatbot_fact";
      if (item.label) {
        var label = document.createElement("dt");
        label.textContent = item.label;
        row.append(label);
      } else {
        row.classList.add("has_no_label");
      }

      appendChatbotValue(value, item.value);
      row.append(value);
      list.append(row);
    });

    parent.append(list);
  }

  function appendChatbotSections(parent, sections) {
    (sections || []).forEach(function (section) {
      var sectionElement = document.createElement("section");
      var title = document.createElement("h4");

      sectionElement.className = "quick_chatbot_info_section";
      title.className = "quick_chatbot_info_title";
      title.textContent = section.title;
      sectionElement.append(title);
      appendChatbotItems(sectionElement, section.items);

      (section.groups || []).forEach(function (group) {
        var groupElement = document.createElement("div");
        var groupTitle = document.createElement("h5");

        groupElement.className = "quick_chatbot_info_group";
        groupTitle.className = "quick_chatbot_info_group_title";
        groupTitle.textContent = group.title;
        groupElement.append(groupTitle);
        appendChatbotItems(groupElement, group.items);
        sectionElement.append(groupElement);
      });

      if (section.list) {
        var bulletList = document.createElement("ul");
        bulletList.className = "quick_chatbot_info_list";
        section.list.forEach(function (item) {
          var listItem = document.createElement("li");
          listItem.textContent = item;
          bulletList.append(listItem);
        });
        sectionElement.append(bulletList);
      }

      parent.append(sectionElement);
    });
  }

  function createChatbotOptions(options) {
    var optionList = document.createElement("div");
    optionList.className = "quick_chatbot_suboptions";
    optionList.setAttribute("aria-label", "Transport options");

    options.forEach(function (option) {
      var button = document.createElement("button");
      button.className = "quick_chatbot_suboption";
      button.type = "button";
      button.dataset.chatbotCategory = option.key;
      button.textContent = option.label;
      optionList.append(button);
    });

    return optionList;
  }

  function appendChatbotActions(parent, buttons) {
    if (!buttons || buttons.length === 0) {
      return;
    }

    var actions = document.createElement("div");
    actions.className = "quick_chatbot_response_actions";

    buttons.forEach(function (item) {
      var control;
      if (item.url) {
        control = document.createElement("a");
        control.href = item.url;
        if (item.isExternal) {
          control.target = "_blank";
          control.rel = "noopener noreferrer";
        }
      } else {
        control = document.createElement("button");
        control.type = "button";
        control.dataset.chatbotAction = item.action;
      }
      control.className = "quick_chatbot_cta";
      control.textContent = item.text;
      actions.append(control);
    });

    parent.append(actions);
  }

  function appendChatbotTypingIndicator() {
    var indicator = document.createElement("div");
    indicator.className = "quick_chatbot_typing";
    indicator.setAttribute("role", "status");
    indicator.setAttribute("aria-label", "Chatbot is typing");
    indicator.innerHTML = "<span></span><span></span><span></span>";
    chatbotMessages.append(indicator);
    scrollChatbotToLatest();
    return indicator;
  }

  function appendChatbotResponse(response) {
    var article = document.createElement("article");
    var avatar = document.createElement("img");
    var content = document.createElement("div");
    var name = document.createElement("p");
    var referenceAvatar = chatbotPanel.querySelector(".quick_chatbot_message_avatar");

    article.className = "quick_chatbot_message quick_chatbot_message_response";
    avatar.className = "quick_chatbot_message_avatar";
    avatar.src = referenceAvatar ? referenceAvatar.src : "";
    avatar.alt = "";
    avatar.width = 32;
    avatar.height = 32;
    content.className = "quick_chatbot_message_content";
    name.className = "quick_chatbot_message_name";
    name.textContent = "Chatbot";

    content.append(name);
    (response.descriptions || []).forEach(function (description) {
      var text = document.createElement("p");
      text.className = "quick_chatbot_message_text";
      text.textContent = description;
      content.append(text);
    });
    appendChatbotSections(content, response.sections);
    (response.notes || []).forEach(function (note) {
      var text = document.createElement("p");
      text.className = "quick_chatbot_message_text quick_chatbot_message_note";
      text.textContent = note;
      content.append(text);
    });
    if (response.options) {
      content.append(createChatbotOptions(response.options));
    }
    appendChatbotActions(content, response.buttons);

    article.append(avatar, content);
    chatbotMessages.append(article);
    scrollChatbotToLatest();
  }

  function appendTransportOptions() {
    Array.prototype.forEach.call(
      chatbotMessages.querySelectorAll(".quick_chatbot_suboptions_return"),
      function (optionPanel) {
        optionPanel.remove();
      }
    );
    var optionPanel = createChatbotOptions(chatbotData.transport.options);
    optionPanel.classList.add("quick_chatbot_suboptions_return", "quick_chatbot_message_response");
    chatbotMessages.append(optionPanel);
    scrollChatbotToLatest();
  }

  function handleChatbotCategoryClick(event) {
    var button = event.target.closest("[data-chatbot-category]");
    if (!button || isChatbotReplyPending || !chatbotMessages) {
      return;
    }

    var response = chatbotData[button.dataset.chatbotCategory];
    if (!response) {
      return;
    }

    isChatbotReplyPending = true;
    chatbotMessages.setAttribute("aria-busy", "true");
    setChatbotCategoriesDisabled(true);
    appendChatbotUserMessage(response.userMessage);
    var typingIndicator = appendChatbotTypingIndicator();

    window.setTimeout(function renderChatbotResponse() {
      typingIndicator.remove();
      appendChatbotResponse(response);
      isChatbotReplyPending = false;
      chatbotMessages.removeAttribute("aria-busy");
      setChatbotCategoriesDisabled(false);
    }, 400);
  }

  function handleChatbotActionClick(event) {
    var actionButton = event.target.closest("[data-chatbot-action]");
    if (!actionButton || isChatbotReplyPending) {
      return;
    }

    if (actionButton.dataset.chatbotAction === "transportOptions") {
      appendTransportOptions();
    }
  }

  function closeChatbot(shouldRestoreFocus) {
    if (!isChatbotOpen) {
      return;
    }
    isChatbotOpen = false;
    renderChatbotState();

    if (shouldRestoreFocus && chatbotToggle) {
      chatbotToggle.focus();
    }
  }

  function handleChatbotToggle() {
    isChatbotOpen = !isChatbotOpen;
    /* 두 패널이 같은 자리에 겹치므로 섹션 패널은 함께 닫습니다. */
    if (isChatbotOpen) {
      closeSectionMenu();
    }
    renderChatbotState();

    if (isChatbotOpen && mobileChatbotMediaQuery.matches && chatbotClose) {
      chatbotClose.focus();
    }
  }

  function handleChatbotViewportChange() {
    if (isChatbotOpen) {
      renderChatbotState();
    }
  }

  function renderQuickMenuState() {
    toggleButton.setAttribute("aria-expanded", String(isQuickMenuOpen));
    actions.hidden = !isQuickMenuOpen;
    if (toggleLabel) {
      toggleLabel.textContent = isQuickMenuOpen ? "Close quick menu" : "Open quick menu";
    }
  }

  function closeQuickMenu(shouldRestoreFocus) {
    if (!isQuickMenuOpen) {
      return;
    }
    isQuickMenuOpen = false;
    closeSectionMenu();
    closeChatbot(false);
    renderQuickMenuState();

    if (shouldRestoreFocus) {
      toggleButton.focus();
    }
  }

  function handleQuickMenuToggle() {
    if (isQuickMenuOpen) {
      closeQuickMenu(false);
      return;
    }
    isQuickMenuOpen = true;
    renderQuickMenuState();
  }

  function openSectionMenu() {
    if (isSectionMenuOpen) {
      return;
    }
    isSectionMenuOpen = true;
    closeChatbot(false);
    renderSectionMenuState();
  }

  function handleSectionMenuToggle() {
    if (isSectionMenuOpen) {
      closeSectionMenu();
      return;
    }
    openSectionMenu();
  }

  toggleButton.addEventListener("click", handleQuickMenuToggle);

  if (chatbotToggle && chatbotPanel) {
    chatbotToggle.addEventListener("click", handleChatbotToggle);
  }

  if (chatbotClose) {
    chatbotClose.addEventListener("click", function handleChatbotClose() {
      closeChatbot(true);
    });
  }

  if (chatbotMessages) {
    chatbotMessages.addEventListener("click", handleChatbotCategoryClick);
    chatbotMessages.addEventListener("click", handleChatbotActionClick);
  }

  mobileChatbotMediaQuery.addEventListener("change", handleChatbotViewportChange);

  if (sectionButton) {
    sectionButton.addEventListener("click", handleSectionMenuToggle);

    if (sectionClose) {
      sectionClose.addEventListener("click", function handleSectionMenuClose() {
        closeSectionMenu();
        sectionButton.focus();
      });
    }

    /* 마우스 환경에서는 섹션 버튼에 호버만 해도 패널이 열립니다.
       버튼과 패널을 함께 감싸는 .quick_section 에 걸어 패널 위에서는 닫히지 않게 합니다.
       hover 가 없는 터치 환경에서는 기존 클릭 동작만 사용합니다 (AGENTS 6.3). */
    var sectionArea = sectionButton.closest(".quick_section");

    if (sectionArea) {
      sectionArea.addEventListener("mouseenter", function handleSectionPointerEnter() {
        if (!hoverMediaQuery.matches) {
          return;
        }
        openSectionMenu();
      });

    }
  }

  /* 섹션으로 이동한 뒤에는 패널이 화면을 가리지 않게 함께 닫습니다. */
  if (sectionMenu) {
    sectionMenu.addEventListener("click", function handleSectionLinkClick(event) {
      if (event.target.closest("[href]")) {
        closeQuickMenu(false);
      }
    });
  }

  document.addEventListener("click", function handleQuickOutsideClick(event) {
    if (!quickMenu.contains(event.target)) {
      closeQuickMenu(false);
    }
  });

  document.addEventListener("keydown", function handleQuickEscape(event) {
    if (event.key === "Tab" && isChatbotOpen && mobileChatbotMediaQuery.matches) {
      var focusableItems = chatbotPanel.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      var firstItem = focusableItems[0];
      var lastItem = focusableItems[focusableItems.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
      return;
    }

    if (event.key !== "Escape") {
      return;
    }
    if (isChatbotOpen) {
      closeChatbot(true);
      return;
    }
    if (isSectionMenuOpen) {
      closeSectionMenu();
      if (sectionButton) {
        sectionButton.focus();
      }
      return;
    }
    closeQuickMenu(true);
  });
}

/* --------------------------------------------------------------------------
   init
   -------------------------------------------------------------------------- */
function initCommon() {
  initMotionPreference();
  renderSubHeader();
  renderCommonFooter();
  renderCommonQuickMenu();
  initImageFallback();
  initLanguageSelectors();
  initStickyHeader();
  initSubpageSectionJump();
  initGlobalMenu();
  initFamilySite();
  initQuickMenu();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCommon);
} else {
  initCommon();
}
