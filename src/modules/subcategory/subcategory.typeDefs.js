import gql from "graphql-tag";

export const subcategoryTypeDefs = gql`
  type Subcategory {
    id: ID!
    categoryId: ID!
    name: String!
    description: String!
    breadcrumb: String!
    path: String!
    posterImage: JSON
    bannerImage: JSON
    metaTitle: String!
    metaDescription: String!
    canonicalUrl: String!
    seoSchema: String
    lastEditedBy: String!
    status: ContentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    category: Category
    products: [Product!]
  }

  input CreateSubcategoryInput {
    categoryId: ID!
    name: String!
    description: String!
    breadcrumb: String!
    path: String
    posterImage: JSON
    bannerImage: JSON
    metaTitle: String!
    metaDescription: String!
    canonicalUrl: String!
    seoSchema: String
    status: ContentStatus
  }

  input UpdateSubcategoryInput {
    categoryId: ID
    name: String
    description: String
    breadcrumb: String
    path: String
    posterImage: JSON
    bannerImage: JSON
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    seoSchema: String
    status: ContentStatus
  }

  type Query {
    subcategoryList(published: Boolean): [Subcategory!]!
    subcategoryById(id: ID!): Subcategory
    subcategoryByPath(path: String!): Subcategory
    subcategoriesByCategory(categoryId: ID!): [Subcategory!]!
  }

  type Mutation {
    createSubcategory(input: CreateSubcategoryInput!): Subcategory
    updateSubcategoryById(id: ID!, input: UpdateSubcategoryInput!): Subcategory
    removeSubcategoryById(id: ID!): GenericResponse
  }
`;
