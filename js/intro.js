(function initIntro() {
  const INTRO_SESSION_KEY = "hasSeenIntro";
  const introScreen = document.querySelector(".intro_screen");
  const introVideo = document.querySelector("[data-intro-video]");
  const cursorSkip = document.querySelector("[data-intro-cursor]");
  const isPreview = new URLSearchParams(window.location.search).has("preview");
  let isNavigating = false;

  if (!introScreen || !introVideo || !cursorSkip) {
    return;
  }

  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");
  } catch (error) {
    /* 저장소가 차단된 환경에서도 인트로 재생과 메인 이동은 그대로 동작합니다. */
  }

  function goToMain() {
    if (isNavigating) {
      return;
    }

    isNavigating = true;
    window.location.replace("./index.html?intro=complete");
  }

  if (isPreview) {
    introVideo.loop = true;
  } else {
    introVideo.addEventListener("ended", goToMain, { once: true });
  }
  introScreen.addEventListener("click", goToMain);

  introScreen.addEventListener("pointermove", function handlePointerMove(event) {
    if (event.pointerType !== "mouse") {
      return;
    }

    cursorSkip.classList.add("is_active");
    cursorSkip.style.transform = "translate3d(" + event.clientX + "px, " + event.clientY + "px, 0) translate3d(-50%, -50%, 0)";
  });

  introScreen.addEventListener("pointerleave", function handlePointerLeave() {
    cursorSkip.classList.remove("is_active");
  });

  const playIntro = introVideo.play();

  if (playIntro) {
    playIntro.catch(function handlePlayError() {
      cursorSkip.focus();
    });
  }
}());
