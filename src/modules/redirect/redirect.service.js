import { prisma, cache } from "#lib/index.js";
import { normalizePath } from "./redirect.validation.js";

const LIST_KEY = "redirects:list";

export const redirectService = {
  list: async () => {
    let data = await cache.get(LIST_KEY);
    if (!data) {
      data = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });
      await cache.set(LIST_KEY, data, 120);
    }
    return data;
  },

  byId: (id) => prisma.redirect.findUnique({ where: { id } }),

  byFrom: (fromPath) =>
    prisma.redirect.findUnique({ where: { fromPath: normalizePath(fromPath) } }),

  create: async (input, editor) => {
    const redirect = await prisma.redirect.create({
      data: { ...input, lastEditedBy: editor },
    });
    await cache.del(LIST_KEY);
    return redirect;
  },

  update: async (id, input, editor) => {
    const redirect = await prisma.redirect.update({
      where: { id },
      data: { ...input, lastEditedBy: editor },
    });
    await cache.del(LIST_KEY);
    return redirect;
  },

  remove: async (id) => {
    await prisma.redirect.delete({ where: { id } });
    await cache.del(LIST_KEY);
    return { success: true, message: "Redirect removed successfully." };
  },
};
