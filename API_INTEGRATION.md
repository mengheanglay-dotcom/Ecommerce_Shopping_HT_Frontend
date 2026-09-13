# SHOP Frontend API Integration

Backend base URL: `https://pitipiw.online/api`

## Customer endpoints used
- GET `/products`
- GET `/products/{id}`
- GET `/categories`
- GET `/brands`
- POST `/login`
- POST `/register`
- POST `/logout`
- GET `/me`
- PUT `/me`
- GET `/cart`
- POST `/cart/items`
- PUT ` /cart/items/{id}`
- DELETE `/cart/items/{id}`
- DELETE `/cart`
- GET `/wishlist`
- POST `/wishlist/{productId}`
- DELETE `/wishlist/{productId}`
- POST `/orders`
- GET `/orders`
- GET `/orders/{id}`

## Admin endpoints used
- GET `/admin/user`
- PUT `/admin/user`
- GET `/admin/dashboard`
- GET `/admin/orders`
- GET `/admin/orders/{id}`
- PATCH `/admin/orders/{id}/status`
- GET `/admin/customers`
- GET `/admin/customers/{id}`
- DELETE `/admin/customers/{id}`
- POST/PUT/DELETE `/categories`
- POST/PUT/DELETE `/brands`

## Important
The frontend now sends the API requests, but the exact endpoint names and JSON field names must match the Laravel backend. The existing products/categories/brands endpoints were already verified from the frontend project. Cart, auth, order, profile, and admin endpoints are wired using the conventional routes above.
