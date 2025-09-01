import { type PawnGameState } from "../types/types";
import { GAME_CONFIG } from "../config";

// Display end-of-day ledger
export function displayDayLedger(state: PawnGameState): void {
  const dayTrades = state.trades.filter((t) => t.day === state.day);
  const purchases = dayTrades.filter((t) => t.type === "buy");
  const sales = dayTrades.filter((t) => t.type === "sell");

  const totalPurchases = purchases.reduce((sum, t) => sum + t.price, 0);
  const totalSales = sales.reduce((sum, t) => sum + t.price, 0);
  const dailyProfit = totalSales - totalPurchases;

  console.log(`\n📊 === END OF DAY ${state.day} LEDGER ===`);
  console.log(
    `💰 Starting Money: $${GAME_CONFIG.STARTING_MONEY + state.trades.filter((t) => t.day < state.day).reduce((sum, t) => sum + (t.type === "sell" ? t.price : -t.price), 0)}`
  );
  console.log(
    `📦 Starting Inventory: ${state.inventory.length - purchases.length + sales.length} items`
  );

  if (purchases.length > 0) {
    console.log(`\n🛒 PURCHASES (${purchases.length}):`);
    purchases.forEach((trade) => {
      console.log(
        `  • ${trade.item.name} - $${trade.price} from ${trade.customerName}`
      );
    });
    console.log(`  Total Spent: $${totalPurchases}`);
  }

  if (sales.length > 0) {
    console.log(`\n💸 SALES (${sales.length}):`);
    sales.forEach((trade) => {
      console.log(
        `  • ${trade.item.name} - $${trade.price} to ${trade.customerName} (profit: $${trade.profit || 0})`
      );
    });
    console.log(`  Total Revenue: $${totalSales}`);
  }

  if (purchases.length === 0 && sales.length === 0) {
    console.log(`❌ No transactions today`);
  }

  console.log(
    `\n📈 Daily Profit/Loss: ${dailyProfit >= 0 ? "+" : ""}$${dailyProfit}`
  );
  console.log(`💰 Ending Money: $${state.money}`);
  console.log(`📦 Ending Inventory: ${state.inventory.length} items`);
  console.log(`===============================\n`);
}
