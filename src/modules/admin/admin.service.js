import createError from "http-errors";

import { prisma, bcryptUtils } from "#lib/index.js";

const PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  permissions: true,
  lastEditedBy: true,
  createdAt: true,
  updatedAt: true,
};

export const adminService = {
  list: () =>
    prisma.admin.findMany({
      select: PUBLIC_FIELDS,
      orderBy: { createdAt: "desc" },
    }),

  byId: (id) => prisma.admin.findUnique({ where: { id }, select: PUBLIC_FIELDS }),

  create: async (input, editor) => {
    const existing = await prisma.admin.findUnique({
      where: { email: input.email },
    });
    if (existing) throw createError(409, "An admin with this email already exists.");

    const password = await bcryptUtils.hash(input.password, { rounds: 12 });

    return prisma.admin.create({
      data: {
        name: input.name,
        email: input.email,
        password,
        role: input.role ?? "ADMIN",
        permissions: input.permissions ?? [],
        lastEditedBy: editor,
      },
      select: PUBLIC_FIELDS,
    });
  },

  update: async (id, input, editor) => {
    const data = { ...input, lastEditedBy: editor };
    if (input.password) {
      data.password = await bcryptUtils.hash(input.password, { rounds: 12 });
    }
    return prisma.admin.update({ where: { id }, data, select: PUBLIC_FIELDS });
  },

  remove: async (id) => {
    await prisma.admin.delete({ where: { id } });
    return { success: true, message: "Admin removed successfully." };
  },
};
