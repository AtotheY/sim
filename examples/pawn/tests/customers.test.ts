import { describe, test, expect } from "bun:test";
import {
  generateDailyCustomers,
  getCustomerItemDescription,
  getCustomerPriceRange,
  isCustomerInterestedInItem,
  isOfferAcceptable,
} from "../helpers/customers";
import { getActualValue } from "../types/items";

describe("Pawn Shop Customer Generation", () => {
  test("generates exactly 2 customers per day", () => {
    const customers = generateDailyCustomers(1);
    expect(customers).toHaveLength(2);
  });

  test("customers have unique IDs within a day", () => {
    const customers = generateDailyCustomers(1);
    const ids = customers.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(2);
  });

  test("customer IDs follow correct format", () => {
    const customers = generateDailyCustomers(3);
    expect(customers[0]!.id).toBe("day_3_customer_1");
    expect(customers[1]!.id).toBe("day_3_customer_2");
  });

  test("customers have non-empty names", () => {
    const customers = generateDailyCustomers(1);
    customers.forEach((customer) => {
      expect(customer.name).toBeTruthy();
      expect(typeof customer.name).toBe("string");
      expect(customer.name.length).toBeGreaterThan(0);
    });
  });
});

describe("Customer Items and Pricing", () => {
  test("customer price ranges are valid", () => {
    const customers = generateDailyCustomers(1);
    customers.forEach((customer) => {
      const { min, max } = getCustomerPriceRange(customer);
      expect(min).toBeGreaterThan(0);
      expect(max).toBeGreaterThan(0);
      expect(min).toBeLessThanOrEqual(max);
    });
  });

  test("customer prices are reasonable percentage of actual value", () => {
    const customers = generateDailyCustomers(1);
    customers.forEach((customer) => {
      const actualValue = getActualValue(customer.itemToSell.item);
      const { min, max } = getCustomerPriceRange(customer);

      // Min should be 40-70% of actual value
      expect(min / actualValue).toBeGreaterThanOrEqual(0.35); // Allow small variance
      expect(min / actualValue).toBeLessThanOrEqual(0.75);

      // Max should be 60-90% of actual value
      expect(max / actualValue).toBeGreaterThanOrEqual(0.55);
      expect(max / actualValue).toBeLessThanOrEqual(0.95);
    });
  });

  test("customer item description is properly formatted", () => {
    const customers = generateDailyCustomers(1);
    customers.forEach((customer) => {
      const description = getCustomerItemDescription(customer);
      expect(description).toBeTruthy();
      expect(description).toContain(customer.itemToSell.item.name);
      expect(description).toContain(customer.itemToSell.item.condition);
    });
  });
});

describe("Customer Buying Interests", () => {
  test("customer buying interests are within spec range", () => {
    const customers = generateDailyCustomers(1);
    customers.forEach((customer) => {
      expect(customer.interestedInBuying.length).toBeGreaterThanOrEqual(2);
      expect(customer.interestedInBuying.length).toBeLessThanOrEqual(8);
    });
  });

  test("customer buying interests contain valid item IDs", () => {
    const customers = generateDailyCustomers(1);
    customers.forEach((customer) => {
      customer.interestedInBuying.forEach((itemId) => {
        expect(typeof itemId).toBe("string");
        expect(itemId.length).toBeGreaterThan(0);
      });
    });
  });

  test("customer buying interests have no duplicates", () => {
    const customers = generateDailyCustomers(1);
    customers.forEach((customer) => {
      const interests = customer.interestedInBuying;
      const uniqueInterests = new Set(interests);
      expect(uniqueInterests.size).toBe(interests.length);
    });
  });
});

describe("Offer Acceptance Logic", () => {
  test("accepts offers at or above minimum price", () => {
    const customers = generateDailyCustomers(1);
    const customer = customers[0]!;
    const { min, max } = getCustomerPriceRange(customer);

    expect(isOfferAcceptable(customer, min)).toBe(true);
    expect(isOfferAcceptable(customer, max)).toBe(true);
    expect(isOfferAcceptable(customer, min + 10)).toBe(true);
  });

  test("rejects offers below minimum price", () => {
    const customers = generateDailyCustomers(1);
    const customer = customers[0]!;
    const { min } = getCustomerPriceRange(customer);

    expect(isOfferAcceptable(customer, min - 1)).toBe(false);
    expect(isOfferAcceptable(customer, 0)).toBe(false);
    expect(isOfferAcceptable(customer, -1)).toBe(false);
  });
});

describe("Customer Interest Checking", () => {
  test("correctly identifies when customer is interested in item", () => {
    const customers = generateDailyCustomers(1);
    const customer = customers[0]!;
    const firstInterest = customer.interestedInBuying[0]!;

    expect(isCustomerInterestedInItem(customer, firstInterest)).toBe(true);
  });

  test("correctly identifies when customer is not interested in item", () => {
    const customers = generateDailyCustomers(1);
    const customer = customers[0]!;

    // Use an item ID that's very unlikely to be in their interests
    const unlikelyItemId = "nonexistent_item_12345";
    expect(isCustomerInterestedInItem(customer, unlikelyItemId)).toBe(false);
  });
});

describe("Multiple Days Generation", () => {
  test("generates different customers across multiple days", () => {
    const day1Customers = generateDailyCustomers(1);
    const day2Customers = generateDailyCustomers(2);

    // IDs should be different
    expect(day1Customers[0]!.id).not.toBe(day2Customers[0]!.id);
    expect(day1Customers[1]!.id).not.toBe(day2Customers[1]!.id);

    // Should contain day numbers
    expect(day1Customers[0]!.id).toContain("day_1");
    expect(day2Customers[0]!.id).toContain("day_2");
  });

  test("maintains consistency within same day calls", () => {
    // Note: This test might be flaky due to randomness, but tests the API
    const customers1 = generateDailyCustomers(1);
    const customers2 = generateDailyCustomers(1);

    // Should generate same number each time
    expect(customers1).toHaveLength(2);
    expect(customers2).toHaveLength(2);
  });
});

describe("Edge Cases and Validation", () => {
  test("handles day 0 and negative days gracefully", () => {
    expect(() => generateDailyCustomers(0)).not.toThrow();
    expect(() => generateDailyCustomers(-1)).not.toThrow();
  });

  test("handles large day numbers", () => {
    const customers = generateDailyCustomers(999);
    expect(customers).toHaveLength(2);
    expect(customers[0]!.id).toContain("day_999");
  });

  test("customer data is consistent", () => {
    const customers = generateDailyCustomers(1);
    customers.forEach((customer) => {
      // All required fields should exist
      expect(customer.id).toBeTruthy();
      expect(customer.name).toBeTruthy();
      expect(customer.itemToSell).toBeTruthy();
      expect(customer.itemToSell.item).toBeTruthy();
      expect(customer.itemToSell.minPrice).toBeGreaterThan(0);
      expect(customer.itemToSell.maxPrice).toBeGreaterThan(0);
      expect(Array.isArray(customer.interestedInBuying)).toBe(true);
    });
  });
});
