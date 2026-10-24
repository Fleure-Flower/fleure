// Shop settings and catalogue. Edit this file to change prices, products or contact details.
window.SHOP = {
  name: "Fleure", // Taken from the Canva home page. Change here if your brand name is different.
  tagline: "Handmade forever flowers that never wilt",
  instagram: "", // handle without @, e.g. "fleure.flowers"
  email: "fleurehandmadeflower@gmail.com", // the only contact for custom orders and extra requests
  // Web app link from scripts/orders-sheet.gs. Every order, custom request and message is saved to that Google Sheet.
  orderSheetUrl: "https://script.google.com/macros/s/AKfycbyukKPyLDqN6plru2nz2XdAdyTbbHypm8E_EMIYvnrnYaL3MJhi4P6IkuzM9LPC4-2s5Q/exec",
  paymentQr: "", // payment QR picture, e.g. "assets/payment-qr.jpg"; until set, checkout says the QR is coming soon
  // Delivery charges in rupees. Pickup is free. No cash on delivery.
  // We only deliver inside this area, to these pincodes. Add or remove pincodes here.
  delivery: { pickup: 0, day: 30, night: 40, area: "Kharagpur", pincodes: ["721301", "721302", "721303", "721304", "721305", "721306"] },
};

window.CATEGORIES = [
  { id: "ribbon", name: "Ribbon Roses", short: "Ribbon Roses", priceLabel: "from ₹59" },
  { id: "lily", name: "Lily Bouquets", short: "Lily Bouquet", priceLabel: "from ₹89" },
  { id: "gift", name: "Gift Bouquets", short: "Gift Bouquets", priceLabel: "from ₹299" },
];

const WRAPS = ["White", "Black", "Newspaper"];
// Number of chocolates or photos in a gift bouquet. prices: { count: price } once known; until then each size is priced by email.
const PIECES = (one, many, label) => ({ label, unit: [one, many], sizes: [1, 3, 5, 7, 10], prices: null });
const RIBBONS = ["Red", "Pink", "Black", "White"];

// Pipe-cleaner prices by number of flowers. Sizes not listed are priced on request.
const PIPE_PRICES = { 1: 89, 2: 189, 3: 279 };

// Ribbon rose prices by number of roses: [price, old price shown crossed out, price with glitter].
// Glitter's old price keeps the same glitter extra on top of the plain old price. Sizes not listed are priced on request.
const ROSE_PRICES = {
  1: [59, null, 69], 3: [169, 179, 179], 7: [399, 419, 409], 10: [549, 599, 569],
  13: [719, 769, 739], 17: [929, 999, 949], 20: [1099, 1179, 1119],
};
const rosePrice = (o, i) => {
  const row = ROSE_PRICES[o.count];
  if (!row || row[i] == null) return null;
  return o.glitter ? row[i] + row[2] - row[0] : row[i];
};

// Pipe cleaner lily prices by number of lilies: [price, old price shown crossed out, offer label].
const LILY_PRICES = {
  1: [89, null, ""], 3: [259, 267, "Offer price"], 5: [419, 445, "Offer price"],
  7: [569, 623, "Offer price"], 10: [799, 890, "Bulk Special"],
};
const lilyPrice = (o, i) => (LILY_PRICES[o.count] ? LILY_PRICES[o.count][i] : null);

// Lily bouquets: choose how many lilies, colour and wrapping paper.
const LILY = {
  unit: ["lily", "lilies"], sizes: [1, 3, 5, 7, 10], maxCount: 10, priceFrom: true, // the only sizes sold; more on request
  priceFor: (o) => lilyPrice(o, 0), wasFor: (o) => lilyPrice(o, 1), tagFor: (o) => lilyPrice(o, 2),
  description: "Lilies shaped by hand from soft pipe cleaners, wrapped and tied with a double satin bow. Choose your lily colour, how many lilies (1, 3, 5, 7 or 10) and your wrapping paper. Made to last, with no water or care needed.",
  options: { colours: ["White", "Pink", "Red"], wrap: WRAPS },
};

const PIPE = "Handmade from soft pipe cleaners (chenille stems), wrapped and tied with a double satin bow.";

