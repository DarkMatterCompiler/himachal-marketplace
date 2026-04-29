// src/controllers/productController.js
import prisma from '../db.js';

// Get all products with their variants
export const getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, search } = req.query;

  try {
    const where = {};

    if (category) {
      where.category = { categoryName: category };
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { categoryName: true } },
        seller: {
          select: {
            locationVillage: true,
            sellerType: true,
            user: { select: { email: true } },
          },
        },
        variants: {
          where: { stockQuantity: { gt: 0 } },
          orderBy: { manufacturingDate: 'asc' }, // FIFO - oldest first
          select: {
            id: true,
            batchNumber: true,
            manufacturingDate: true,
            expiryDate: true,
            stockQuantity: true,
            isPerishable: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add additional info for each product
    const productsWithInfo = products.map((product) => ({
      ...product,
      inStock: product.variants.length > 0,
      totalStock: product.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
      currentBatch: product.variants[0] || null, // FIFO - first available batch
    }));

    res.json({ products: productsWithInfo });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Could not fetch products' });
  }
};

// Get single product with full details including authenticity timeline
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          include: {
            user: { select: { email: true, phoneNumber: true } },
          },
        },
        variants: {
          where: { stockQuantity: { gt: 0 } },
          orderBy: { manufacturingDate: 'asc' },
          include: {
            authenticitySteps: {
              orderBy: { timestamp: 'asc' },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      product: {
        ...product,
        inStock: product.variants.length > 0,
        totalStock: product.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
        currentBatch: product.variants[0] || null,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Could not fetch product' });
  }
};

// Create new product (Seller only)
export const createProduct = async (req, res) => {
  const { 
    name, 
    description, 
    basePrice, 
    categoryId, 
    tags,
    imageUrl, // Added this field
    // Variant data
    batchNumber,
    manufacturingDate,
    expiryDate,
    stockQuantity,
    isPerishable,
    sku,
    // Authenticity timeline (optional)
    authenticitySteps,
  } = req.body;

  try {
    // Get seller ID from authenticated user
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Verify category exists
    const category = await prisma.category.findFirst({ 
      where: { 
        OR: [
           { id: categoryId },
           { categoryName: categoryId }
        ]
      } 
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create product with variant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          sellerId: seller.id,
          categoryId: category.id,
          name,
          basePrice: parseFloat(basePrice),
          description,
          tags: tags || '',
          imageUrl: imageUrl || null,
        },
      });

      const newVariant = await tx.productVariant.create({
        data: {
          productId: newProduct.id,
          batchNumber,
          manufacturingDate: new Date(manufacturingDate),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          stockQuantity: parseInt(stockQuantity),
          isPerishable: Boolean(isPerishable),
          sku,
        },
      });

      // Add authenticity timeline if provided
      if (authenticitySteps && Array.isArray(authenticitySteps)) {
        await tx.authenticityTimeline.createMany({
          data: authenticitySteps.map((step) => ({
            productVariantId: newVariant.id,
            stepName: step.stepName,
            description: step.description,
            imageUrl: step.imageUrl || null,
            timestamp: step.timestamp ? new Date(step.timestamp) : new Date(),
            locationLatLong: step.locationLatLong || null,
          })),
        });
      }

      return { product: newProduct, variant: newVariant };
    });

    res.status(201).json({
      message: 'Product created successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get seller's own products (Seller only)
export const getSellerProducts = async (req, res) => {
  try {
    // Get seller ID from authenticated user
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found. Please complete onboarding first.' });
    }

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      include: {
        category: { select: { categoryName: true } },
        variants: {
          orderBy: { manufacturingDate: 'asc' },
          select: {
            id: true,
            batchNumber: true,
            manufacturingDate: true,
            expiryDate: true,
            stockQuantity: true,
            isPerishable: true,
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add additional info for each product
    const productsWithInfo = products.map((product) => ({
      ...product,
      inStock: product.variants.reduce((sum, v) => sum + v.stockQuantity, 0) > 0,
      totalStock: product.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
    }));

    res.json({ products: productsWithInfo });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ error: 'Could not fetch products' });
  }
};

// Update product (Seller only)
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, basePrice, categoryId, tags, imageUrl } = req.body;

  try {
    // Get seller ID from authenticated user
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Verify product belongs to seller
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId !== seller.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(basePrice && { basePrice: parseFloat(basePrice) }),
        ...(categoryId && { categoryId }),
        ...(tags !== undefined && { tags }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: {
        category: true,
        variants: true,
      },
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete product (Seller only)
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Get seller ID from authenticated user
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user.userId },
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Verify product belongs to seller
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId !== seller.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update product stock (Seller only)
export const updateProductStock = async (req, res) => {
  const { variantId } = req.params;
  const { stockQuantity } = req.body;

  try {
    // Verify seller owns this product
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            seller: { select: { userId: true } },
          },
        },
      },
    });

    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    if (variant.product.seller.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: parseInt(stockQuantity) },
    });

    res.json({
      message: 'Stock updated successfully',
      variant: updatedVariant,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};