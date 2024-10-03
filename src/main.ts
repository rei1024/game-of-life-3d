import "./style.css";
import * as BABYLON from "babylonjs";
import { Engine, Vector3 } from "babylonjs";
import { setupArcRotateCamera } from "./lib/camera";
import { setupFullScreenButton } from "./lib/settings";
import {
  $autoRandom,
  $autoRotate,
  $canvas,
  $closeSettings,
  $colorInput,
  $configButton,
  $fullScreen,
  $historySizeInput,
  $inputRLE,
  $readRLE,
  $rleErrorMessage,
  $settingsDialog,
} from "./bind";
import { App } from "./app";

const engine = new Engine($canvas, true);
const scene = new BABYLON.Scene(engine);

// 背景色を黒に設定
scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

// ArcRotateCameraをBitWorldの中心に設定
const camera = setupArcRotateCamera(scene, $canvas);

const pointLight = new BABYLON.PointLight(
  "pointLight",
  new BABYLON.Vector3(-100, 100, 0), // ライトの初期位置
  scene
);
pointLight.intensity = 0.3; // 光の強さ
pointLight.diffuse = new BABYLON.Color3(0.8, 1, 1); // 光の色
pointLight.specular = new BABYLON.Color3(1, 1, 1); // 反射光の色

const app = new App(engine, scene, camera, pointLight);

// 基本的なライトを追加
new BABYLON.HemisphericLight("light1", new Vector3(0, 1, 0), scene);

let running = true;
let i = 0;

engine.runRenderLoop(() => {
  if ($autoRotate.checked) {
    camera.alpha += scene.deltaTime / 4000;
  }
  scene.render();
  if (!running) {
    return;
  }
  const INTERVAL = 3;

  i++;
  if (i % INTERVAL === 0) {
    app.updateWorld();
  }
});

window.addEventListener("resize", () => {
  engine.resize();
});

document.addEventListener("keydown", (e) => {
  if (e.isComposing) {
    return;
  }
  if (e.key === "Enter") {
    running = !running;
  }
  if (e.key === "r") {
    app.random();
  }
});

// ダイアログ制御
$historySizeInput.addEventListener("input", () => {
  let historySize = parseInt($historySizeInput.value, 10);
  if (Number.isNaN(app.historySize)) {
    historySize = 1;
  }
  app.historySize = Math.min(Math.max(historySize, 1), 500);
});
$historySizeInput.value = app.historySize.toString();

$closeSettings.addEventListener("click", () => {
  $settingsDialog.close();
});

$configButton.addEventListener("click", () => {
  if (!$settingsDialog.open) {
    $settingsDialog.showModal();
  }
});

function updateReadRLEButton() {
  if ($inputRLE.value.trim() === "") {
    $readRLE.disabled = true;
  } else {
    $readRLE.disabled = false;
  }
}
updateReadRLEButton();
$inputRLE.addEventListener("input", () => {
  updateReadRLEButton();
});

$readRLE.addEventListener("click", () => {
  $autoRandom.checked = false;
  app.clearCell();
  $rleErrorMessage.textContent = null;
  try {
    app.setRLE($inputRLE.value);
  } catch (error) {
    $rleErrorMessage.textContent = "Invalid RLE or oversized";
    app.clearCell();
    throw error;
  }
  $settingsDialog.close();
});

$colorInput.addEventListener("input", () => {
  app.setCellColor($colorInput.value);
});

setupFullScreenButton($fullScreen, () => {
  $settingsDialog.close();
});
