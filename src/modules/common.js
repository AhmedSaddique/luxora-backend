import gql from "graphql-tag";
import GraphQLJSON from "graphql-type-json";
import { GraphQLScalarType } from "graphql";

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 date-time string",
  serialize: (value) => (value instanceof Date ? value.toISOString() : value),
  parseValue: (value) => new Date(value),
});

export const commonTypeDefs = gql`
  scalar JSON
  scalar DateTime

  enum AdminRole {
    ADMIN
    SUPER_ADMIN
  }

  enum ContentStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  type GenericResponse {
    success: Boolean!
    message: String!
  }

  type Query {
    _health: String!
  }
`;

export const commonResolvers = {
  JSON: GraphQLJSON,
  DateTime,
  Query: {
    _health: () => "OK",
  },
};
