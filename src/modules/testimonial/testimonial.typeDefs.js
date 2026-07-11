import gql from "graphql-tag";

export const testimonialTypeDefs = gql`
  type Testimonial {
    id: ID!
    name: String!
    designation: String!
    rating: Int!
    description: String!
    lastEditedBy: String!
    status: ContentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateTestimonialInput {
    name: String!
    designation: String!
    rating: Int!
    description: String!
    status: ContentStatus
  }

  input UpdateTestimonialInput {
    name: String
    designation: String
    rating: Int
    description: String
    status: ContentStatus
  }

  type Query {
    testimonialList(published: Boolean): [Testimonial!]!
    testimonialById(id: ID!): Testimonial
  }

  type Mutation {
    createTestimonial(input: CreateTestimonialInput!): Testimonial
    updateTestimonialById(id: ID!, input: UpdateTestimonialInput!): Testimonial
    removeTestimonialById(id: ID!): GenericResponse
  }
`;
