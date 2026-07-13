import crypto from "crypto";
import createError from "http-errors";

import { env } from "#config/index.js";
import { prisma, sendEmail, logger } from "#lib/index.js";

const { FRONTEND_URL } = env;
const SHIPPING_FEE = 250;
const AUTO_COMPLETE_DAYS = 5;

const site = (FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
const money = (n) => `PKR ${Number(n ?? 0).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

// Email clients need absolute image URLs; make relative /assets paths absolute.
const absImg = (img) => {
  const fallback = `${site}/assets/images/categories/watches.svg`;
  if (!img) return fallback;
  if (/^https?:\/\//i.test(img)) return img;
  return `${site}${img.startsWith("/") ? "" : "/"}${img}`;
};

const genOrderNumber = () =>
  "LX" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase();
const genTracking = () => "TRK" + crypto.randomBytes(5).toString("hex").toUpperCase();

const orderInclude = { items: true };

/** Orders older than N days that were never delivered/cancelled auto-complete. */
const autoComplete = async () => {
  const cutoff = new Date(Date.now() - AUTO_COMPLETE_DAYS * 24 * 60 * 60 * 1000);
  try {
    await prisma.order.updateMany({
      where: { status: { in: ["PENDING", "SHIPPED"] }, createdAt: { lt: cutoff } },
      data: { status: "DELIVERED" },
    });
  } catch (error) {
    logger.error(`[order] auto-complete failed: ${error.message}`);
  }
};

const sendOrderEmail = async (order) => {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0; width:56px;">
            <img src="${absImg(i.image)}" alt="${i.name}" width="48" height="48"
              style="width:48px; height:48px; border-radius:6px; object-fit:cover; border:1px solid #eee; display:block;" />
          </td>
          <td style="padding:8px 10px; font-size:14px; color:#333;">${i.name} &times; ${i.quantity}</td>
          <td style="padding:8px 0; font-size:14px; color:#333; text-align:right; white-space:nowrap;">${money(
            Number(i.price) * i.quantity
          )}</td>
        </tr>`
    )
    .join("");
  const addressHtml = [order.addressLine, order.area, order.city]
    .filter(Boolean)
    .join(", ");

  try {
    await sendEmail("order-confirmation", {
      to: order.email,
      subject: `Order Confirmed - ${order.orderNumber} | Luxora Collection`,
      name: order.customerName,
      orderNumber: order.orderNumber,
      trackingId: order.trackingId,
      itemsHtml,
      subtotal: money(order.subtotal),
      shipping: money(order.shippingFee),
      total: money(order.total),
      addressHtml,
      phone: order.phone,
      trackUrl: `${site}/order-tracking?id=${order.trackingId}`,
    });
  } catch (error) {
    logger.error(`[order] confirmation email failed: ${error.message}`);
  }
};

export const orderService = {
  // ---- Addresses ----
  addresses: (userId) =>
    prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),

  addAddress: async (userId, input) => {
    if (input.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { ...input, userId } });
  },

  updateAddress: async (userId, id, input) => {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw createError(404, "Address not found.");
    if (input.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.update({ where: { id }, data: input });
  },

  deleteAddress: async (userId, id) => {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw createError(404, "Address not found.");
    await prisma.address.delete({ where: { id } });
    return { success: true, message: "Address removed." };
  },

  // ---- Orders (read) ----
  listForAdmin: async (status) => {
    await autoComplete();
    return prisma.order.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    });
  },

  myOrders: async (userId) => {
    await autoComplete();
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    });
  },

  byTracking: async (trackingId) => {
    await autoComplete();
    return prisma.order.findUnique({
      where: { trackingId: trackingId.trim() },
      include: orderInclude,
    });
  },

  byId: async (id) => {
    await autoComplete();
    return prisma.order.findUnique({ where: { id }, include: orderInclude });
  },

  // ---- Orders (write) ----
  create: async (input, customer) => {
    // Resolve the delivery address (saved address for logged-in, else inline fields).
    let addr;
    if (input.addressId) {
      if (!customer) throw createError(401, "Please sign in to use a saved address.");
      const saved = await prisma.address.findFirst({
        where: { id: input.addressId, userId: customer.id },
      });
      if (!saved) throw createError(404, "Selected address not found.");
      addr = {
        customerName: saved.fullName,
        phone: saved.phone,
        addressLine: saved.addressLine,
        city: saved.city,
        area: saved.area,
      };
    } else {
      addr = {
        customerName: input.customerName,
        phone: input.phone,
        addressLine: input.addressLine,
        city: input.city,
        area: input.area || null,
      };
    }

    const order = await prisma.$transaction(async (tx) => {
      const lineItems = [];
      let subtotal = 0;

      for (const { productId, quantity } of input.items) {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product || product.status !== "PUBLISHED")
          throw createError(400, "One of the products is no longer available.");
        if (product.stock < quantity)
          throw createError(400, `"${product.name}" is out of stock.`);

        const unit = Number(product.discountPrice ?? product.price);
        subtotal += unit * quantity;
        lineItems.push({
          productId: product.id,
          name: product.name,
          image: product.posterImage?.imageUrl ?? null,
          price: unit,
          quantity,
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } },
        });
      }

      const total = subtotal + SHIPPING_FEE;

      return tx.order.create({
        data: {
          orderNumber: genOrderNumber(),
          trackingId: genTracking(),
          userId: customer?.id ?? null,
          customerName: addr.customerName,
          email: input.email,
          phone: addr.phone,
          addressLine: addr.addressLine,
          city: addr.city,
          area: addr.area,
          note: input.note || null,
          subtotal,
          shippingFee: SHIPPING_FEE,
          total,
          paymentMethod: "COD",
          status: "PENDING",
          items: { create: lineItems },
        },
        include: orderInclude,
      });
    });

    await sendOrderEmail(order);
    return order;
  },

  updateStatus: (id, status) =>
    prisma.order.update({ where: { id }, data: { status }, include: orderInclude }),
};
