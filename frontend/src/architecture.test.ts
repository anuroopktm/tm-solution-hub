import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Architectural Guardrail Test
 * Ensures shared infrastructure modules never import from domain-specific features or app pages.
 */
describe("Architectural Dependency Boundaries", () => {
  const srcDir = path.resolve(__dirname);
  const sharedDirs = [
    "components",
    "utils",
    "hooks",
    "api",
    "types",
    "lib",
    "constants",
    "context",
  ];

  function getFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getFiles(filePath, fileList);
      } else if (
        /\.(ts|tsx)$/.test(file) &&
        !file.endsWith(".test.ts") &&
        !file.endsWith(".test.tsx")
      ) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  it("ensures shared modules never import from features/ or app/", () => {
    const violations: { file: string; line: string }[] = [];
    const forbiddenPattern =
      /from\s+["'](@\/features|@\/app|\.\.?\/.*features|\.\.?\/.*app)["']/;

    for (const sharedDir of sharedDirs) {
      const fullSharedDirPath = path.join(srcDir, sharedDir);
      if (!fs.existsSync(fullSharedDirPath)) continue;

      const files = getFiles(fullSharedDirPath);
      for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        lines.forEach((line: string) => {
          if (forbiddenPattern.test(line)) {
            violations.push({
              file: path.relative(srcDir, file),
              line: line.trim(),
            });
          }
        });
      }
    }

    expect(
      violations,
      `Architectural boundary violations found:\n${violations
        .map((v) => `  ${v.file}: ${v.line}`)
        .join("\n")}`,
    ).toEqual([]);
  });
});
