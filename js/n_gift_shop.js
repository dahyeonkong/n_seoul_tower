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

  var isSidebarOpen = false;

  function renderSidebarState() {
    toggleButton.setAttribute("aria-expanded", String(isSidebarOpen));
    sidebar.classList.toggle("is_open", isSidebarOpen);
    if (layout) {
      layout.classList.toggle("is_sidebar_open", isSidebarOpen);
    }
  }

  function openSidebar() {
    if (isSidebarOpen) {
      return;
    }
    isSidebarOpen = true;
    renderSidebarState();

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
