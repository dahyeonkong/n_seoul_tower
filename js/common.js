"use strict";

/* ==========================================================================
   common.js — 헤더 메뉴, 언어 선택, 섹션 페이저, 공통 상태 처리
   ========================================================================== */

var LANGUAGE_STORAGE_KEY = "n_seoul_tower_language";
var LANGUAGE_LABELS = { en: "English", ko: "Korean", ja: "Japanese", zh: "Chinese" };

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
            <li><button class="language_option" type="button" data-language="ko">Korean</button></li>
            <li><button class="language_option" type="button" data-language="ja">Japanese</button></li>
            <li><button class="language_option" type="button" data-language="zh">Chinese</button></li>
          </ul>
        </div>
      </div>

      <div class="page_container global_menu_body">
        <div class="menu_brand">
          <div class="menu_brand_logo">
            <img src="../assets/nst_logo_gray.svg" alt="" width="219" height="136">
            <p class="menu_brand_name"><span>N</span> SEOUL TOWER</p>
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
    if (!option) {
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

  panel.addEventListener("keydown", handleMenuKeydown);
  toggleButton.addEventListener("keydown", handleMenuKeydown);

  panel.addEventListener("click", function handleOutsideClick(event) {
    if (event.target === panel) {
      closeMenu(true);
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
   플로팅 퀵 메뉴 (Figma 987:7708)
   -------------------------------------------------------------------------- */
/* 시안의 링은 10도 간격 36칸이고 "CLICK ME" 8글자 뒤에 빈칸 4개가 붙어 3번 반복됩니다. */
var QUICK_RING_UNIT = "CLICK ME    ";
var QUICK_RING_REPEAT = 3;
var QUICK_RING_STEP = 10;
/* 첫 글자가 9시 방향에서 시작해 시계 방향으로 돕니다 (987:6688 이 -90도). */
var QUICK_RING_START = -90;

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
  var sectionButton = quickMenu.querySelector("[data-quick-section-button]");
  var sectionMenu = quickMenu.querySelector("[data-quick-section-menu]");

  if (!toggleButton || !actions) {
    return;
  }

  var isQuickMenuOpen = false;
  var isSectionMenuOpen = false;

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

  function handleSectionMenuToggle() {
    isSectionMenuOpen = !isSectionMenuOpen;
    renderSectionMenuState();
  }

  toggleButton.addEventListener("click", handleQuickMenuToggle);

  if (sectionButton) {
    sectionButton.addEventListener("click", handleSectionMenuToggle);
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
    if (event.key !== "Escape") {
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
  renderSubHeader();
  initImageFallback();
  initLanguageSelectors();
  initStickyHeader();
  initGlobalMenu();
  initFamilySite();
  initQuickMenu();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCommon);
} else {
  initCommon();
}
