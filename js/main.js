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
    gondola.src = ASSET_PATH + "Angolmi_cable.gif";
    gondola.alt = "";
    /* Angolmi_cable.gif 원본 크기. "auto" 를 넣으면 width 가 0 이 되어 비율 힌트가 깨지고,
       이미지가 로드되기 전 높이가 어긋납니다. */
    gondola.width = 560;
    gondola.height = 704;
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

/* 곤돌라와 카드가 화면 밖으로 잘리지 않도록 path 좌우 끝에서 잘라내는 비율입니다. */
var EVENT_PATH_EDGE_INSET = 0.08;

/* 곤돌라가 화면에서 실제로 내려가는 세로 폭(뷰포트 높이 기준)입니다.
   0 이면 세로 중앙 고정, 1 이면 화면 전체를 지나갑니다.
   path 를 타고 내려가는 형상은 남기되 화면 밖으로는 나가지 않는 값입니다. */
var EVENT_GONDOLA_BAND = 0.36;

/* 곡선을 세로로 얼마나 늘릴지. 1 이면 곡선이 페이지와 1:1 로 흘러가지만 경사가 매우 가팔라집니다.
   가로 배율과 같아지는 지점(약 0.217)이 에셋에 그려진 원래 각도이고, 그보다 낮추면 더 완만해집니다. */
var EVENT_CURVE_STEEPNESS = 0.217;

