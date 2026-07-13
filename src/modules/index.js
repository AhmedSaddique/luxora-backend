import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

import { commonTypeDefs, commonResolvers } from "./common.js";
import { authTypeDefs, authResolvers } from "./auth/index.js";
import { adminTypeDefs, adminResolvers } from "./admin/index.js";
import { customerTypeDefs, customerResolvers } from "./customer/index.js";
import { orderTypeDefs, orderResolvers } from "./order/index.js";
import { categoryTypeDefs, categoryResolvers } from "./category/index.js";
import { subcategoryTypeDefs, subcategoryResolvers } from "./subcategory/index.js";
import { productTypeDefs, productResolvers } from "./product/index.js";
import { blogTypeDefs, blogResolvers } from "./blog/index.js";
import { contactTypeDefs, contactResolvers } from "./contact/index.js";
import { testimonialTypeDefs, testimonialResolvers } from "./testimonial/index.js";
import { redirectTypeDefs, redirectResolvers } from "./redirect/index.js";

export const typeDefs = mergeTypeDefs([
  commonTypeDefs,
  authTypeDefs,
  adminTypeDefs,
  customerTypeDefs,
  orderTypeDefs,
  categoryTypeDefs,
  subcategoryTypeDefs,
  productTypeDefs,
  blogTypeDefs,
  contactTypeDefs,
  testimonialTypeDefs,
  redirectTypeDefs,
]);

export const resolvers = mergeResolvers([
  commonResolvers,
  authResolvers,
  adminResolvers,
  customerResolvers,
  orderResolvers,
  categoryResolvers,
  subcategoryResolvers,
  productResolvers,
  blogResolvers,
  contactResolvers,
  testimonialResolvers,
  redirectResolvers,
]);
