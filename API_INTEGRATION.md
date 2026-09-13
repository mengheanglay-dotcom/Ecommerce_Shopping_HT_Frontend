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
- POST `/checkout`
- GET `/orders`
- GET `/orders/{id}`

## Admin endpoints used
- GET/POST/PUT/DELETE `/admin/users`
- GET `/admin/dashboard`
- GET `/admin/orders`
- GET `/admin/orders/{id}`
- PUT `/admin/orders/{id}/status`
- PUT `/admin/orders/{id}/payment-status`
- GET `/admin/categories`
- GET `/admin/brands`
- GET `/admin/sizes`
- GET `/admin/colors`
- POST/PUT/DELETE `/admin/categories`
- POST/PUT/DELETE `/admin/brands`
- POST/PUT/DELETE `/admin/sizes`
- POST/PUT/DELETE `/admin/colors`
- POST/PUT/DELETE `/admin/products`
- POST/PUT/DELETE `/admin/product-variants`

## Important
The frontend now sends the API requests, but the exact endpoint names and JSON field names must match the Laravel backend. The existing products/categories/brands endpoints were already verified from the frontend project. Cart, auth, order, profile, and admin endpoints are wired using the conventional routes above.
