import { describe, test, expect } from "bun:test";
import {
  PAWN_ITEMS,
  getRandomItems,
  getActualValue,
  getItemsByCategory,
  getCategories,
  ITEM_CONDITIONS,
} from "../types/items";

describe("Pawn Shop Items", () => {
  test("has a good variety of items", () => {
    expect(PAWN_ITEMS.length).toBeGreaterThanOrEqual(80);
  });

  test("all items have required fields", () => {
    PAWN_ITEMS.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.baseValue).toBeGreaterThan(0);
      expect(item.condition).toBeTruthy();
      expect(item.description).toBeTruthy();
    });
  });

  test("all items have valid conditions", () => {
    const validConditions = Object.keys(ITEM_CONDITIONS);
    PAWN_ITEMS.forEach((item) => {
      expect(validConditions).toContain(item.condition);
    });
  });

  test("all items have unique IDs", () => {
    const ids = PAWN_ITEMS.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(PAWN_ITEMS.length);
  });
});

describe("Item Helper Functions", () => {
  test("getRandomItems returns correct number of items", () => {
    const randomItems = getRandomItems(5);
    expect(randomItems).toHaveLength(5);

    const moreItems = getRandomItems(10);
    expect(moreItems).toHaveLength(10);
  });

  test("getRandomItems doesn't return duplicates", () => {
    const randomItems = getRandomItems(10);
    const ids = randomItems.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  test("getActualValue calculates correctly", () => {
    const item = PAWN_ITEMS[0]!;
    const actualValue = getActualValue(item);
    const expectedValue = Math.round(
      item.baseValue * ITEM_CONDITIONS[item.condition].multiplier
    );
    expect(actualValue).toBe(expectedValue);
  });

  test("getItemsByCategory filters correctly", () => {
    const jewelryItems = getItemsByCategory("jewelry");
    expect(jewelryItems.length).toBeGreaterThan(0);
    jewelryItems.forEach((item) => {
      expect(item.category).toBe("jewelry");
    });
  });

  test("getCategories returns all unique categories", () => {
    const categories = getCategories();
    expect(categories.length).toBeGreaterThan(0);

    // Should have no duplicates
    const uniqueCategories = new Set(categories);
    expect(uniqueCategories.size).toBe(categories.length);

    // Should include known categories
    expect(categories).toContain("jewelry");
    expect(categories).toContain("electronics");
    expect(categories).toContain("tools");
  });
});

describe("Item Conditions", () => {
  test("condition multipliers are in correct range", () => {
    Object.values(ITEM_CONDITIONS).forEach((condition) => {
      expect(condition.multiplier).toBeGreaterThan(0);
      expect(condition.multiplier).toBeLessThanOrEqual(1);
      expect(condition.label).toBeTruthy();
    });
  });

  test("condition multipliers are ordered correctly", () => {
    expect(ITEM_CONDITIONS.poor.multiplier).toBeLessThan(
      ITEM_CONDITIONS.fair.multiplier
    );
    expect(ITEM_CONDITIONS.fair.multiplier).toBeLessThan(
      ITEM_CONDITIONS.good.multiplier
    );
    expect(ITEM_CONDITIONS.good.multiplier).toBeLessThan(
      ITEM_CONDITIONS.excellent.multiplier
    );
  });
});
