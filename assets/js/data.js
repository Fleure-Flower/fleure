// Shop settings and catalogue. Edit this file to change prices, products or contact details.
window.SHOP = {
  name: "Fleure", // Taken from the Canva home page. Change here if your brand name is different.
  tagline: "Handmade forever flowers that never wilt",
  // WhatsApp number with country code, digits only, e.g. "919876543210".
  // Left empty until confirmed: WhatsApp then asks the customer which chat to send to.
  whatsapp: "",
  instagram: "", // handle without @, e.g. "fleure.flowers"
  email: "",
  phone: "", // number for calls, e.g. "+91 98765 43210"
};

window.CATEGORIES = [
  { id: "single", name: "Single Flower Bouquets", short: "Single", priceLabel: "₹89" },
  { id: "double", name: "Double Flower Bouquets", short: "Double", priceLabel: "₹189" },
  { id: "combo", name: "Bouquet Combinations", short: "Combos", priceLabel: "₹279" },
  { id: "ribbon", name: "Ribbon Roses", short: "Ribbon Roses", priceLabel: "from ₹90" },
  { id: "grand", name: "Grand Bouquets", short: "Grand", priceLabel: "Ask us" },
  { id: "special", name: "Special Occasion Bouquets", short: "Special", priceLabel: "Ask us" },
];

const WRAPS = ["White", "Black", "Newspaper"];
const RIBBONS = ["Red", "Pink", "Black", "White"];

// Pipe-cleaner prices by number of flowers. Sizes not listed are priced on WhatsApp.
const PIPE_PRICES = { 1: 89, 2: 189, 3: 279 };

// Ribbon rose prices by number of roses. Sizes not listed are priced on WhatsApp.
const ROSE_PRICES = {
  1: { plain: 90, glitter: 110 },
  3: { plain: 250, glitter: 270 },
  6: { plain: 480, glitter: 500 },
  7: { plain: 550, glitter: 570 },
  10: { plain: 850, glitter: 870 }, // glitter price assumed (+₹20), not visible in the reference sheet
  15: { plain: 1300, glitter: 1320 },
  20: { plain: 1750, glitter: 1770 },
};

const PIPE = "Handmade from soft pipe cleaners (chenille stems), wrapped and tied with a double satin bow.";

// Pipe-cleaner bouquets are drawn by assets/js/bouquet.js, so the picture follows
// the chosen wrap, ribbon and number of flowers (up to 20).
function pipe(id, name, category, flowers, look, extra) {
  const count = Math.max(flowers.length, { single: 1, double: 2, combo: 3 }[category]);
  return Object.assign({
    id, name, category, kind: "pipe", flowers, images: [],
    look: Object.assign({ count }, look),
    minCount: flowers.length, maxCount: 20,
    price: PIPE_PRICES[count],
    priceFor: (o) => PIPE_PRICES[o.count] ?? null,
    description: `${name} bouquet. ${PIPE} Choose how many flowers you'd like, up to 20. Made to last, with no water or care needed.`,
    options: { wrap: WRAPS, ribbon: RIBBONS },
  }, extra || {});
}

// Satin ribbon rose bouquets, up to 30 roses, in any colour mix.
function roses(id, name, colours, look, photos, extra) {
  return Object.assign({
    id, name, category: "ribbon", kind: "ribbon", priceFrom: true, price: 90,
    images: photos.map((p) => `assets/photos/${p}.jpg`),
    look: Object.assign({ count: 20, glitter: false, colours }, look),
    minCount: 1, maxCount: 30,
    priceFor: (o) => (ROSE_PRICES[o.count] ? ROSE_PRICES[o.count][o.glitter ? "glitter" : "plain"] : null),
    description: "Roses folded by hand from satin ribbon, each finished with a rhinestone centre and tied with a double satin bow. Choose your colours, how many roses (up to 30), and glitter for extra sparkle.",
    options: { colours: ["Red", "Pink", "White", "Black", "Red & White", "Black & White"], wrap: WRAPS, ribbon: RIBBONS },
  }, extra || {});
}

