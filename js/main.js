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
    { id: "gift_01", image: "n_gift_shop/gift1.png", imageAlt: "Olive green spring notebook with an N Seoul Tower illustration" },
    { id: "gift_02", image: "n_gift_shop/gift2.png", imageAlt: "N Bear plush doll wearing an olive hoodie" },
    { id: "gift_03", image: "n_gift_shop/gift3.png", imageAlt: "Ceramic mug printed with N Bear and Namsan" },
    { id: "gift_04", image: "n_gift_shop/gift4.png", imageAlt: "N Bear rubber key ring with a tower name tag" },
    { id: "gift_05", image: "n_gift_shop/gift5.png", imageAlt: "Olive green insulated tumbler with a tower emblem" },
    { id: "gift_06", image: "n_gift_shop/gift6.png", imageAlt: "Round hand mirror with an N Bear face" },
    { id: "gift_07", image: "n_gift_shop/gift7.png", imageAlt: "Greeting card illustrated with N Bear and Namsan" },
    { id: "gift_08", image: "n_gift_shop/gift8.png", imageAlt: "Cotton eco bag printed with N Bear and Namsan" }
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
  ],

  /* Figma restaurant_wrap 에 실제로 포함된 사진만 사용합니다. */
  restaurantPhotos: [
    {
      id: "the_place_dining",
      image: "restaurant/restaurant_dining.png",
      alt: "Dining tables by the observatory window at The Place Dining"
    }
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

/* --------------------------------------------------------------------------
   n gift shop
   -------------------------------------------------------------------------- */
function createGiftCard(item, isDuplicate) {
  var card = createElement("li", "gift_card");
  if (isDuplicate) {
    card.setAttribute("aria-hidden", "true");
  }

  card.appendChild(createMedia("gift_card_media", item.image, isDuplicate ? "" : item.imageAlt, 253, 300, true));

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
   restaurant 슬라이더
   -------------------------------------------------------------------------- */
function initRestaurantSlider(photos) {
  var slidesBox = document.querySelector("[data-restaurant-slides]");
  var dotsBox = document.querySelector("[data-restaurant-dots]");
  var prevButton = document.querySelector("[data-restaurant-prev]");
  var nextButton = document.querySelector("[data-restaurant-next]");

  if (!slidesBox || !dotsBox || !prevButton || !nextButton) {
    return;
  }

  var slideCount = Array.isArray(photos) ? photos.length : 0;
  if (slideCount === 0) {
    return;
  }

  var currentIndex = 0;
  var slides = slidesBox.querySelectorAll("[data-restaurant-slide]");

  dotsBox.textContent = "";
  for (var index = 0; index < slideCount; index += 1) {
    var dot = createElement("button", "restaurant_dot");
    dot.type = "button";
    dot.setAttribute("data-restaurant-dot", String(index));
    dot.appendChild(createElement("span", "visually_hidden", "Photo " + (index + 1)));
    dotsBox.appendChild(dot);
  }
  var dots = dotsBox.querySelectorAll("[data-restaurant-dot]");

  function renderSlideState() {
    Array.prototype.forEach.call(slides, function (slide, index) {
      slide.classList.toggle("is_active", index === currentIndex);
    });
    Array.prototype.forEach.call(dots, function (dot, index) {
      dot.setAttribute("aria-current", String(index === currentIndex));
    });
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slideCount - 1;
  }

  function goToSlide(nextIndex) {
    if (nextIndex < 0 || nextIndex > slideCount - 1) {
      return;
    }
    currentIndex = nextIndex;
    renderSlideState();
  }

  prevButton.addEventListener("click", function handlePrevClick() {
    goToSlide(currentIndex - 1);
  });

  nextButton.addEventListener("click", function handleNextClick() {
    goToSlide(currentIndex + 1);
  });

  dotsBox.addEventListener("click", function handleDotClick(event) {
    var dot = event.target.closest("[data-restaurant-dot]");
    if (!dot) {
      return;
    }
    goToSlide(Number(dot.getAttribute("data-restaurant-dot")));
  });

  renderSlideState();
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

  initTowerReveal();
  initRestaurantSlider(mainPageData.restaurantPhotos);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMain);
} else {
  initMain();
}
