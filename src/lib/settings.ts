export function setupFullScreenButton(
  fullScreen: HTMLElement,
  onClick: () => void = () => {}
) {
  if (!document.fullscreenEnabled) {
    fullScreen.remove();
    return;
  }

  fullScreen.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
    onClick();
  });
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      fullScreen.textContent = "End Full Screen";
    } else {
      fullScreen.textContent = "Full Screen";
    }
  });
}
