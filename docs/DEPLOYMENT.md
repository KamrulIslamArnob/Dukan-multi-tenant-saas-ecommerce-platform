# Endpoint Reference

## Base URLs
- API: http://localhost:5001
- Media: http://localhost:5002
- Notification: http://localhost:5003

## Authentication Endpoints

### POST /api/auth/login
**Request:**
`json
{
  "email": "merchant@example.com",
  "password": "SecurePass123!"
}
`
**Response:**
`json
{
  "token": "eyJhbGci...",
  "refreshToken": "abc123...",
  "expiresAt": "2026-07-24T10:00:00Z"
}
`

## Product Endpoints

### GET /api/products
**Query Parameters:**
- page (int): Page number (default: 1)
- pageSize (int): Items per page (default: 20)
- categoryId (guid): Filter by category
- search (string): Search by name
- minPrice (decimal): Minimum price
- maxPrice (decimal): Maximum price

**Response:**
`json
{
  "items": [...],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20
}
`

## Order Endpoints

### POST /api/orders
**Request:**
`json
{
  "cartId": "guid",
  "shippingAddressId": "guid",
  "paymentMethod": "cod"
}
`
**Response:**
`json
{
  "orderNumber": "ORD-20260723-001",
  "totalAmount": 150.00,
  "status": "Pending"
}
`
"@ | Set-Content "docs/ENDPOINTS.md"

@"
# Deployment Guide

## Prerequisites
- Docker Desktop 4.0+
- .NET 10.0 SDK
- Node.js 22+
- PostgreSQL 16 (if running without Docker)

## Quick Start

1. Clone the repository
2. Start infrastructure:
   `ash
   cd backend
   docker compose up -d
   `
3. Run database migrations:
   `ash
   dotnet ef database update --project Dukaan.Infrastructure --startup-project Dukaan.Host
   `
4. Start backend APIs:
   `ash
   dotnet run --project Dukaan.Host
   dotnet run --project Dukaan.Media.Host
   dotnet run --project Dukaan.Notification.Host
   `
5. Install and start frontend:
   `ash
   cd frontend/dukaan-web
   npm install
   npm run dev
   `

## Environment Variables

### Dukaan API
- ConnectionStrings__DefaultConnection - PostgreSQL connection string
- Redis__ConnectionString - Redis connection string
- Jwt__Secret - JWT signing key
- Jwt__Issuer - Token issuer
- Jwt__Audience - Token audience

### Frontend
- NEXT_PUBLIC_API_URL - Backend API base URL
- NEXT_PUBLIC_MEDIA_URL - Media service URL

## Production Considerations
- Use proper TLS certificates
- Configure CORS origins appropriately
- Set up monitoring and alerting
- Use managed PostgreSQL and Redis
- Configure proper logging levels
- Set up CI/CD pipeline
