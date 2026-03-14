import type { BenefitPrediction } from './types';

interface ParsedContent {
  textBlocks: string[];
  benefitCards: BenefitPrediction[];
}

const CARD_REGEX = /\[BENEFIT_CARD\]([\s\S]*?)\[\/BENEFIT_CARD\]/g;

export function parseMessageContent(content: string): ParsedContent {
  const benefitCards: BenefitPrediction[] = [];
  const textBlocks: string[] = [];

  let lastIndex = 0;
  let match;

  // Reset regex state
  CARD_REGEX.lastIndex = 0;

  while ((match = CARD_REGEX.exec(content)) !== null) {
    // Text before this card
    const textBefore = content.slice(lastIndex, match.index).trim();
    if (textBefore) textBlocks.push(textBefore);

    // Parse the card JSON
    try {
      const card = JSON.parse(match[1].trim());
      benefitCards.push(card);
    } catch {
      // If JSON parsing fails, treat it as text
      textBlocks.push(match[1].trim());
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last card
  const remaining = content.slice(lastIndex).trim();
  if (remaining) textBlocks.push(remaining);

  // If no cards found, the whole thing is text
  if (textBlocks.length === 0 && benefitCards.length === 0) {
    textBlocks.push(content);
  }

  return { textBlocks, benefitCards };
}
