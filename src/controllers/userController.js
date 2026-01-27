import bcrypt from 'bcryptjs';
import prisma from '../db.js';

export const createUser = async ( req , res) => {
    const { email, password, userType, phone, name } = req.body;

    try {
        // Check if user with the same email already exists
        const existingUser = await prisma.user.findUnique({ where: {email: email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword, // Store the HASH, not the plain text
                userType,
                // We haven't added 'phone' or 'name' to the schema yet, 
                // so we can only save these 3 fields for now.
            }
        });

        res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    userType: newUser.userType
                }
             });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};