import { prisma, cache } from "#lib/index.js";

const LIST_KEY = "testimonials:list";

export const testimonialService = {
  list: async (onlyPublished = false) => {
    let data = await cache.get(LIST_KEY);
    if (!data) {
      data = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
      await cache.set(LIST_KEY, data, 120);
    }
    return onlyPublished ? data.filter((t) => t.status === "PUBLISHED") : data;
  },

  byId: (id) => prisma.testimonial.findUnique({ where: { id } }),

  create: async (input, editor) => {
    const testimonial = await prisma.testimonial.create({
      data: { ...input, lastEditedBy: editor },
    });
    await cache.del(LIST_KEY);
    return testimonial;
  },

  update: async (id, input, editor) => {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { ...input, lastEditedBy: editor },
    });
    await cache.del(LIST_KEY);
    return testimonial;
  },

  remove: async (id) => {
    await prisma.testimonial.delete({ where: { id } });
    await cache.del(LIST_KEY);
    return { success: true, message: "Testimonial removed successfully." };
  },
};
