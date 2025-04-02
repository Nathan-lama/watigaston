import { prisma } from './db';
import * as bcrypt from 'bcrypt';

// This script creates a default user for custom levels
export async function createDefaultUser() {
  try {
    // Check if default user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'default@example.com' }
    });

    if (existingUser) {
      console.log("Default user already exists with ID:", existingUser.id);
      return existingUser.id;
    }

    // Create default user
    const hashedPassword = await bcrypt.hash('defaultpassword123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'default@example.com',
        name: 'Default User',
        password: hashedPassword,
        role: 'USER'
      }
    });

    console.log("Default user created with ID:", user.id);
    return user.id;
  } catch (error) {
    console.error("Error creating default user:", error);
    throw error;
  }
}
