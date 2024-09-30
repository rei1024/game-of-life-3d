import type { BitWorld } from "@ca-ts/algo/bit";
import { parseRLE } from "@ca-ts/rle";

export function setRLE(bitWorld: BitWorld, sourceRLE: string) {
  const data = parseRLE(sourceRLE);

  const width = data.size?.width ?? 0;
  const height = data.size?.height ?? 0;

  const centerX = Math.floor(bitWorld.getWidth() / 2) - Math.floor(width / 2);
  const centerY = Math.floor(bitWorld.getHeight() / 2) - Math.floor(height / 2);
  for (const {
    position: { x, y },
    state,
  } of data.cells) {
    if (state === 1) {
      bitWorld.set(x + centerX, y + centerY);
    }
  }
}
