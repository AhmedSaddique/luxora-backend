import { prisma, slugify, cache } from "#lib/index.js";

const LIST_KEY = "blogs:list";

export const blogService = {
  list: async (onlyPublished = false) => {
    let data = await cache.get(LIST_KEY);
    if (!data) {
      data = await prisma.blog.findMany({
        orderBy: { createdAt: "desc" },
        include: { category: true },
      });
      await cache.set(LIST_KEY, data, 120);
    }
    return onlyPublished ? data.filter((b) => b.status === "PUBLISHED") : data;
  },

  byId: (id) =>
    prisma.blog.findUnique({ where: { id }, include: { category: true } }),

  byPath: async (path, onlyPublished = false) => {
    const blog = await prisma.blog.findUnique({
      where: { path },
      include: { category: true },
    });
    if (onlyPublished && blog && blog.status !== "PUBLISHED") return null;
    return blog;
  },

  byCategory: (categoryId, onlyPublished = false) =>
    prisma.blog.findMany({
      where: {
        categoryId,
        ...(onlyPublished ? { status: "PUBLISHED" } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),

  create: async (input, editor) => {
    const path = input.path?.trim() || slugify(input.title);
    const blog = await prisma.blog.create({
      data: { ...input, path, lastEditedBy: editor },
      include: { category: true },
    });
    await cache.del(LIST_KEY);
    return blog;
  },

  update: async (id, input, editor) => {
    const data = { ...input, lastEditedBy: editor };
    if (input.path) data.path = input.path.trim();
    const blog = await prisma.blog.update({
      where: { id },
      data,
      include: { category: true },
    });
    await cache.del(LIST_KEY);
    return blog;
  },

  remove: async (id) => {
    await prisma.blog.delete({ where: { id } });
    await cache.del(LIST_KEY);
    return { success: true, message: "Blog removed successfully." };
  },
};
