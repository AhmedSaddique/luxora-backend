import { validate, verify, handlePromise, PERMISSIONS } from "#lib/index.js";
import { subcategoryService } from "./subcategory.service.js";
import {
  createSubcategorySchema,
  updateSubcategorySchema,
} from "./subcategory.validation.js";

export const subcategoryResolvers = {
  Query: {
    // Public (no auth) sees only PUBLISHED; an authenticated admin sees all.
    subcategoryList: handlePromise((_p, { published }, ctx) =>
      subcategoryService.list(published === true || !ctx.user)
    ),
    subcategoryById: handlePromise((_p, { id }) => subcategoryService.byId(id)),
    subcategoryByPath: handlePromise((_p, { path }, ctx) =>
      subcategoryService.byPath(path, !ctx.user)
    ),
    subcategoriesByCategory: handlePromise((_p, { categoryId }, ctx) =>
      subcategoryService.byCategory(categoryId, !ctx.user)
    ),
  },

  Mutation: {
    createSubcategory: handlePromise(
      verify.permission(PERMISSIONS.ADD_SUBCATEGORY)((_p, { input }, ctx) => {
        const data = validate(createSubcategorySchema, input);
        return subcategoryService.create(data, ctx.user.name);
      })
    ),

    updateSubcategoryById: handlePromise(
      verify.permission(PERMISSIONS.EDIT_SUBCATEGORY)(
        (_p, { id, input }, ctx) => {
          const data = validate(updateSubcategorySchema, input);
          return subcategoryService.update(id, data, ctx.user.name);
        }
      )
    ),

    removeSubcategoryById: handlePromise(
      verify.permission(PERMISSIONS.DELETE_SUBCATEGORY)((_p, { id }) =>
        subcategoryService.remove(id)
      )
    ),
  },
};
