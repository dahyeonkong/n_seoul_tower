"use strict";

/* ==========================================================================
   main.js — 메인 페이지 목업 데이터와 섹션 렌더링 / 인터랙션
   문구·이미지·수치는 Figma main 프레임에서 확인한 값만 사용합니다.
   상세 페이지 URL 은 아직 확정되지 않아 href 를 만들지 않고 pending 처리합니다.
   ========================================================================== */

var ASSET_PATH = "./assets/";

var mainPageData = {
  events: [
    {
      id: "event_visit_korea",
      slot: 3,
      label: "Korea's official tourism website",
      title: "Visit Korea",
      description: "Find Everything You Need for Your Trip to Korea",
      image: "event/event3.png",
      imageAlt: "Visit Korea campaign artwork with Seoul landmarks"
    },
    {
      id: "event_sns_follow",
      slot: 2,
      label: "Namsan Cable Car",
      title: "SNS Follow Event",
      description: "Follow the official Namsan Cable Car account and get a special prize!",
      image: "event/event2.png",
      imageAlt: "Namsan cable car social media follow event artwork"
    },
    {
      id: "event_view_mac",
      slot: 1,
      label: "2026 NAMSAN",
      title: "view-Mac festival",
      description: "You Can Enjoy Seoul's Views and Beer to the Fullest",
      image: "event/event1.png",
      imageAlt: "View-Mac Festival artwork with a beer glass and Namsan park"
    }
  ],

  courses: [
    {
      id: "speed_course",
      title: "Speed Course",
      description: "See More, Spend Less Time.",
      image: "guide_course/course1.png",
      imageAlt: "N Seoul Tower observatory against a clear daytime sky"
    },
    {
      id: "date_course",
      title: "Date Course",
      description: "A Romantic Journey Above Seoul",
      image: "guide_course/course2.png",
      imageAlt: "A couple watching the sunset over Seoul from Namsan"
    },
    {
      id: "food_course",
      title: "Food Course",
      description: "Taste Seoul with a View",
      image: "guide_course/course3.png",
      imageAlt: "Korean dishes served on a table"
    },
    {
      id: "running_course",
      title: "Running course",
      description: "Run Through Nature and City Views",
      image: "guide_course/course4.png",
      imageAlt: "A runner on the tree lined Namsan trail"
    }
  ],

  /* 디자인의 기프트숍 카드는 상품 이미지만 노출합니다.
     상품명·가격·재고는 확정되지 않아 만들지 않고, 이미지 설명만 alt 로 제공합니다. */
  giftShopItems: [
    { id: "gift_01", image: "n_gift_shop/gift1.png", imageAlt: "Olive green N Seoul Tower spiral notebook illustrated with N-gomi" },
    { id: "gift_02", image: "n_gift_shop/gift2.png", imageAlt: "Round olive green badge illustrated with N-gomi" },
    { id: "gift_03", image: "n_gift_shop/gift3.png", imageAlt: "N Tower Friend memo card illustrated with N-gomi" },
    { id: "gift_04", image: "n_gift_shop/gift4.png", imageAlt: "Canvas tote bag illustrated with N-gomi and N Seoul Tower" },
    { id: "gift_05", image: "n_gift_shop/n_gomi_keyring.png", imageAlt: "N-gomi rubber keyring with an N Seoul Tower name tag" },
    { id: "gift_06", image: "n_gift_shop/n_gomi_mug.png", imageAlt: "Ceramic mug printed with N-gomi walking near N Seoul Tower" },
    { id: "gift_07", image: "n_gift_shop/n_gomi_toy.png", imageAlt: "N-gomi bear plush toy wearing a green N Seoul Tower shirt" },
    { id: "gift_08", image: "n_gift_shop/tumbler.png", imageAlt: "Olive green N Seoul Tower tumbler with a tower line drawing" }
  ],

  customGoodsItems: [
    {
      id: "goods_candle",
      title: "Seoul Glow Candle",
      description: "Build Your Own Tower Candle",
      tags: ["DIY", "Custom", "Object"],
      image: "custom_goods/goods1.png",
      imageAlt: "Seoul Glow Candle stacked like N Seoul Tower"
    },
    {
      id: "goods_love_lock",
      title: "Seoul Love Lock",
      description: "Create Your Own Love Lock",
      tags: ["LoveLock", "Memory", "Custom"],
      image: "custom_goods/goods2.png",
      imageAlt: "Olive green Seoul Love Lock padlock"
    },
    {
      id: "goods_keycap",
      title: "Seoul Click Keycap",
      description: "Design Every Keystroke",
      tags: ["Keycap", "DeskSetup", "DIY"],
      image: "custom_goods/goods3.png",
      imageAlt: "Keyboard keycap engraved with N Seoul Tower"
    },
    {
      id: "goods_fan",
      title: "Seoul Breeze Fan",
      description: "Carry Your Summer Breeze",
      tags: ["Fan", "Summer", "Lifestyle"],
      image: "custom_goods/goods4.png",
      imageAlt: "Folding fan printed with N Seoul Tower"
    }
  ],

  /* 아래에서 위로 쌓이는 6개 파츠. 단계마다 파츠가 하나씩 늘어납니다. */
  towerParts: [
    { file: "custom_goods/candle1.png", step: 1 },
    { file: "custom_goods/candle2.png", step: 2 },
    { file: "custom_goods/candle3.png", step: 3 },
    { file: "custom_goods/candle4.png", step: 4 },
    { file: "custom_goods/candle5.png", step: 5 },
    { file: "custom_goods/candle6.png", step: 6 }
  ]
};

