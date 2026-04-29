# Himachal Marketplace - Implementation Summary

## 🎯 Project Overview
Full-stack e-commerce platform for Himalayan artisans featuring supply-chain transparency, authenticity timeline tracking, and commission-based payouts.

## 🏗️ Architecture

### Backend (Node.js + Express + Prisma + PostgreSQL)
**Port:** 3000  
**Database:** himachal_db (PostgreSQL)

#### Schema (14 Tables)
1. **users** - Authentication with JWT, userType (buyer/seller/admin)
2. **addresses** - User shipping addresses
3. **sellers** - 1:1 with users, seller profiles with location
4. **categories** - Product categories with commission rules
5. **commission_rules** - Percentage + fixed fee per category
6. **products** - Base product info with basePrice
7. **product_variants** - Batch tracking (FIFO), manufacturing/expiry dates
8. **authenticity_timeline** - Supply chain steps with geolocation
9. **wishlist** - User saved products
10. **cart_items** - Persistent cart with product variants
11. **orders** - Multi-seller support with groupId
12. **order_items** - Line items with batch numbers
13. **shipments** - Auto-created with orders, tracking status
14. **payouts** - Auto-generated with commission deduction

#### API Endpoints

**Authentication:**
- POST /api/users/signup - Create account (email, password, userType)
- POST /api/users/login - Login (returns JWT token, 7-day expiry)
- GET /api/users/profile - Get authenticated user profile

**Products:**
- GET /api/products - Get all products (filters: category, minPrice, maxPrice, search)
- GET /api/products/:id - Get product with variants and authenticity timeline
- POST /api/products - Create product with variant (seller only)
- PATCH /api/products/:variantId/stock - Update stock (seller only)

**Cart:**
- GET /api/cart - Get user's cart with summary
- POST /api/cart - Add item to cart (productVariantId, quantity)
- PATCH /api/cart/:id - Update cart item quantity
- DELETE /api/cart/:id - Remove item from cart
- DELETE /api/cart - Clear entire cart

**Orders:**
- POST /api/orders - Create order from cart (shippingAddressId)
- GET /api/orders - Get user's order history
- GET /api/orders/:id - Get order details with authenticity timeline
- GET /api/orders/seller/orders - Get seller's orders (seller only)
- PATCH /api/orders/:id/status - Update order status (seller only)

**Sellers:**
- POST /api/sellers - Create seller profile
- GET /api/sellers/:id - Get seller profile

#### Key Features

**1. JWT Authentication**
- Token stored in localStorage
- Middleware: authenticateToken, requireSeller, requireAdmin, requireBuyer
- Auto-logout on 401 response

**2. FIFO Inventory Management**
- Product variants ordered by manufacturingDate ASC
- Oldest batch auto-selected for orders
- Stock deduction in transaction

**3. Multi-Seller Order Splitting**
- Cart items grouped by sellerId
- Separate Order created per seller
- groupId links related orders

**4. Commission Calculation**
- Category-based rules (percentage + fixed fee)
- Calculated per line item: `(basePrice × quantity × percentage / 100) + fixedFee`
- Examples: Organic Skincare 5%, Organic Food 3%, Traditional Textiles 7%+₹50

**5. Automatic Payout Generation**
- Created on order placement
- grossAmount - platformFeeDeducted = netPayable
- Status: PENDING → PAID (admin action)
- dueDate: 7 days after order

**6. Shipment Tracking**
- Auto-created with status PENDING_PICKUP
- Updated on order status changes (SHIPPED → IN_TRANSIT, DELIVERED)
- estimatedDelivery: 7 days from order

### Frontend (React 18 + Tailwind CSS + shadcn/ui)
**Port:** 4000 (172.16.23.150:4000)  
**Design System:** 46+ Radix UI components, dual-theme support

#### Pages
- **LandingPage** - Hero, categories, featured products
- **ProductsPage** - Grid view, filters (category, search, sort), loading states
- **ProductDetailPage** - Product details, variant selection, authenticity timeline

#### Components
- **Navbar** - Navigation with auth state
- **ProductCard** - Product display with hover effects
- **UI Components** - Button, Card, Badge, Input, Dialog, etc.

#### Context Providers
- **ThemeContext** - Dark/light mode with localStorage
- **AuthContext** - User state, login/signup/logout methods

#### API Service Layer (src/services/api.js)
- Axios instance with base URL
- Request interceptor: Add Bearer token
- Response interceptor: Handle 401 (auto-logout)
- Organized APIs: authAPI, productAPI, cartAPI, orderAPI, sellerAPI

