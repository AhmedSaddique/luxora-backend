import { ApolloServer } from "@apollo/server";

import { env } from "#config/index.js";
import { typeDefs, resolvers } from "#modules/index.js";

const formatError = (error) => {
  if (env.NODE_ENV !== "production") {
    console.error("GraphQL Error:", error.message);
  }
  return {
    message: error.message || "An unexpected error occurred.",
    path: error.path || [],
    code: error.extensions?.code,
  };
};

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  formatError,
  introspection: true,
  includeStacktraceInErrorResponses: env.NODE_ENV !== "production",
});
