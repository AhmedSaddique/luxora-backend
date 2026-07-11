import { validate, verify, handlePromise, PERMISSIONS } from "#lib/index.js";
import { productService } from "./product.service.js";
import {
  createProductSchema,
  updateProductSchema,
} from "./product.validation.js";

export const productResolvers = {
  Query: {
    productList: handlePromise((_p, { published }, ctx) =>
      productService.list(published === true || !ctx.user)
    ),
    productById: handlePromise((_p, { id }) => productService.byId(id)),
    productByPath: handlePromise((_p, { path }, ctx) =>
      productService.byPath(path, !ctx.user)
    ),
    productsByCategory: handlePromise((_p, { categoryId }, ctx) =>
      productService.byCategory(categoryId, !ctx.user)
    ),
  },

  Mutation: {
    createProduct: handlePromise(
      verify.permission(PERMISSIONS.ADD_PRODUCT)((_p, { input }, ctx) => {
        const data = validate(createProductSchema, input);
        return productService.create(data, ctx.user.name);
      })
    ),

    updateProductById: handlePromise(
      verify.permission(PERMISSIONS.EDIT_PRODUCT)((_p, { id, input }, ctx) => {
        const data = validate(updateProductSchema, input);
        return productService.update(id, data, ctx.user.name);
      })
    ),

    removeProductById: handlePromise(
      verify.permission(PERMISSIONS.DELETE_PRODUCT)((_p, { id }) =>
        productService.remove(id)
      )
    ),
  },
};
