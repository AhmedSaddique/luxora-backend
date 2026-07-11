import gql from "graphql-tag";

export const categoryTypeDefs = gql`
  type Category {
    id: ID!
    name: String!
    description: String!
    breadcrumb: String!
    bannerImage: JSON
    path: String!
    posterImage: JSON
    metaTitle: String!
    metaDescription: String!
    canonicalUrl: String!
    seoSchema: String
    lastEditedBy: String!
    status: ContentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    products: [Product!]
    blogs: [Blog!]
  }

  input CreateCategoryInput {
    name: String!
    description: String!
    breadcrumb: String!
    bannerImage: JSON
    path: String
    posterImage: JSON
    metaTitle: String!
    metaDescription: String!
    canonicalUrl: String!
    seoSchema: String
    status: ContentStatus
  }

  input UpdateCategoryInput {
    name: String
    description: String
    breadcrumb: String
    bannerImage: JSON
    path: String
    posterImage: JSON
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    seoSchema: String
    status: ContentStatus
  }

  type Query {
    categoryList(published: Boolean): [Category!]!
    categoryById(id: ID!): Category
    categoryByPath(path: String!): Category
  }

  type Mutation {
    createCategory(input: CreateCategoryInput!): Category
    updateCategoryById(id: ID!, input: UpdateCategoryInput!): Category
    removeCategoryById(id: ID!): GenericResponse
  }
`;
