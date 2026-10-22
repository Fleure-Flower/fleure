// Shop settings and catalogue. Edit this file to change prices, products or contact details.
window.SHOP = {
  name: "Fleure", // Taken from the Canva home page. Change here if your brand name is different.
  tagline: "Handmade forever flowers that never wilt",
  // WhatsApp number with country code, digits only, e.g. "919876543210".
  // Left empty until confirmed: WhatsApp then asks the customer which chat to send to.
  whatsapp: "",
  instagram: "", // handle without @, e.g. "fleure.flowers"
  email: "",
};

window.CATEGORIES = [
  { id: "single", name: "Single Flower Bouquets", short: "Single", priceLabel: "₹89" },
  { id: "double", name: "Double Flower Bouquets", short: "Double", priceLabel: "₹189" },
  { id: "combo", name: "Bouquet Combinations", short: "Combos", priceLabel: "₹279" },
  { id: "ribbon", name: "Ribbon Roses", short: "Ribbon Roses", priceLabel: "from ₹90" },
  { id: "grand", name: "Grand Bouquets", short: "Grand", priceLabel: "Ask us" },
  { id: "special", name: "Special Occasion Bouquets", short: "Special", priceLabel: "Ask us" },
];

const PIPE = "Handmade from soft pipe cleaners (chenille stems), wrapped and tied with satin ribbon.";
const pipeOptions = {
  wrap: ["Kraft", "Pink", "Lavender", "Yellow"],
  ribbon: ["Pink", "Lavender", "Gold", "Red", "Twine"],
};

function pipe(id, name, category, price, image, extra) {
  return Object.assign({
    id, name, category, price, images: [image],
    description: `${name} bouquet. ${PIPE} Made to last, with no water or care needed.`,
    material: "Pipe cleaner",
    options: pipeOptions,
  }, extra || {});
}

