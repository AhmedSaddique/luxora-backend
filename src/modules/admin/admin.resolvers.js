import createError from "http-errors";

import { validate, verify, handlePromise, PERMISSIONS } from "#lib/index.js";
import { adminService } from "./admin.service.js";
import { createAdminSchema, updateAdminSchema } from "./admin.validation.js";

export const adminResolvers = {
  Query: {
    adminList: handlePromise(
      verify.permission(PERMISSIONS.VIEW_ADMINS)(() => adminService.list())
    ),
    adminById: handlePromise(
      verify.permission(PERMISSIONS.VIEW_ADMINS)((_p, { id }) =>
        adminService.byId(id)
      )
    ),
  },

  Mutation: {
    createAdmin: handlePromise(
      verify.permission(PERMISSIONS.ADD_ADMIN)((_p, { input }, ctx) => {
        const data = validate(createAdminSchema, input);
        return adminService.create(data, ctx.user.name);
      })
    ),

    updateAdminById: handlePromise(
      verify.permission(PERMISSIONS.EDIT_ADMIN)((_p, { id, input }, ctx) => {
        const data = validate(updateAdminSchema, input);
        return adminService.update(id, data, ctx.user.name);
      })
    ),

    removeAdminById: handlePromise(
      verify.permission(PERMISSIONS.DELETE_ADMIN)((_p, { id }, ctx) => {
        if (id === ctx.user.id)
          throw createError(400, "You cannot delete your own account.");
        return adminService.remove(id);
      })
    ),
  },
};
