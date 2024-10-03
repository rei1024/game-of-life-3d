import * as BABYLON from "babylonjs";
import { BitGrid, BitWorld } from "@ca-ts/algo/bit";
import { $autoRandom } from "./bind";
import { createTemplateCell } from "./lib/cell";
import { setRLE } from "./lib/setRLE";

const WORLD_SIZE = 32 * 2;
const stackHeight = 1;

export class App {
  private prevGrid: BitGrid | null = null;
  private prevPrevGrid: BitGrid | null = null;
  private bitWorld = BitWorld.make({ width: WORLD_SIZE, height: WORLD_SIZE });
  private generation = 0;
  public historySize = 16;
  private templateMesh: BABYLON.Mesh;
  private cellMaterial: BABYLON.StandardMaterial;
  private cellMeshes: BABYLON.InstancedMesh[][] = [];

  constructor(
    private engine: BABYLON.Engine,
    private scene: BABYLON.Scene,
    private camera: BABYLON.ArcRotateCamera,
    private pointLight: BABYLON.PointLight
  ) {
    this.bitWorld.random();
    this.initCamera();
    const { templateCell, cellMaterial } = createTemplateCell(scene);
    this.templateMesh = templateCell;
    this.cellMaterial = cellMaterial;
  }

  private initCamera() {
    const worldCenterX = this.bitWorld.getWidth() / 2;
    const worldCenterY = this.bitWorld.getHeight() / 2;
    // BitWorldの中心を計算
    this.camera.target = new BABYLON.Vector3(worldCenterX, 0, worldCenterY);
  }

  setSize(size: number) {
    this.generation = 0;
    this.camera.target.y = 0;
    this.pointLight.position.y = 0;
    this.clearCell();
    this.bitWorld = BitWorld.make({ width: size, height: size });
    this.initCamera();
    this.random();
  }

  updateWorld() {
    this.prevPrevGrid = this.prevGrid;
    this.prevGrid = this.bitWorld.bitGrid.clone();
    this.bitWorld.next();

    if (
      $autoRandom.checked &&
      this.prevPrevGrid &&
      this.bitWorld.bitGrid.equal(this.prevPrevGrid)
    ) {
      this.clearCell();
      this.bitWorld.random();
    }

    const newCells: BABYLON.InstancedMesh[] = [];

    // 新しい世代のセルを表示
    this.bitWorld.forEach((x, y, alive) => {
      if (alive === 1) {
        // セルのインスタンスを作成
        const instance = this.templateMesh.createInstance(`cell_${x}_${y}`);
        instance.position = new BABYLON.Vector3(
          x,
          this.generation * stackHeight,
          y
        );

        // マテリアルや色はテンプレートセルと共有されるので追加設定不要
        newCells.push(instance);
        // instance.scaling = new Vector3(0.5, 0.5, 0.5);
      }
    });

    this.cellMeshes.push(newCells);

    // 古い世代のセルを削除
    if (this.cellMeshes.length >= this.historySize) {
      const old = this.cellMeshes.slice(
        0,
        this.cellMeshes.length - this.historySize
      );
      old.forEach((a) => {
        a.forEach((c) => c.dispose());
      });
      this.cellMeshes = this.cellMeshes.slice(
        this.cellMeshes.length - this.historySize
      );
    }
    // カメラを移動
    this.camera.target.y += stackHeight;
    // 点光源の位置を移動させる
    this.pointLight.position.y += stackHeight;
    this.generation++;
  }

  clearCell() {
    this.cellMeshes.forEach((a) => {
      a.forEach((c) => c.dispose());
    });
    this.cellMeshes = [];
    this.bitWorld.clear();
  }

  random() {
    this.clearCell();
    this.bitWorld.random();
  }

  setRLE(rle: string) {
    setRLE(this.bitWorld, rle);
  }

  setCellColor(colorHex: string) {
    this.cellMaterial.diffuseColor = BABYLON.Color3.FromHexString(colorHex);
  }
}
