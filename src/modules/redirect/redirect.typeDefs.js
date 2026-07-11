import gql from "graphql-tag";

export const redirectTypeDefs = gql`
  type Redirect {
    id: ID!
    fromPath: String!
    toPath: String!
    statusCode: Int!
    lastEditedBy: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateRedirectInput {
    fromPath: String!
    toPath: String!
    statusCode: Int
  }

  input UpdateRedirectInput {
    fromPath: String
    toPath: String
    statusCode: Int
  }

  type Query {
    redirectList: [Redirect!]!
    redirectById(id: ID!): Redirect
    "Public lookup used by the frontend middleware to resolve an incoming path."
    redirectByFrom(fromPath: String!): Redirect
  }

  type Mutation {
    createRedirect(input: CreateRedirectInput!): Redirect
    updateRedirectById(id: ID!, input: UpdateRedirectInput!): Redirect
    removeRedirectById(id: ID!): GenericResponse
  }
`;