function initEventPathMotion() {
  var section = document.querySelector("#events_section");
  var sticky = document.querySelector("[data-events-sticky]");
  var curve = section ? section.querySelector(".events_curve") : null;
  /* 곡선 지오메트리를 읽는 대상. SVG 를 불러오면 인라인 SVG 로 교체됩니다. */
  var curveElement = curve;
  var list = section ? section.querySelector("[data-events-list]") : null;
  var items = list ? Array.from(list.querySelectorAll(".event_item")) : [];
  var viewButtons = section ? Array.from(section.querySelectorAll("[data-events-view]")) : [];

  if (!section || !sticky || !curve || !list || items.length === 0) {
    return;
  }

  var desktopQuery = window.matchMedia("(min-width: 1280px)");
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var pathElement = null;
  var pathViewBoxWidth = 1920;
  var pathViewBoxHeight = 1045;
  var visibleStartLength = 0;
  var visibleEndLength = 0;
  var pathTopY = 0;
  var pathBottomY = 0;
  var isRenderRequested = false;
  var isCardView = false;

  function renderCardEvents() {
    section.classList.add("is_card_view");
    list.style.removeProperty("--event_path_x");
    list.style.removeProperty("--event_path_y");
    sticky.style.removeProperty("--event_curve_y");

    items.forEach(function (item) {
      item.classList.remove("is_active");
      item.removeAttribute("aria-hidden");
      item.inert = false;
    });
  }

  function renderStaticEvents() {
    section.classList.add("has_static_events");
    list.style.removeProperty("--event_path_x");
    list.style.removeProperty("--event_path_y");
    sticky.style.removeProperty("--event_curve_y");

    items.forEach(function (item) {
      item.classList.remove("is_active");
      item.removeAttribute("aria-hidden");
      item.inert = false;
    });
  }

  function findVisiblePathRange() {
    var totalLength = pathElement.getTotalLength();
    var sampleCount = 800;
    var insetX = pathViewBoxWidth * EVENT_PATH_EDGE_INSET;
    var firstVisibleLength = null;
    var lastVisibleLength = null;

    for (var index = 0; index <= sampleCount; index += 1) {
      var length = totalLength * index / sampleCount;
      var point = pathElement.getPointAtLength(length);
      var isVisible =
        point.x >= insetX &&
        point.x <= pathViewBoxWidth - insetX &&
        point.y >= 0 &&
        point.y <= pathViewBoxHeight;

      if (isVisible && firstVisibleLength === null) {
        firstVisibleLength = length;
      }

      if (isVisible) {
        lastVisibleLength = length;
      }
    }

    visibleStartLength = firstVisibleLength === null ? 0 : firstVisibleLength;
    visibleEndLength = lastVisibleLength === null ? totalLength : lastVisibleLength;

    /* 실제로 지나가는 구간이 viewBox 세로의 일부뿐이므로, 그만큼 곡선을 더 늘려야
       곡선이 스크롤과 같은 속도로 흘러갑니다. */
    /* 진행률 0 은 path 의 끝(우상단), 진행률 1 은 시작(좌하단)입니다. */
    pathTopY = pathElement.getPointAtLength(visibleEndLength).y;
    pathBottomY = pathElement.getPointAtLength(visibleStartLength).y;

    var travelRatio = Math.abs(pathBottomY - pathTopY) / pathViewBoxHeight;
    var curveScale = travelRatio > 0.01 ? EVENT_CURVE_STEEPNESS / travelRatio : 1;

    section.style.setProperty("--events_curve_scale", curveScale.toFixed(4));
  }

  /* 그립(선이 걸리는 지점) 아래로 늘어지는 콘텐츠의 최대 높이입니다.
     곤돌라 몸통과 카드를 모두 재고, 구간이 바뀔 때 흔들리지 않도록 전체 최댓값을 씁니다.
     보정값은 CSS 의 --event_gondola_hook 하나만 보도록 계산된 값에서 읽습니다. */
  function getContentHeightBelowHook() {
    var maxBelowHook = 0;

    items.forEach(function (item) {
      var hook = parseFloat(window.getComputedStyle(item).getPropertyValue("--event_gondola_hook"));
      var hookOffset = item.offsetHeight * (isNaN(hook) ? 0 : hook) / 100;

      Array.prototype.forEach.call(item.children, function (child) {
        maxBelowHook = Math.max(maxBelowHook, hookOffset + child.offsetTop + child.offsetHeight);
      });
    });

    return maxBelowHook;
  }

  function renderEventPathMotion() {
    isRenderRequested = false;

    if (isCardView) {
      renderCardEvents();
      return;
    }

    if (!desktopQuery.matches || reducedMotionQuery.matches || !pathElement) {
      renderStaticEvents();
      return;
    }

    section.classList.remove("has_static_events");
    var sectionRect = section.getBoundingClientRect();
    var stageHeight = sticky.offsetHeight;
    /* transform 이 걸린 곡선이라 getBoundingClientRect 는 쓸 수 없고,
       인라인 SVG 는 offsetWidth 가 표준이 아니라 계산된 스타일에서 읽습니다. */
    var curveStyle = window.getComputedStyle(curveElement);
    var curveWidth = parseFloat(curveStyle.width);
    var curveHeight = parseFloat(curveStyle.height);
    var scrollTravel = Math.max(1, section.offsetHeight - stageHeight);
    var progress = Math.min(1, Math.max(0, -sectionRect.top / scrollTravel));
    var pathLength = visibleEndLength - (visibleEndLength - visibleStartLength) * progress;
    var point = pathElement.getPointAtLength(pathLength);
    var pathX = point.x * curveWidth / pathViewBoxWidth;
    var pathY = point.y * curveHeight / pathViewBoxHeight;
    var activeIndex = progress < 1 / 3 ? 2 : progress < 2 / 3 ? 1 : 0;

    /* 곤돌라는 path 를 타고 내려가되, 화면에서의 세로 이동은 뷰포트 중앙을 기준으로
       EVENT_GONDOLA_BAND 폭 안으로 압축합니다. 나머지 하강은 페이지 스크롤이 흡수합니다.
       그립이 선에 걸린 채 몸통과 카드가 아래로 매달리므로, 둘 다 화면에 들어오도록
       이동 구간을 위로 밀고 그래도 모자라면 폭을 좁힙니다. */
    var descent = pathBottomY - pathTopY;
    var descentRatio = descent === 0 ? 0 : (point.y - pathTopY) / descent;
    var contentBelowHook = getContentHeightBelowHook();
    var lowestHookY = Math.max(0, stageHeight - contentBelowHook);
    var bandHeight = Math.min(stageHeight * EVENT_GONDOLA_BAND, lowestHookY);
    var bandStart = Math.max(0, Math.min((stageHeight - bandHeight) / 2, lowestHookY - bandHeight));
    var gondolaY = bandStart + bandHeight * descentRatio;

    /* 곡선을 곤돌라 위치에 맞춰 반대로 밀어, 곤돌라가 늘 선 위에 놓이게 합니다. */
    list.style.setProperty("--event_path_x", pathX.toFixed(2) + "px");
    list.style.setProperty("--event_path_y", gondolaY.toFixed(2) + "px");
    sticky.style.setProperty("--event_curve_y", (gondolaY - pathY).toFixed(2) + "px");

    items.forEach(function (item, index) {
      var isActive = index === activeIndex;
      item.classList.toggle("is_active", isActive);
      item.setAttribute("aria-hidden", String(!isActive));
      item.inert = !isActive;
    });
  }

  function requestEventPathRender() {
    if (isRenderRequested) {
      return;
    }

    isRenderRequested = true;
    window.requestAnimationFrame(renderEventPathMotion);
  }

  function setEventViewMode(viewMode) {
    isCardView = viewMode === "cards";
    section.classList.toggle("is_card_view", isCardView);
    section.scrollIntoView({ block: "start" });

    viewButtons.forEach(function (button) {
      var isActive = button.getAttribute("data-events-view") === viewMode;
      button.classList.toggle("is_active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (isCardView) {
      renderCardEvents();
      return;
    }

    requestEventPathRender();
  }

  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setEventViewMode(button.getAttribute("data-events-view"));
    });
  });

  fetch(curve.src)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Event path SVG could not be loaded.");
      }

      return response.text();
    })
    .then(function (svgText) {
      var svgDocument = new DOMParser().parseFromString(svgText, "image/svg+xml");
      var sourcePath = svgDocument.querySelector("path");

      if (!sourcePath) {
        renderStaticEvents();
        return;
      }

      /* 곡선 에셋을 다시 export 해도 좌표 계산이 깨지지 않도록 viewBox 에서 읽습니다. */
      var sourceSvg = svgDocument.querySelector("svg");
      var viewBox = sourceSvg ? (sourceSvg.getAttribute("viewBox") || "").split(/[\s,]+/) : [];

      if (viewBox.length === 4 && Number(viewBox[2]) > 0 && Number(viewBox[3]) > 0) {
        pathViewBoxWidth = Number(viewBox[2]);
        pathViewBoxHeight = Number(viewBox[3]);
      }

      var geometry = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      geometry.classList.add("events_path_geometry");
      geometry.setAttribute("aria-hidden", "true");
      pathElement.setAttribute("d", sourcePath.getAttribute("d"));
      geometry.appendChild(pathElement);
      section.appendChild(geometry);

      /* 화면용 곡선을 인라인 SVG 로 다시 그립니다.
         <img> 는 object-fit 으로 상자만 늘어나고 SVG 안쪽 좌표계는
         preserveAspectRatio 기본값(xMidYMid meet)으로 비율을 유지한 채 가운데 정렬돼,
         세로로 늘린 상자에서는 곤돌라 경로와 선이 어긋납니다. */
      if (sourceSvg) {
        var previousVector = section.querySelector(".events_curve_vector");
        if (previousVector) {
          previousVector.remove();
        }

        var vector = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var skippedAttributes = ["width", "height", "class", "style", "id", "preserveAspectRatio"];

        /* 원본 루트의 표현 속성을 그대로 가져옵니다.
           특히 fill="none" 이 빠지면 열린 곡선이 닫히면서 검정으로 칠해집니다. */
        Array.prototype.forEach.call(sourceSvg.attributes, function (attribute) {
          if (attribute.name.indexOf("xmlns") === 0) {
            return;
          }

          if (skippedAttributes.indexOf(attribute.name) !== -1) {
            return;
          }

          vector.setAttribute(attribute.name, attribute.value);
        });

        vector.setAttribute("class", "events_curve events_curve_vector");
        vector.setAttribute("preserveAspectRatio", "none");
        vector.setAttribute("aria-hidden", "true");
        vector.setAttribute("focusable", "false");

        if (!vector.getAttribute("viewBox")) {
          vector.setAttribute("viewBox", "0 0 " + pathViewBoxWidth + " " + pathViewBoxHeight);
        }

        Array.prototype.forEach.call(sourceSvg.childNodes, function (node) {
          vector.appendChild(node.cloneNode(true));
        });

        /* 세로로 크게 늘어나므로 선 굵기는 배율의 영향을 받지 않게 고정합니다. */
        Array.prototype.forEach.call(vector.querySelectorAll("path"), function (node) {
          node.setAttribute("vector-effect", "non-scaling-stroke");
        });

        curve.insertAdjacentElement("afterend", vector);
        curve.hidden = true;
        curveElement = vector;
      }

      findVisiblePathRange();
      requestEventPathRender();
    })
    .catch(function () {
      renderStaticEvents();
    });

  window.addEventListener("scroll", requestEventPathRender, { passive: true });
  window.addEventListener("resize", requestEventPathRender);
  desktopQuery.addEventListener("change", requestEventPathRender);
  reducedMotionQuery.addEventListener("change", requestEventPathRender);
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

    var link = createElement("a", "btn btn_green", "Learn more");
    link.href = "./pages/visitor_guide.html#panel_recommended_courses";
    link.appendChild(createElement("span", "visually_hidden", " about " + course.title));
    var icon = createElement("img", "btn_icon");
    icon.src = ASSET_PATH + "icon/arrow_right.png";
    icon.alt = "";
    icon.width = 19;
    icon.height = 19;
    link.appendChild(icon);
    item.appendChild(link);

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
    var lastSlide = slides[slides.length - 1];
    maxListOffset = Math.max(0, lastSlide.offsetTop);
    stage.style.height = sticky.clientHeight + maxListOffset + "px";
    scrollTravel = Math.max(1, maxListOffset);
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

