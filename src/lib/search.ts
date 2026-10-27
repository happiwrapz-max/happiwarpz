import { Product } from "@/lib/store/types";
import { CATALOG } from "@/lib/data/catalog";

// Synonym mappings for natural search queries
const SYNONYMS: Record<string, string[]> = {
  rose: ["roses", "flower", "flowers", "bloom", "blooms", "bouquet", "ribbon", "floral", "red", "crimson"],
  roses: ["rose", "flower", "flowers", "bloom", "blooms", "bouquet", "ribbon", "floral", "red", "crimson"],
  sunflower: ["sunflowers", "sun", "yellow", "gold", "golden", "ribbon", "flower", "bouquet"],
  sunflowers: ["sunflower", "sun", "yellow", "gold", "golden", "ribbon", "flower", "bouquet"],
  ribbon: ["satin", "handcrafted", "handmade", "forever", "rose", "sunflower", "flowers"],
  flower: ["flowers", "rose", "roses", "sunflower", "sunflowers", "bouquet", "bouquets", "bloom", "ribbon"],
  flowers: ["flower", "rose", "roses", "sunflower", "sunflowers", "bouquet", "bouquets", "bloom", "ribbon"],
  bouquet: ["bouquets", "flower", "flowers", "rose", "roses", "sunflower", "sunflowers", "bunch", "wrap"],
  hamper: ["hampers", "gift basket", "crate", "box", "package", "combo"],
  box: ["boxes", "cylinder", "keepsake", "packaging", "case"],
  mug: ["cup", "coffee", "ceramic", "personalized", "gift"],
  lamp: ["light", "lights", "nightlight", "led", "glow", "decor", "heart", "ambient"],
  sweet: ["sweets", "chocolate", "chocolates", "truffle", "truffles", "praline", "treat", "treats"],
  chocolate: ["chocolates", "sweet", "sweets", "truffle", "truffles", "treats"],
  custom: ["personalized", "customized", "bespoke", "name", "calligraphy", "ribbon"],
  anniversary: ["love", "romantic", "romance", "couple", "wife", "husband", "gift", "roses", "sunflower"],
  birthday: ["gift", "celebration", "special", "surprise", "present"],
  valentine: ["valentines", "love", "romantic", "roses", "red", "heart"],
  red: ["crimson", "scarlet", "ruby", "roses"],
  black: ["midnight", "dark", "velvet"],
};