/* --------------------------------------------------------------------------
   요소 생성 헬퍼
   -------------------------------------------------------------------------- */
function createElement(tagName, className, textContent) {
  var element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  return element;
}

function createMedia(className, fileName, altText, width, height, isContain) {
  var figure = createElement("div", "media " + className + (isContain ? " is_contain" : ""));
  var image = createElement("img");
  image.src = ASSET_PATH + fileName;
  image.alt = altText || "";
  image.width = width;
  image.height = height;
  image.loading = "lazy";
  image.decoding = "async";
  figure.appendChild(image);
  return figure;
}

function createPendingButton(className, label, accessibleName) {
  var button = createElement("button", className, label);
  button.type = "button";
  button.setAttribute("data-pending-link", "");
  button.setAttribute("aria-disabled", "true");
  if (accessibleName) {
    var hidden = createElement("span", "visually_hidden", " " + accessibleName);
    button.appendChild(hidden);
  }
  return button;
}

function renderEmptyState(container, message) {
  container.textContent = "";
  var item = createElement("li");
  item.appendChild(createElement("p", "empty_state", message));
  container.appendChild(item);
}

/* --------------------------------------------------------------------------
   events
   -------------------------------------------------------------------------- */
function renderEvents(events) {
  var list = document.querySelector("[data-events-list]");
  if (!list) {
    return;
  }

  if (!Array.isArray(events) || events.length === 0) {
    renderEmptyState(list, "현재 진행 중인 이벤트가 없습니다.");
    return;
  }

  var fragment = document.createDocumentFragment();

  events.forEach(function (event) {
    var item = createElement("li", "event_item");
    item.setAttribute("data-event-slot", String(event.slot));

    var gondola = createElement("img", "event_gondola");
    gondola.src = ASSET_PATH + "event/cablecar_nbear.png";
    gondola.alt = "";
    gondola.width = 258;
    gondola.height = 301;
    gondola.loading = "lazy";
    gondola.setAttribute("aria-hidden", "true");
    item.appendChild(gondola);

    var card = createElement("article", "event_card");

    var head = createElement("div", "event_card_head");
    head.appendChild(createElement("p", "event_card_label", event.label));
    head.appendChild(createElement("h3", "event_card_title", event.title));
    card.appendChild(head);

    card.appendChild(createMedia("event_card_media", event.image, event.imageAlt, 341, 163));
    card.appendChild(createElement("p", "event_card_desc", event.description));
    card.appendChild(createPendingButton("btn_soft", "view more", "about " + event.title));

    item.appendChild(card);
    fragment.appendChild(item);
  });

  list.textContent = "";
  list.appendChild(fragment);
}

/* --------------------------------------------------------------------------
   recommended course
   -------------------------------------------------------------------------- */
function renderCourses(courses) {
  var list = document.querySelector("[data-course-list]");
  if (!list) {
    return;
  }

  if (!Array.isArray(courses) || courses.length === 0) {
    renderEmptyState(list, "추천 코스를 준비하고 있습니다.");
    return;
  }

  var fragment = document.createDocumentFragment();

  courses.forEach(function (course) {
    var slide = createElement("li", "course_slide");
    var item = createElement("article", "course_card");

    var head = createElement("div", "course_card_head");
    head.appendChild(createElement("h3", "course_card_title", course.title));
    head.appendChild(createElement("p", "course_card_desc", course.description));
    item.appendChild(head);

    item.appendChild(createMedia("course_card_media", course.image, course.imageAlt, 460, 203));

    var button = createPendingButton("btn btn_green", "Learn more", "about " + course.title);
    var icon = createElement("img", "btn_icon");
    icon.src = ASSET_PATH + "icon/arrow_right.png";
    icon.alt = "";
    icon.width = 19;
    icon.height = 19;
    button.appendChild(icon);
    item.appendChild(button);

    slide.appendChild(item);
    fragment.appendChild(slide);
  });

  list.textContent = "";
  list.appendChild(fragment);
}