/* 스크롤에 맞춰 양초가 한 단씩 쌓이는 3D 조립 (yul_tower_3d/scroll-stack-3d.js).
   데스크톱에서만 켜고, 그 외에는 기존 이미지 스택을 그대로 씁니다.
   모듈·three·gsap 이 없으면 초기화가 null 을 돌려주므로 이미지 스택이 남습니다. */
function initTowerStack3D() {
  var section = document.querySelector("#tower_section");
  var mount = document.querySelector("[data-tower-3d]");
  var goodsSection = document.querySelector("#goods_section");
  var goodsHeroImage = goodsSection ? goodsSection.querySelector(".goods_hero_img") : null;

  if (!section || !mount || !window.ScrollStack3D) {
    return;
  }

  var desktopQuery = window.matchMedia("(min-width: 1280px)");
  var stack = null;
  var towerCanvas = null;
  var towerStage = null;
  var transitionLayer = null;
  var transitionTrigger = null;
  var assemblyTrigger = null;
  var towerTransitionState = "";
  var isTowerTransitionSyncRequested = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function interpolate(start, end, progress) {
    return start + (end - start) * progress;
  }

  function createTowerTransitionLayer() {
    if (transitionLayer) {
      return transitionLayer;
    }

    transitionLayer = document.createElement("div");
    transitionLayer.className = "tower_transition_layer";
    transitionLayer.hidden = true;
    transitionLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(transitionLayer);
    return transitionLayer;
  }

  function renderTowerTransition(progress) {
    if (!towerCanvas || !goodsSection || !goodsHeroImage || !window.gsap) {
      return;
    }

    var normalizedProgress = clamp(progress, 0, 1);
    var goodsRect = goodsSection.getBoundingClientRect();
    var heroRect = goodsHeroImage.getBoundingClientRect();
    var startX = window.innerWidth * 0.16;
    var targetX = heroRect.left + heroRect.width / 2 - window.innerWidth / 2;
    var targetY = heroRect.top - goodsRect.top + heroRect.height / 2 - window.innerHeight / 2;
    var motionProgress = normalizedProgress * normalizedProgress * (3 - 2 * normalizedProgress);
    var imageProgress = clamp((normalizedProgress - 0.84) / 0.16, 0, 1);

    window.gsap.set(towerCanvas, {
      x: interpolate(startX, targetX, motionProgress),
      y: interpolate(0, targetY, motionProgress),
      scale: interpolate(1, 0.72, motionProgress),
      autoAlpha: 1 - imageProgress
    });
    window.gsap.set(goodsHeroImage, { autoAlpha: imageProgress });
  }

  function activateTowerTransition(progress) {
    var layer = createTowerTransitionLayer();

    if (!towerCanvas || !layer) {
      return;
    }

    layer.hidden = false;
    if (towerCanvas.parentNode !== layer) {
      layer.appendChild(towerCanvas);
    }
    renderTowerTransition(progress);
  }

  function completeTowerTransition() {
    renderTowerTransition(1);
    attachTowerCanvasToStage();
  }

  function attachTowerCanvasToStage() {
    if (!towerCanvas || !towerStage || !window.gsap) {
      return;
    }

    if (towerCanvas.parentNode !== towerStage) {
      towerStage.insertBefore(towerCanvas, towerStage.firstChild);
    }
    if (transitionLayer) {
      transitionLayer.hidden = true;
    }
  }

  function settleTowerAssemblyProgress() {
    if (!stack || !stack.timeline || !assemblyTrigger) {
      return;
    }

    /* 숫자 scrub이 이전 위치를 뒤쫓고 있으면 현재 스크롤 진행률까지 즉시 정착시킵니다. */
    var scrubTween = typeof assemblyTrigger.getTween === "function"
      ? assemblyTrigger.getTween()
      : null;

    if (scrubTween) {
      scrubTween.progress(1);
    }
    stack.timeline.progress(assemblyTrigger.progress, true);
  }

  function prepareTowerAssembly(shouldShowCanvas) {
    attachTowerCanvasToStage();
    settleTowerAssemblyProgress();
    if (towerCanvas && window.gsap) {
      /* x는 조립 timeline이 관리합니다. 핸드오프에서만 쓰는 속성만 초기화합니다. */
      window.gsap.set(towerCanvas, {
        y: 0,
        scale: 1,
        autoAlpha: shouldShowCanvas ? 1 : 0
      });
    }
    if (goodsHeroImage && window.gsap) {
      window.gsap.set(goodsHeroImage, { autoAlpha: 0 });
    }
  }

  function syncTowerTransitionState() {
    isTowerTransitionSyncRequested = false;

    if (!assemblyTrigger || !transitionTrigger || !towerCanvas) {
      return;
    }

    var scrollPosition = typeof assemblyTrigger.scroll === "function"
      ? assemblyTrigger.scroll()
      : window.scrollY;
    var assemblyStart = assemblyTrigger.start;
    var handoffStart = assemblyTrigger.end;
    var handoffEnd = transitionTrigger.end;

    if (
      !Number.isFinite(assemblyStart) ||
      !Number.isFinite(handoffStart) ||
      !Number.isFinite(handoffEnd) ||
      handoffEnd <= handoffStart
    ) {
      return;
    }

    if (scrollPosition < assemblyStart) {
      if (towerTransitionState !== "before") {
        prepareTowerAssembly(false);
        towerTransitionState = "before";
      }
      return;
    }

    if (scrollPosition < handoffStart) {
      if (towerTransitionState !== "assembly") {
        prepareTowerAssembly(true);
        towerTransitionState = "assembly";
      }
      return;
    }

    if (scrollPosition <= handoffEnd) {
      towerTransitionState = "handoff";
      activateTowerTransition((scrollPosition - handoffStart) / (handoffEnd - handoffStart));
      return;
    }

    if (towerTransitionState !== "complete") {
      completeTowerTransition();
      towerTransitionState = "complete";
    }
  }

  function requestTowerTransitionSync() {
    if (isTowerTransitionSyncRequested) {
      return;
    }

    isTowerTransitionSyncRequested = true;
    window.requestAnimationFrame(syncTowerTransitionState);
  }

  function destroyTowerTransition() {
    if (transitionTrigger) {
      transitionTrigger.kill();
      transitionTrigger = null;
    }
    window.removeEventListener("scroll", requestTowerTransitionSync);
    window.removeEventListener("pageshow", requestTowerTransitionSync);

    prepareTowerAssembly(false);
    towerTransitionState = "";
    isTowerTransitionSyncRequested = false;

    if (transitionLayer) {
      transitionLayer.remove();
      transitionLayer = null;
    }
    if (goodsSection) {
      goodsSection.classList.remove("has_tower_transition");
    }
    if (goodsHeroImage && window.gsap) {
      window.gsap.set(goodsHeroImage, { clearProps: "opacity,visibility" });
    }
  }

  function initTowerCanvasMotion() {
    var canvas = mount.querySelector(".s3d__canvas");

    if (
      !stack ||
      !stack.timeline ||
      !canvas ||
      !window.gsap
    ) {
      return;
    }

    towerCanvas = canvas;
    towerStage = mount.querySelector(".s3d__stage");
    assemblyTrigger = stack.timeline.scrollTrigger;
    var assemblyDuration = stack.timeline.duration();

    window.gsap.set(canvas, {
      x: "20vw",
      y: 0,
      scale: 1,
      autoAlpha: 1,
      transformOrigin: "50% 50%"
    });
    window.gsap.set(towerStage, {
      backgroundColor: "rgba(247, 244, 232, 0)"
    });

    /* Gift Shop을 부드럽게 덮은 뒤 오른쪽 → 왼쪽 → 오른쪽으로 조립합니다. */
    stack.timeline
      .to(towerStage, {
        backgroundColor: "rgba(247, 244, 232, 1)",
        duration: assemblyDuration * 0.14,
        ease: "none"
      }, 0)
      .to(canvas, {
        x: "-20vw",
        duration: assemblyDuration * 0.48,
        ease: "sine.inOut"
      }, 0)
      .to(canvas, {
        x: "16vw",
        duration: assemblyDuration * 0.42,
        ease: "sine.inOut"
      }, assemblyDuration * 0.48);

    if (towerStage && goodsSection && goodsHeroImage && window.ScrollTrigger && assemblyTrigger) {
      goodsSection.classList.add("has_tower_transition");
      window.gsap.set(goodsHeroImage, { autoAlpha: 0 });

      transitionTrigger = window.ScrollTrigger.create({
        trigger: goodsSection,
        /* 조립 핀이 풀리는 정확한 스크롤 좌표에서 핸드오프를 시작합니다. */
        start: function () {
          return assemblyTrigger.end;
        },
        end: "top top",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onEnter: requestTowerTransitionSync,
        onUpdate: requestTowerTransitionSync,
        onLeave: requestTowerTransitionSync,
        onEnterBack: requestTowerTransitionSync,
        onLeaveBack: requestTowerTransitionSync,
        /* refresh 중에는 DOM을 옮기지 않고 다음 프레임에만 상태를 동기화합니다. */
        onRefresh: requestTowerTransitionSync
      });

      /* Lenis 앵커 이동과 빠른 휠 스크롤도 실제 scroll 위치로 상태를 확정합니다. */
      window.addEventListener("scroll", requestTowerTransitionSync, { passive: true });
      window.addEventListener("pageshow", requestTowerTransitionSync);
    }

    window.ScrollTrigger.refresh();
    requestTowerTransitionSync();
  }

  function renderTowerStackMode() {
    if (desktopQuery.matches && !stack) {
      stack = window.ScrollStack3D.init({
        mount: mount,
        /* 모듈 기본 오버레이(라벨·단계 목록·진행 레일)는 시안에 없어 끕니다. */
        ui: false
      });
      section.classList.toggle("is_tower_3d", Boolean(stack));
      initTowerCanvasMotion();
      return;
    }

    if (!desktopQuery.matches && stack) {
      destroyTowerTransition();
      stack.destroy();
      stack = null;
      towerCanvas = null;
      towerStage = null;
      assemblyTrigger = null;
      section.classList.remove("is_tower_3d");
    }
  }

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", renderTowerStackMode);
  }

  renderTowerStackMode();
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

