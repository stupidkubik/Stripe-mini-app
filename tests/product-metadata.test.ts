import { describe, expect, it } from "vitest";

import { formatCategory, formatLight, formatWatering } from "@/lib/product-metadata";

describe("product metadata formatting", () => {
  it("formats category segments and handles empty input", () => {
    expect(formatCategory()).toBeUndefined();
    expect(formatCategory("air-plant")).toBe("Air Plant");
    expect(formatCategory("air--plant")).toBe("Air  Plant");
  });

  it("formats light and watering labels", () => {
    expect(formatLight()).toBeUndefined();
    expect(formatLight("medium")).toBe("Medium light");
    expect(formatWatering()).toBeUndefined();
    expect(formatWatering("biweekly")).toBe("Every 2 weeks");
  });
});
