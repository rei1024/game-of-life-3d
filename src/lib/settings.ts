export function setupFullScreenButton(
  fullScreenToggleButton: HTMLElement,
  onClick: () => void = () => {}
) {
  if (!document.fullscreenEnabled) {
    fullScreenToggleButton.remove();
    return;
  }

  fullScreenToggleButton.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
    onClick();
  });
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      fullScreenToggleButton.textContent = "End Full Screen";
    } else {
      fullScreenToggleButton.textContent = "Full Screen";
    }
  });
}