function initRestaurantStackState() {
  var restaurantAll = document.querySelector("[data-restaurant-all]");
  if (!restaurantAll) {
    return;
  }

  var stickyMedia = window.matchMedia("(min-width: 834px)");
  var isFrameRequested = false;

  function renderRestaurantStackState() {
    var restaurantRect = restaurantAll.getBoundingClientRect();
    var stickyTop = parseFloat(window.getComputedStyle(restaurantAll).top) || 0;
    var isStacked =
      stickyMedia.matches &&
      restaurantRect.top <= stickyTop + 1 &&
      restaurantRect.bottom > stickyTop;

    restaurantAll.classList.toggle("is_stacked", isStacked);
    isFrameRequested = false;
  }

  function requestRestaurantStackRender() {
    if (isFrameRequested) {
      return;
    }

    isFrameRequested = true;
    window.requestAnimationFrame(renderRestaurantStackState);
  }

  window.addEventListener("scroll", requestRestaurantStackRender, { passive: true });
  window.addEventListener("resize", requestRestaurantStackRender);

  if (typeof stickyMedia.addEventListener === "function") {
    stickyMedia.addEventListener("change", requestRestaurantStackRender);
  } else if (typeof stickyMedia.addListener === "function") {
    stickyMedia.addListener(requestRestaurantStackRender);
  }

  requestRestaurantStackRender();
}

