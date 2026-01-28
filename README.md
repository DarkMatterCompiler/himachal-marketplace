# 🏔️ Himachal Marketplace API

> A RESTful backend API connecting local Himachali farmers and artisans with global buyers. Empowering rural communities through digital commerce.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🧑‍🌾 **User Management** - Register as Buyer or Seller with secure authentication
- 🏪 **Seller Onboarding** - Complete profile with bank details and location
- 📦 **Product Catalog** - Polymorphic product system supporting various categories
- 🔍 **Advanced Filtering** - Filter products by category, organic status, attributes
- 🛒 **Order Processing** - Automated stock validation and price calculation
- 🔐 **Secure Authentication** - Password hashing with bcrypt

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js 5.x |
| **Database** | PostgreSQL |
| **ORM** | Prisma 5.x |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- ✅ **Node.js** v18 or higher ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** installed and running ([Download](https://www.postgresql.org/download/))
- ✅ **Git** ([Download](https://git-scm.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/himachal-marketplace.git

# Navigate to project directory
cd himachal-marketplace

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Database connection string
# Replace 'user' and 'password' with your PostgreSQL credentials
DATABASE_URL="postgresql://user:password@localhost:5432/himachal_db"
```

### Database Setup

```bash
# Run Prisma migrations to create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`

---

## 📖 API Reference

### Base URL

```
http://localhost:3000/api
```

### 👤 Users & Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/signup` | Register a new user (Buyer/Seller) |

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "userType": "Buyer"
}
```

### 🏪 Sellers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sellers/onboard` | Create seller profile with bank & location info |
| `GET` | `/api/sellers/:id` | Get seller details with user information |

### 📦 Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products with optional filters |
| `POST` | `/api/products` | Create a new product |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category (e.g., `Fruit`, `Handicraft`) |
| `isOrganic` | boolean | Filter organic products |
| `color` | string | Filter by color attribute |

**Create Product Body:**

```json
{
  "name": "Organic Apples",
  "category": "Fruit",
  "price": 150,
  "stock": 100,
  "attributes": {
    "isOrganic": true,
    "expiryDate": "2026-03-01"
  }
}
```

### 🛒 Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Place an order (validates stock & calculates total) |

---

## 📁 Project Structure

```
himachal-marketplace/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── sellerController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── sellerRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   └── db.js                  # Prisma client instance
├── server.js                  # Express server entry point
├── .env                       # Environment variables (not committed)
├── package.json               # Dependencies and scripts
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Made with ❤️ 
</p>
