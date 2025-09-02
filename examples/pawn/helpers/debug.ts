import { type PawnGameState } from "../types/types";
import { GAME_CONFIG } from "../config";

// Ledger entry types for tracking all interactions
export interface LedgerEntry {
  id: string;
  timestamp: number;
  day: number;
  type:
    | "customer_arrived"
    | "customer_talked"
    | "deal_made"
    | "customer_left"
    | "day_ended";
  customerName?: string;
  customerId?: string;
  data?: any;
}

// Daily statistics
export interface DailyStats {
  day: number;
  totalCustomers: number;
  customersTalkedTo: number;
  customersNeverTalkedTo: number;
  sellDeals: Array<{ customerName: string; item: string; price: number }>;
  buyDeals: Array<{
    customerName: string;
    item: string;
    price: number;
    profit: number;
  }>;
  customersWhoLeft: Array<{ customerName: string; reason: string }>;
}

// Final game statistics
export interface GameStats {
  totalDays: number;
  totalCustomers: number;
  totalCustomersTalkedTo: number;
  totalCustomersNeverTalkedTo: number;
  totalSellDeals: number;
  totalBuyDeals: number;
  totalCustomersWhoLeft: number;
  moneyFromSelling: number;
  totalItemsBought: number;
  totalItemsSold: number;
  finalMoney: number;
  startingMoney: number;
  totalProfit: number;
  sellDetails: Array<{
    day: number;
    customerName: string;
    item: string;
    price: number;
  }>;
  buyDetails: Array<{
    day: number;
    customerName: string;
    item: string;
    price: number;
    profit: number;
  }>;
  customerInteractions: Record<
    string,
    {
      name: string;
      talkedTo: boolean;
      dealMade: boolean;
      leftWithoutDeal: boolean;
    }
  >;
}

