import postgres from "postgres";
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default connection string for local development
const DEFAULT_DATABASE_URL = "postgresql://postgres:01466@localhost:5432/irctc_booking";

// Use environment variable or default connection string
const databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

// Create a postgres client without SSL for local development
export const pool = postgres(databaseUrl, { 
  ssl: false,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  try {
    // Test the database connection
    await pool`SELECT 1`;
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;
  }
}
