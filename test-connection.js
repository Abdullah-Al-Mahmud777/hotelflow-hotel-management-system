// Quick test to check if backend is accessible
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function testConnection() {
  console.log('Testing connection to:', API_URL);
  
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log('✅ Backend is running!');
    console.log('Response:', data);
  } catch (error) {
    console.log('❌ Backend is NOT running!');
    console.log('Error:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Open a new terminal');
    console.log('2. Run: cd server');
    console.log('3. Run: npm run seed (to add sample data)');
    console.log('4. Run: npm start');
  }
}

testConnection();
