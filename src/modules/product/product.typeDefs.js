import gql from "graphql-tag";

export const productTypeDefs = gql`
  type Product {
    id: ID!
    categoryId: ID!
    name: String!
    description: String!
    breadcrumb: String!
    bannerImage: JSON
    path: String!
    posterImage: JSON
    firstImage: JSON
    firstHeading: String!
    firstSubTitle: String!
    firstDescription: String!
    secondImage: JSON
    secondHeading: String!
    secondSubTitle: String!
    secondDescription: String!
    imageHeading: String
    productImages: [JSON!]
    faq: [JSON!]
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    seoSchema: String
    lastEditedBy: String!
    status: ContentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    category: Category
  }

  input CreateProductInput {
    categoryId: ID!
    name: String!
    description: String!
    breadcrumb: String!
    bannerImage: JSON
    path: String
    posterImage: JSON
    firstImage: JSON
    firstHeading: String!
    firstSubTitle: String!
    firstDescription: String!
    secondImage: JSON
    secondHeading: String!
    secondSubTitle: String!
    secondDescription: String!
    imageHeading: String
    productImages: [JSON!]
    faq: [JSON!]
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    seoSchema: String
    status: ContentStatus
  }

  input UpdateProductInput {
    categoryId: ID
    name: String
    description: String
    breadcrumb: String
    bannerImage: JSON
    path: String
    posterImage: JSON
    firstImage: JSON
    firstHeading: String
    firstSubTitle: String
    firstDescription: String
    secondImage: JSON
    secondHeading: String
    secondSubTitle: String
    secondDescription: String
    imageHeading: String
    productImages: [JSON!]
    faq: [JSON!]
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    seoSchema: String
    status: ContentStatus
  }

  type Query {
    productList(published: Boolean): [Product!]!
    productById(id: ID!): Product
    productByPath(path: String!): Product
    productsByCategory(categoryId: ID!): [Product!]!
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product
    updateProductById(id: ID!, input: UpdateProductInput!): Product
    removeProductById(id: ID!): GenericResponse
  }
`;
