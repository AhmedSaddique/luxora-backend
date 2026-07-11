import { validate, verify, handlePromise, PERMISSIONS } from "#lib/index.js";
import { blogService } from "./blog.service.js";
import { createBlogSchema, updateBlogSchema } from "./blog.validation.js";

export const blogResolvers = {
  Query: {
    blogList: handlePromise((_p, { published }, ctx) =>
      blogService.list(published === true || !ctx.user)
    ),
    blogById: handlePromise((_p, { id }) => blogService.byId(id)),
    blogByPath: handlePromise((_p, { path }, ctx) =>
      blogService.byPath(path, !ctx.user)
    ),
    blogsByCategory: handlePromise((_p, { categoryId }, ctx) =>
      blogService.byCategory(categoryId, !ctx.user)
    ),
  },

  Mutation: {
    createBlog: handlePromise(
      verify.permission(PERMISSIONS.ADD_BLOG)((_p, { input }, ctx) => {
        const data = validate(createBlogSchema, input);
        return blogService.create(data, ctx.user.name);
      })
    ),

    updateBlogById: handlePromise(
      verify.permission(PERMISSIONS.EDIT_BLOG)((_p, { id, input }, ctx) => {
        const data = validate(updateBlogSchema, input);
        return blogService.update(id, data, ctx.user.name);
      })
    ),

    removeBlogById: handlePromise(
      verify.permission(PERMISSIONS.DELETE_BLOG)((_p, { id }) =>
        blogService.remove(id)
      )
    ),
  },
};
