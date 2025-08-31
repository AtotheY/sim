import { type Customer, type CustomerItem, GAME_CONFIG } from "../types/types";
import {
  PAWN_ITEMS,
  getRandomItems,
  getActualValue,
  type PawnItem,
} from "../types/items";

// Customer names pool
const CUSTOMER_NAMES = [
  "Alice Johnson",
  "Bob Miller",
  "Carol Davis",
  "David Wilson",
  "Emma Brown",
  "Frank Garcia",
  "Grace Martinez",
  "Henry Lopez",
  "Ivy Anderson",
  "Jack Taylor",
  "Kate Thomas",
  "Liam Moore",
  "Maya Jackson",
  "Noah White",
  "Olivia Harris",
  "Paul Clark",
  "Quinn Lewis",
  "Ruby Walker",
  "Sam Hall",
  "Tina Allen",
  "Uma Young",
  "Victor King",
  "Wendy Wright",
  "Xavier Scott",
  "Yara Green",
  "Zoe Adams",
  "Alex Baker",
  "Blair Cooper",
  "Casey Reed",
  "Drew Morgan",
];

// Generate 2 customers for a given day
export function generateDailyCustomers(day: number): Customer[] {
  const customers: Customer[] = [];

  for (let i = 0; i < GAME_CONFIG.CUSTOMERS_PER_DAY; i++) {
    customers.push(generateCustomer(day, i));
  }

  return customers;
}

// Generate a single customer
function generateCustomer(day: number, customerIndex: number): Customer {
  const customerId = `day_${day}_customer_${customerIndex + 1}`;
  const name = getRandomCustomerName();

  // Customer wants to sell one item
  const itemToSell = generateCustomerItem();

  // Customer is interested in buying a subset of available items
  const interestedInBuying = generateBuyingInterests();

  return {
    id: customerId,
    name,
    itemToSell,
    interestedInBuying,
  };
}

// Generate the item a customer wants to sell with pricing
function generateCustomerItem(): CustomerItem {
  const item = getRandomItem();
  const actualValue = getActualValue(item);

  // Customer pricing strategy:
  // - maxPrice: 60-90% of actual value (what they hope to get)
  // - minPrice: 40-70% of actual value (minimum they'll accept)
  const maxPriceMultiplier = 0.6 + Math.random() * 0.3; // 0.6-0.9
  const minPriceMultiplier = 0.4 + Math.random() * 0.3; // 0.4-0.7

  const maxPrice = Math.round(actualValue * maxPriceMultiplier);
  const minPrice = Math.round(actualValue * minPriceMultiplier);

  // Ensure minPrice <= maxPrice
  const finalMinPrice = Math.min(minPrice, maxPrice);
  const finalMaxPrice = Math.max(minPrice, maxPrice);

  return {
    item,
    minPrice: finalMinPrice,
    maxPrice: finalMaxPrice,
  };
}

// Generate list of items customer might be interested in buying
function generateBuyingInterests(): string[] {
  // Customer is interested in 2-8 different items
  const interestCount = 2 + Math.floor(Math.random() * 7);
  const interestedItems = getRandomItems(interestCount);

  return interestedItems.map((item) => item.id);
}

// Get a random item from the full catalog
function getRandomItem(): PawnItem {
  const randomIndex = Math.floor(Math.random() * PAWN_ITEMS.length);
  return PAWN_ITEMS[randomIndex]!;
}

// Get a random customer name (avoiding duplicates in the same day)
function getRandomCustomerName(): string {
  const randomIndex = Math.floor(Math.random() * CUSTOMER_NAMES.length);
  return CUSTOMER_NAMES[randomIndex]!;
}

// Helper function to check if customer is interested in buying a specific item
export function isCustomerInterestedInItem(
  customer: Customer,
  itemId: string
): boolean {
  return customer.interestedInBuying.includes(itemId);
}

// Helper function to get customer's price range for their selling item
export function getCustomerPriceRange(customer: Customer): {
  min: number;
  max: number;
} {
  return {
    min: customer.itemToSell.minPrice,
    max: customer.itemToSell.maxPrice,
  };
}

// Helper function to check if a price offer is acceptable to customer
export function isOfferAcceptable(
  customer: Customer,
  offerPrice: number
): boolean {
  return offerPrice >= customer.itemToSell.minPrice;
}

// Get customer's item description for display
export function getCustomerItemDescription(customer: Customer): string {
  const item = customer.itemToSell.item;
  return `${item.name} (${item.condition}) - ${item.description}`;
}
