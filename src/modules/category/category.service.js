import { prisma, slugify, cache } from "#lib/index.js";

const LIST_KEY = "categories:list";

export const categoryService = {
  list: async (onlyPublished = false) => {
    let data = await cache.get(LIST_KEY);
    if (!data) {
      data = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
      await cache.set(LIST_KEY, data, 120);
    }
    return onlyPublished ? data.filter((c) => c.status === "PUBLISHED") : data;
  },

  byId: (id) =>
    prisma.category.findUnique({
      where: { id },
      include: { products: true, blogs: true },
    }),

  byPath: async (path, onlyPublished = false) => {
    const category = await prisma.category.findUnique({
      where: { path },
      include: onlyPublished
        ? {
            products: { where: { status: "PUBLISHED" } },
            blogs: { where: { status: "PUBLISHED" } },
          }
        : { products: true, blogs: true },
    });
    // A draft/archived category isn't visible to the public.
    if (onlyPublished && category && category.status !== "PUBLISHED") return null;
    return category;
  },

  create: async (input, editor) => {
    const path = input.path?.trim() || slugify(input.name);
    const category = await prisma.category.create({
      data: { ...input, path, lastEditedBy: editor },
    });
    await cache.del(LIST_KEY);
    return category;
  },

  update: async (id, input, editor) => {
    const data = { ...input, lastEditedBy: editor };
    if (input.path) data.path = input.path.trim();
    const category = await prisma.category.update({ where: { id }, data });
    await cache.del(LIST_KEY);
    return category;
  },

  remove: async (id) => {
    await prisma.category.delete({ where: { id } });
    await cache.del(LIST_KEY);
    return { success: true, message: "Category removed successfully." };
  },
};
