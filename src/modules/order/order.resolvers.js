import createError from "http-errors";
import { validate, verify, handlePromise, PERMISSIONS } from "#lib/index.js";
import { orderService } from "./order.service.js";
import { addressSchema, createOrderSchema } from "./order.validation.js";

export const orderResolvers = {
  Query: {
    myAddresses: verify.customer((_p, _a, ctx) => orderService.addresses(ctx.customer.id)),

    myOrders: verify.customer((_p, _a, ctx) => orderService.myOrders(ctx.customer.id)),

    // Public tracking lookup.
    orderByTracking: handlePromise((_p, { trackingId }) =>
      orderService.byTracking(trackingId)
    ),

    orderList: handlePromise(
      verify.permission(PERMISSIONS.VIEW_ORDERS)((_p, { status }) =>
        orderService.listForAdmin(status)
      )
    ),

    orderById: handlePromise(
      verify.permission(PERMISSIONS.VIEW_ORDERS)((_p, { id }) => orderService.byId(id))
    ),
  },

  Mutation: {
    addAddress: verify.customer((_p, { input }, ctx) => {
      const data = validate(addressSchema, input);
      return orderService.addAddress(ctx.customer.id, data);
    }),

    updateAddress: verify.customer((_p, { id, input }, ctx) => {
      const data = validate(addressSchema, input);
      return orderService.updateAddress(ctx.customer.id, id, data);
    }),

    deleteAddress: verify.customer((_p, { id }, ctx) =>
      orderService.deleteAddress(ctx.customer.id, id)
    ),

    // Guest OR logged-in customer can place an order.
    createOrder: handlePromise((_p, { input }, ctx) => {
      const data = validate(createOrderSchema, input);
      return orderService.create(data, ctx.customer || null);
    }),

    updateOrderStatus: handlePromise(
      verify.permission(PERMISSIONS.MANAGE_ORDERS)((_p, { id, status }) => {
        if (!["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status))
          throw createError(400, "Invalid order status.");
        return orderService.updateStatus(id, status);
      })
    ),
  },
};
