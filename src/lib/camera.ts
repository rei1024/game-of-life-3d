import { ArcRotateCamera, Scene, Vector3 } from "babylonjs";

export function setupArcRotateCamera(
  scene: Scene,
  canvas: HTMLCanvasElement,
): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    "ArcRotateCamera",
    Math.PI / 2,
    Math.PI / 3,
    100,
    new Vector3(0, 0, 0),
    scene,
  );
  camera.attachControl(canvas, true);
  return camera;
}
