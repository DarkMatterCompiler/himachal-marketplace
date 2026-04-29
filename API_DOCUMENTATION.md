# Himachal Marketplace API Documentation

Base URL: `http://localhost:3000/api`

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Signup
**POST** `/users/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userType": "buyer",
  "phoneNumber": "9876543210"
}
```

**userType Options:** `buyer`, `seller`, `admin`

**Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "userType": "buyer",
    "phoneNumber": "9876543210",
    "createdAt": "2025-02-01T12:00:00.000Z"
  }
}
```

**Errors:**
- 400: Email already exists
- 500: Internal server error

---

### Login
**POST** `/users/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "userType": "buyer",
    "phoneNumber": "9876543210"
  }
}
```

**Errors:**
- 404: User not found
- 401: Invalid password
- 500: Internal server error

---

### Get Profile
**GET** `/users/profile`  
🔒 **Requires Authentication**

Get authenticated user's profile including seller profile if exists.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "userType": "seller",
    "phoneNumber": "9876543210",
    "createdAt": "2025-02-01T12:00:00.000Z",
    "seller": {
      "id": "seller-uuid",
      "locationVillage": "Manali",
      "sellerType": "artisan",
      "bio": "Traditional Himachali craftsperson",
      "verificationStatus": "verified"
    }
  }
}
```

---

## 🛍️ Products

### Get All Products
**GET** `/products`

Fetch products with optional filters.

**Query Parameters:**
- `category` (string) - Filter by category name (e.g., "Organic Skincare")
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `search` (string) - Search in name, description, tags

**Examples:**
```
GET /products?category=Organic%20Skincare
GET /products?minPrice=500&maxPrice=2000
GET /products?search=honey
```

**Response (200):**
```json
{
  "products": [
    {
      "id": "product-uuid",
      "name": "Himalayan Rose Serum",
      "description": "Organic rose serum from Himalayan roses",
      "basePrice": 899,
      "tags": "organic,skincare,natural",
      "createdAt": "2025-02-01T12:00:00.000Z",
      "category": {
        "categoryName": "Organic Skincare"
      },
      "seller": {
        "locationVillage": "Shimla",
        "sellerType": "cooperative",
        "user": {
          "email": "carol@seller.com"
        }
      },
      "variants": [
        {
          "id": "variant-uuid",
          "batchNumber": "ROSE-2025-001",
          "manufacturingDate": "2025-01-15T00:00:00.000Z",
          "expiryDate": "2026-01-15T00:00:00.000Z",
          "stockQuantity": 45,
          "isPerishable": true,
          "sku": "SKU-ROSE-001"
        }
      ],
      "inStock": true,
      "totalStock": 45,
      "currentBatch": {
        "id": "variant-uuid",
        "batchNumber": "ROSE-2025-001",
        "stockQuantity": 45
      }
    }
  ]
}
```

---

### Get Product by ID
**GET** `/products/:id`

Get detailed product information including all variants and authenticity timeline.

**Response (200):**
```json
{
  "product": {
    "id": "product-uuid",
    "name": "Himalayan Rose Serum",
    "description": "Organic rose serum...",
    "basePrice": 899,
    "tags": "organic,skincare,natural",
    "category": {
      "id": "category-uuid",
      "categoryName": "Organic Skincare",
      "commissionPercentage": 5,
      "fixedFee": 0
    },
    "seller": {
      "id": "seller-uuid",
      "locationVillage": "Shimla",
      "sellerType": "cooperative",
      "bio": "Organic skincare producer",
      "user": {
        "email": "carol@seller.com",
        "phoneNumber": "9876543210"
      }
    },
    "variants": [
      {
        "id": "variant-uuid",
        "batchNumber": "ROSE-2025-001",
        "manufacturingDate": "2025-01-15T00:00:00.000Z",
        "expiryDate": "2026-01-15T00:00:00.000Z",
        "stockQuantity": 45,
        "isPerishable": true,
        "sku": "SKU-ROSE-001",
        "authenticitySteps": [
          {
            "id": "step-uuid",
            "stepName": "Rose Harvest",
            "description": "Organic roses harvested at dawn",
            "imageUrl": "https://cloudinary.com/...",
            "timestamp": "2025-01-15T06:00:00.000Z",
            "locationLatLong": "31.1048,77.1734"
          },
          {
            "stepName": "Cold Processing",
            "description": "Cold-pressed extraction",
            "timestamp": "2025-01-15T10:00:00.000Z",
            "locationLatLong": "31.1048,77.1734"
          }
        ]
      }
    ],
    "inStock": true,
    "totalStock": 45,
    "currentBatch": { "batchNumber": "ROSE-2025-001" }
  }
}
```

