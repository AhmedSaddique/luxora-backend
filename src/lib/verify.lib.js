import createError from "http-errors";

const requireAuth = (context) => {
  if (!context.user) throw createError(401, "Authentication required.");
};

/**
 * Resolver guards. Compose like:
 *   verify.permission('canAddCategory')(resolverFn)
 * SUPER_ADMIN bypasses every permission check.
 */
export const verify = {
  access: (resolver) => (parent, args, context, info) => {
    requireAuth(context);
    return resolver(parent, args, context, info);
  },

  role: (authorizedRoles) => (resolver) => (parent, args, context, info) => {
    requireAuth(context);
    if (!authorizedRoles.includes(context.user.role)) {
      throw createError(
        403,
        `Access denied: requires one of ${authorizedRoles.join(", ")}.`
      );
    }
    return resolver(parent, args, context, info);
  },

  permission:
    (permissionKey) => (resolver) => (parent, args, context, info) => {
      requireAuth(context);
      const { role, permissions = [] } = context.user;
      if (role === "SUPER_ADMIN") {
        return resolver(parent, args, context, info);
      }
      if (!permissions.includes(permissionKey)) {
        throw createError(
          403,
          `Access denied: missing permission "${permissionKey}".`
        );
      }
      return resolver(parent, args, context, info);
    },
};