function initCourseScrollScene() {
  var section = document.querySelector("#course_section");
  var stage = document.querySelector("[data-course-scroll-stage]");
  var sticky = document.querySelector("[data-course-sticky]");
  var scene = document.querySelector("[data-course-scene]");
  var list = document.querySelector("[data-course-list]");

  if (!section || !stage || !sticky || !scene || !list) {
    return;
  }

  var slides = list.querySelectorAll(".course_slide");
  if (slides.length === 0 || isReducedMotion()) {
    section.classList.add("is_reduced_motion");
    return;
  }

  var sceneHeight = 0;
  var scrollTravel = 1;
  var maxListOffset = 0;
  var isFrameRequested = false;

  function renderCourseScroll() {
    var stageRect = stage.getBoundingClientRect();
    var progress = Math.min(1, Math.max(0, -stageRect.top / scrollTravel));
    list.style.transform = "translate3d(0, " + -progress * maxListOffset + "px, 0)";
    isFrameRequested = false;
  }

  function requestCourseScrollRender() {
    if (isFrameRequested) {
      return;
    }

    isFrameRequested = true;
    window.requestAnimationFrame(renderCourseScroll);
  }

  function updateCourseMeasurements() {
    sceneHeight = scene.clientHeight;
    section.style.setProperty("--course_scene_height", sceneHeight + "px");
    stage.style.height = sticky.clientHeight + sceneHeight * (slides.length - 1) + "px";
    maxListOffset = Math.max(0, sceneHeight * (slides.length - 1));
    scrollTravel = Math.max(1, stage.offsetHeight - sticky.clientHeight);
    requestCourseScrollRender();
  }

  window.addEventListener("scroll", requestCourseScrollRender, { passive: true });
  window.addEventListener("resize", updateCourseMeasurements);
  updateCourseMeasurements();
}

/* --------------------------------------------------------------------------
   n gift shop
   -------------------------------------------------------------------------- */
function createGiftCard(item, isDuplicate) {
  var card = createElement("li", "gift_card");
  var link = createElement("a", "gift_card_link");
  link.href = "./pages/n_gift_shop.html";

  if (isDuplicate) {
    card.setAttribute("aria-hidden", "true");
    link.tabIndex = -1;
  }

  link.appendChild(createMedia("gift_card_media", item.image, isDuplicate ? "" : item.imageAlt, 253, 300, true));
  card.appendChild(link);

  return card;
}

function renderGiftItems(items) {
  var track = document.querySelector("[data-gift-track]");
  if (!track) {
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    renderEmptyState(track, "상품 준비 중입니다.");
    return;
  }

  var fragment = document.createDocumentFragment();

  items.forEach(function (item) {
    fragment.appendChild(createGiftCard(item, false));
  });

  // 데스크톱 무한 흐름용 복제본 — 접근성 트리와 탭 순서에서는 제외
  items.forEach(function (item) {
    var duplicate = createGiftCard(item, true);
    duplicate.setAttribute("data-gift-duplicate", "");
    fragment.appendChild(duplicate);
  });

  track.textContent = "";
  track.appendChild(fragment);
}

function initGiftTrackCursor() {
  var track = document.querySelector("[data-gift-track]");
  var cursor = document.querySelector("[data-gift-cursor]");

  if (!track || !cursor) {
    return;
  }

  function handleGiftPointerMove(event) {
    cursor.style.transform = "translate3d(" + (event.clientX - 50) + "px, " + (event.clientY - 50) + "px, 0)";
  }

  function handleGiftPointerEnter(event) {
    handleGiftPointerMove(event);
    cursor.classList.add("is_visible");
  }

  function handleGiftPointerLeave() {
    cursor.classList.remove("is_visible");
  }

  function handleGiftTrackClick(event) {
    if (event.target.closest(".gift_card_link")) {
      return;
    }

    window.location.href = "./pages/n_gift_shop.html";
  }

  track.addEventListener("pointerenter", handleGiftPointerEnter);
  track.addEventListener("pointermove", handleGiftPointerMove);
  track.addEventListener("pointerleave", handleGiftPointerLeave);
  track.addEventListener("click", handleGiftTrackClick);
}

/* --------------------------------------------------------------------------
   custom tower visual
   -------------------------------------------------------------------------- */
function renderTowerStacks(parts) {
  var list = document.querySelector("[data-tower-list]");
  if (!list || !Array.isArray(parts) || parts.length === 0) {
    return;
  }

  var fragment = document.createDocumentFragment();

  parts.forEach(function (_part, stageIndex) {
    var stack = createElement("li", "tower_stack tower_stack_" + (stageIndex + 1));

    // 아래(candle1)부터 현재 단계까지 쌓습니다.
    for (var partIndex = 0; partIndex <= stageIndex; partIndex += 1) {
      var image = createElement("img", "tower_part tower_part_" + (partIndex + 1));
      image.src = ASSET_PATH + parts[partIndex].file;
      image.alt = "";
      image.width = 1000;
      image.height = 1000;
      image.loading = "lazy";
      image.decoding = "async";
      stack.appendChild(image);
    }

    fragment.appendChild(stack);
  });

  list.textContent = "";
  list.appendChild(fragment);
}

