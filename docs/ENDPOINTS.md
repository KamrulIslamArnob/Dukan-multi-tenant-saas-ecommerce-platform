# Endpoint Reference

## Base URLs
- API: `http://localhost:5001`
- Media: `http://localhost:5002`
- Notification: `http://localhost:5003`

## Authentication Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "email": "merchant@example.com",
  "password": "SecurePass123!"
}
```
**Response:**
```json
{
  "token": "eyJhbGci...",
  "refreshToken": "abc123...",
  "expiresAt": "2026-07-24T10:00:00Z"
}
```

## Product Endpoints

### GET /api/products
**Query Parameters:**
- `page` (int): Page number (default: 1)
- `pageSize` (int): Items per page (default: 20)
- `categoryId` (guid): Filter by category
- `search` (string): Search by name
- `minPrice` (decimal): Minimum price
- `maxPrice` (decimal): Maximum price

**Response:**
```json
{
  "items": [...],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20
}
```

## Order Endpoints

### POST /api/orders
**Request:**
```json
{
  "cartId": "guid",
  "shippingAddressId": "guid",
  "paymentMethod": "cod"
}
```
**Response:**
```json
{
  "orderNumber": "ORD-20260723-001",
  "totalAmount": 150.00,
  "status": "Pending"
}
```

