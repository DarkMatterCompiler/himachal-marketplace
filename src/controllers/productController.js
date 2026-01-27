// src/controllers/productController.js
import prisma from '../db.js';

export const createProduct = async (req , res)=> {
    const { 
        sellerId, 
        name, 
        description, 
        price, 
        category, 
        stock, 
        images, 
        attributes // <--- This receives the JSON object (Apples vs Shawls)
    } = req.body;

    try {
        const seller = await prisma.seller.findUnique({ where: { id: sellerId } });

        if(!seller){
            return res.status(404).json({ error: 'Seller not found' });
        }

        //TODO: basic category validation with its attributes

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price,      // Prisma will automatically handle the Decimal conversion
                category,
                stock,
                images,
                attributes, // Prisma saves this straight into the JSONB column
                sellerId
            }
        });

        res.status(201).json({
            message: 'Product created successfully',
            product: newProduct
        });

    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error no product created' });
    }

};

export const getProducts = async (req, res) => {
    const {category, minPrice, maxPrice, ...otherFilters} = req.query;

    try {
        const filter = {};
        if(category) {
            filter.category = category;
        }
        if(minPrice || maxPrice) {
            filter.price = {};
            if(minPrice) filter.price.gte = parseFloat(minPrice);
            if(maxPrice) filter.price.lte = parseFloat(maxPrice);
        }

        if(Object.keys(otherFilters).length > 0) {
            // We check if "attributes" matches ALL these conditions
            // This is an "AND" search.
            Object.keys(otherFilters).forEach( key=>{
                const value = otherFilters[key];

                // Handle "true"/"false" strings converting to booleans
                let actualValue = value;
                if(value.toLowerCase() === 'true') actualValue = true;
                else if(value.toLowerCase() === 'false') actualValue = false;

                filter.attributes = {
                    ...filter.attributes,
                    path: [key],
                    equals: actualValue
                };
            });
        }

        const products = await prisma.product.findMany({
            where: filter,
            include:{
                seller:{
                    select: {location: true, bio: true}
                }
            }
        });

        res.json({ products });

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'couldnt fetch products' });
    }
};