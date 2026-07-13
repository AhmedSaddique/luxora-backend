import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Keep in sync with src/lib/permissions.lib.js
const ALL_PERMISSIONS = [
  "canAddCategory",
  "canEditCategory",
  "canDeleteCategory",
  "canAddSubcategory",
  "canEditSubcategory",
  "canDeleteSubcategory",
  "canAddProduct",
  "canEditProduct",
  "canDeleteProduct",
  "canAddBlog",
  "canEditBlog",
  "canDeleteBlog",
  "canAddTestimonial",
  "canEditTestimonial",
  "canDeleteTestimonial",
  "canAddRedirect",
  "canEditRedirect",
  "canDeleteRedirect",
  "canViewOrders",
  "canManageOrders",
  "canViewContacts",
  "canViewAdmins",
  "canAddAdmin",
  "canEditAdmin",
  "canDeleteAdmin",
];

async function main() {
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Missing SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD in .env. Aborting seed."
    );
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      name,
      role: "SUPER_ADMIN",
      permissions: ALL_PERMISSIONS,
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      permissions: ALL_PERMISSIONS,
      lastEditedBy: "system",
    },
  });

  console.log(`✅ Super admin ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