**Errors:**
- 404: Product not found

---

### Create Product
**POST** `/products`  
🔒 **Requires Authentication + Seller Role**

Create a new product with initial variant and optional authenticity timeline.

**Request Body:**
```json
{
  "name": "Lavender Soap",
  "description": "Handmade lavender soap",
  "basePrice": 250,
  "categoryId": "category-uuid",
  "tags": "organic,soap,lavender",
  "batchNumber": "LAV-2025-001",
  "manufacturingDate": "2025-02-01",
  "expiryDate": "2026-02-01",
  "stockQuantity": 100,
  "isPerishable": true,
  "sku": "SKU-LAV-001",
  "authenticitySteps": [
    {
      "stepName": "Lavender Harvest",
      "description": "Harvested from organic farm",
      "imageUrl": "https://cloudinary.com/...",
      "timestamp": "2025-02-01T08:00:00Z",
      "locationLatLong": "31.1048,77.1734"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Product created successfully",
  "product": { /* product object */ },
  "variant": { /* variant object */ }
}
```

**Errors:**
- 404: Seller profile not found
- 404: Category not found
- 500: Internal server error

---

### Update Product Stock
**PATCH** `/products/:variantId/stock`  
🔒 **Requires Authentication + Seller Role**

Update stock quantity for a specific product variant. Only the seller who owns the product can update stock.

**URL Parameters:**
- `variantId` (string) - UUID of the product variant

**Request Body:**
```json
{
  "stockQuantity": 75
}
```

**Response (200):**
```json
{
  "message": "Stock updated successfully",
  "variant": {
    "id": "variant-uuid",
    "batchNumber": "ROSE-2025-001",
    "stockQuantity": 75,
    "updatedAt": "2025-02-01T14:30:00.000Z"
  }
}
```

**Errors:**
- 404: Product variant not found
- 403: Not authorized to update this product
- 500: Internal server error

---

## 🛒 Cart

All cart endpoints require authentication.

### Get Cart
**GET** `/cart`  
🔒 **Requires Authentication**

Fetch user's cart with product details and summary.

**Response (200):**
```json
{
  "cart": [
    {
      "id": "cart-item-uuid",
      "userId": "user-uuid",
      "productVariantId": "variant-uuid",
      "quantity": 2,
      "addedAt": "2025-02-01T10:00:00.000Z",
      "productVariant": {
        "id": "variant-uuid",
        "batchNumber": "ROSE-2025-001",
        "stockQuantity": 45,
        "product": {
          "id": "product-uuid",
          "name": "Himalayan Rose Serum",
          "basePrice": 899,
          "category": {
            "categoryName": "Organic Skincare"
          },
          "seller": {
            "locationVillage": "Shimla",
            "user": { "email": "carol@seller.com" }
          }
        }
      }
    }
  ],
  "summary": {
    "itemCount": 3,
    "totalItems": 5,
    "subtotal": 3500
  }
}
```

---

### Add to Cart
**POST** `/cart`  
🔒 **Requires Authentication**

Add a product variant to cart. If item already exists, quantity is incremented.

**Request Body:**
```json
{
  "productVariantId": "variant-uuid",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "message": "Item added to cart",
  "cartItem": {
    "id": "cart-item-uuid",
    "userId": "user-uuid",
    "productVariantId": "variant-uuid",
    "quantity": 2,
    "productVariant": {
      "product": {
        "name": "Himalayan Rose Serum",
        "basePrice": 899
      }
    }
  }
}
```

**Errors:**
- 400: Invalid product variant or quantity
- 404: Product variant not found
- 400: Insufficient stock (returns availableStock)
- 500: Internal server error

---

### Update Cart Item
**PATCH** `/cart/:id`  
🔒 **Requires Authentication**

Update quantity of an existing cart item.

