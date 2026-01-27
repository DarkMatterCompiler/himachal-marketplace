// src/controllers/orderController.js
import prisma from '../db.js';

export const createOrder = async (req, res) => {
  const { userId, items } = req.body; 
  // items expected format: [{ productId: "123", quantity: 2 }, ...]

  try {
    // 🛡️ START TRANSACTION
    // "tx" is a special client. Operations done with "tx" are temporary until the function finishes.
    const result = await prisma.$transaction(async (tx) => {
      
      let totalAmount = 0;
      const orderItemsData = [];

      // Loop through every item the user wants to buy
      for (const item of items) {
        
        // 1. Fetch the Product (INSIDE the transaction to lock it)
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        // 2. CHECK STOCK (The Guardrail)
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}. Only ${product.stock} left.`);
        }

        // 3. DECREMENT STOCK
        // We update the product immediately within this transaction scope
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });

        // 4. Calculate Price & Prepare Order Item
        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;
        
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price // Save the price *at moment of purchase*
        });
      }

      // 5. Create the Order Record
      // We only reach here if NO errors occurred above.
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: "COMPLETED",
          items: {
            create: orderItemsData // Prisma creates all OrderItems automatically here
          }
        },
        include: { items: true } // Return the full receipt
      });

      return newOrder;
    });
    // 🛡️ END TRANSACTION - Changes are permanent now.

    res.status(201).json({ message: "Order placed! 🛍️", order: result });

  } catch (error) {
    console.error("Transaction Failed:", error.message);
    // If ANY error was thrown above, Prisma undoes everything automatically.
    res.status(400).json({ error: error.message || "Order failed" });
  }
};