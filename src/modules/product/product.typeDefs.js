import gql from "graphql-tag";

export const productTypeDefs = gql`
  type Product {
    id: ID!
    categoryId: ID!
    subcategoryId: ID
    name: String!
    description: String!
    breadcrumb: String!
    path: String!
    price: Float!
    discountPrice: Float
    stock: Int!
    posterImage: JSON
    productImages: [JSON!]
    additionalInformation: [JSON!]
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    seoSchema: String
    lastEditedBy: String!
    status: ContentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    category: Category
    subcategory: Subcategory
  }

  input CreateProductInput {
    categoryId: ID!
    subcategoryId: ID
    name: String!
    description: String!
    breadcrumb: String!
    path: String
    price: Float!
    discountPrice: Float
    stock: Int
    posterImage: JSON
    productImages: [JSON!]
    additionalInformation: [JSON!]
    metaTitle: String
    metaDescription: String
    canonicalUrl: String
    seoSchema: String
    status: ContentStatus
  }

  input UpdateProductInput {
    categoryId: ID
    subcategoryId: ID
    name: String
    description: String
    breadcrumb: String
    path: String
    price: Float
    discountPrice: Float
    stock: Int
    posterImage: JSON
    productImages: [JSON!]
    additionalInformation: [JSON!]
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
    productsBySubcategory(subcategoryId: ID!): [Product!]!
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product
    updateProductById(id: ID!, input: UpdateProductInput!): Product
    removeProductById(id: ID!): GenericResponse
  }
`;