**URL Parameters:**
- `id` (string) - UUID of the cart item

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "message": "Cart updated",
  "cartItem": { /* updated cart item */ }
}
```

**Errors:**
- 400: Quantity must be at least 1
- 404: Cart item not found
- 403: Not authorized
- 400: Insufficient stock
- 500: Internal server error

---

### Remove from Cart
**DELETE** `/cart/:id`  
🔒 **Requires Authentication**

Remove a specific item from cart.

**Response (200):**
```json
{
  "message": "Item removed from cart"
}
```

**Errors:**
- 404: Cart item not found
- 403: Not authorized

---

### Clear Cart
**DELETE** `/cart`  
🔒 **Requires Authentication**

Remove all items from cart.

**Response (200):**
```json
{
  "message": "Cart cleared"
}
```

---

## 📦 Orders

### Create Order
**POST** `/orders`  
🔒 **Requires Authentication**

Create order(s) from cart items. Automatically:
- Splits by seller (multi-seller support)
- Deducts stock using FIFO
- Creates shipment records
- Generates payout records with commission calculation
- Clears cart

**Request Body:**
```json
{
  "shippingAddressId": "address-uuid"
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "orders": [
    {
      "id": "order-uuid",
      "userId": "user-uuid",
      "shippingAddressId": "address-uuid",
      "totalAmount": 1798,
      "paymentMethod": "COD",
      "status": "PENDING_CONFIRMATION",
      "groupId": "group-uuid",
      "createdAt": "2025-02-01T12:00:00.000Z",
      "orderItems": [
        {
          "id": "item-uuid",
          "productVariantId": "variant-uuid",
          "quantity": 2,
          "priceAtPurchase": 899,
          "batchNumber": "ROSE-2025-001",
          "productVariant": {
            "product": {
              "name": "Himalayan Rose Serum"
            }
          }
        }
      ]
    }
  ],
  "groupId": "group-uuid"
}
```

**groupId:** Links orders from same cart (multiple sellers). `null` for single-seller orders.

**Errors:**
- 400: Shipping address is required
- 400: Cart is empty
- 404: Shipping address not found
- 500: Insufficient stock for {product} (Batch: {batchNumber})
- 500: Could not create order

---

### Get Orders
**GET** `/orders`  
🔒 **Requires Authentication**

Get authenticated user's order history.

**Response (200):**
```json
{
  "orders": [
    {
      "id": "order-uuid",
      "userId": "user-uuid",
      "totalAmount": 1798,
      "paymentMethod": "COD",
      "status": "DELIVERED",
      "groupId": null,
      "createdAt": "2025-02-01T12:00:00.000Z",
      "orderItems": [ /* items with product details */ ],
      "shippingAddress": {
        "addressLine1": "123 Main Street",
        "city": "Shimla",
        "state": "Himachal Pradesh",
        "pincode": "171001"
      },
      "shipment": {
        "id": "shipment-uuid",
        "status": "DELIVERED",
        "trackingNumber": "TRK123456789",
        "estimatedDelivery": "2025-02-08T00:00:00.000Z",
        "actualDelivery": "2025-02-07T14:30:00.000Z"
      }
    }
  ]
}
```

---

### Get Order by ID
**GET** `/orders/:id`  
🔒 **Requires Authentication**

Get detailed order information including authenticity timeline for all variants.

**Response (200):**
```json
{
  "order": {
    "id": "order-uuid",
    "userId": "user-uuid",
    "totalAmount": 1798,
    "paymentMethod": "COD",
    "status": "SHIPPED",
    "createdAt": "2025-02-01T12:00:00.000Z",
    "user": {
      "email": "alice@test.com",
      "phoneNumber": "9876543210"
    },
    "orderItems": [
      {
        "id": "item-uuid",
        "quantity": 2,
        "priceAtPurchase": 899,
        "batchNumber": "ROSE-2025-001",
        "productVariant": {
          "batchNumber": "ROSE-2025-001",
          "manufacturingDate": "2025-01-15T00:00:00.000Z",
          "expiryDate": "2026-01-15T00:00:00.000Z",
          "product": {
            "name": "Himalayan Rose Serum",
            "basePrice": 899,
            "category": {
              "categoryName": "Organic Skincare"
            },
            "seller": {
              "locationVillage": "Shimla",
              "user": {
                "email": "carol@seller.com",
                "phoneNumber": "9876543211"
              }
            }
          },
          "authenticitySteps": [
            {
              "stepName": "Rose Harvest",
              "description": "Organic roses harvested at dawn",
              "imageUrl": "https://cloudinary.com/...",
              "timestamp": "2025-01-15T06:00:00.000Z",
              "locationLatLong": "31.1048,77.1734"
            }
          ]
        }
      }
    ],
    "shippingAddress": { /* address details */ },
    "shipment": { /* shipment details */ }
  }
}
```

**Errors:**
- 404: Order not found
- 403: Not authorized

---

### Get Seller Orders
**GET** `/orders/seller/orders`  
🔒 **Requires Authentication + Seller Role**

Get all orders containing the authenticated seller's products.

**Response (200):**
```json
{
  "orders": [
    {
      "id": "order-uuid",
      "totalAmount": 1798,
      "status": "CONFIRMED",
      "createdAt": "2025-02-01T12:00:00.000Z",
      "user": {
        "email": "alice@test.com",
        "phoneNumber": "9876543210"
      },
      "orderItems": [
        /* Only items for this seller's products */
      ],
      "shippingAddress": { /* address */ },
      "shipment": { /* shipment */ }
    }
  ]
}
```

**Errors:**
- 404: Seller profile not found

---

### Update Order Status
**PATCH** `/orders/:id/status`  
🔒 **Requires Authentication + Seller Role**

Update order status. Seller can only update orders containing their products.

**Valid Status Values:**
- `PENDING_CONFIRMATION`
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED` (also updates shipment to IN_TRANSIT)
- `DELIVERED` (also updates shipment with actualDelivery)
- `CANCELLED`

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Response (200):**
```json
{
  "message": "Order status updated",
  "order": { /* updated order with shipment */ }
}
```