window.PRODUCTS = [
  pipe("sunflower", "Sunflower", "single", ["sunflower"], { wrap: "Newspaper", ribbon: "Black" }, { featured: true }),
  pipe("rose", "Rose", "single", ["rose"], { wrap: "White", ribbon: "Red" }, { featured: true }),
  pipe("tulip", "Tulip", "single", ["tulip"], { wrap: "White", ribbon: "Pink" }),
  pipe("lily", "Lily", "single", ["lily"], { wrap: "White", ribbon: "Pink" }),
  pipe("daisy", "Daisy", "single", ["daisy"], { wrap: "Black", ribbon: "White" }),
  pipe("custom-flower", "Custom Flower", "single", ["custom"], { wrap: "White", ribbon: "Pink" }, {
    priceFrom: true,
    description: "Tell us the flower and colours you have in mind and we'll shape it by hand from pipe cleaners. Final price is confirmed on WhatsApp.",
  }),

  pipe("sunflower-rose", "Sunflower + Rose", "double", ["sunflower", "rose"], { wrap: "Newspaper", ribbon: "Red" }, { featured: true }),
  pipe("rose-tulip", "Rose + Tulip", "double", ["rose", "tulip"], { wrap: "White", ribbon: "Pink" }),
  pipe("tulip-daisy", "Tulip + Daisy", "double", ["tulip", "daisy"], { wrap: "White", ribbon: "Pink" }),
  pipe("lily-tulip", "Lily + Tulip", "double", ["lily", "tulip"], { wrap: "White", ribbon: "Pink" }),
  pipe("sunflower-tulip", "Sunflower + Tulip", "double", ["sunflower", "tulip"], { wrap: "Newspaper", ribbon: "Gold" }),
  pipe("rose-lily", "Rose + Lily", "double", ["rose", "lily"], { wrap: "Black", ribbon: "Red" }),

  pipe("sunflower-rose-tulip", "Sunflower + Rose + Tulip", "combo", ["sunflower", "rose", "tulip"], { wrap: "Newspaper", ribbon: "Black" }),
  pipe("rose-tulip-daisy", "Rose + Tulip + Daisy", "combo", ["rose", "tulip", "daisy"], { wrap: "White", ribbon: "Red" }, { featured: true }),
  pipe("tulip-lily-rose", "Tulip + Lily + Rose", "combo", ["tulip", "lily", "rose"], { wrap: "White", ribbon: "Pink" }),
  pipe("sunflower-lily-tulip", "Sunflower + Lily + Tulip", "combo", ["sunflower", "lily", "tulip"], { wrap: "Newspaper", ribbon: "Gold" }),
  pipe("rose-daisy-lily", "Rose + Daisy + Lily", "combo", ["rose", "daisy", "lily"], { wrap: "Black", ribbon: "Red" }),
  pipe("tulip-daisy-custom", "Tulip + Daisy + Custom Flower", "combo", ["tulip", "daisy", "custom"], { wrap: "White", ribbon: "Pink" }),

  roses("red-ribbon-roses", "Red Ribbon Roses", "Red", { wrap: "White", ribbon: "Red" },
    ["rose-red_white-wrap", "rose-red_black-wrap", "rose-red-glitter_white-wrap", "rose-red-glitter_black-wrap"], { featured: true }),
  roses("black-white-ribbon-roses", "Black & White Ribbon Roses", "Black & White", { wrap: "Black", ribbon: "White", glitter: true },
    ["rose-black-white_black-wrap", "rose-black-white_white-wrap", "rose-black-white_newspaper-wrap"], { featured: true }),
  roses("red-white-ribbon-roses", "Red & White Ribbon Roses", "Red & White", { wrap: "Newspaper", ribbon: "Red", glitter: true },
    ["rose-red-white_newspaper-wrap", "rose-red-white_white-wrap"]),
  roses("white-ribbon-roses", "White Ribbon Roses", "White", { wrap: "Black", ribbon: "White" },
    ["rose-white_black-wrap", "rose-white-glitter_black-wrap"]),
  roses("black-ribbon-roses", "Black Ribbon Roses", "Black", { wrap: "White", ribbon: "Black" },
    ["rose-black_white-wrap", "rose-black-glitter_white-wrap"]),

  {
    id: "grand-lily-red-white", name: "Grand Lily Bouquet, Red & White", category: "grand", price: null, featured: true,
    images: ["assets/photos/lily-red-white_white-wrap.jpg", "assets/products/lily-bouquet-red-white.jpg"],
    description: "A full, generous bouquet of red and white pipe-cleaner lilies in white and gold wrap, tied with a double satin bow. Price depends on size; ask us on WhatsApp.",
    options: { wrap: WRAPS, ribbon: RIBBONS },
  },
  {
    id: "grand-lily-blue-white", name: "Grand Lily Bouquet, Blue & White", category: "grand", price: null,
    images: ["assets/products/lily-bouquet-blue-white.jpg"],
    description: "Blue and white pipe-cleaner lilies arranged into a full bouquet. Price depends on size; ask us on WhatsApp.",
    options: { wrap: WRAPS, ribbon: RIBBONS },
  },

  { id: "chocolate-bouquet", name: "Chocolate Bouquet", category: "special", price: null, images: ["assets/products/chocolate.jpg"], description: "A sweet surprise for your sweet people: chocolates wrapped like a bouquet.", options: { wrap: WRAPS, ribbon: RIBBONS } },
  { id: "teddy-bouquet", name: "Teddy Bouquet", category: "special", price: null, images: ["assets/products/teddy.jpg"], description: "Cute, cuddly and full of love: a soft teddy wrapped with baby's breath.", options: { wrap: WRAPS, ribbon: RIBBONS } },
  { id: "photo-bouquet", name: "Photo Bouquet", category: "special", price: null, images: ["assets/products/photo.jpg"], description: "Memories wrapped with love. Send us your photos on WhatsApp and we'll arrange them into a bouquet.", options: { wrap: WRAPS, ribbon: RIBBONS } },
  { id: "snack-bouquet", name: "Snack Bouquet", category: "special", price: null, images: ["assets/products/snack.jpg"], description: "Tasty, fun and perfect for everyone: favourite snacks wrapped like a bouquet.", options: { wrap: WRAPS, ribbon: RIBBONS } },
];

// Real customer reviews go here, e.g. { text: "...", name: "First name" }.
// The reviews section stays hidden while this list is empty.
window.REVIEWS = [];
