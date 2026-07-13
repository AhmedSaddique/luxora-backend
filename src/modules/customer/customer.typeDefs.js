import gql from "graphql-tag";

export const customerTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    createdAt: DateTime!
  }

  type UserAuthResponse {
    id: ID!
    name: String!
    email: String!
    phone: String
    accessToken: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    phone: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ForgotPasswordInput {
    email: String!
  }

  input ResetPasswordInput {
    token: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String
    phone: String
  }

  type Query {
    myAccount: User
  }

  type Mutation {
    registerUser(input: RegisterInput!): UserAuthResponse!
    loginUser(input: LoginInput!): UserAuthResponse!
    logoutUser: GenericResponse!
    forgotPassword(input: ForgotPasswordInput!): GenericResponse!
    verifyResetToken(token: String!): GenericResponse!
    resetPassword(input: ResetPasswordInput!): GenericResponse!
    updateProfile(input: UpdateProfileInput!): User!
  }
`;
