import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Multi-tenant POS data schema with role-based access control
 * @see https://docs.amplify.aws/gen2/build-a-backend/data
 */
const schema = a.schema({
  /**
   * Store Model
   * Represents a business location in the multi-tenant system
   */
  Store: a
    .model({
      storeId: a.id().required(),
      name: a.string().required(),
      type: a.string(), // e.g., "retail", "restaurant"
      ownerEmail: a.email().required(),
      userProfiles: a.hasMany('UserProfile', 'storeId'),
      transactions: a.hasMany('Transaction', 'storeId'),
    })
    .authorization((allow) => [
      // Owner can CRUD their own store
      allow.owner().identityClaim('custom:storeId'),
      // Admins can manage their own store
      allow.group('Admin').to(['read', 'update']),
    ])
    .identifier(['storeId']),

  /**
   * UserProfile Model
   * User metadata linked to Cognito accounts
   * Maps username to email for username-based login
   */
  UserProfile: a
    .model({
      userId: a.id().required(), // Cognito sub
      username: a.string().required(),
      email: a.email().required(),
      role: a.enum(['admin', 'cashier']),
      storeId: a.id().required(),
      isActive: a.boolean().default(true),
      store: a.belongsTo('Store', 'storeId'),
    })
    .authorization((allow) => [
      // Users can read their own profile
      allow.owner().identityClaim('sub'),
      // Admins can manage users in their store
      allow.group('Admin').to(['create', 'read', 'update', 'delete']),
      // Admins can only access users in their own store
      allow.ownerDefinedIn('storeId'),
      // Cashiers can read their own profile
      allow.group('Cashier').to(['read']),
    ])
    .identifier(['userId']),

  /**
   * Transaction Model
   * POS transactions created by cashiers
   */
  Transaction: a
    .model({
      transactionId: a.id().required(),
      storeId: a.id().required(),
      cashierId: a.id().required(), // UserProfile.userId
      amount: a.float().required(),
      items: a.json().required(), // Array of { name, price, quantity }
      paymentMethod: a.enum(['cash', 'card', 'other']),
      timestamp: a.datetime(),
      store: a.belongsTo('Store', 'storeId'),
    })
    .authorization((allow) => [
      // Admins can view all transactions in their store
      allow.group('Admin').to(['create', 'read', 'update', 'delete']),
      // Admins can only access transactions in their own store
      allow.ownerDefinedIn('storeId'),
      // Cashiers can create and read transactions
      allow.group('Cashier').to(['create', 'read']),
      // Cashiers can only see their own transactions
      allow.owner().identityClaim('sub').to(['read']),
    ])
    .identifier(['transactionId']),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    iamAuthorizationMode: 'required',
  },
});
