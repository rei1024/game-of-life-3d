import * as BABYLON from "babylonjs";

export function createTemplateCell(scene: BABYLON.Scene) {
  // 1つのベースメッシュを作成
  const templateCell = BABYLON.MeshBuilder.CreateBox(
    "templateCell",
    { size: 1 },
    scene,
  );
  // const templateCell = BABYLON.MeshBuilder.CreateSphere(
  //   "templateCell",
  //   { diameter: 1 },
  //   scene
  // );
  templateCell.isVisible = false; // マスターセル自体は非表示にする

  // マテリアルを作成して透明度を設定
  const cellMaterial = new BABYLON.StandardMaterial("cellMaterial", scene);
  cellMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // 白色
  cellMaterial.alpha = 1; // 透明度を設定
  cellMaterial.alphaMode = BABYLON.Constants.ALPHA_COMBINE;
  // cellMaterial.wireframe = true; // ワイヤーフレームモードを有効に
  // cellMaterial.freeze();

  templateCell.material = cellMaterial;

  return { templateCell, cellMaterial };
}
