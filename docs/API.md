# Dukaan API Documentation

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
`
Authorization: Bearer <jwt_token>
`

## Endpoints

### Auth
- POST /api/auth/login - Merchant login
- POST /api/auth/customer/login - Customer login
- POST /api/auth/refresh - Refresh JWT token

### Products
- GET /api/products - List products (paginated)
- GET /api/products/{id} - Get product by ID
- POST /api/products - Create product (merchant)
- PUT /api/products/{id} - Update product (merchant)
- DELETE /api/products/{id} - Delete product (merchant)

### Categories
- GET /api/categories - List categories
- GET /api/categories/{id} - Get category by ID
- POST /api/categories - Create category (merchant)
- PUT /api/categories/{id} - Update category (merchant)
- DELETE /api/categories/{id} - Delete category (merchant)

### Cart
- GET /api/cart - Get customer cart
- POST /api/cart/items - Add item to cart
- PUT /api/cart/items/{id} - Update item quantity
- DELETE /api/cart/items/{id} - Remove item from cart
- DELETE /api/cart - Clear cart

### Orders
- POST /api/orders - Place order
- GET /api/orders - Get customer orders
- GET /api/orders/{id} - Get order details
- PUT /api/orders/{id}/status - Update order status (merchant)

### Admin
- GET /api/admin/stats - Platform statistics
- GET /api/admin/tenants - List tenants
- POST /api/admin/tenants - Create tenant
- GET /api/admin/merchants - List merchants
- GET /api/admin/customers - List customers

### Storefront
- GET /api/storefront/{slug} - Get storefront by tenant slug
- GET /api/storefront/{slug}/products - Get storefront products
