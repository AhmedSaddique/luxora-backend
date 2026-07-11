import { validate, verify, handlePromise, PERMISSIONS } from "#lib/index.js";
import { appointmentService } from "./appointment.service.js";
import { createAppointmentSchema } from "./appointment.validation.js";

export const appointmentResolvers = {
  Query: {
    appointmentList: handlePromise(
      verify.permission(PERMISSIONS.VIEW_APPOINTMENTS)(() =>
        appointmentService.list()
      )
    ),
    appointmentById: handlePromise(
      verify.permission(PERMISSIONS.VIEW_APPOINTMENTS)((_p, { id }) =>
        appointmentService.byId(id)
      )
    ),
  },

  Mutation: {
    // Public: submitted from the website appointment form.
    createAppointment: handlePromise(async (_p, { input }) => {
      const data = validate(createAppointmentSchema, input);
      await appointmentService.create(data);
      return {
        success: true,
        message:
          "Thank you! Your appointment request has been received. Our team will contact you shortly.",
      };
    }),
  },
};
