import "./style.css";
import * as BABYLON from "babylonjs";
import { Engine, Vector3 } from "babylonjs";
import { BitWorld } from "@ca-ts/algo/bit";
import { setupArcRotateCamera } from "./camera";
import { createTemplateCell } from "./cell";
import { setRLE } from "./setRLE";

const WORLD_SIZE = 32 * 2;
let historySize = 16;

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// 背景色を黒に設定
scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

// ArcRotateCameraをBitWorldの中心に設定
const camera = setupArcRotateCamera(scene, canvas);

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

const templateCell = createTemplateCell(scene);

function updateWorld() {
  bitWorld.next();

  const newCells: BABYLON.InstancedMesh[] = [];

  // 新しい世代のセルを表示
  bitWorld.forEach((x, y, alive) => {
    if (alive === 1) {
      // セルのインスタンスを作成
      const instance = templateCell.createInstance(`cell_${x}_${y}`);
      instance.position = new Vector3(x, generation * stackHeight, y);

      // マテリアルや色はテンプレートセルと共有されるので追加設定不要
      newCells.push(instance);
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
  pointLight.position.y = generation * stackHeight;
  // カメラを移動
  camera.target.y = generation * stackHeight;
  generation++;
}

let running = true;
let i = 0;
engine.runRenderLoop(() => {
  scene.render();
  if (!running) {
    return;
  }
  i++;
  if (i % 3 === 0) {
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
const settingsDialog = document.getElementById(
  "settingsDialog"
) as HTMLDialogElement;
const historySizeInput = document.getElementById(
  "historySize"
) as HTMLInputElement;

historySizeInput.addEventListener("input", () => {
  historySize = parseInt(historySizeInput.value, 10);
  if (Number.isNaN(historySize)) {
    historySize = 1;
  }
  historySize = Math.min(Math.max(historySize, 1), 500);
});
historySizeInput.value = historySize.toString();

document.getElementById("closeSettings")!.addEventListener("click", () => {
  settingsDialog.close();
});

const configButton = document.getElementById("configButton") as HTMLElement;
configButton.addEventListener("click", () => {
  if (!settingsDialog.open) {
    settingsDialog.showModal();
  }
});

const readRLE = document.getElementById("readRLE") as HTMLElement;
const rleErrorMessage = document.getElementById("rleError") as HTMLElement;
const inputRLE = document.getElementById("inputRLE") as HTMLTextAreaElement;
readRLE.addEventListener("click", () => {
  clearCell();
  rleErrorMessage.textContent = null;
  try {
    setRLE(bitWorld, inputRLE.value);
  } catch (error) {
    rleErrorMessage.textContent = "Invalid RLE or oversized";
    throw error;
  }
  settingsDialog.close();
});
