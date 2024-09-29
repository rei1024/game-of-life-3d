import "./style.css";
import * as BABYLON from "babylonjs";
import {
  Engine,
  Scene,
  Vector3,
  MeshBuilder,
  Color3,
  StandardMaterial,
} from "babylonjs";
import { BitWorld } from "@ca-ts/algo/bit";
import { setupArcRotateCamera } from "./camera";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);

// ArcRotateCameraをBitWorldの中心に設定
const camera = setupArcRotateCamera(scene, canvas);

// 基本的なライトを追加
const light = new BABYLON.HemisphericLight(
  "light1",
  new Vector3(0, 1, 0),
  scene
);

// BitWorldを作成
const bitWorld = BitWorld.make({ width: 64, height: 64 });
bitWorld.random();

// BitWorldの中心を計算
const worldCenterX = bitWorld.getWidth() / 2;
const worldCenterY = bitWorld.getHeight() / 2;
camera.target = new Vector3(worldCenterX, 0, worldCenterY);

let generation = 0;
const cellMeshes: BABYLON.Mesh[][] = [];
const stackHeight = 2;

function updateWorld() {
  bitWorld.next();

  const newCells: BABYLON.Mesh[] = [];

  // 新しい世代のセルを表示
  bitWorld.forEach((x, y, alive) => {
    if (alive === 1) {
      const cell = MeshBuilder.CreateBox(`cell_${x}_${y}`, { size: 1 }, scene);
      cell.position = new Vector3(x, generation * stackHeight, y);

      const cellMaterial = new StandardMaterial(`mat_${generation}`, scene);
      // cellMaterial.diffuseColor = getColorForGeneration(generation);
      // cellMaterial.alpha = Math.max(1 - generation / 10, 0.1); // 古い世代ほど透明に
      cell.material = cellMaterial;

      newCells.push(cell);
    }
  });

  cellMeshes.push(newCells);

  if (cellMeshes.length >= 10) {
    const old = cellMeshes.shift()!;
    old.forEach((c) => c.dispose());
  }

  camera.target.y = generation * stackHeight;
  generation++;
}

engine.runRenderLoop(() => {
  scene.render();
  updateWorld();
});

window.addEventListener("resize", () => {
  engine.resize();
});
