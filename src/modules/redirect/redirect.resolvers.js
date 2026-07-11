import { validate, verify, handlePromise, PERMISSIONS } from "#lib/index.js";
import { redirectService } from "./redirect.service.js";
import {
  createRedirectSchema,
  updateRedirectSchema,
} from "./redirect.validation.js";

export const redirectResolvers = {
  Query: {
    redirectList: handlePromise(() => redirectService.list()),
    redirectById: handlePromise((_p, { id }) => redirectService.byId(id)),
    redirectByFrom: handlePromise((_p, { fromPath }) =>
      redirectService.byFrom(fromPath)
    ),
  },

  Mutation: {
    createRedirect: handlePromise(
      verify.permission(PERMISSIONS.ADD_REDIRECT)((_p, { input }, ctx) => {
        const data = validate(createRedirectSchema, input);
        return redirectService.create(data, ctx.user.name);
      })
    ),

    updateRedirectById: handlePromise(
      verify.permission(PERMISSIONS.EDIT_REDIRECT)((_p, { id, input }, ctx) => {
        const data = validate(updateRedirectSchema, input);
        return redirectService.update(id, data, ctx.user.name);
      })
    ),

    removeRedirectById: handlePromise(
      verify.permission(PERMISSIONS.DELETE_REDIRECT)((_p, { id }) =>
        redirectService.remove(id)
      )
    ),
  },
};
