import { describe, it, expect } from "vitest";
import { getCategoryShade, getCategoryShorthand } from "./chart.utils";

describe("Dashboard Chart Utilities", () => {
  describe("getCategoryShorthand", () => {
    it("handles empty or invalid inputs", () => {
      expect(getCategoryShorthand("")).toBe("");
      // @ts-expect-error test undefined
      expect(getCategoryShorthand(undefined)).toBe("");
    });

    it("generates uppercase for short single-word categories", () => {
      expect(getCategoryShorthand("Web")).toBe("WEB");
      expect(getCategoryShorthand("API")).toBe("API");
      expect(getCategoryShorthand("Data")).toBe("DATA");
    });

    it("generates 4-letter title-case shorthand for longer single-word categories", () => {
      expect(getCategoryShorthand("Security")).toBe("Secu");
      expect(getCategoryShorthand("Infrastructure")).toBe("Infr");
      expect(getCategoryShorthand("Automation")).toBe("Auto");
    });

    it("combines 2-3 letters from two-word categories", () => {
      expect(getCategoryShorthand("Artificial Intelligence")).toBe("ArtInt");
      expect(getCategoryShorthand("Cloud Infrastructure")).toBe("CloInf");
      expect(getCategoryShorthand("Mobile Development")).toBe("MobDev");
    });

    it("handles connectors like '&' and 'and'", () => {
      expect(getCategoryShorthand("DevOps & Testing")).toBe("DevTes");
      expect(getCategoryShorthand("Data and Analytics")).toBe("DatAna");
    });

    it("takes first 2 letters of each word for 3+ word categories", () => {
      expect(getCategoryShorthand("Enterprise Asset Management")).toBe(
        "EnAsMa",
      );
    });
  });

  describe("getCategoryShade", () => {
    it("returns primary color when only 1 category exists", () => {
      expect(getCategoryShade(0, 1)).toBe("hsl(var(--primary))");
    });

    it("generates distinct shades across multiple categories", () => {
      const shade0 = getCategoryShade(0, 5);
      const shade4 = getCategoryShade(4, 5);
      expect(shade0).not.toBe(shade4);
      expect(shade0).toBe("hsl(180 100.0% 25.0%)");
      expect(shade4).toBe("hsl(180 75.0% 65.0%)");
    });
  });
});
