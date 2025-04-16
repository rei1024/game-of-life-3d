import type { BitWorld } from "@ca-ts/algo/bit";
import { parseRLE } from "@ca-ts/rle";
import { parseRule } from "@ca-ts/rule";

export function setRLE(bitWorld: BitWorld, sourceRLE: string) {
  const data = parseRLE(sourceRLE);

  try {
    const rule = parseRule(data.ruleString);
    if (rule.type === "outer-totalistic") {
      console.log(rule);
      if (rule.generations != undefined) {
        throw new Error("Generations is unsupported");
      }
      if (rule.neighborhood != undefined) {
        throw new Error(
          "Hexagonal or von Neumann neighborhood is not supported",
        );
      }
      console.log(rule);
      bitWorld.setRule(rule.transition);
    } else if (rule.type === "int") {
      if (rule.generations != undefined) {
        throw new Error("Generations is unsupported");
      }
      bitWorld.setINTRule(rule.transition);
    } else {
      throw new Error("unsupported rule");
    }
  } catch {
    bitWorld.setRule({ birth: [3], survive: [2, 3] });
  }

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
