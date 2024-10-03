import "./style.css";
import * as BABYLON from "babylonjs";
import { Engine, Vector3 } from "babylonjs";
import { BitGrid, BitWorld } from "@ca-ts/algo/bit";
import { setupArcRotateCamera } from "./camera";
import { createTemplateCell } from "./cell";
import { setRLE } from "./setRLE";
import { setupFullScreenButton } from "./settings";
import {
  $autoRandom,
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

const WORLD_SIZE = 32 * 2;
let historySize = 16;

const engine = new Engine($canvas, true);
const scene = new BABYLON.Scene(engine);

// 背景色を黒に設定
scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

// ArcRotateCameraをBitWorldの中心に設定
const camera = setupArcRotateCamera(scene, $canvas);

let prevGrid: BitGrid | null = null;
let prevPrevGrid: BitGrid | null = null;

// 基本的なライトを追加
new BABYLON.HemisphericLight("light1", new Vector3(0, 1, 0), scene);

const pointLight = new BABYLON.PointLight(
  "pointLight",
  new BABYLON.Vector3(-100, 100, 0), // ライトの初期位置
  scene
);
pointLight.intensity = 0.3; // 光の強さ
pointLight.diffuse = new BABYLON.Color3(0.8, 1, 1); // 光の色
pointLight.specular = new BABYLON.Color3(1, 1, 1); // 反射光の色

// BitWorldを作成
const bitWorld = BitWorld.make({ width: WORLD_SIZE, height: WORLD_SIZE });
bitWorld.random();

// BitWorldの中心を計算
const worldCenterX = bitWorld.getWidth() / 2;
const worldCenterY = bitWorld.getHeight() / 2;
camera.target = new Vector3(worldCenterX, 0, worldCenterY);

let generation = 0;
let cellMeshes: BABYLON.InstancedMesh[][] = [];
const stackHeight = 1;

const { templateCell, cellMaterial } = createTemplateCell(scene);

function updateWorld() {
  prevPrevGrid = prevGrid;
  prevGrid = bitWorld.bitGrid.clone();
  bitWorld.next();

  if (
    $autoRandom.checked &&
    prevPrevGrid &&
    bitWorld.bitGrid.equal(prevPrevGrid)
  ) {
    clearCell();
    bitWorld.random();
  }

  const newCells: BABYLON.InstancedMesh[] = [];

  // 新しい世代のセルを表示
  bitWorld.forEach((x, y, alive) => {
    if (alive === 1) {
      // セルのインスタンスを作成
      const instance = templateCell.createInstance(`cell_${x}_${y}`);
      instance.position = new Vector3(x, generation * stackHeight, y);

      // マテリアルや色はテンプレートセルと共有されるので追加設定不要
      newCells.push(instance);
      // instance.scaling = new Vector3(0.5, 0.5, 0.5);
    }
  });

  cellMeshes.push(newCells);

  // 古い世代のセルを削除
  if (cellMeshes.length >= historySize) {
    const old = cellMeshes.slice(0, cellMeshes.length - historySize);
    old.forEach((a) => {
      a.forEach((c) => c.dispose());
    });
    cellMeshes = cellMeshes.slice(cellMeshes.length - historySize);
  }
  // 点光源の位置を移動させる
  pointLight.position.y += stackHeight;
  // カメラを移動
  camera.target.y += stackHeight;
  generation++;
}
const autoRotate = document.querySelector("#auto-rotate") as HTMLInputElement;
let running = true;
let i = 0;

engine.runRenderLoop(() => {
  if (autoRotate.checked) {
    camera.alpha += scene.deltaTime / 4000;
  }
  scene.render();
  if (!running) {
    return;
  }
  const INTERVAL = 3;

  i++;
  if (i % INTERVAL === 0) {
    updateWorld();
  }
});

window.addEventListener("resize", () => {
  engine.resize();
});

function clearCell() {
  cellMeshes.forEach((a) => {
    a.forEach((c) => c.dispose());
  });
  cellMeshes = [];
  bitWorld.clear();
}

document.addEventListener("keydown", (e) => {
  if (e.isComposing) {
    return;
  }
  if (e.key === "Enter") {
    running = !running;
  }
  if (e.key === "r") {
    clearCell();
    bitWorld.random();
  }
});

// ダイアログ制御
$historySizeInput.addEventListener("input", () => {
  historySize = parseInt($historySizeInput.value, 10);
  if (Number.isNaN(historySize)) {
    historySize = 1;
  }
  historySize = Math.min(Math.max(historySize, 1), 500);
});
$historySizeInput.value = historySize.toString();

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
  clearCell();
  $rleErrorMessage.textContent = null;
  try {
    setRLE(bitWorld, $inputRLE.value);
  } catch (error) {
    $rleErrorMessage.textContent = "Invalid RLE or oversized";
    throw error;
  }
  $settingsDialog.close();
});

$colorInput.addEventListener("input", () => {
  cellMaterial.diffuseColor = BABYLON.Color3.FromHexString($colorInput.value);
});

setupFullScreenButton($fullScreen, () => {
  $settingsDialog.close();
});
