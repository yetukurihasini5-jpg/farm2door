# Farm2Door — Direct Farmer-to-Consumer Marketplace

[![Java](https://img.shields.io/badge/Java-21%20%7C%2024-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

> **Farm2Door** is a direct agricultural marketplace connecting local farmers directly with consumers. By eliminating predatory intermediaries, consumers enjoy fresh produce at reasonable prices, while farmers keep fair margins for their hard work.

---

## 🌟 Key Features

### 🛒 Consumer Experience
- **Interactive Produce Catalog**: Browse seasonal fruits, vegetables, dairy, grains, herbs, and spices with search, multi-category filtering, price sliders, and farmer details.
- **Produce Detail & Traceability**: High-resolution image galleries, origin farm background, freshness metrics, verified ratings, and harvest info.
- **Cart & Direct Order Flow**: Real-time cart calculations, multiple delivery address manager, and working **Cash on Delivery (COD)** checkout.
- **Full Order Lifecycle Tracking**: Visual order timeline from `PENDING` → `ACCEPTED` → `PROCESSING` → `READY_FOR_DISPATCH` → `DISPATCHED` → `DELIVERED`.
- **Verified Purchase Reviews**: Write 1-5 star reviews with feedback after produce delivery.

### 🚜 Farmer Portal
- **Harvest & Inventory Management**: Add produce listings with title, category, unit (KG, GRAM, PIECE, BUNCH, DOZEN, LITER), price per unit, stock quantity, and minimum order threshold.
- **Produce Image Upload**: Direct image file upload or URL linking.
- **Fulfillment Operations**: Receive incoming orders and transition status (`Accept`, `Start Processing`, `Pack`, `Dispatch`, `Confirm Delivery`).
- **Low Stock Inventory Alerts**: Instant warnings when produce stock dips below 5 units.
- **Farm Story & Profile**: Manage farm name, location, acreage, farming experience, and organic lineage.

### 🛡️ Admin Governance
- **Live Database Analytics**: Real platform totals (gross sales, order counts, registered farmers, active consumers).
- **User Management**: Inspect all accounts, toggle user activations, and verify authentic farmer profiles.
- **Catalog Moderation**: Audit produce listings and moderate availability (`ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`).
- **Produce Taxonomy**: Full CRUD management of catalog categories and slug indexing.
- **Financial Analytics & CSV Export**: Date-range filtered sales reports with one-click downloadable CSV export.

---

## 🏗️ Architecture & Technology Stack

```
farm2door/
├── backend/          # Java 21/24 + Spring Boot 3.3.4 (REST API & Business Logic)
├── frontend/         # React 18 + Vite + Tailwind CSS (SPA Client)
├── database/         # MySQL relational schemas, ER diagrams, setup scripts
└── docs/             # Technical architecture, API documentation, testing guides
```

### Backend:
- **Language & Runtime**: Java 21 / Java 24
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6 with JJWT (`0.12.6`) Bearer authentication
- **ORM & Data**: Spring Data JPA, Hibernate, MySQL Connector/J
- **Database Migrations**: Flyway (`V1__init_schema.sql`, `V2__seed_initial_data.sql`)
- **API Documentation**: SpringDoc OpenAPI 3 (`2.6.0`) & Swagger UI
- **Build Tool**: Apache Maven 3.9+

### Frontend:
- **Core**: React 18 (Hooks, Context API)
- **Tooling**: Vite 5.4
- **Styling**: Tailwind CSS 3.4, Lucide React icons
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with automatic JWT interceptors
- **Form Management**: React Hook Form
- **Unit Testing**: Vitest, React Testing Library, jsdom

### Database:
- **Engine**: MySQL 8.x
- **Schema**: 15 normalized tables with foreign keys, composite indexes, cascades, and timestamps.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Java**: JDK 21 or JDK 24 installed (`java -version`)
- **Node.js**: v18+ or v20+ / v24+ installed (`node -v`)
- **MySQL**: MySQL 8.x running on port `3306` (`mysql -u root -p`)
- **Maven**: Maven 3.8+ or bundled Maven wrapper

---

### 2. Database Setup

1. Start MySQL and run the database setup script:
```sql
CREATE DATABASE IF NOT EXISTS farm2door_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```
2. Verify credentials in `backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/farm2door_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: system
```
*(Flyway will automatically execute migrations and create all 15 tables with schema indices on first application boot).*

---

### 3. Backend Setup & Run

1. Navigate to the backend directory:
```bash
cd backend
```
2. Build and run the Spring Boot application:
```bash
mvn spring-boot:run
```
3. Backend starts at `http://localhost:8080`.
   - **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - **Health / Open API**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

### 4. Frontend Setup & Run

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```
4. Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Demo User Accounts

The database is pre-seeded with realistic test accounts. The login screen features **1-click quick credentials auto-fill buttons** for each role:

| Role | Email | Password | Pre-seeded Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@farm2door.com` | `admin123` | Platform Administrator with global control panel |
| **Farmer** | `raju.farmer@farm2door.com` | `farmer123` | Raju Patel — Patel Organic Green Acres |
| **Farmer** | `anita.farmer@farm2door.com` | `farmer123` | Anita Sharma — Himalayan Foothills Orchard |
| **Consumer** | `consumer@farm2door.com` | `consumer123` | Priya Sundaram — Consumer buyer with delivered order |
| **Consumer** | `rahul.consumer@farm2door.com` | `consumer123` | Rahul Kumar — Verified consumer buyer |

---

## 🧪 Running Automated Tests

### Backend Unit & Integration Tests:
```bash
cd backend
mvn clean test
```
*Executes all unit tests including `AuthServiceTest`, `OrderServiceTest`, `ProductServiceTest`, and `ReviewServiceTest` (11/11 tests pass).*

### Frontend Component Tests:
```bash
cd frontend
npm run test
```
*Executes Vitest suite for UI buttons, badges, loaders, and empty states.*

---

## 📁 Repository Structure

```
farm2door/
├── backend/
│   ├── src/main/java/com/farm2door/
│   │   ├── config/              # Security, OpenAPI, WebMvc configs
│   │   ├── controller/          # REST endpoints (Auth, Farmer, Admin, Orders, etc.)
│   │   ├── dto/                 # Request/Response Data Transfer Objects
│   │   ├── entity/              # JPA domain entities (User, Product, Order, etc.)
│   │   ├── enums/               # Business enums (Role, OrderStatus, ProductUnit)
│   │   ├── exception/           # Global exception handler & custom exceptions
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── security/            # JWT filters, TokenProvider, UserDetails
│   │   └── service/             # Transactional domain services & business rules
│   ├── src/main/resources/
│   │   ├── db/migration/        # Flyway SQL migrations (V1 schema, V2 categories)
│   │   └── application.yml      # Configuration profiles
│   └── pom.xml                  # Maven dependencies & build plugins
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components (Buttons, Badges, Modals)
│   │   ├── context/             # AuthContext, CartContext, ToastContext
│   │   ├── layouts/             # PublicLayout, FarmerLayout, ConsumerLayout, AdminLayout
│   │   ├── pages/               # Views (Catalog, Checkout, Farmer/Admin Dashboards)
│   │   ├── routes/              # AppRoutes with role-based Route Guards
│   │   ├── services/            # Axios API client modules
│   │   └── styles/              # Tailwind CSS styles & design tokens
│   ├── package.json             # NPM dependencies & scripts
│   └── vite.config.js           # Vite dev server & proxy to :8080
├── database/
│   ├── er-diagram.md            # Full Mermaid Entity-Relationship diagram
│   └── scripts/setup.sql        # Database initialization script
└── docs/
    ├── project-overview.md      # Comprehensive architecture & design system
    ├── api-documentation.md     # Complete REST API reference
    └── testing-guide.md         # Testing procedures & verification steps
```

---

## 📄 License
This project is licensed under the MIT License.
