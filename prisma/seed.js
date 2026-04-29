import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.$executeRaw`TRUNCATE TABLE "users", "addresses", "sellers", "categories", "commission_rules", "products", "product_variants", "authenticity_timeline", "wishlist", "cart_items", "orders", "order_items", "shipments", "payouts", "reviews" CASCADE`;

  console.log('✅ Cleared existing data');

  // 1. Create Users (Buyers, Sellers, Admin)
  const password = await bcrypt.hash('password123', 10);
  
  const buyer1 = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      passwordHash: password,
      phoneNumber: '+919876543210',
      userType: 'BUYER',
      preferredLanguage: 'en',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: 'rahul@example.com',
      passwordHash: password,
      phoneNumber: '+919876543211',
      userType: 'BUYER',
      preferredLanguage: 'en',
    },
  });

  const sellerUser1 = await prisma.user.create({
    data: {
      email: 'meera@example.com',
      passwordHash: password,
      phoneNumber: '+919876543212',
      userType: 'SELLER',
      preferredLanguage: 'hi',
    },
  });

  const sellerUser2 = await prisma.user.create({
    data: {
      email: 'raju@example.com',
      passwordHash: password,
      phoneNumber: '+919876543213',
      userType: 'SELLER',
      preferredLanguage: 'hi',
    },
  });

  const sellerUser3 = await prisma.user.create({
    data: {
      email: 'shyam@example.com',
      passwordHash: password,
      phoneNumber: '+919876543214',
      userType: 'SELLER',
      preferredLanguage: 'hi',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@himachal-marketplace.com',
      passwordHash: password,
      phoneNumber: '+919876543215',
      userType: 'ADMIN',
      preferredLanguage: 'en',
    },
  });

  console.log('✅ Created 6 users');

  // 2. Create Addresses
  await prisma.address.create({
    data: {
      userId: buyer1.id,
      streetAddress: '45 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020',
      country: 'India',
      addressType: 'HOME',
    },
  });

  await prisma.address.create({
    data: {
      userId: buyer2.id,
      streetAddress: '12 Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      addressType: 'HOME',
    },
  });

  console.log('✅ Created addresses');

  // 3. Create Seller Profiles
  const seller1 = await prisma.seller.create({
    data: {
      userId: sellerUser1.id,
      bio: 'Third-generation rose grower specializing in wild Himalayan roses for natural skincare products.',
      locationVillage: 'Kalpa Village, Kinnaur',
      bankAccountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      sellerType: 'FARMER',
      taxId: 'GSTIN12345',
    },
  });

  const seller2 = await prisma.seller.create({
    data: {
      userId: sellerUser2.id,
      bio: 'Beekeeper in Sangla Valley producing pure honey from apple orchards at 9,000 feet altitude.',
      locationVillage: 'Sangla Valley, Kinnaur',
      bankAccountNumber: '0987654321',
      ifscCode: 'HDFC0001234',
      sellerType: 'FARMER',
      taxId: 'GSTIN67890',
    },
  });

  const seller3 = await prisma.seller.create({
    data: {
      userId: sellerUser3.id,
      bio: 'Master weaver carrying forward 40 years of Pashmina weaving tradition from Kullu Valley.',
      locationVillage: 'Kullu Valley',
      bankAccountNumber: '1122334455',
      ifscCode: 'ICIC0001234',
      sellerType: 'CRAFTSMAN',
      taxId: 'GSTIN11111',
    },
  });

  console.log('✅ Created 3 sellers');

  // 4. Create Categories
  const skincare = await prisma.category.create({
    data: {
      categoryName: 'Organic Skincare',
      description: 'Natural beauty products from the Himalayas',
    },
  });

  const food = await prisma.category.create({
    data: {
      categoryName: 'Organic Food',
      description: 'Pure mountain flavors and traditional recipes',
    },
  });

  const textiles = await prisma.category.create({
    data: {
      categoryName: 'Traditional Textiles',
      description: 'Hand-woven heritage pieces',
    },
  });

  const crafts = await prisma.category.create({
    data: {
      categoryName: 'Artisan Crafts',
      description: 'Handcrafted with love and tradition',
    },
  });

  console.log('✅ Created 4 categories');

  // 5. Create Commission Rules
  const activeDate = new Date('2024-01-01');
  
  const skincareCommission = await prisma.commissionRule.create({
    data: {
      categoryId: skincare.id,
      commissionPercentage: 5.0,
      fixedFee: 0,
      activeFromDate: activeDate,
    },
  });

  const foodCommission = await prisma.commissionRule.create({
    data: {
      categoryId: food.id,
      commissionPercentage: 3.0,
      fixedFee: 0,
      activeFromDate: activeDate,
    },
  });

  const textilesCommission = await prisma.commissionRule.create({
    data: {
      categoryId: textiles.id,
      commissionPercentage: 7.0,
      fixedFee: 50,
      activeFromDate: activeDate,
    },
  });

  const craftsCommission = await prisma.commissionRule.create({
    data: {
      categoryId: crafts.id,
      commissionPercentage: 5.0,
      fixedFee: 0,
      activeFromDate: activeDate,
    },
  });

  console.log('✅ Created commission rules');

  // 6. Create Products with Variants and Authenticity Timeline
  
  // Product 1: Himalayan Rose Face Serum
  const roseSerum = await prisma.product.create({
    data: {
      sellerId: seller1.id,
      categoryId: skincare.id,
      name: 'Himalayan Rose Face Serum',
      basePrice: 2499,
      description: 'Infused with wild Himalayan roses harvested at dawn, this luxurious serum deeply nourishes and revitalizes your skin.',
      tags: 'organic,rose,serum,skincare,anti-aging',
      imageUrl: 'https://images.unsplash.com/photo-1748543668676-ea8241cb3886?w=600&q=80',
    },
  });

  const roseSerumVariant = await prisma.productVariant.create({
    data: {
      productId: roseSerum.id,
      batchNumber: 'RS-2024-001',
      manufacturingDate: new Date('2024-10-25'),
      expiryDate: new Date('2025-10-25'),
      stockQuantity: 50,
      isPerishable: true,
      sku: 'HMS-RS-001',
    },
  });

  await prisma.authenticityTimeline.createMany({
    data: [
      {
        productVariantId: roseSerumVariant.id,
        stepName: 'Harvest',
        description: 'Wild roses harvested at dawn from high-altitude gardens',
        imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
        timestamp: new Date('2024-10-15T06:00:00'),
        locationLatLong: '31.5497,78.2577',
      },
      {
        productVariantId: roseSerumVariant.id,
        stepName: 'Extraction',
        description: 'Traditional steam distillation to extract pure rose essence',
        imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
        timestamp: new Date('2024-10-18T10:00:00'),
        locationLatLong: '31.5497,78.2577',
      },
      {
        productVariantId: roseSerumVariant.id,
        stepName: 'Formulation',
        description: 'Blended with apricot kernel oil and saffron in Ayurvedic lab',
        imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800',
        timestamp: new Date('2024-10-25T14:00:00'),
        locationLatLong: '31.1048,77.1734',
      },
    ],
  });

  // Product 2: Kinnauri Apple Honey
  const appleHoney = await prisma.product.create({
    data: {
      sellerId: seller2.id,
      categoryId: food.id,
      name: 'Kinnauri Apple Honey',
      basePrice: 899,
      description: 'Pure honey collected from bees that pollinate the famous Kinnauri apple orchards at 9,000 feet altitude.',
      tags: 'honey,organic,apple,kinnaur,natural',
      imageUrl: 'https://images.unsplash.com/photo-1603189864361-0cc65b5ecd3a?w=600&q=80',
    },
  });

  const appleHoneyVariant = await prisma.productVariant.create({
    data: {
      productId: appleHoney.id,
      batchNumber: 'AH-2024-001',
      manufacturingDate: new Date('2024-09-25'),
      expiryDate: new Date('2026-09-25'),
      stockQuantity: 100,
      isPerishable: true,
      sku: 'HMS-AH-001',
    },
  });

  await prisma.authenticityTimeline.createMany({
    data: [
      {
        productVariantId: appleHoneyVariant.id,
        stepName: 'Collection',
        description: 'Honey collected from hives in apple orchards',
        imageUrl: 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=800',
        timestamp: new Date('2024-09-20T08:00:00'),
        locationLatLong: '31.4304,78.2655',
      },
      {
        productVariantId: appleHoneyVariant.id,
        stepName: 'Filtering',
        description: 'Natural filtration to remove impurities while preserving nutrients',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784354?w=800',
        timestamp: new Date('2024-09-25T12:00:00'),
        locationLatLong: '31.4304,78.2655',
      },
    ],
  });

  // Product 3: Pashmina Heritage Shawl
  const pashmina = await prisma.product.create({
    data: {
      sellerId: seller3.id,
      categoryId: textiles.id,
      name: 'Pashmina Heritage Shawl',
      basePrice: 18999,
      description: 'Hand-woven by master artisans using centuries-old techniques. Each shawl takes 6 months to complete.',
      tags: 'pashmina,shawl,handwoven,kullu,luxury',
      imageUrl: 'https://images.unsplash.com/photo-1549429446-f9faad31a9ac?w=600&q=80',
    },
  });

  const pashminaVariant = await prisma.productVariant.create({
    data: {
      productId: pashmina.id,
      batchNumber: 'PS-2024-001',
      manufacturingDate: new Date('2024-11-01'),
      expiryDate: null,
      stockQuantity: 5,
      isPerishable: false,
      sku: 'HMS-PS-001',
    },
  });

  await prisma.authenticityTimeline.createMany({
    data: [
      {
        productVariantId: pashminaVariant.id,
        stepName: 'Wool Collection',
        description: 'Premium Pashmina wool sourced from high-altitude pastures',
        imageUrl: 'https://images.unsplash.com/photo-1609043668030-7f91c72ecc8b?w=800',
        timestamp: new Date('2024-05-15T10:00:00'),
        locationLatLong: '31.9588,77.1095',
      },
      {
        productVariantId: pashminaVariant.id,
        stepName: 'Spinning',
        description: 'Traditional hand-spinning to create fine yarn',
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
        timestamp: new Date('2024-06-20T09:00:00'),
        locationLatLong: '31.9588,77.1095',
      },
      {
        productVariantId: pashminaVariant.id,
        stepName: 'Weaving',
        description: 'Six months of meticulous hand-weaving by master artisan',
        imageUrl: 'https://images.unsplash.com/photo-1569076042883-dd5eff2a3f16?w=800',
        timestamp: new Date('2024-10-30T16:00:00'),
        locationLatLong: '31.9588,77.1095',
      },
    ],
  });

  // Product 4: Lavender Essential Oil
  const lavenderOil = await prisma.product.create({
    data: {
      sellerId: seller1.id,
      categoryId: skincare.id,
      name: 'Lavender Essential Oil',
      basePrice: 799,
      description: 'Steam-distilled from lavender grown in the pristine valleys of Kasauli at 6,000 feet elevation.',
      tags: 'lavender,essential-oil,organic,aromatherapy',
      imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    },
  });

  const lavenderOilVariant = await prisma.productVariant.create({
    data: {
      productId: lavenderOil.id,
      batchNumber: 'LEO-2024-001',
      manufacturingDate: new Date('2024-08-15'),
      expiryDate: new Date('2026-08-15'),
      stockQuantity: 75,
      isPerishable: true,
      sku: 'HMS-LEO-001',
    },
  });

  await prisma.authenticityTimeline.createMany({
    data: [
      {
        productVariantId: lavenderOilVariant.id,
        stepName: 'Harvest',
        description: 'Fresh lavender flowers harvested at peak bloom',
        imageUrl: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800',
        timestamp: new Date('2024-07-10T07:00:00'),
        locationLatLong: '30.8985,76.9659',
      },
      {
        productVariantId: lavenderOilVariant.id,
        stepName: 'Distillation',
        description: 'Steam distillation to extract pure essential oil',
        imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
        timestamp: new Date('2024-07-12T10:00:00'),
        locationLatLong: '30.8985,76.9659',
      },
    ],
  });

  // Product 5: Hand-carved Wooden Bowl
  const woodenBowl = await prisma.product.create({
    data: {
      sellerId: seller3.id,
      categoryId: crafts.id,
      name: 'Hand-carved Wooden Bowl',
      basePrice: 1299,
      description: 'Carved from sustainably sourced Himalayan walnut wood, each bowl is a unique piece of functional art.',
      tags: 'wooden,bowl,handcarved,walnut,sustainable',
      imageUrl: 'https://images.unsplash.com/photo-1590483884812-70db3bd30d97?w=600&q=80',
    },
  });

  const woodenBowlVariant = await prisma.productVariant.create({
    data: {
      productId: woodenBowl.id,
      batchNumber: 'WB-2024-001',
      manufacturingDate: new Date('2024-10-15'),
      expiryDate: null,
      stockQuantity: 20,
      isPerishable: false,
      sku: 'HMS-WB-001',
    },
  });

  await prisma.authenticityTimeline.createMany({
    data: [
      {
        productVariantId: woodenBowlVariant.id,
        stepName: 'Wood Selection',
        description: 'Sustainably sourced Himalayan walnut from certified forests',
        imageUrl: 'https://images.unsplash.com/photo-1542601098-3adb3baeb0c4?w=800',
        timestamp: new Date('2024-08-20T10:00:00'),
        locationLatLong: '32.5548,76.1259',
      },
      {
        productVariantId: woodenBowlVariant.id,
        stepName: 'Carving',
        description: 'Hand-carved by master craftsman using traditional tools',
        imageUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800',
        timestamp: new Date('2024-09-15T14:00:00'),
        locationLatLong: '32.5548,76.1259',
      },
      {
        productVariantId: woodenBowlVariant.id,
        stepName: 'Finishing',
        description: 'Polished with natural beeswax for a smooth, food-safe finish',
        imageUrl: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?w=800',
        timestamp: new Date('2024-10-10T11:00:00'),
        locationLatLong: '32.5548,76.1259',
      },
    ],
  });

  console.log('✅ Created 5 products with variants and authenticity timelines');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 6 Users (2 Buyers, 3 Sellers, 1 Admin)');
  console.log('- 2 Addresses');
  console.log('- 3 Seller Profiles');
  console.log('- 4 Categories');
  console.log('- 4 Commission Rules');
  console.log('- 5 Products');
  console.log('- 5 Product Variants');
  console.log('- 15+ Authenticity Timeline entries');
  console.log('\n🔑 Test Credentials:');
  console.log('Buyers: priya@example.com / rahul@example.com');
  console.log('Sellers: meera@example.com / raju@example.com / shyam@example.com');
  console.log('Admin: admin@himachal-marketplace.com');
  console.log('Password for all: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
