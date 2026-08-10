(function initIntro() {
  const introVideo = document.querySelector("[data-intro-video]");
  const skipButton = document.querySelector("[data-intro-skip]");

  if (!introVideo || !skipButton) {
    return;
  }

  function goToMain() {
    window.location.replace("./index.html?intro=complete");
  }

  introVideo.addEventListener("ended", goToMain, { once: true });
  skipButton.addEventListener("click", goToMain);

  const playIntro = introVideo.play();

  if (playIntro) {
    playIntro.catch(function handlePlayError() {
      skipButton.focus();
    });
  }
}());
