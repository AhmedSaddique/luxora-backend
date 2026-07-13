import { prisma, slugify, cache } from "#lib/index.js";

const LIST_KEY = "products:list";
const INCLUDE = { category: true, subcategory: true };

export const productService = {
  list: async (onlyPublished = false) => {
    let data = await cache.get(LIST_KEY);
    if (!data) {
      data = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: INCLUDE,
      });
      await cache.set(LIST_KEY, data, 120);
    }
    return onlyPublished ? data.filter((p) => p.status === "PUBLISHED") : data;
  },

  byId: (id) =>
    prisma.product.findUnique({ where: { id }, include: INCLUDE }),

  byPath: async (path, onlyPublished = false) => {
    const product = await prisma.product.findUnique({
      where: { path },
      include: INCLUDE,
    });
    if (onlyPublished && product && product.status !== "PUBLISHED") return null;
    return product;
  },

  byCategory: (categoryId, onlyPublished = false) =>
    prisma.product.findMany({
      where: {
        categoryId,
        ...(onlyPublished ? { status: "PUBLISHED" } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: INCLUDE,
    }),

  bySubcategory: (subcategoryId, onlyPublished = false) =>
    prisma.product.findMany({
      where: {
        subcategoryId,
        ...(onlyPublished ? { status: "PUBLISHED" } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: INCLUDE,
    }),

  create: async (input, editor) => {
    const path = input.path?.trim() || slugify(input.name);
    const product = await prisma.product.create({
      data: { ...input, path, lastEditedBy: editor },
      include: INCLUDE,
    });
    await cache.del(LIST_KEY);
    return product;
  },

  update: async (id, input, editor) => {
    const data = { ...input, lastEditedBy: editor };
    if (input.path) data.path = input.path.trim();
    const product = await prisma.product.update({
      where: { id },
      data,
      include: INCLUDE,
    });
    await cache.del(LIST_KEY);
    return product;
  },

  remove: async (id) => {
    await prisma.product.delete({ where: { id } });
    await cache.del(LIST_KEY);
    return { success: true, message: "Product removed successfully." };
  },
};
