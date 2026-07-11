import { validate, verify, handlePromise, PERMISSIONS } from "#lib/index.js";
import { testimonialService } from "./testimonial.service.js";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from "./testimonial.validation.js";

export const testimonialResolvers = {
  Query: {
    testimonialList: handlePromise((_p, { published }, ctx) =>
      testimonialService.list(published === true || !ctx.user)
    ),
    testimonialById: handlePromise((_p, { id }) => testimonialService.byId(id)),
  },

  Mutation: {
    createTestimonial: handlePromise(
      verify.permission(PERMISSIONS.ADD_TESTIMONIAL)((_p, { input }, ctx) => {
        const data = validate(createTestimonialSchema, input);
        return testimonialService.create(data, ctx.user.name);
      })
    ),

    updateTestimonialById: handlePromise(
      verify.permission(PERMISSIONS.EDIT_TESTIMONIAL)((_p, { id, input }, ctx) => {
        const data = validate(updateTestimonialSchema, input);
        return testimonialService.update(id, data, ctx.user.name);
      })
    ),

    removeTestimonialById: handlePromise(
      verify.permission(PERMISSIONS.DELETE_TESTIMONIAL)((_p, { id }) =>
        testimonialService.remove(id)
      )
    ),
  },
};
