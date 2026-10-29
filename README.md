# FixSwap - Appliance-as-a-Service (AaaS) & Rescue Logistics

FixSwap is an enterprise-grade platform designed for appliance repair and logistics. It optimizes the operational flow by integrating real-time proximity-based dispatching, technician management, and secure equipment handling.

## 🚀 Key Features
- **Proximity-Based Shop Discovery:** Enables customers to find repair shops and available loaner inventory within an 8km radius using PostGIS integration.
- **Rescue Logistics Dispatch:** End-to-end notification and dispatch workflow for partners to receive service requests, assign them to verified technicians, and manage status updates.
- **Secure Equipment Pickup:** Implementation of secure, OTP-based verification (e.g., OTP '1234') for equipment pickup and handoffs to ensure transactional security.
- **Partner Hub UI:** A comprehensive dashboard for shop owners to view technician rosters, assign jobs, and manage the dispatch sequence seamlessly.
- **Appliance-as-a-Service (AaaS):** Tracking of device states (available, loaned out, in maintenance, retired) and complex ticket life-cycles.

## 🛠 Tech Stack

### Backend
- **Java 21**
- **Spring Boot 4.x** (REST APIs, Validation)
- **Spring Data JPA / Hibernate 7**
- **PostgreSQL** (Advanced DB architecture leveraging Partitioning, JSONB, Triggers, Stored Procedures, Views, Row-Level Security, and PostGIS logic)

### Frontend
- **React 19**
- **Vite**
- **React Router**
- **Lucide React** (Icons)

## 📁 Project Structure
- `fixswap-backend/`: The Spring Boot RESTful API application.
- `fixswap-frontend/`: The Vite/React client application.
- `schema.sql`: The complete enterprise database architecture including 14 core tables, enums, triggers, and spatial logic.

## 🏃‍♂️ Getting Started

### Prerequisites
- Java 21
- Node.js & npm
- PostgreSQL database

### 1. Database Setup
Ensure PostgreSQL is running and initialize the schema using the provided file:
```bash
psql -U your_user -d fixswap -f schema.sql
```

### 2. Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd fixswap-backend
   ```
2. Start the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   The API will be accessible at `http://localhost:8080`.

### 3. Running the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd fixswap-frontend
   ```
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The UI will be accessible at `http://localhost:5173`.

## 🏗 Enterprise Database Architecture
The backend database is designed for scale and security:
- **Role Management:** Customer, Shop Owner, Admin, Rescue Worker
- **Geospatial Queries:** For 8km-radius shop mappings.
- **Financial Ledgers:** Integrated transactional records.
- **Service Tickets:** Granular states from `PENDING` to `COMPLETED` and `CANCELLED`.