function initTowerReveal() {
  var stacks = document.querySelectorAll("[data-tower-list] .tower_stack");
  if (stacks.length === 0) {
    return;
  }

  if (isReducedMotion() || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(stacks, function (stack) {
      stack.classList.add("is_active");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function handleStackIntersect(entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is_active");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -15% 0px", threshold: 0.15 }
  );

  Array.prototype.forEach.call(stacks, function (stack) {
    observer.observe(stack);
  });
}

/* --------------------------------------------------------------------------
   custom goods
   -------------------------------------------------------------------------- */
function renderCustomGoods(items) {
  var list = document.querySelector("[data-goods-list]");
  if (!list) {
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    renderEmptyState(list, "상품 준비 중입니다.");
    return;
  }

  var fragment = document.createDocumentFragment();

  items.forEach(function (item, index) {
    var card = createElement("li", "goods_card");

    if (index === 0) {
      var arc = createElement("img", "goods_card_arc");
      arc.src = ASSET_PATH + "custom_goods/goods_card_arc.svg";
      arc.alt = "";
      arc.width = 695;
      arc.height = 695;
      arc.loading = "lazy";
      arc.setAttribute("aria-hidden", "true");
      card.appendChild(arc);
    }

    card.appendChild(createMedia("goods_card_media", item.image, item.imageAlt, 280, 317, true));

    var body = createElement("div", "goods_card_body");
    body.appendChild(createElement("h3", "goods_card_title", item.title));
    body.appendChild(createElement("p", "goods_card_desc", item.description));

    var tagList = createElement("ul", "goods_tags");
    item.tags.forEach(function (tag) {
      tagList.appendChild(createElement("li", "goods_tag", tag));
    });
    body.appendChild(tagList);

    card.appendChild(body);
    fragment.appendChild(card);
  });

  list.textContent = "";
  list.appendChild(fragment);
}

/* --------------------------------------------------------------------------
   restaurant stack
   -------------------------------------------------------------------------- */
function initRestaurantStack() {
  var stack = document.querySelector("[data-restaurant-stack]");
  var stackItems = stack ? stack.querySelectorAll("[data-restaurant-stack-item]") : [];
  var stackOffsets = [48, 148, 248, 348];
  var stackMeasurements = [];
  var isStackFramePending = false;

  if (!stack || stackItems.length !== stackOffsets.length) {
    return;
  }

  function measureRestaurantStack() {
    Array.prototype.forEach.call(stackItems, function clearStackTransform(item) {
      item.style.transform = "";
    });

    var stackTop = stack.getBoundingClientRect().top + window.scrollY;
    var stackBottom = stackTop + stack.offsetHeight;

    stackMeasurements = Array.prototype.map.call(stackItems, function measureStackItem(item) {
      var itemTop = item.getBoundingClientRect().top + window.scrollY;
      return {
        itemTop: itemTop,
        maxTranslate: Math.max(0, stackBottom - itemTop - item.offsetHeight)
      };
    });
  }

  function renderRestaurantStack() {
    isStackFramePending = false;

    Array.prototype.forEach.call(stackItems, function renderStackItem(item, index) {
      if (window.innerWidth < 834) {
        item.style.transform = "";
        return;
      }

      var measurement = stackMeasurements[index];
      var translateY = Math.min(
        measurement.maxTranslate,
        Math.max(0, window.scrollY + stackOffsets[index] - measurement.itemTop)
      );

      item.style.transform = "translate3d(0, " + translateY + "px, 0)";
    });
  }

  function requestRestaurantStackRender() {
    if (isStackFramePending) {
      return;
    }
    isStackFramePending = true;
    window.requestAnimationFrame(renderRestaurantStack);
  }

  function handleRestaurantStackResize() {
    measureRestaurantStack();
    requestRestaurantStackRender();
  }

  measureRestaurantStack();
  renderRestaurantStack();
  window.addEventListener("scroll", requestRestaurantStackRender, { passive: true });
  window.addEventListener("resize", handleRestaurantStackResize);
}

/* --------------------------------------------------------------------------
   init
   -------------------------------------------------------------------------- */
function initMain() {
  renderEvents(mainPageData.events);
  renderCourses(mainPageData.courses);
  renderGiftItems(mainPageData.giftShopItems);
  renderTowerStacks(mainPageData.towerParts);
  renderCustomGoods(mainPageData.customGoodsItems);

  initCourseScrollScene();
  initGiftTrackCursor();
  initTowerReveal();
  initRestaurantStack();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMain);
} else {
  initMain();
}
