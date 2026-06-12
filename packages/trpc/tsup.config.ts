import { defineConfig } from "tsup";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

function getEntries(dir: string): string[] {
  const results: string[] = [];
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name === "__tests__" || item.name === "__mocks__") continue;
      results.push(...getEntries(full));
    } else if (
      item.name.endsWith(".ts") &&
      !item.name.endsWith(".test.ts") &&
      !item.name.endsWith(".spec.ts") &&
      !item.name.endsWith(".d.ts")
    ) {
      results.push(relative(process.cwd(), full));
    }
  }
  return results;
}

export default defineConfig({
  entry: {
    "client": "client/index.ts",
    "server": "server/index.ts",
  },
  format: ["cjs"],
  outDir: "dist",
  dts: false,
  clean: true,
  splitting: false,
});