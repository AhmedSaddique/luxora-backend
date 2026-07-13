/**
 * Role-based permission keys. These exact strings are stored in
 * Admin.permissions[] and checked by verify.permission(...).
 * They mirror the permission keys used by the dashboard frontend.
 */
export const PERMISSIONS = {
  // Category
  ADD_CATEGORY: "canAddCategory",
  EDIT_CATEGORY: "canEditCategory",
  DELETE_CATEGORY: "canDeleteCategory",

  // Subcategory
  ADD_SUBCATEGORY: "canAddSubcategory",
  EDIT_SUBCATEGORY: "canEditSubcategory",
  DELETE_SUBCATEGORY: "canDeleteSubcategory",

  // Product
  ADD_PRODUCT: "canAddProduct",
  EDIT_PRODUCT: "canEditProduct",
  DELETE_PRODUCT: "canDeleteProduct",

  // Blog
  ADD_BLOG: "canAddBlog",
  EDIT_BLOG: "canEditBlog",
  DELETE_BLOG: "canDeleteBlog",

  // Testimonial
  ADD_TESTIMONIAL: "canAddTestimonial",
  EDIT_TESTIMONIAL: "canEditTestimonial",
  DELETE_TESTIMONIAL: "canDeleteTestimonial",

  // Redirect
  ADD_REDIRECT: "canAddRedirect",
  EDIT_REDIRECT: "canEditRedirect",
  DELETE_REDIRECT: "canDeleteRedirect",

  // Orders
  VIEW_ORDERS: "canViewOrders",
  MANAGE_ORDERS: "canManageOrders",

  // Contact (view only — contacts cannot be deleted)
  VIEW_CONTACTS: "canViewContacts",

  // Admin management
  VIEW_ADMINS: "canViewAdmins",
  ADD_ADMIN: "canAddAdmin",
  EDIT_ADMIN: "canEditAdmin",
  DELETE_ADMIN: "canDeleteAdmin",
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
