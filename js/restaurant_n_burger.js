"use strict";

/* ========================================================================== 
   Restaurant > N Burger page interactions
   ========================================================================== */

function initRestaurantScrollAnimations() {
  var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initBurgerGallerySlider(isReducedMotion);
  initBurgerBestSwiper(isReducedMotion);

  if (isReducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  function revealFrom(targets, options) {
    if (!targets || targets.length === 0) {
      return;
    }

    var settings = options || {};

    gsap.from(targets, {
      autoAlpha: 0,
      x: settings.x || 0,
      y: settings.y || 48,
      scale: settings.scale || 1,
      duration: settings.duration || 0.85,
      stagger: settings.stagger || 0,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: {
        trigger: settings.trigger || targets[0],
        start: settings.start || "top 82%",
        once: true
      }
    });
  }

  function initBurgerGallerySlider(shouldReduceMotion) {
    var slider = document.querySelector("[data-gallery-slider]");
    var previousButton = document.querySelector("[data-gallery-prev]");
    var nextButton = document.querySelector("[data-gallery-next]");
    var paginationButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-gallery-pagination-button]")
    );

    if (!slider || !previousButton || !nextButton) {
      return;
    }

    var sliderRegion = slider.closest(".burger_gallery_inner") || slider;
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-gallery-slide]"));
    var galleryGsap = window.gsap;

    if (!galleryGsap || slides.length < 2) {
      previousButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    var currentIndex = 0;
    var isAnimating = false;
    var autoPlayTimer = null;
    var SLIDE_INTERVAL = 2000;

    galleryGsap.set(slides, { autoAlpha: 0, zIndex: 0 });
    galleryGsap.set(slides[currentIndex], { autoAlpha: 1, zIndex: 1 });

    function renderSlideAccessibility() {
      slides.forEach(function renderSlideState(slide, index) {
        var isCurrentSlide = index === currentIndex;
        slide.classList.toggle("is_active", isCurrentSlide);
        slide.setAttribute("aria-hidden", String(!isCurrentSlide));
      });

      paginationButtons.forEach(function renderPaginationState(button, index) {
        var isCurrentButton = index === currentIndex;
        button.classList.toggle("is_active", isCurrentButton);

        if (isCurrentButton) {
          button.setAttribute("aria-current", "true");
        } else {
          button.removeAttribute("aria-current");
        }
      });
    }

    function moveGallery(direction) {
      if (isAnimating) {
        return;
      }

      isAnimating = true;
      var nextIndex = (currentIndex + direction + slides.length) % slides.length;
      var currentSlide = slides[currentIndex];
      var nextSlide = slides[nextIndex];
      var transitionDuration = shouldReduceMotion ? 0 : 0.65;

      galleryGsap.set(nextSlide, {
        autoAlpha: 0,
        zIndex: 2
      });
      galleryGsap.set(currentSlide, { zIndex: 1 });

      galleryGsap.timeline({
        defaults: {
          duration: transitionDuration,
          ease: "power2.inOut"
        },
        onComplete: function handleGalleryTransitionComplete() {
          galleryGsap.set(currentSlide, { autoAlpha: 0, zIndex: 0 });
          currentIndex = nextIndex;
          isAnimating = false;
          renderSlideAccessibility();
        }
      })
        .to(currentSlide, { autoAlpha: 0 }, 0)
        .to(nextSlide, { autoAlpha: 1 }, 0);
    }

    function startAutoPlay() {
      if (shouldReduceMotion || autoPlayTimer) {
        return;
      }

      autoPlayTimer = window.setInterval(function handleGalleryAutoPlay() {
        moveGallery(1);
      }, SLIDE_INTERVAL);
    }

    function stopAutoPlay() {
      if (!autoPlayTimer) {
        return;
      }

      window.clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }

    function handlePreviousClick() {
      moveGallery(-1);
    }

    function handleNextClick() {
      moveGallery(1);
    }

    function handlePaginationClick(event) {
      var targetIndex = Number(event.currentTarget.dataset.slideIndex);

      if (!Number.isInteger(targetIndex) || targetIndex === currentIndex) {
        return;
      }

      moveGallery(targetIndex - currentIndex);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    }

    previousButton.addEventListener("click", handlePreviousClick);
    nextButton.addEventListener("click", handleNextClick);
    paginationButtons.forEach(function bindPaginationButton(button) {
      button.addEventListener("click", handlePaginationClick);
    });
    sliderRegion.addEventListener("pointerenter", stopAutoPlay);
    sliderRegion.addEventListener("pointerleave", startAutoPlay);
    sliderRegion.addEventListener("focusin", stopAutoPlay);
    sliderRegion.addEventListener("focusout", startAutoPlay);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    renderSlideAccessibility();
    startAutoPlay();
  }

  function initBurgerBestSwiper(shouldReduceMotion) {
    var swiper = document.querySelector("[data-burger-best-swiper]");

    if (!swiper) {
      return;
    }

    var mobileQuery = window.matchMedia("(max-width: 833px)");
    var cards = Array.prototype.slice.call(swiper.querySelectorAll(".swiper_slide"));
    var isDragging = false;
    var startPointerX = 0;
    var lastPointerX = 0;
    var startScrollLeft = 0;
    var startCardIndex = 0;
    var startTouchY = 0;
    var wheelTimer = null;
    var wheelDirection = 0;
    var swiperAutoPlayTimer = null;
    var SWIPE_THRESHOLD = 24;
    var SWIPER_INTERVAL = 2000;

    function getNearestCardIndex() {
      var viewportCenter = swiper.scrollLeft + swiper.clientWidth / 2;
      var nearestIndex = 0;
      var nearestDistance = Infinity;

      cards.forEach(function findNearestCard(card, index) {
        var cardCenter = card.offsetLeft + card.offsetWidth / 2;
        var distance = Math.abs(cardCenter - viewportCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    }

    function scrollToCard(index) {
      var safeIndex = Math.max(0, Math.min(cards.length - 1, index));
      var targetCard = cards[safeIndex];

      if (!targetCard) {
        return;
      }

      var targetScrollLeft = targetCard.offsetLeft - (swiper.clientWidth - targetCard.offsetWidth) / 2;

      swiper.scrollTo({
        left: targetScrollLeft,
        behavior: shouldReduceMotion ? "auto" : "smooth"
      });
    }

    function startSwiperAutoPlay() {
      if (shouldReduceMotion || !mobileQuery.matches || document.hidden || swiperAutoPlayTimer) {
        return;
      }

      swiperAutoPlayTimer = window.setInterval(function handleSwiperAutoPlay() {
        var nextIndex = (getNearestCardIndex() + 1) % cards.length;
        scrollToCard(nextIndex);
      }, SWIPER_INTERVAL);
    }

    function stopSwiperAutoPlay() {
      if (!swiperAutoPlayTimer) {
        return;
      }

      window.clearInterval(swiperAutoPlayTimer);
      swiperAutoPlayTimer = null;
    }

    function restartSwiperAutoPlay() {
      stopSwiperAutoPlay();
      startSwiperAutoPlay();
    }

    function handlePointerDown(event) {
      if (!mobileQuery.matches || (event.pointerType === "mouse" && event.button !== 0)) {
        return;
      }

      isDragging = true;
      stopSwiperAutoPlay();
      startPointerX = event.clientX;
      lastPointerX = event.clientX;
      startScrollLeft = swiper.scrollLeft;
      startCardIndex = getNearestCardIndex();
      swiper.classList.add("is_dragging");
      if (typeof swiper.setPointerCapture === "function") {
        swiper.setPointerCapture(event.pointerId);
      }
    }

    function handlePointerMove(event) {
      if (!isDragging) {
        return;
      }

      lastPointerX = event.clientX;
      swiper.scrollLeft = startScrollLeft - (event.clientX - startPointerX);
      event.preventDefault();
    }

    function endPointerDrag(event) {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      swiper.classList.remove("is_dragging");

      if (typeof swiper.hasPointerCapture === "function" && swiper.hasPointerCapture(event.pointerId)) {
        swiper.releasePointerCapture(event.pointerId);
      }

      var endPointerX = typeof event.clientX === "number" ? event.clientX : lastPointerX;
      var swipeDistance = startPointerX - endPointerX;
      var targetIndex = startCardIndex;

      if (Math.abs(swipeDistance) >= SWIPE_THRESHOLD) {
        targetIndex += swipeDistance > 0 ? 1 : -1;
      }

      scrollToCard(targetIndex);
      restartSwiperAutoPlay();
    }

    function handleTouchStart(event) {
      if (window.PointerEvent || !mobileQuery.matches || !event.touches[0]) {
        return;
      }

      startPointerX = event.touches[0].clientX;
      stopSwiperAutoPlay();
      lastPointerX = startPointerX;
      startTouchY = event.touches[0].clientY;
      startScrollLeft = swiper.scrollLeft;
      startCardIndex = getNearestCardIndex();
    }

    function handleTouchMove(event) {
      if (window.PointerEvent || !mobileQuery.matches || !event.touches[0]) {
        return;
      }

      var currentTouchX = event.touches[0].clientX;
      var horizontalDistance = currentTouchX - startPointerX;
      var verticalDistance = event.touches[0].clientY - startTouchY;

      lastPointerX = currentTouchX;

      if (Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) {
        return;
      }

      event.preventDefault();
      swiper.scrollLeft = startScrollLeft - horizontalDistance;
    }

    function handleTouchEnd(event) {
      if (window.PointerEvent || !mobileQuery.matches || !event.changedTouches[0]) {
        return;
      }

      var swipeDistance = startPointerX - event.changedTouches[0].clientX;

      if (Math.abs(swipeDistance) < SWIPE_THRESHOLD) {
        scrollToCard(startCardIndex);
        restartSwiperAutoPlay();
        return;
      }

      scrollToCard(startCardIndex + (swipeDistance > 0 ? 1 : -1));
      restartSwiperAutoPlay();
    }

    function handleWheel(event) {
      if (!mobileQuery.matches) {
        return;
      }

      var scrollAmount = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      if (scrollAmount === 0) {
        return;
      }

      event.preventDefault();
      stopSwiperAutoPlay();
      wheelDirection = scrollAmount > 0 ? 1 : -1;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(function handleWheelEnd() {
        scrollToCard(getNearestCardIndex() + wheelDirection);
        wheelDirection = 0;
        startSwiperAutoPlay();
      }, 120);
    }

    function handleKeyDown(event) {
      if (!mobileQuery.matches || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
        return;
      }

      event.preventDefault();
      var direction = event.key === "ArrowRight" ? 1 : -1;
      var nextIndex = Math.max(0, Math.min(cards.length - 1, getNearestCardIndex() + direction));
      scrollToCard(nextIndex);
      restartSwiperAutoPlay();
    }

    function handleSwiperVisibilityChange() {
      if (document.hidden) {
        stopSwiperAutoPlay();
      } else {
        startSwiperAutoPlay();
      }
    }

    function handleSwiperViewportChange() {
      if (mobileQuery.matches) {
        startSwiperAutoPlay();
      } else {
        stopSwiperAutoPlay();
      }
    }

    swiper.addEventListener("pointerdown", handlePointerDown);
    swiper.addEventListener("pointermove", handlePointerMove);
    swiper.addEventListener("pointerup", endPointerDrag);
    swiper.addEventListener("pointercancel", endPointerDrag);
    swiper.addEventListener("touchstart", handleTouchStart, { passive: true });
    swiper.addEventListener("touchmove", handleTouchMove, { passive: false });
    swiper.addEventListener("touchend", handleTouchEnd, { passive: true });
    swiper.addEventListener("wheel", handleWheel, { passive: false });
    swiper.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleSwiperVisibilityChange);

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", handleSwiperViewportChange);
    } else {
      mobileQuery.addListener(handleSwiperViewportChange);
    }

    startSwiperAutoPlay();
  }

  revealFrom(document.querySelectorAll(".burger_info_thumb"), {
    x: -64,
    y: 0,
    trigger: document.querySelector(".burger_info")
  });

  revealFrom(document.querySelectorAll(".burger_info_head, .burger_info_boxes, .burger_reserve_btn"), {
    x: 64,
    y: 0,
    stagger: 0.12,
    trigger: document.querySelector(".burger_info")
  });

  revealFrom(document.querySelectorAll(".burger_best_type_top"), {
    x: -80,
    y: 0,
    trigger: document.querySelector(".burger_best")
  });

  revealFrom(document.querySelectorAll(".burger_best_type_bottom"), {
    x: 80,
    y: 0,
    trigger: document.querySelector(".burger_best")
  });

  revealFrom(document.querySelectorAll(".burger_best_card"), {
    y: 72,
    stagger: 0.1,
    trigger: document.querySelector(".burger_best_list"),
    start: "top 88%"
  });

  revealFrom(document.querySelectorAll(".burger_menu_header"), {
    y: 48,
    trigger: document.querySelector(".burger_menu_board")
  });

  ScrollTrigger.batch(".burger_menu_group, .burger_tower_cup", {
    start: "top 88%",
    once: true,
    onEnter: function handleMenuGroupEnter(elements) {
      gsap.from(elements, {
        autoAlpha: 0,
        y: 56,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility"
      });
    }
  });

  window.addEventListener("load", function handleRestaurantPageLoad() {
    ScrollTrigger.refresh();
  }, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRestaurantScrollAnimations);
} else {
  initRestaurantScrollAnimations();
}
