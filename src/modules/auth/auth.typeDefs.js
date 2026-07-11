import gql from "graphql-tag";

export const authTypeDefs = gql`
  type AuthResponse {
    id: ID!
    name: String!
    email: String!
    role: AdminRole!
    permissions: [String!]!
    accessToken: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input PasswordResetRequestInput {
    email: String!
  }

  input UpdatePasswordInput {
    resetToken: String!
    password: String!
  }

  type Query {
    me: Admin
  }

  type Mutation {
    signIn(input: SignInInput!): AuthResponse!
    signOut: GenericResponse!
    passwordResetRequest(input: PasswordResetRequestInput!): GenericResponse!
    updatePassword(input: UpdatePasswordInput!): GenericResponse!
  }
`;
