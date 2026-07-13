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
const poster = (file) => ({
  imageUrl: `/assets/images/categories/${file}`,
  altText: "",
});

const categories = [
  {
    name: "Watches",
    path: "watches",
    poster: "watches.svg",
    description:
      "Discover our curated collection of luxury watches — timeless timepieces for couples and men, crafted to make every moment count.",
    subcategories: [
      { name: "Couple Watches", path: "couple-watches" },
      { name: "Men Watches", path: "men-watches" },
    ],
  },
  {
    name: "Perfume",
    path: "perfume",
    poster: "perfume.svg",
    description:
      "Signature fragrances that leave a lasting impression. Explore our exclusive range of perfumes for the modern man.",
    subcategories: [{ name: "Men Perfume", path: "men-perfume" }],
  },
  {
    name: "Cosmetics",
    path: "cosmetics",
    poster: "cosmetics.svg",
    description:
      "Premium cosmetics and beauty essentials for men and women — quality you can feel, looks you will love.",
    subcategories: [
      { name: "Men Cosmetics", path: "men-cosmetics" },
      { name: "Women Cosmetics", path: "women-cosmetics" },
    ],
  },
  {
    name: "Bags",
    path: "bags",
    poster: "bags.svg",
    description:
      "Elegant bags to complete every look. Browse our handpicked selection of ladies bags built for style and everyday luxury.",
    subcategories: [{ name: "Ladies Bag", path: "ladies-bag" }],
  },
];

async function main() {
  for (const cat of categories) {
    const base = {
      description: cat.description,
      breadcrumb: cat.name,
      posterImage: poster(cat.poster),
      metaTitle: `${cat.name} | Luxora Collection`,
      metaDescription: cat.description,
      canonicalUrl: `${SITE}/${cat.path}`,
      status: "PUBLISHED",
      lastEditedBy: "system",
    };

    const category = await prisma.category.upsert({
      where: { path: cat.path },
      update: base,
      create: { name: cat.name, path: cat.path, ...base },
    });

    for (const sub of cat.subcategories) {
      const subBase = {
        categoryId: category.id,
        description: `${sub.name} — part of our ${cat.name} collection at Luxora Collection.`,
        breadcrumb: `${cat.name} > ${sub.name}`,
        posterImage: poster(cat.poster),
        metaTitle: `${sub.name} | Luxora Collection`,
        metaDescription: `Shop ${sub.name} at Luxora Collection.`,
        canonicalUrl: `${SITE}/${cat.path}/${sub.path}`,
        status: "PUBLISHED",
        lastEditedBy: "system",
      };
      await prisma.subcategory.upsert({
        where: { path: sub.path },
        update: subBase,
        create: { name: sub.name, path: sub.path, ...subBase },
      });
    }

    console.log(`✓ ${cat.name} (+${cat.subcategories.length} subcategories)`);
  }
  console.log("Catalog seeded.");
}

main()
  .catch((e) => {
    console.error("Catalog seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