// Associated keyword tags per product ID
const PRODUCT_KEYWORDS: Record<string, string[]> = {
  "red-rose-bouquet": [
    "red", "rose", "roses", "ribbon", "satin", "handcrafted", "bouquet", "eucalyptus", "love", "anniversary", "romantic", "valentines", "flowers"
  ],
  "ribbon-sunflower-bouquet": [
    "sunflower", "sunflowers", "yellow", "gold", "golden", "ribbon", "handcrafted", "satin", "bouquet", "gift", "keepsake", "sun"
  ],
  "sun-rose-ribbon-duet": [
    "sunflower", "rose", "roses", "sunflowers", "ribbon", "handcrafted", "satin", "duet", "combo", "bouquet", "gift", "keepsake"
  ],
  "glitter-rose-luxury": [
    "glitter", "sparkle", "luxury", "red", "rose", "roses", "black", "gold", "bouquet", "party", "anniversary", "keepsake", "ribbon"
  ],
  "midnight-rose-box": [
    "midnight", "black", "rose", "roses", "box", "velvet", "luxury", "gold", "dramatic", "statement", "gothic", "flower box", "ribbon"
  ],
  "eternal-crimson-hamper": [
    "hamper", "crimson", "roses", "sunflower", "chocolates", "candle", "gift card", "keepsake", "luxury", "combo", "romantic", "anniversary", "ribbon"
  ],
  "custom-gift-wrap": [
    "gift wrap", "wrapping", "paper", "ribbon", "matte", "packaging", "service", "present"
  ],
  "red-rose-box": [
    "red rose box", "cylinder", "velvet", "roses", "red", "flower box", "anniversary", "birthday", "bestseller", "signature"
  ],
  "romantic-gift-hamper": [
    "romantic gift hamper", "wooden crate", "wine", "chocolates", "candle", "roses", "popular", "date night", "anniversary"
  ],
  "personalized-mug": [
    "personalized mug", "coffee mug", "better together", "couple", "calligraphy", "ceramic", "gift", "tea", "custom"
  ],
  "love-heart-lamp": [
    "love heart lamp", "acrylic", "led", "lamp", "light", "wooden base", "night light", "room decor", "romantic", "home"
  ],
  "belgian-truffle-box": [
    "belgian sweet truffles", "chocolate", "chocolates", "sweets", "truffles", "gold leaf", "pralines", "dessert", "treat"
  ],
  "bespoke-custom-order": [
    "bespoke custom", "custom order", "stem count", "calligraphy ribbon", "personalized", "florist", "made to order"
  ],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface SearchResult {
  product: Product;
  score: number;
  matchedTerms: string[];
}

export function searchProducts(
  rawQuery: string,
  catalog: Product[] = CATALOG
): SearchResult[] {
  const query = normalize(rawQuery);
  if (!query) {
    return catalog.map((p) => ({ product: p, score: 0, matchedTerms: [] }));
  }

  const queryTokens = query.split(" ").filter((t) => t.length > 0);

  // Expand query tokens with synonyms
  const allTokens = new Set<string>();
  queryTokens.forEach((t) => {
    allTokens.add(t);
    // Plural/singular normalization
    if (t.endsWith("s") && t.length > 3) allTokens.add(t.slice(0, -1));
    if (!t.endsWith("s")) allTokens.add(t + "s");

    // Add dictionary synonyms
    const syns = SYNONYMS[t] || [];
    syns.forEach((s) => allTokens.add(s));
  });

  const scoredResults: SearchResult[] = [];

  for (const product of catalog) {
    let score = 0;
    const matchedTerms: string[] = [];
    const productNameNorm = normalize(product.name);
    const categoryNorm = normalize(product.category);
    const descNorm = normalize(product.description);
    const keywords = (PRODUCT_KEYWORDS[product.id] || []).map(normalize);

    // 1. Exact full query match
    if (productNameNorm === query) {
      score += 150;
      matchedTerms.push(query);
    } else if (productNameNorm.includes(query)) {
      score += 80;
      matchedTerms.push(query);
    }

    if (categoryNorm.includes(query)) {
      score += 60;
      matchedTerms.push(query);
    }

    if (descNorm.includes(query)) {
      score += 30;
      matchedTerms.push(query);
    }

    // 2. Token-by-token scoring
    for (const token of allTokens) {
      const isDirectQueryToken = queryTokens.includes(token);
      const weight = isDirectQueryToken ? 1.0 : 0.6; // Direct search words carry higher weight

      // Name matches
      if (productNameNorm.includes(token)) {
        score += 35 * weight;
        matchedTerms.push(token);
      }

      // Category matches
      if (categoryNorm.includes(token)) {
        score += 25 * weight;
        matchedTerms.push(token);
      }

      // Keyword tags matches
      if (keywords.some((k) => k.includes(token) || token.includes(k))) {
        score += 20 * weight;
        matchedTerms.push(token);
      }

      // Description matches
      if (descNorm.includes(token)) {
        score += 10 * weight;
        matchedTerms.push(token);
      }
    }

    // Bonus for featured products
    if (product.featured && score > 0) {
      score += 5;
    }

    if (score > 0) {
      scoredResults.push({
        product,
        score,
        matchedTerms: Array.from(new Set(matchedTerms)),
      });
    }
  }

  // Sort descending by score
  return scoredResults.sort((a, b) => b.score - a.score);
}

// Popular search suggestions for empty search inputs
export const POPULAR_SEARCH_TERMS = [
  "Ribbon Rose Bouquet",
  "Ribbon Sunflowers",
  "Sun & Rose Duet",
  "Velvet Ribbon Box",
  "Gift Hampers",
  "Glitter Roses",
  "Custom Order",
];
