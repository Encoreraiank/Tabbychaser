/* ==========================================================================
   Tabby Chaser – Centralized Product Database
   ========================================================================== */

const PRODUCTS_DATA = [
  {
    id: "pond-hopper-frog",
    name: "Pond Hopper Frog",
    price: 219,
    category: "charms",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-88b446e8-wa8nqo.webp",
    description: "A tiny frog friend ready to hop into your everyday adventures. Handmade from cold porcelain clay and finished with care, this charm is perfect for phones, bags, keys, and anywhere that could use a little extra cuteness. 🐸🌿",
    details: ["100% Handmade", "Cold Porcelain Clay", "High Gloss Glaze Finish", "Includes Phone/Bag Attachment Strap"]
  },
  {
    id: "bow-bear-charm",
    name: "Bow Bear Charm",
    price: 219,
    category: "charms",
    stock: "low-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-46e4e5de-0cd7-4387-9f47-92c55a666831-b56fe6d8-ket789.webp",
    description: "A tiny handmade teddy bear charm with a glossy finish and a sweet pink bow 🎀, perfect for decorating phones, bags, keys, and collecting alongside other cute charms. Each piece is sculpted with love and patience.",
    details: ["100% Handmade", "Cold Porcelain Clay", "Gloss Varnish Finish", "Cozy Teddy Bear Design"]
  },
  {
    id: "ghostly-skull-charm",
    name: "Ghostly Skull Charm",
    price: 199,
    category: "charms",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-094dc89c-gsisii.webp",
    description: "A tiny skull with a soft spooky heart. Handmade from cold porcelain clay and finished with care, this charm is perfect for lovers of cute and spooky things 💀🖤",
    details: ["100% Handmade", "Cold Porcelain Clay", "Water Resistant Gloss Coating", "Spooky Hearts Details"]
  },
  {
    id: "tiny-mushroom-charm",
    name: "Tiny Mushroom Charm",
    price: 189,
    category: "charms",
    stock: "low-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-88b446e8-wa8nqo.webp",
    description: "A tiny magical mushroom charm to carry good luck and fairy vibes with you. Handcrafted and hand-painted, finished with a glassy protective glaze. 🍄✨",
    details: ["100% Handmade", "Cold Porcelain Clay", "Bright Red Finish", "Fairy Aesthetic"]
  },
  {
    id: "star-cat-keychain",
    name: "Star Cat Keychain",
    price: 399,
    category: "keychains",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-59b33d32-ix8s64.webp",
    description: "Star cat finally got its own star 🌟 A handmade clay keychain featuring a favorite little cat, holding a tiny Golden Star complete with rosy cheeks, paw beans, and a star-shaped clasp made for bags, keys, and desk buddies.",
    details: ["100% Handmade", "Cold Porcelain Clay", "Star Shaped Golden Clasp", "Cute Paw Beans Detail"]
  },
  {
    id: "sleepy-bear-keychain",
    name: "Sleepy Bear Keychain",
    price: 349,
    category: "keychains",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-46e4e5de-0cd7-4387-9f47-92c55a666831-b56fe6d8-ket789.webp",
    description: "A cute, sleepy little teddy bear keychain designed to accompany you through the sleepiest of days. Handmade with a sturdy keychain ring, perfect for keys or backpacks. 🧸💤",
    details: ["100% Handmade", "Cold Porcelain Clay", "Sturdy Metal Ring", "Sleepy Cozy Vibe"]
  },
  {
    id: "froggy-phone-charm-keychain",
    name: "Froggy Phone Charm Keychain",
    price: 299,
    category: "keychains",
    stock: "low-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-88b446e8-wa8nqo.webp",
    description: "This little froggy keychain pulls double-duty as a cute phone strap and a robust keychain buddy. Hand-glazed to resist everyday wear and tear. 🐸💚",
    details: ["100% Handmade", "Cold Porcelain Clay", "Dual Attachment Option", "Kawaii Frog Motif"]
  },
  {
    id: "sleepy-froggy",
    name: "Sleepy Froggy",
    price: 469,
    category: "desk-pals",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-2079e3bba73627cf-585hmv.webp",
    description: "Meet the Sleepy Frog Charm, a tiny pocket-sized friend who’s always ready for a cozy nap. Handmade from cold porcelain clay and finished with a glossy protective coat, each charm is carefully sculpted and painted by hand, making every piece one of a kind. 😴🐸",
    details: ["100% Handmade", "Cold Porcelain Clay", "Nap-time Companion", "Great for Desk Display"]
  },
  {
    id: "little-hopper",
    name: "Little Hopper",
    price: 459,
    category: "desk-pals",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-fef5ae9ecc16e517-ilew0k.webp",
    description: "A tiny handmade frog with rosy cheeks, a cheerful smile, and a bright yellow bow. Carefully sculpted from cold porcelain clay to add a little joy to your everyday adventures. 💚🐸🎀",
    details: ["100% Handmade", "Cold Porcelain Clay", "Cute Yellow Bow Decoration", "Adorable Rosy Cheeks"]
  },
  {
    id: "starcat-desk-pal",
    name: "Starcat Desk Pal",
    price: 499,
    category: "desk-pals",
    stock: "low-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-59b33d32-ix8s64.webp",
    description: "Your new cozy office companion! The Starcat Desk Pal is a tiny clay cat holding a golden star, designed to sit beside your monitor and protect you from bugs and compile errors. 🐱⭐",
    details: ["100% Handmade", "Cold Porcelain Clay", "Desk Protector Companion", "Gold Star Decoration"]
  },
  {
    id: "hoppy-buddy",
    name: "Hoppy Buddy",
    price: 449,
    category: "desk-pals",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-2079e3bba73627cf-585hmv.webp",
    description: "A round, chubby frog figurine to keep you company during study sessions or work hours. Crafted from high-density clay, painted down to the tiny toe beans. 🐸🌸",
    details: ["100% Handmade", "Cold Porcelain Clay", "Chubby Round Design", "Matte Finish Protectant"]
  },
  {
    id: "purr-parade-sticker-sheet",
    name: "Purr Parade Sticker Sheet",
    price: 99,
    category: "stickers",
    stock: "low-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-f2c594d5-2456-4e9b-a0bd-da99e1367784-354c0636159af917-g8hjt3.webp",
    description: "A sheet of six adorable cat stickers featuring curious, sleepy, playful, and wonderfully chaotic little kitties. Perfect for decorating your journal, laptop, phone case, water bottle, planner, or anywhere that could use a tiny dose of feline mischief. 🐱💕",
    details: ["Designed by Tabby Chaser", "6 Unique Cat Stickers", "Vinyl Matte Waterproof Paper", "Journal & Laptop Safe"]
  },
  {
    id: "froggies-sticker-sheet",
    name: "Froggies Sticker Sheet",
    price: 89,
    category: "stickers",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-f2c594d5-2456-4e9b-a0bd-da99e1367784-354c0636159af917-g8hjt3.webp",
    description: "An adorable sticker sheet featuring cozy froggies sitting on lilypads, wearing tiny flower hats, and sleeping. Hand-drawn by one sleepy cat artist. 🐸🌸",
    details: ["Designed by Tabby Chaser", "Cozy Froggies Themes", "Matte Finish sticker sheet", "Great for Planner Layouts"]
  },
  {
    id: "pocket-pals-sticker-sheet",
    name: "Pocket Pals Sticker Sheet",
    price: 109,
    category: "stickers",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-f2c594d5-2456-4e9b-a0bd-da99e1367784-354c0636159af917-g8hjt3.webp",
    description: "Sticker pack containing a collection of your favorite pocket pals! Bears, frogs, cats, and bunnies peeking out of tiny pockets. 🐻🐰🐱🐸",
    details: ["Designed by Tabby Chaser", "Includes 8 Pocket Pals", "High Quality Die Cut Matte Vinyl", "Scratch & Water Resistant"]
  },
  {
    id: "starcat-worry-stone",
    name: "Starcat Worry Stone",
    price: 389,
    category: "worry-stones",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-e566ae4b-051b-4294-975e-0a93fb4a47b3-56e26791-ktpfey.webp",
    description: "A tiny pocket companion for restless hands and busy minds. The Starcat Worry Stone is handcrafted from cold porcelain clay. Smooth, glossy, and perfectly sized to carry in your pocket, bag, or on your desk, it’s designed for fidgeting, grounding, and adding a little whimsy to your day. 🐱🌟",
    details: ["100% Handmade", "Cold Porcelain Clay", "Smooth Indent for Thumb Rubbing", "Fits Perfectly in Palm"]
  },
  {
    id: "froggy-worry-stone",
    name: "Froggy Worry Stone",
    price: 369,
    category: "worry-stones",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-88b446e8-wa8nqo.webp",
    description: "Fidget away your worries with this tiny, smooth froggy worry stone. Fits in your pocket and features a smooth curved indentation for comforting thumb rubs. 🐸💚",
    details: ["100% Handmade", "Cold Porcelain Clay", "Ergonomic Thumb Groove", "Varnish Gloss Finish"]
  },
  {
    id: "frog-phone-charm",
    name: "Frog Phone Charm",
    price: 249,
    category: "phone-charms",
    stock: "in-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-88b446e8-wa8nqo.webp",
    description: "A high-quality handmade phone charm featuring a tiny hopper, perfect for keeping your phone cute and secure. Features a durable pink strap. 🐸📞",
    details: ["100% Handmade", "Cold Porcelain Clay", "Durable Attachment Loop", "High Quality Clasp"]
  },
  {
    id: "bear-phone-charm",
    name: "Bear Phone Charm",
    price: 249,
    category: "phone-charms",
    stock: "low-stock",
    image: "https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-46e4e5de-0cd7-4387-9f47-92c55a666831-b56fe6d8-ket789.webp",
    description: "A cute little teddy bear phone strap handmade and coated with a protective shine. The perfect accessory to match any phone cover. 🐻🎀",
    details: ["100% Handmade", "Cold Porcelain Clay", "Gloss Glaze Protection", "Lightweight Phone Accessory"]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRODUCTS_DATA;
}
