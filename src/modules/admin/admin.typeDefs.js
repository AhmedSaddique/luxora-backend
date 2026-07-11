import gql from "graphql-tag";

export const adminTypeDefs = gql`
  type Admin {
    id: ID!
    name: String!
    email: String!
    role: AdminRole!
    permissions: [String!]!
    lastEditedBy: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateAdminInput {
    name: String!
    email: String!
    password: String!
    role: AdminRole
    permissions: [String!]
  }

  input UpdateAdminInput {
    name: String
    email: String
    password: String
    role: AdminRole
    permissions: [String!]
  }

  type Query {
    adminList: [Admin!]!
    adminById(id: ID!): Admin
  }

  type Mutation {
    createAdmin(input: CreateAdminInput!): Admin
    updateAdminById(id: ID!, input: UpdateAdminInput!): Admin
    removeAdminById(id: ID!): GenericResponse
  }
`;