## 📦 Seed Data

**Users:** 6 accounts
- 2 buyers (alice@test.com, bob@test.com)
- 3 sellers (carol@seller.com, david@seller.com, eve@seller.com)
- 1 admin (admin@marketplace.com)
- All passwords: `password123`

**Products:** 5 items
1. Himalayan Rose Serum (₹899) - Organic Skincare
2. Wild Apple Honey (₹750) - Organic Food
3. Handwoven Pashmina Shawl (₹12,500) - Traditional Textiles
4. Lavender Essential Oil (₹1,200) - Organic Skincare
5. Carved Wooden Bowl (₹2,500) - Artisan Crafts

**Authenticity Timeline:** 15+ supply chain steps
- Farm harvest → Processing → Quality check → Packaging → Warehouse → Delivery
- Real geolocations (Shimla, Kullu, Manali, Dharamshala)

## 🔐 Environment Variables

**Backend (.env):**
```
DATABASE_URL="postgresql://username:password@localhost:5432/himachal_db"
JWT_SECRET="your-secret-key-here"
```

**Frontend (.env):**
```
HOST=172.16.23.150
PORT=4000
REACT_APP_API_URL=http://localhost:3000/api
```

## 🚀 Running the Application

**Backend:**
```bash
cd d:\aaa\istp\himachal-marketplace
npm install
npx prisma migrate dev
npx prisma db seed
node server.js
```

**Frontend:**
```bash
cd d:\aaa\istp\himachal-marketplace\frontend
npm install
npm start
```

**Access:**
- Frontend: http://172.16.23.150:4000
- Backend API: http://localhost:3000/api

## 📝 Implementation Status

### ✅ Completed
- [x] Complete 14-table Prisma schema with relationships
- [x] Database migration and seed script
- [x] JWT authentication system (signup, login, profile)
- [x] Auth middleware (role-based access control)
- [x] Product CRUD with FIFO variant selection
- [x] Cart system with database persistence
- [x] Order creation with multi-seller splitting
- [x] Automatic shipment and payout generation
- [x] Commission calculation per category
- [x] Frontend API service layer with axios
- [x] AuthContext for global auth state
- [x] ProductsPage with API integration
- [x] ProductCard updated for API data structure
- [x] Both servers running successfully

### 🔄 Next Steps (Future Enhancements)
- [ ] Create Login/Signup UI components
- [ ] Cart page with add/remove functionality
- [ ] Checkout flow with address selection
- [ ] Order history page with tracking
- [ ] Seller dashboard (orders, products, payouts)
- [ ] Admin panel (payout management)
- [ ] Product detail page with variant selection
- [ ] Authenticity timeline visualization
- [ ] Review system (post-delivery)
- [ ] Image upload integration (Cloudinary)

## 🎨 Design Highlights
- Dual-theme support (light/dark mode)
- Smooth animations with Framer Motion
- Glass morphism UI effects
- Responsive grid layouts
- Loading states with spinner
- Toast notifications for feedback

## 🔧 Technical Decisions

**Why FIFO Inventory?**
- Perishable goods require oldest-first rotation
- Prevents expired stock accumulation
- Critical for food and skincare products

**Why Multi-Seller Orders?**
- Simplifies seller fulfillment (each handles own order)
- Clear payout calculation per seller
- Shipment tracking per seller

**Why JWT over Session?**
- Stateless authentication
- Works with mobile apps
- Easy token refresh pattern

**Why Prisma ORM?**
- Type-safe database queries
- Automatic migration generation
- Excellent PostgreSQL support

## 📚 API Testing with Postman

**Sample Login Request:**
```json
POST http://localhost:3000/api/users/login
{
  "email": "carol@seller.com",
  "password": "password123"
}
```

**Sample Product Fetch:**
```
GET http://localhost:3000/api/products?category=Organic%20Skincare
Authorization: Bearer <token>
```

**Sample Order Creation:**
```json
POST http://localhost:3000/api/orders
Authorization: Bearer <token>
{
  "shippingAddressId": "address-uuid-here"
}
```

---

## 🎓 Learning Resources
- Prisma Docs: https://www.prisma.io/docs
- JWT.io: https://jwt.io
- React Router: https://reactrouter.com
- shadcn/ui: https://ui.shadcn.com
- Framer Motion: https://www.framer.com/motion

---

**Project Status:** Backend API fully functional, Frontend integrated with API calls, ready for UI enhancements and feature additions.
