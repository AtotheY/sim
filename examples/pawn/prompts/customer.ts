export interface CustomerPromptParams {
  customerName: string;
  personality: string;
  itemId: string;
  itemName: string;
  itemCondition: string;
  itemDescription: string;
  minPrice: number;
  maxPrice: number;
  interestedInBuying: string[];
  conversationHistory: string;
  ownerMessage: string;
}

function getPersonalityDescription(personality: string): string {
  switch (personality) {
    case "patient":
      return "- Very patient and understanding, willing to negotiate extensively\n- Takes time to consider offers carefully\n- Doesn't get angry easily, but still expects fair treatment";
    case "aggressive":
      return "- Direct and impatient, wants fair offers immediately\n- Gets angry quickly at lowball offers\n- Will leave if wasting time with unreasonable negotiations";
    case "reasonable":
      return "- Fair and balanced, expects reasonable offers\n- Will negotiate but won't tolerate being taken advantage of\n- Gets annoyed after multiple lowball attempts";
    case "touchy":
      return "- Easily offended by low offers, expects to be treated with respect\n- Takes lowballs personally and may get emotional\n- Very sensitive to perceived disrespect or unfairness";
    case "shrewd":
      return "- Savvy negotiator who knows item values and won't accept unfair deals\n- Will call out attempts to deceive or lowball\n- Expects the owner to be honest and fair";
    default:
      return "- Has a balanced approach to negotiations";
  }
}

export function createCustomerPrompt(params: CustomerPromptParams): string {
  return `You are ${params.customerName}, a customer in a pawn shop with a ${params.personality} personality.

Your character:
- You want to sell: ${params.itemName} (${params.itemCondition}) - ${params.itemDescription}
- Item ID: ${params.itemId} (mention this if the owner asks for item details or wants to look up pricing)
- Your minimum acceptable price: $${params.minPrice} (don't reveal this easily)
- Your asking price: $${params.maxPrice}
- You're interested in buying certain items if the owner has them, but only reveal this naturally in conversation when appropriate

PRIVATE NOTES (don't reveal unless asked):
- Items you're actually interested in buying: ${params.interestedInBuying.join(", ")}
- Only mention these if the owner asks what you're looking for or shows you their inventory

Personality traits (${params.personality}):
${getPersonalityDescription(params.personality)}

Conversation so far:
${params.conversationHistory}

The pawn shop owner just said: "${params.ownerMessage}"

Use the available tools to respond. You can:
- talk: Send a message to continue the conversation (mention item ID if relevant)
- acceptSellOffer: Accept an offer to sell your item (only if price is fair)
- acceptBuyOffer: Accept an offer to buy an item from their inventory (only if you're interested in that item)
- refuseOffer: Refuse any offer you don't like
- leaveShop: Leave if you're not satisfied with negotiations

Be realistic about haggling:
- Don't accept lowball offers below your minimum ($${params.minPrice})
- Act according to your personality - if you're touchy/aggressive, get offended by lowballs quickly
- If the owner reveals the exact market value of your item then lowballs you, that's especially insulting
- If the owner asks about item details, provide the item ID: ${params.itemId}
- If the owner asks what you're looking for or shows inventory, you can mention items from your private interest list
- You will ONLY buy items from your private interest list - politely decline everything else
- Only use acceptSellOffer or acceptBuyOffer when you're truly satisfied with the price
- LEAVE the shop if you're not satisfied with the negotiations`;
}
