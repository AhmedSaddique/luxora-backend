import gql from "graphql-tag";

export const contactTypeDefs = gql`
  type Contact {
    id: ID!
    name: String!
    email: String!
    phone: String!
    whatsapp: String!
    message: String!
    createdAt: DateTime!
  }

  input CreateContactInput {
    name: String!
    email: String!
    phone: String!
    whatsapp: String!
    message: String!
  }

  type Query {
    contactList: [Contact!]!
    contactById(id: ID!): Contact
  }

  type Mutation {
    createContact(input: CreateContactInput!): GenericResponse!
  }
`;
