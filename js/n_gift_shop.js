"use strict";

/* ==========================================================================
   n_gift_shop.js — 카테고리 필터, Filters 버튼으로 여닫는 좌측 사이드바
   상품 hover 효과는 CSS 가 담당합니다. 이 파일은 표시/숨김 상태만 다룹니다.
   ========================================================================== */

function initGiftShopFilter() {
  var grid = document.querySelector("[data-product-grid]");
  var categoryList = document.querySelector("[data-category-list]");

  /* 대상 요소가 없는 페이지에서도 오류가 나지 않도록 먼저 확인합니다. */
  if (!grid || !categoryList) {
    return;
  }

  var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-product]"));
  var categoryButtons = Array.prototype.slice.call(
    categoryList.querySelectorAll("[data-category-filter]")
  );
  var emptyState = document.querySelector("[data-product-empty]");

  var selectedCategory = "all";

  function getCardCategories(card) {
    var value = card.getAttribute("data-category") || "";
    return value.split(" ").filter(Boolean);
  }

  function matchesCategory(card) {
    if (selectedCategory === "all") {
      return true;
    }
    return getCardCategories(card).indexOf(selectedCategory) !== -1;
  }

  function renderProducts() {
    var visibleCount = 0;

    cards.forEach(function (card) {
      if (matchesCategory(card)) {
        card.removeAttribute("hidden");
        visibleCount += 1;
      } else {
        card.setAttribute("hidden", "");
      }
    });

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.removeAttribute("hidden");
      } else {
        emptyState.setAttribute("hidden", "");
      }
    }
  }

  function renderCategoryState() {
    categoryButtons.forEach(function (button) {
      var isSelected = button.getAttribute("data-category-filter") === selectedCategory;
      button.classList.toggle("is_active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function handleCategoryClick(event) {
    var button = event.target.closest("[data-category-filter]");
    if (!button) {
      return;
    }
    selectedCategory = button.getAttribute("data-category-filter");
    renderCategoryState();
    renderProducts();
  }

  categoryList.addEventListener("click", handleCategoryClick);

  renderCategoryState();
  renderProducts();
}

/* --------------------------------------------------------------------------
   좌측 사이드바 (Filters 버튼으로 여닫는 화면 고정 드로어)
   기본은 닫힌 상태이고, 열려 있는 동안에는 스크롤해도 위치가 고정됩니다.
   -------------------------------------------------------------------------- */
function initGiftShopSidebar() {
  var toggleButton = document.querySelector("[data-filter-toggle]");
  var sidebar = document.querySelector("[data-sidebar]");
  var layout = document.querySelector(".giftshop");

  if (!toggleButton || !sidebar) {
    return;
  }

  var footer = document.querySelector(".site_footer");
  var isSidebarOpen = false;
  var isBoundFrameQueued = false;
  var lastSidebarTop = null;

  function renderSidebarState() {
    toggleButton.setAttribute("aria-expanded", String(isSidebarOpen));
    sidebar.classList.toggle("is_open", isSidebarOpen);
    if (layout) {
      layout.classList.toggle("is_sidebar_open", isSidebarOpen);
    }
  }

  /* 아래로 스크롤해 푸터를 만나면 사이드바가 푸터를 덮지 않도록 위로 밀어 멈춰 세웁니다.
     transform 은 여닫는 데 쓰고 있으므로 top 으로만 조정합니다.
     같은 값이면 다시 쓰지 않아 불필요한 스타일 재계산을 피합니다. */
  function renderSidebarFooterBound() {
    if (!footer) {
      return;
    }

    var nextTop = "";
    if (isSidebarOpen) {
      var footerTop = footer.getBoundingClientRect().top;
      nextTop = Math.min(0, Math.round(footerTop - sidebar.offsetHeight)) + "px";
    }

    if (nextTop === lastSidebarTop) {
      return;
    }
    lastSidebarTop = nextTop;
    sidebar.style.top = nextTop;
  }

  /* 스크롤 이벤트에서 직접 계산하지 않고 프레임당 한 번만 처리합니다 (AGENTS 7.2). */
  function requestSidebarFooterBound() {
    if (isBoundFrameQueued) {
      return;
    }
    isBoundFrameQueued = true;
    window.requestAnimationFrame(function () {
      isBoundFrameQueued = false;
      renderSidebarFooterBound();
    });
  }

  function openSidebar() {
    if (isSidebarOpen) {
      return;
    }
    isSidebarOpen = true;
    renderSidebarState();
    renderSidebarFooterBound();

    var firstItem = sidebar.querySelector("[data-category-filter]");
    if (firstItem) {
      firstItem.focus();
    }
  }

  function closeSidebar(shouldRestoreFocus) {
    if (!isSidebarOpen) {
      return;
    }
    isSidebarOpen = false;
    renderSidebarState();
    renderSidebarFooterBound();

    if (shouldRestoreFocus) {
      toggleButton.focus();
    }
  }

  function handleSidebarToggle() {
    if (isSidebarOpen) {
      closeSidebar(true);
      return;
    }
    openSidebar();
  }

  toggleButton.addEventListener("click", handleSidebarToggle);

  window.addEventListener("scroll", requestSidebarFooterBound, { passive: true });
  window.addEventListener("resize", requestSidebarFooterBound);

  document.addEventListener("keydown", function handleSidebarEscape(event) {
    if (event.key === "Escape") {
      closeSidebar(true);
    }
  });

  document.addEventListener("click", function handleSidebarOutsideClick(event) {
    if (!isSidebarOpen) {
      return;
    }
    if (event.target.closest("[data-sidebar]") || event.target.closest("[data-filter-toggle]")) {
      return;
    }
    closeSidebar(false);
  });

  renderSidebarState();
  renderSidebarFooterBound();
}

/* --------------------------------------------------------------------------
   init
   -------------------------------------------------------------------------- */
function initGiftShopPage() {
  initGiftShopFilter();
  initGiftShopSidebar();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGiftShopPage);
} else {
  initGiftShopPage();
}
