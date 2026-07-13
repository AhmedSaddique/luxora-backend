import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const SITE = "https://luxoracollection.online";

const POSTER = {
  watches: "/assets/images/categories/watches.svg",
  perfume: "/assets/images/categories/perfume.svg",
  cosmetics: "/assets/images/categories/cosmetics.svg",
  bags: "/assets/images/categories/bags.svg",
};

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

// Build a 5-image gallery for a product (placeholder = its category image).
const gallery = (imageUrl, name) =>
  Array.from({ length: 5 }, (_, i) => ({
    imageUrl,
    name: `${name} — View ${i + 1}`,
    altText: `${name} image ${i + 1}`,
  }));

// [subcategory path, name, price, discountPrice|null, stock]
const products = [
  // Watches — Couple Watches
  ["couple-watches", "Rose Gold Couple Watch Set", 18500, 14900, 12],
  ["couple-watches", "Classic Leather Couple Watches", 15000, null, 8],
  ["couple-watches", "Minimalist Steel Couple Pair", 22000, 18500, 0],
  ["couple-watches", "Elegant Bracelet Couple Watch", 9500, null, 20],
  // Watches — Men Watches
  ["men-watches", "Chronograph Sport Watch", 26000, 21000, 15],
  ["men-watches", "Automatic Skeleton Watch", 34000, null, 6],
  ["men-watches", "Titanium Diver Watch", 45000, 39000, 4],
  ["men-watches", "Everyday Leather Strap Watch", 8500, 6900, 25],
  // Perfume — Men Perfume
  ["men-perfume", "Oud Royale Eau de Parfum 100ml", 12500, 9900, 30],
  ["men-perfume", "Aqua Marine EDT 100ml", 7800, null, 18],
  ["men-perfume", "Noir Intense Parfum 75ml", 15500, 12500, 0],
  // Cosmetics — Men
  ["men-cosmetics", "Men's Matte Face Moisturizer", 3200, 2600, 40],
  ["men-cosmetics", "Beard Grooming Kit", 4500, null, 22],
  ["men-cosmetics", "Charcoal Face Wash", 1800, 1500, 35],
  // Cosmetics — Women
  ["women-cosmetics", "Velvet Matte Lipstick", 2200, 1800, 50],
  ["women-cosmetics", "24H Foundation SPF30", 3800, null, 28],
  ["women-cosmetics", "Radiance Vitamin C Serum 30ml", 6500, 5200, 16],
  // Bags — Ladies Bag
  ["ladies-bag", "Quilted Chain Shoulder Bag", 13500, 10900, 14],
  ["ladies-bag", "Genuine Leather Tote Bag", 16500, null, 9],
  ["ladies-bag", "Mini Crossbody Bag", 8900, 6900, 21],
];

async function main() {
  const subs = await prisma.subcategory.findMany({ include: { category: true } });
  const byPath = new Map(subs.map((s) => [s.path, s]));

  let created = 0;
  let discounted = 0;
  let outOfStock = 0;

  for (const [subPath, name, price, discountPrice, stock] of products) {
    const sub = byPath.get(subPath);
    if (!sub) {
      console.warn(`! subcategory "${subPath}" not found — skipping "${name}"`);
      continue;
    }
    const cat = sub.category;
    const catKey = cat.path; // watches | perfume | cosmetics | bags
    const path = slugify(name);

    const data = {
      categoryId: cat.id,
      subcategoryId: sub.id,
      name,
      description: `${name} — an authentic piece from the Luxora Collection ${sub.name} range. Premium quality, delivered across Pakistan.`,
      breadcrumb: `${cat.name} > ${sub.name} > ${name}`,
      price,
      discountPrice: discountPrice ?? null,
      stock,
      posterImage: { imageUrl: POSTER[catKey], altText: name },
      productImages: gallery(POSTER[catKey], name),
      additionalInformation: [
        { label: "Category", value: cat.name },
        { label: "Collection", value: sub.name },
        { label: "Warranty", value: "1 Year" },
      ],
      metaTitle: `${name} | Luxora Collection`,
      metaDescription: `Buy ${name} at Luxora Collection. Authentic ${sub.name} in Pakistan.`,
      canonicalUrl: `${SITE}/${cat.path}/${path}`,
      status: "PUBLISHED",
      lastEditedBy: "system",
    };

    await prisma.product.upsert({
      where: { path },
      update: data,
      create: { path, ...data },
    });

    created += 1;
    if (discountPrice) discounted += 1;
    if (stock === 0) outOfStock += 1;
  }

  console.log(`Seeded ${created} products (${discounted} discounted, ${outOfStock} out of stock).`);
}

main()
  .catch((e) => {
    console.error("Product seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