// Pipe-cleaner bouquets are drawn by assets/js/bouquet.js, so the picture follows
// the chosen wrap, ribbon and number of flowers (up to 20).
function pipe(id, name, category, flowers, look, extra) {
  const count = flowers.length;
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

// Satin ribbon rose bouquets, up to 20 roses (bigger on request), in any colour mix.
function roses(id, name, colours, look, photos, extra) {
  return Object.assign({
    id, name, category: "ribbon", kind: "ribbon", priceFrom: true, price: 59,
    images: photos.map((p) => `assets/photos/${p}.jpg`),
    look: Object.assign({ count: 20, glitter: false, colours }, look, { ribbon: colours }),
    minCount: 1, maxCount: 20, sizes: [1, 3, 7, 10, 13, 17, 20], // the only sizes sold; other counts on request
    maxByColour: { Pink: 7, White: 7, Black: 7 }, // largest size sold for now in these colours; red goes up to 20
    ideas: Array.from({ length: 15 }, (_, i) => i + 1), ideasFolder: "assets/photos/rose-ideas/", ideasName: "Rose idea", // reference pictures
    priceFor: (o) => rosePrice(o, 0),
    wasFor: (o) => rosePrice(o, 1),
    description: "Roses folded by hand from satin ribbon, tied with a double satin bow in the same colour as the roses. Glitter roses get a rhinestone centre. Choose your colours, how many roses (1, 3, 7, 10, 13, 17 or 20 in red; up to 7 in pink, white and black for now), and glitter for extra sparkle.",
    options: { colours: ["Red", "Pink", "White", "Black"], wrap: WRAPS, ribbon: RIBBONS },
  }, extra || {});
}

window.PRODUCTS = [
  roses("red-ribbon-roses", "Red Ribbon Roses", "Red", { wrap: "White", ribbon: "Red" },
    ["rose-red_white-wrap", "rose-red_black-wrap", "rose-red-glitter_white-wrap", "rose-red-glitter_black-wrap"], { featured: true }),
  roses("pink-ribbon-roses", "Pink Ribbon Roses", "Pink", { wrap: "White", count: 3 }, [],
    { images: ["white-plain-3", "black-plain-3", "newspaper-plain-1", "white-glitter-1", "black-glitter-3"].map((n) => `assets/sizes/pink/${n}.jpg`) }),
  roses("white-ribbon-roses", "White Ribbon Roses", "White", { wrap: "Black", count: 3 }, [],
    { images: ["black-plain-3", "white-plain-3", "newspaper-plain-1", "white-glitter-3", "black-glitter-1", "newspaper-glitter-3"].map((n) => `assets/sizes/white/${n}.jpg`) }),
  roses("black-ribbon-roses", "Black Ribbon Roses", "Black", { wrap: "White", count: 3 }, [],
    { images: ["white-plain-3", "black-plain-3", "newspaper-plain-1", "white-glitter-1", "black-glitter-3", "newspaper-glitter-3"].map((n) => `assets/sizes/black/${n}.jpg`) }),

  // The one lily product: customers choose the number of lilies, colour and wrap.
  pipe("white-lily-bouquet", "White Lily Bouquet", "lily", ["lily"], { wrap: "White", ribbon: "White", colours: "White" },
    Object.assign({}, LILY, { featured: true, fixedPhoto: true, images: ["assets/photos/lily-white_white-wrap.jpg"],
      // One photo per lily colour and wrap in assets/photos/lily/<colour>_<wrap>.jpg; the number of lilies doesn't change it.
      photoFolder: "assets/photos/lily/",
      ideas: Array.from({ length: 15 }, (_, i) => i + 1) })), // reference pictures in assets/photos/ideas/

  { id: "chocolate-bouquet", name: "Dairy Milk Chocolate Bouquet", category: "gift", price: 399, featured: true,
    images: ["black", "white"].map((w) => `assets/products/dairy-milk_${w}-wrap.jpg`),
    wrapPhotos: { Black: "assets/products/dairy-milk_black-wrap.jpg", White: "assets/products/dairy-milk_white-wrap.jpg" },
    description: "Cadbury Dairy Milk bars wrapped like a bouquet and tied with a satin bow. Choose how many chocolates and a black or white wrap.", options: { wrap: ["Black", "White"] },
    pieces: PIECES("chocolate", "chocolates", "Number of chocolates") },
  { id: "kitkat-bouquet", name: "KitKat Chocolate Bouquet", category: "gift", price: 399,
    images: ["black", "white"].map((w) => `assets/products/kitkat_${w}-wrap.jpg`),
    wrapPhotos: { Black: "assets/products/kitkat_black-wrap.jpg", White: "assets/products/kitkat_white-wrap.jpg" },
    description: "KitKat bars wrapped like a bouquet and tied with a red satin bow. Choose how many chocolates and a black or white wrap.", options: { wrap: ["Black", "White"] },
    pieces: PIECES("chocolate", "chocolates", "Number of chocolates") },
  { id: "photo-bouquet", name: "Photo Bouquet", category: "gift", price: 299, featured: true,
    images: ["black", "white"].map((w) => `assets/products/photo_${w}-wrap.jpg`),
    wrapPhotos: { Black: "assets/products/photo_black-wrap.jpg", White: "assets/products/photo_white-wrap.jpg" },
    description: "Your favourite photos printed and arranged into a bouquet with a satin bow. Choose how many photos and a black or white wrap, then email us your photos after you order.", options: { wrap: ["Black", "White"] },
    pieces: PIECES("photo", "photos", "Number of photos") },
  { id: "photo-teddy-bouquet", name: "Photo Bouquet with Teddy & Chocolates", category: "gift", price: 799, priceFrom: true, featured: true,
    images: ["black", "white"].map((w) => `assets/products/photo-teddy_${w}-wrap.jpg`),
    wrapPhotos: { Black: "assets/products/photo-teddy_black-wrap.jpg", White: "assets/products/photo-teddy_white-wrap.jpg" },
    description: "Your photos with a soft teddy, chocolates and baby's breath, wrapped with a satin bow. Comes with one teddy; choose how many chocolates and photos together (1, 3, 5, 7 or 10) and a black or white wrap, then email us your photos after you order. From ₹799; the final price depends on the teddy you choose, confirmed by email.", options: { wrap: ["Black", "White"] },
    pieces: PIECES("chocolate & photo", "chocolates & photos", "Number of chocolates & photos (with 1 teddy)") },
];

// Real customer reviews go here, e.g. { text: "...", name: "First name" }.
// The reviews section stays hidden while this list is empty.
window.REVIEWS = [];