// Add a ledger entry
export function addLedgerEntry(
  state: PawnGameState,
  entry: Omit<LedgerEntry, "id" | "timestamp">
): void {
  if (!state.ledger) {
    state.ledger = [];
  }

  const ledgerEntry: LedgerEntry = {
    id: `ledger_${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    ...entry,
  };

  state.ledger.push(ledgerEntry);
}

// Record customer arrival
export function recordCustomerArrival(
  state: PawnGameState,
  customerName: string,
  customerId: string
): void {
  addLedgerEntry(state, {
    day: state.day,
    type: "customer_arrived",
    customerName,
    customerId,
  });
}

// Record customer interaction (first talk)
export function recordCustomerTalked(
  state: PawnGameState,
  customerName: string,
  customerId: string
): void {
  // Check if this customer was already talked to
  const alreadyTalked = state.ledger?.some(
    (entry) =>
      entry.type === "customer_talked" && entry.customerId === customerId
  );

  if (!alreadyTalked) {
    addLedgerEntry(state, {
      day: state.day,
      type: "customer_talked",
      customerName,
      customerId,
    });
  }
}

// Record a deal being made
export function recordDeal(
  state: PawnGameState,
  dealType: "sell" | "buy",
  customerName: string,
  customerId: string,
  item: string,
  price: number,
  profit?: number
): void {
  addLedgerEntry(state, {
    day: state.day,
    type: "deal_made",
    customerName,
    customerId,
    data: {
      dealType,
      item,
      price,
      profit: profit || 0,
    },
  });
}

// Record customer leaving
export function recordCustomerLeft(
  state: PawnGameState,
  customerName: string,
  customerId: string,
  reason: string = "left_without_deal"
): void {
  addLedgerEntry(state, {
    day: state.day,
    type: "customer_left",
    customerName,
    customerId,
    data: { reason },
  });
}

// Record day ending
export function recordDayEnd(state: PawnGameState): void {
  addLedgerEntry(state, {
    day: state.day,
    type: "day_ended",
  });
}

// Generate daily statistics
export function generateDailyStats(
  state: PawnGameState,
  day: number
): DailyStats {
  const ledger = state.ledger || [];
  const dayEntries = ledger.filter((entry) => entry.day === day);

  // Get all customers for this day
  const arrivals = dayEntries.filter(
    (entry) => entry.type === "customer_arrived"
  );
  const talks = dayEntries.filter((entry) => entry.type === "customer_talked");
  const deals = dayEntries.filter((entry) => entry.type === "deal_made");
  const lefts = dayEntries.filter((entry) => entry.type === "customer_left");

  const totalCustomers = arrivals.length;
  const customersTalkedTo = talks.length;
  const customersNeverTalkedTo = totalCustomers - customersTalkedTo;

  const sellDeals = deals
    .filter((deal) => deal.data?.dealType === "sell")
    .map((deal) => ({
      customerName: deal.customerName!,
      item: deal.data.item,
      price: deal.data.price,
    }));

  const buyDeals = deals
    .filter((deal) => deal.data?.dealType === "buy")
    .map((deal) => ({
      customerName: deal.customerName!,
      item: deal.data.item,
      price: deal.data.price,
      profit: deal.data.profit,
    }));

  const customersWhoLeft = lefts.map((left) => ({
    customerName: left.customerName!,
    reason: left.data?.reason || "unknown",
  }));

  return {
    day,
    totalCustomers,
    customersTalkedTo,
    customersNeverTalkedTo,
    sellDeals,
    buyDeals,
    customersWhoLeft,
  };
}

// Display daily summary
export function displayDailySummary(state: PawnGameState, day: number): void {
  const stats = generateDailyStats(state, day);

  console.log(`\n📊 === DAY ${day} CUSTOMER SUMMARY ===`);
  console.log(`👥 Total customers: ${stats.totalCustomers}`);
  console.log(`💬 Customers talked to: ${stats.customersTalkedTo}`);
  console.log(`🚫 Customers never talked to: ${stats.customersNeverTalkedTo}`);

  if (stats.sellDeals.length > 0) {
    console.log(
      `\n🛒 ITEMS BOUGHT FROM CUSTOMERS (${stats.sellDeals.length}):`
    );
    stats.sellDeals.forEach((deal) => {
      console.log(
        `  • ${deal.item} from ${deal.customerName} - $${deal.price}`
      );
    });
  }

  if (stats.buyDeals.length > 0) {
    console.log(`\n💸 ITEMS SOLD TO CUSTOMERS (${stats.buyDeals.length}):`);
    stats.buyDeals.forEach((deal) => {
      console.log(
        `  • ${deal.item} to ${deal.customerName} - $${deal.price} (profit: $${deal.profit})`
      );
    });
  }

  if (stats.customersWhoLeft.length > 0) {
    console.log(`\n🚪 CUSTOMERS WHO LEFT (${stats.customersWhoLeft.length}):`);
    stats.customersWhoLeft.forEach((customer) => {
      console.log(`  • ${customer.customerName} (${customer.reason})`);
    });
  }

  console.log(`====================================\n`);
}

// Generate final game statistics
export function generateFinalStats(state: PawnGameState): GameStats {
  const ledger = state.ledger || [];
  const STARTING_MONEY = GAME_CONFIG.STARTING_MONEY;

  // Basic counts
  const arrivals = ledger.filter((entry) => entry.type === "customer_arrived");
  const talks = ledger.filter((entry) => entry.type === "customer_talked");
  const deals = ledger.filter((entry) => entry.type === "deal_made");
  const lefts = ledger.filter((entry) => entry.type === "customer_left");

  const sellDeals = deals.filter((deal) => deal.data?.dealType === "sell");
  const buyDeals = deals.filter((deal) => deal.data?.dealType === "buy");

  // Money calculations
  const moneyFromSelling = buyDeals.reduce(
    (sum, deal) => sum + (deal.data?.price || 0),
    0
  );
  const totalProfit = buyDeals.reduce(
    (sum, deal) => sum + (deal.data?.profit || 0),
    0
  );

  // Customer interaction tracking
  const customerInteractions: Record<string, any> = {};
  arrivals.forEach((arrival) => {
    const customerId = arrival.customerId!;
    const customerName = arrival.customerName!;

    const wasTalkedTo = talks.some((talk) => talk.customerId === customerId);
    const madeDeals = deals.filter((deal) => deal.customerId === customerId);
    const leftEntry = lefts.find((left) => left.customerId === customerId);

    customerInteractions[customerId] = {
      name: customerName,
      talkedTo: wasTalkedTo,
      dealMade: madeDeals.length > 0,
      leftWithoutDeal: leftEntry && madeDeals.length === 0,
    };
  });

  // Detailed transaction lists
  const sellDetails = sellDeals.map((deal) => ({
    day: deal.day,
    customerName: deal.customerName!,
    item: deal.data.item,
    price: deal.data.price,
  }));

  const buyDetails = buyDeals.map((deal) => ({
    day: deal.day,
    customerName: deal.customerName!,
    item: deal.data.item,
    price: deal.data.price,
    profit: deal.data.profit,
  }));

  return {
    totalDays: state.day - 1,
    totalCustomers: arrivals.length,
    totalCustomersTalkedTo: talks.length,
    totalCustomersNeverTalkedTo: arrivals.length - talks.length,
    totalSellDeals: sellDeals.length,
    totalBuyDeals: buyDeals.length,
    totalCustomersWhoLeft: lefts.length,
    moneyFromSelling,
    totalItemsBought: sellDeals.length,
    totalItemsSold: buyDeals.length,
    finalMoney: state.money,
    startingMoney: STARTING_MONEY,
    totalProfit,
    sellDetails,
    buyDetails,
    customerInteractions,
  };
}

// Display comprehensive final report
export function displayFinalReport(state: PawnGameState): void {
  const stats = generateFinalStats(state);

  console.log(`\n🏆 === FINAL PAWN SHOP REPORT ===`);
  console.log(`📅 Total days played: ${stats.totalDays}`);
  console.log(`💰 Starting money: $${stats.startingMoney}`);
  console.log(`💰 Final money: $${stats.finalMoney}`);
  console.log(
    `📈 Total profit/loss: ${stats.totalProfit >= 0 ? "+" : ""}$${stats.totalProfit}`
  );

  console.log(`\n👥 CUSTOMER STATISTICS:`);
  console.log(`  Total customers: ${stats.totalCustomers}`);
  console.log(`  Customers talked to: ${stats.totalCustomersTalkedTo}`);
  console.log(
    `  Customers never talked to: ${stats.totalCustomersNeverTalkedTo}`
  );
  console.log(
    `  Customers who left without deals: ${stats.totalCustomersWhoLeft}`
  );

  console.log(`\n💼 TRANSACTION STATISTICS:`);
  console.log(`  Items bought from customers: ${stats.totalItemsBought}`);
  console.log(`  Items sold to customers: ${stats.totalItemsSold}`);
  console.log(`  Money earned from selling: $${stats.moneyFromSelling}`);

  if (stats.sellDetails.length > 0) {
    console.log(`\n🛒 DETAILED PURCHASE HISTORY:`);
    stats.sellDetails.forEach((purchase, index) => {
      console.log(
        `  ${index + 1}. Day ${purchase.day}: Bought ${purchase.item} from ${purchase.customerName} for $${purchase.price}`
      );
    });
  }

  if (stats.buyDetails.length > 0) {
    console.log(`\n💸 DETAILED SALES HISTORY:`);
    stats.buyDetails.forEach((sale, index) => {
      console.log(
        `  ${index + 1}. Day ${sale.day}: Sold ${sale.item} to ${sale.customerName} for $${sale.price} (profit: $${sale.profit})`
      );
    });
  }

  console.log(`\n👤 INDIVIDUAL CUSTOMER BREAKDOWN:`);
  Object.values(stats.customerInteractions).forEach((customer: any) => {
    const status = customer.dealMade
      ? "✅ Made deal"
      : customer.leftWithoutDeal
        ? "❌ Left without deal"
        : customer.talkedTo
          ? "💬 Talked, no deal"
          : "🚫 Never talked to";
    console.log(`  • ${customer.name}: ${status}`);
  });

  console.log(`\n=======================================`);
}
