import { prisma, slugify, cache } from "#lib/index.js";

const LIST_KEY = "subcategories:list";

export const subcategoryService = {
  list: async (onlyPublished = false) => {
    let data = await cache.get(LIST_KEY);
    if (!data) {
      data = await prisma.subcategory.findMany({
        orderBy: { createdAt: "desc" },
        include: { category: true },
      });
      await cache.set(LIST_KEY, data, 120);
    }
    return onlyPublished ? data.filter((s) => s.status === "PUBLISHED") : data;
  },

  byId: (id) =>
    prisma.subcategory.findUnique({
      where: { id },
      include: { category: true, products: true },
    }),

  byPath: async (path, onlyPublished = false) => {
    const subcategory = await prisma.subcategory.findUnique({
      where: { path },
      include: onlyPublished
        ? {
            category: true,
            products: { where: { status: "PUBLISHED" } },
          }
        : { category: true, products: true },
    });
    // A draft/archived subcategory isn't visible to the public.
    if (onlyPublished && subcategory && subcategory.status !== "PUBLISHED")
      return null;
    return subcategory;
  },

  byCategory: (categoryId, onlyPublished = false) =>
    prisma.subcategory.findMany({
      where: {
        categoryId,
        ...(onlyPublished ? { status: "PUBLISHED" } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),

  create: async (input, editor) => {
    const path = input.path?.trim() || slugify(input.name);
    const subcategory = await prisma.subcategory.create({
      data: { ...input, path, lastEditedBy: editor },
      include: { category: true },
    });
    await cache.del(LIST_KEY);
    return subcategory;
  },

  update: async (id, input, editor) => {
    const data = { ...input, lastEditedBy: editor };
    if (input.path) data.path = input.path.trim();
    const subcategory = await prisma.subcategory.update({
      where: { id },
      data,
      include: { category: true },
    });
    await cache.del(LIST_KEY);
    return subcategory;
  },

  remove: async (id) => {
    await prisma.subcategory.delete({ where: { id } });
    await cache.del(LIST_KEY);
    return { success: true, message: "Subcategory removed successfully." };
  },
};
