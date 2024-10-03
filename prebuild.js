import { writeFile } from "node:fs/promises";

async function main() {
  await writeFile(".env", `VITE_DATE="${new Date().toISOString()}"`);
}

main();
