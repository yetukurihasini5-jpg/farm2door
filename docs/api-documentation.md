# Farm2Door — REST API Specification
## OpenAPI 3.0 Endpoints Reference

Base URL: `http://localhost:8080/api`  
Swagger UI Interactive Documentation: `http://localhost:8080/swagger-ui.html`  
OpenAPI JSON Spec: `http://localhost:8080/v3/api-docs`

---

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new `ROLE_CONSUMER` or `ROLE_FARMER` account. |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return JWT bearer token. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve currently authenticated user profile and roles. |

#### Sample Request: `POST /api/auth/login`
```json
{
  "email": "consumer@farm2door.com",
  "password": "Password123!"
}
```

#### Sample Response:
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "id": 4,
    "email": "consumer@farm2door.com",
    "fullName": "Sita Devi",
    "role": "ROLE_CONSUMER"
  }
}
```

---

### 2. Marketplace Products (`/api/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Filtered & paginated produce catalog (by `search`, `category`, `farmerId`, `minPrice`, `maxPrice`, `sort`). |
| `GET` | `/api/products/featured` | Public | Featured top-harvest produce listings. |
| `GET` | `/api/products/{id}` | Public | Detailed produce record with category, farmer bio, and verified reviews. |

---

### 3. Categories (`/api/categories`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all active product categories with slug and image. |
| `GET` | `/api/categories/{id}` | Public | Category details by ID. |
| `GET` | `/api/categories/slug/{slug}` | Public | Category details by URL slug. |

---

### 4. Consumer Cart (`/api/cart`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | `ROLE_CONSUMER` | Get current user's active shopping cart and item breakdown. |
| `POST` | `/api/cart/items` | `ROLE_CONSUMER` | Add produce item with desired quantity to cart. |
| `PUT` | `/api/cart/items/{itemId}` | `ROLE_CONSUMER` | Update quantity of existing cart item. |
| `DELETE` | `/api/cart/items/{itemId}` | `ROLE_CONSUMER` | Remove specific item from cart. |
| `DELETE` | `/api/cart` | `ROLE_CONSUMER` | Clear all items from active cart. |

---

### 5. Orders & Fulfillment (`/api/orders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | `ROLE_CONSUMER` | Create new Cash on Delivery order from cart items. |
| `GET` | `/api/orders` | `ROLE_CONSUMER` | Retrieve order history with status timeline for logged-in consumer. |
| `GET` | `/api/orders/{id}` | Authenticated | Retrieve single order details (ownership or producer enforced). |
| `PUT` | `/api/orders/{id}/cancel` | `ROLE_CONSUMER` | Cancel order before dispatch and restore item inventory. |

#### Sample Request: `POST /api/orders`
```json
{
  "addressId": 1,
  "paymentMethod": "CASH_ON_DELIVERY",
  "customerNotes": "Please deliver in the morning"
}
```

---

### 6. Farmer Portal (`/api/farmer`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/farmer/dashboard` | `ROLE_FARMER` | Retrieve revenue, incoming orders, and low-stock alerts. |
| `GET` | `/api/farmer/profile` | `ROLE_FARMER` | Get farm details, verification badge, and biography. |
| `PUT` | `/api/farmer/profile` | `ROLE_FARMER` | Update farm name, location, acreage, and story. |
| `GET` | `/api/farmer/products` | `ROLE_FARMER` | Paginated listing of produce managed by this farmer. |
| `POST` | `/api/farmer/products` | `ROLE_FARMER` | Create new produce listing with price and unit stock. |
| `PUT` | `/api/farmer/products/{id}` | `ROLE_FARMER` | Update existing produce listing. |
| `DELETE` | `/api/farmer/products/{id}` | `ROLE_FARMER` | Soft-deactivate produce listing. |
| `PUT` | `/api/farmer/products/{id}/toggle-status` | `ROLE_FARMER` | Toggle status between `ACTIVE` and `INACTIVE`. |
| `GET` | `/api/farmer/orders` | `ROLE_FARMER` | Incoming customer orders containing farmer items. |
| `PUT` | `/api/farmer/orders/{id}/status` | `ROLE_FARMER` | Advance order status (`ACCEPTED`, `PROCESSING`, `READY_FOR_DISPATCH`, etc.). |

---

### 7. Reviews & Ratings (`/api/reviews`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews/product/{productId}` | Public | Paginated verified reviews for a produce item. |
| `POST` | `/api/reviews` | `ROLE_CONSUMER` | Create verified purchase review with rating 1-5 and comment. |

---

### 8. Admin Control (`/api/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | `ROLE_ADMIN` | Platform-wide KPIs from real database aggregates. |
| `GET` | `/api/admin/users` | `ROLE_ADMIN` | List users with role filter and pagination. |
| `PUT` | `/api/admin/users/{id}/toggle-activation` | `ROLE_ADMIN` | Toggle user active/deactivated status. |
| `PUT` | `/api/admin/farmers/{id}/toggle-verification` | `ROLE_ADMIN` | Toggle farmer verification badge. |
| `GET` | `/api/admin/categories` | `ROLE_ADMIN` | Get all categories for administration. |
| `POST` | `/api/admin/categories` | `ROLE_ADMIN` | Create a new produce taxonomy category. |
| `PUT` | `/api/admin/categories/{id}` | `ROLE_ADMIN` | Update produce category. |
| `PUT` | `/api/admin/products/{id}/status` | `ROLE_ADMIN` | Moderate product status (`ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`). |
| `GET` | `/api/admin/orders` | `ROLE_ADMIN` | Inspect all platform transactions. |
| `GET` | `/api/admin/reports/sales` | `ROLE_ADMIN` | Filtered sales report with revenue and top products. |
| `GET` | `/api/admin/reports/export-csv` | `ROLE_ADMIN` | Downloadable CSV report of platform orders. |

---

### 9. File Uploads (`/api/uploads`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/uploads/image` | Authenticated | Upload JPG, PNG, or WEBP produce image (max 5MB). |
| `GET` | `/api/uploads/{fileName}` | Public | Serve stored image file. |