/* --------------------------------------------------------------------------
   히어로 → 이벤트 한 번에 이동
   히어로가 화면을 채우고 있을 때 아래로 한 번 스크롤하면 이벤트 섹션 상단으로 옮깁니다.
   히어로를 벗어난 뒤에는 개입하지 않고 평소대로 스크롤됩니다.
   -------------------------------------------------------------------------- */
function initHeroSectionJump() {
  var hero = document.getElementById("hero_section");
  var events = document.getElementById("events_section");

  if (!hero || !events) {
    return;
  }

  /* 이동이 끝나기 전에 다음 스크롤이 다시 발동하지 않도록 잠그는 시간입니다. */
  var JUMP_LOCK_TIME = 900;
  /* 터치에서 스크롤 의도로 볼 최소 이동 거리입니다. */
  var SWIPE_THRESHOLD = 24;

  var isJumping = false;
  var unlockTimer = 0;
  var touchStartY = 0;

  function isHeroFillingView() {
    return hero.getBoundingClientRect().bottom > window.innerHeight * 0.9;
  }

  function canJump() {
    /* 메뉴 오버레이로 스크롤이 잠긴 동안에는 동작하지 않습니다. */
    return !isJumping && document.body.style.overflow !== "hidden" && isHeroFillingView();
  }

  function unlockJump() {
    isJumping = false;
  }

  function scrollToEvents() {
    isJumping = true;
    window.clearTimeout(unlockTimer);
    unlockTimer = window.setTimeout(unlockJump, JUMP_LOCK_TIME);

    /* Lenis 가 살아 있으면 Lenis 로 옮겨야 관성 스크롤과 충돌하지 않습니다.
       lock 옵션이 이동하는 동안 사용자 입력을 막아 줍니다. */
    if (window.lenisInstance && typeof window.lenisInstance.scrollTo === "function") {
      window.lenisInstance.scrollTo(events, { lock: true, onComplete: unlockJump });
      return;
    }

    events.scrollIntoView({
      behavior: isReducedMotion() ? "auto" : "smooth",
      block: "start"
    });
  }

  function handleHeroWheel(event) {
    /* 확대 축소 제스처(ctrl + 휠)와 위로 올리는 스크롤은 그대로 둡니다. */
    if (event.ctrlKey || event.deltaY <= 0 || !canJump()) {
      return;
    }

    event.preventDefault();
    scrollToEvents();
  }

  function handleHeroTouchStart(event) {
    touchStartY = event.touches[0].clientY;
  }

  function handleHeroTouchMove(event) {
    if (!canJump()) {
      return;
    }

    /* 손가락을 위로 밀면(=아래로 스크롤) 이동합니다. */
    if (touchStartY - event.touches[0].clientY < SWIPE_THRESHOLD) {
      return;
    }

    scrollToEvents();
  }

  window.addEventListener("wheel", handleHeroWheel, { passive: false });
  window.addEventListener("touchstart", handleHeroTouchStart, { passive: true });
  window.addEventListener("touchmove", handleHeroTouchMove, { passive: true });
}

/* --------------------------------------------------------------------------
   init
   -------------------------------------------------------------------------- */
function initMain() {
  renderEvents(mainPageData.events);
  initEventPathMotion();
  renderCourses(mainPageData.courses);
  renderGiftItems(mainPageData.giftShopItems);
  renderTowerStacks(mainPageData.towerParts);
  renderCustomGoods(mainPageData.customGoodsItems);

  initHeroSectionJump();
  initCourseScrollScene();
  initGiftTrackCursor();
  initTowerReveal();
  initTowerStack3D();
  initRestaurantStackState();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMain);
} else {
  initMain();
}