window.PRODUCTS = [
  pipe("sunflower", "Sunflower", "single", 89, "assets/products/sunflower.jpg", { featured: true }),
  pipe("rose", "Rose", "single", 89, "assets/products/rose.jpg", { featured: true }),
  pipe("tulip", "Tulip", "single", 89, "assets/products/tulip.jpg", { featured: true }),
  pipe("lily", "Lily", "single", 89, "assets/products/lily.jpg"),
  pipe("daisy", "Daisy", "single", 89, "assets/products/daisy.jpg"),
  pipe("custom-flower", "Custom Flower", "single", 89, "assets/products/custom-flower.jpg", {
    priceFrom: true,
    description: "Tell us the flower and colours you have in mind and we'll shape it by hand from pipe cleaners. Final price is confirmed on WhatsApp.",
  }),

  pipe("sunflower-rose", "Sunflower + Rose", "double", 189, "assets/products/sunflower-rose.jpg", { featured: true }),
  pipe("rose-tulip", "Rose + Tulip", "double", 189, "assets/products/rose-tulip.jpg"),
  pipe("tulip-daisy", "Tulip + Daisy", "double", 189, "assets/products/tulip-daisy.jpg"),
  pipe("lily-tulip", "Lily + Tulip", "double", 189, "assets/products/lily-tulip.jpg"),
  pipe("sunflower-tulip", "Sunflower + Tulip", "double", 189, "assets/products/sunflower-tulip.jpg"),
  pipe("rose-lily", "Rose + Lily", "double", 189, "assets/products/rose-lily.jpg"),

  pipe("sunflower-rose-tulip", "Sunflower + Rose + Tulip", "combo", 279, "assets/products/sunflower-rose-tulip.jpg", { featured: true }),
  pipe("rose-tulip-daisy", "Rose + Tulip + Daisy", "combo", 279, "assets/products/rose-tulip-daisy.jpg"),
  pipe("tulip-lily-rose", "Tulip + Lily + Rose", "combo", 279, "assets/products/tulip-lily-rose.jpg"),
  pipe("sunflower-lily-tulip", "Sunflower + Lily + Tulip", "combo", 279, "assets/products/sunflower-lily-tulip.jpg"),
  pipe("rose-daisy-lily", "Rose + Daisy + Lily", "combo", 279, "assets/products/rose-daisy-lily.jpg"),
  pipe("tulip-daisy-custom", "Tulip + Daisy + Custom Flower", "combo", 279, "assets/products/tulip-daisy-custom.jpg"),

  {
    id: "ribbon-rose-bouquet", name: "Ribbon Rose Bouquet", category: "ribbon", price: 90, priceFrom: true, featured: true,
    images: [
      "assets/products/ribbon-pink-glitter.jpg", "assets/products/ribbon-blue-silver.jpg", "assets/products/ribbon-red-20.jpg",
      "assets/products/ribbon-red-1.jpg", "assets/products/ribbon-red-6.jpg", "assets/products/ribbon-red-10.jpg",
    ],
    description: "Roses folded by hand from satin ribbon, finished with baby's breath and a satin bow. Choose how many roses, and add glitter for extra sparkle.",
    material: "Satin ribbon",
    // Price by number of roses. Glitter adds the difference shown.
    sizes: [
      { count: 1, price: 90, glitter: 110 },
      { count: 3, price: 250, glitter: 270 },
      { count: 6, price: 480, glitter: 500 },
      { count: 7, price: 550, glitter: 570 },
      { count: 10, price: 850, glitter: 870 }, // glitter price assumed (+₹20), not visible in the reference sheet
      { count: 15, price: 1300, glitter: 1320 },
      { count: 20, price: 1750, glitter: 1770 },
    ],
    options: { flower: ["Red", "Pink", "Blue & Silver"], wrap: ["Black & Gold", "Pink", "Grey"], ribbon: ["Red", "Pink", "Silver"] },
  },

  {
    id: "grand-lily-red-white", name: "Grand Lily Bouquet, Red & White", category: "grand", price: null,
    images: ["assets/products/lily-bouquet-red-white.jpg"],
    description: "A full, generous bouquet of red and white pipe-cleaner lilies in grey and gold wrap. Price depends on size; ask us on WhatsApp.",
    material: "Pipe cleaner", options: { wrap: ["Grey & Gold", "Kraft", "Pink"] },
  },
  {
    id: "grand-lily-blue-white", name: "Grand Lily Bouquet, Blue & White", category: "grand", price: null,
    images: ["assets/products/lily-bouquet-blue-white.jpg"],
    description: "Blue and white pipe-cleaner lilies arranged into a full bouquet. Price depends on size; ask us on WhatsApp.",
    material: "Pipe cleaner", options: { wrap: ["Grey & Gold", "Kraft", "Pink"] },
  },

  { id: "chocolate-bouquet", name: "Chocolate Bouquet", category: "special", price: null, images: ["assets/products/chocolate.jpg"], description: "A sweet surprise for your sweet people: chocolates wrapped like a bouquet.", material: "Non-flower", options: { wrap: ["Black", "Pink"], ribbon: ["Pink", "Gold"] } },
  { id: "teddy-bouquet", name: "Teddy Bouquet", category: "special", price: null, images: ["assets/products/teddy.jpg"], description: "Cute, cuddly and full of love: a soft teddy wrapped with baby's breath.", material: "Non-flower", options: { wrap: ["Pink", "Black"], ribbon: ["Pink", "Gold"] } },
  { id: "photo-bouquet", name: "Photo Bouquet", category: "special", price: null, images: ["assets/products/photo.jpg"], description: "Memories wrapped with love. Send us your photos on WhatsApp and we'll arrange them into a bouquet.", material: "Non-flower", options: { wrap: ["Black", "Pink"], ribbon: ["Pink", "Gold"] } },
  { id: "snack-bouquet", name: "Snack Bouquet", category: "special", price: null, images: ["assets/products/snack.jpg"], description: "Tasty, fun and perfect for everyone: favourite snacks wrapped like a bouquet.", material: "Non-flower", options: { wrap: ["Black", "Pink"], ribbon: ["Pink", "Gold"] } },
];

// Real customer reviews go here, e.g. { text: "...", name: "First name" }.
// The reviews section stays hidden while this list is empty.
window.REVIEWS = [];
