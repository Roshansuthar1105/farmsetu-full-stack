# Farmsetu API Documentation

All API responses follow a unified response structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {} // Can be an object, list, or null
}
```

## Authentication APIs

| Endpoint | Method | Description | Payload |
|----------|--------|-------------|---------|
| `/api/auth/register` | `POST` | Register a new user | `{ "name", "phone", "password", ... }` |
| `/api/auth/login` | `POST` | Login user | `{ "phone", "password" }` |
| `/api/auth/verify-otp` | `POST` | Verify OTP | `{ "phone", "otp" }` |

## User Profile APIs

| Endpoint | Method | Description | Payload |
|----------|--------|-------------|---------|
| `/api/users/me` | `GET` | Get current user profile | - |
| `/api/users/me` | `PUT` | Update user profile | `{ "name", "bio", ... }` |
| `/api/users/me/badges` | `GET` | Get user badges | - |

## Admin Dashboard APIs

| Endpoint | Method | Description | Payload |
|----------|--------|-------------|---------|
| `/api/admin/dashboard` | `GET` | Get total stats (users, orders, posts) | - |
| `/api/admin/users` | `GET` | List all users (paginated: `?page=0&size=10`) | - |
| `/api/admin/users/{id}` | `PUT` | Update user details | `{ "active": true, "role": "FARMER" }` |
| `/api/admin/products` | `GET` | List all products | - |
| `/api/admin/orders` | `GET` | List all orders | - |
| `/api/admin/crops` | `GET` | List all crops | - |

## Marketplace APIs

| Endpoint | Method | Description | Payload |
|----------|--------|-------------|---------|
| `/api/marketplace/products` | `GET` | List active products | - |
| `/api/marketplace/products` | `POST` | Create a new product | `{ "title", "price", "quantity", ... }` |
| `/api/marketplace/products/{id}` | `GET` | Get product details | - |
| `/api/marketplace/products/{id}/bids` | `POST` | Place a bid on a product | `{ "amount" }` |
| `/api/marketplace/orders` | `POST` | Create an order for a product | `{ "productId", "quantity", "deliveryAddress" }` |

## Community APIs

| Endpoint | Method | Description | Payload |
|----------|--------|-------------|---------|
| `/api/community/posts` | `GET` | List posts | - |
| `/api/community/posts` | `POST` | Create a new post | `{ "title", "content", "category" }` |
| `/api/community/posts/{id}/comments` | `POST` | Add a comment to a post | `{ "text" }` |

## Information APIs (Govt Schemes, Mandi, Weather, etc.)

| Endpoint | Method | Description | Payload |
|----------|--------|-------------|---------|
| `/api/schemes` | `GET` | List Govt Schemes | - |
| `/api/mandis` | `GET` | List Mandis | - |
| `/api/news` | `GET` | List Agriculture News | - |
| `/api/weather` | `GET` | Get weather for lat/lon | `?lat=x&lon=y` |
