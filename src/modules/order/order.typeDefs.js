import gql from "graphql-tag";

export const orderTypeDefs = gql`
  enum OrderStatus {
    PENDING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  enum PaymentMethod {
    COD
  }

  type Address {
    id: ID!
    fullName: String!
    phone: String!
    addressLine: String!
    city: String!
    area: String
    isDefault: Boolean!
    createdAt: DateTime!
  }

  type OrderItem {
    id: ID!
    productId: ID
    name: String!
    image: String
    price: Float!
    quantity: Int!
  }

  type Order {
    id: ID!
    orderNumber: String!
    trackingId: String!
    customerName: String!
    email: String!
    phone: String!
    addressLine: String!
    city: String!
    area: String
    note: String
    subtotal: Float!
    shippingFee: Float!
    total: Float!
    paymentMethod: PaymentMethod!
    status: OrderStatus!
    items: [OrderItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input AddressInput {
    fullName: String!
    phone: String!
    addressLine: String!
    city: String!
    area: String
    isDefault: Boolean
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input CreateOrderInput {
    # Delivery details (used for guests, or to override a saved address)
    customerName: String
    email: String!
    phone: String
    addressLine: String
    city: String
    area: String
    note: String
    # Logged-in customers may pass a saved address id instead of the fields above
    addressId: ID
    items: [OrderItemInput!]!
  }

  type Query {
    myAddresses: [Address!]!
    myOrders: [Order!]!
    orderByTracking(trackingId: String!): Order
    orderList(status: OrderStatus): [Order!]!
    orderById(id: ID!): Order
  }

  type Mutation {
    addAddress(input: AddressInput!): Address!
    updateAddress(id: ID!, input: AddressInput!): Address!
    deleteAddress(id: ID!): GenericResponse!
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  }
`;
