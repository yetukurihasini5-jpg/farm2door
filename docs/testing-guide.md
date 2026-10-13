# Farm2Door — Testing Guide & Verification Procedures

---

### 1. Test Strategy Overview

Farm2Door utilizes a multi-tiered automated and manual verification strategy:
1. **Backend Unit & Service Tests**: JUnit 5, Mockito, AssertJ. Validates authentication token generation, transactional order creation with inventory deduction, cancellation inventory restoration, review constraints, and role permissions.
2. **Frontend Component & Integration Tests**: Vitest, React Testing Library, jsdom. Validates component rendering, order badge color states, loading spinners, empty states, and modal interactions.
3. **End-to-End Scenario Testing**: Validates end-to-end user workflows from user registration, browsing catalog, cart manipulation, COD order placement, farmer status advancement, and consumer delivery confirmation.

---

### 2. Backend Automated Tests

To execute the backend test suite:
```bash
cd backend
mvn clean test
```

*(Note for JDK 24+: The project is pre-configured with ByteBuddy 1.15.11 and Lombok 1.18.48, and Maven Surefire passes `-XX:+EnableDynamicAgentLoading` to allow Mockito dynamic agent loading).*

#### Covered Test Cases:
- **`AuthServiceTest`**:
  - `login_Success`: Authenticates valid credentials, generates valid JWT, returns user info.
  - `login_InvalidCredentials`: Throws `BadCredentialsException` on wrong password.
  - `register_Consumer_Success`: Creates new consumer account with hashed password and initial consumer profile.
  - `register_Farmer_Success`: Creates farmer account with dedicated farmer profile.
  - `register_EmailAlreadyExists`: Throws `ApiException` with HTTP 400 when registering duplicate email.
- **`OrderServiceTest`**:
  - `createOrder_Success_DeductsInventory`: Atomically decreases stock when order is placed.
  - `createOrder_InsufficientStock_ThrowsException`: Fails transaction if quantity exceeds available stock.
  - `cancelOrder_RestoresInventory`: Successfully restores stock quantities to active product when cancelled.
  - `updateOrderStatus_ValidTransition`: Advances order through lifecycle (`ACCEPTED` → `PROCESSING`).
- **`ProductServiceTest`**:
  - `createProduct_Success`: Successfully attaches product listing to authenticated farmer.
  - `toggleProductStatus_Success`: Flips `ACTIVE` to `INACTIVE`.
- **`ReviewServiceTest`**:
  - `createReview_VerifiedPurchase`: Permits review creation only after order is `DELIVERED`.

---

### 3. Frontend Automated Tests

To execute the frontend unit test suite:
```bash
cd frontend
npm run test
```

#### Covered Test Cases:
- **`Button.test.jsx`**: Verifies button rendering, variant styles, loading spinner state, and click handlers.
- **`OrderStatusBadge.test.jsx`**: Verifies dynamic colors and labels across `PENDING`, `ACCEPTED`, `PROCESSING`, `READY_FOR_DISPATCH`, `DISPATCHED`, `DELIVERED`, `CANCELLED`, and `REJECTED`.
- **`LoadingSpinner.test.jsx`**: Verifies rendering and accessible animated loading indicators.
- **`EmptyState.test.jsx`**: Verifies empty catalog and empty orders display.

---

### 4. Manual End-to-End Verification Scenarios

Use the pre-seeded demo accounts below to execute the end-to-end test scenarios:

#### Demo User Credentials:
| Role | Email | Password | Pre-seeded Context |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@farm2door.com` | `Admin123!` | Platform super-user |
| **Farmer (Raju)** | `raju.farmer@farm2door.com` | `Farmer123!` | Green Valley Organic Farm |
| **Farmer (Anita)** | `anita.farmer@farm2door.com` | `Farmer123!` | Sunrise Heritage Orchards |
| **Consumer (Sita)** | `consumer@farm2door.com` | `Consumer123!` | Regular buyer with pre-saved address |
| **Consumer (Rahul)**| `rahul.consumer@farm2door.com` | `Consumer123!` | Regular buyer |

#### Step-by-Step E2E Test Workflow:
1. **Catalog Browsing**:
   - Open `http://localhost:5173/products`
   - Filter by "Vegetables" or "Fruits".
   - Search for "Alphonso" or "Tomatoes".
   - Click a produce card to view the detailed description, producer farm details, and ratings.
2. **Cart & Checkout**:
   - Click **Add to Cart**.
   - Navigate to `/cart`, adjust quantities.
   - Click **Proceed to Checkout**, select or create delivery address.
   - Choose **Cash on Delivery (COD)** and click **Place Order**.
   - Verify stock in database decreases atomically.
3. **Farmer Order Fulfillment**:
   - Log out, log in as `raju.farmer@farm2door.com`.
   - Go to `/farmer/orders`.
   - Locate the new order under **Pending**.
   - Click **Accept Order** (`ACCEPTED`).
   - Click **Start Processing** (`PROCESSING`).
   - Click **Mark Ready for Dispatch** (`READY_FOR_DISPATCH`).
   - Click **Dispatch Produce** (`DISPATCHED`).
   - Click **Confirm Delivered & Paid (COD)** (`DELIVERED`).
4. **Consumer Review**:
   - Log in as the purchasing consumer.
   - Navigate to `/consumer/orders`.
   - Order status reflects **DELIVERED**.
   - Click **Write a Review**, rate 5 stars with comment.
   - Review instantly appears under the product page as a verified purchase review.
5. **Admin Reporting**:
   - Log in as `admin@farm2door.com`.
   - Open `/admin/dashboard` to see updated gross revenue and order counts.
   - Open `/admin/reports` to inspect the breakdown and click **Export Orders to CSV**.