**Errors:**
- 400: Invalid status
- 404: Seller profile not found
- 404: Order not found
- 403: Not authorized to update this order
- 500: Internal server error

---

## 🏪 Sellers

### Create Seller Profile
**POST** `/sellers`  
🔒 **Requires Authentication**

Create a seller profile for the authenticated user.

**Request Body:**
```json
{
  "locationVillage": "Manali",
  "sellerType": "artisan",
  "bio": "Traditional Himachali craftsperson specializing in wooden artifacts",
  "verificationStatus": "pending"
}
```

**sellerType Options:** `artisan`, `farmer`, `cooperative`, `manufacturer`

**Response (201):**
```json
{
  "message": "Seller profile created successfully",
  "seller": {
    "id": "seller-uuid",
    "userId": "user-uuid",
    "locationVillage": "Manali",
    "sellerType": "artisan",
    "bio": "Traditional Himachali craftsperson...",
    "verificationStatus": "pending",
    "createdAt": "2025-02-01T12:00:00.000Z"
  }
}
```

---

### Get Seller Profile
**GET** `/sellers/:id`

Get public seller profile information.

**Response (200):**
```json
{
  "seller": {
    "id": "seller-uuid",
    "locationVillage": "Manali",
    "sellerType": "artisan",
    "bio": "Traditional Himachali craftsperson...",
    "verificationStatus": "verified",
    "user": {
      "email": "eve@seller.com"
    }
  }
}
```

---

## 📊 Commission Calculation Examples

### Example 1: Organic Skincare (5% commission, ₹0 fixed fee)
- Product: Himalayan Rose Serum
- Base Price: ₹899
- Quantity: 2
- Item Total: ₹1,798
- Commission: (1798 × 5 / 100) + 0 = **₹89.90**
- Net to Seller: ₹1,708.10

### Example 2: Traditional Textiles (7% commission, ₹50 fixed fee)
- Product: Handwoven Pashmina Shawl
- Base Price: ₹12,500
- Quantity: 1
- Item Total: ₹12,500
- Commission: (12500 × 7 / 100) + 50 = **₹925**
- Net to Seller: ₹11,575

### Example 3: Organic Food (3% commission, ₹0 fixed fee)
- Product: Wild Apple Honey
- Base Price: ₹750
- Quantity: 3
- Item Total: ₹2,250
- Commission: (2250 × 3 / 100) + 0 = **₹67.50**
- Net to Seller: ₹2,182.50

---

## 🔍 Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

---

## 🧪 Testing with Postman

### 1. Login to Get Token
```
POST http://localhost:3000/api/users/login
Body: { "email": "carol@seller.com", "password": "password123" }
```

### 2. Save Token
Copy the `token` from response and add to all subsequent requests:
```
Authorization: Bearer <paste-token-here>
```

### 3. Test Product Creation
```
POST http://localhost:3000/api/products
Headers: Authorization: Bearer <token>
Body: { ...product data... }
```

### 4. Test Order Flow
1. Add items to cart (POST /cart)
2. View cart (GET /cart)
3. Create order (POST /orders with shippingAddressId)
4. Check order status (GET /orders/:id)

---

**Last Updated:** February 1, 2025  
**API Version:** 1.0.0  
**Server:** Node.js + Express + Prisma ORM
