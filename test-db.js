import postgres from 'postgres';

const sql = postgres('postgresql://postgres:01466@localhost:5432/irctc_booking', {
  ssl: false,
  connect_timeout: 10
});

async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('Connection successful:', result);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await sql.end();
  }
}

testConnection(); 