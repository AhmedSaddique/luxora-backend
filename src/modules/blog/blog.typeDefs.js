import gql from "graphql-tag";

export const blogTypeDefs = gql`
  type Blog {
    id: ID!
    categoryId: ID!
    title: String!
    path: String!
    posterImage: JSON!
    bannerImage: JSON!
    content: String!
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    imageAltText: String
    seoSchema: String
    lastEditedBy: String!
    status: ContentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    category: Category
  }

  input CreateBlogInput {
    categoryId: ID!
    title: String!
    path: String
    posterImage: JSON!
    bannerImage: JSON!
    content: String!
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    imageAltText: String
    seoSchema: String
    status: ContentStatus
  }

  input UpdateBlogInput {
    categoryId: ID
    title: String
    path: String
    posterImage: JSON
    bannerImage: JSON
    content: String
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    imageAltText: String
    seoSchema: String
    status: ContentStatus
  }

  type Query {
    blogList(published: Boolean): [Blog!]!
    blogById(id: ID!): Blog
    blogByPath(path: String!): Blog
    blogsByCategory(categoryId: ID!): [Blog!]!
  }

  type Mutation {
    createBlog(input: CreateBlogInput!): Blog
    updateBlogById(id: ID!, input: UpdateBlogInput!): Blog
    removeBlogById(id: ID!): GenericResponse
  }
`;
