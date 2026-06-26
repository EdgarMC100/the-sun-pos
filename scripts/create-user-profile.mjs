import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { readFileSync } from 'fs';

// Load amplify outputs
const outputs = JSON.parse(
  readFileSync('./amplify_outputs.json', 'utf-8')
);

Amplify.configure(outputs);

const client = generateClient({ authMode: 'iam' });

const userProfile = {
  userId: 'd42854e8-d061-7093-a278-91a2d509a204',
  username: 'edgar.morales',
  email: 'edgarmc100@gmail.com',
  role: 'admin',
  storeId: '0e5f19e8-293c-4ed0-9417-eebfabc536a1',
  isActive: true
};

console.log('Creating UserProfile record...');
console.log('Data:', userProfile);

try {
  const result = await client.models.UserProfile.create(userProfile);
  console.log('\n✅ UserProfile created successfully!');
  console.log('Result:', JSON.stringify(result, null, 2));
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error creating UserProfile:', error);
  process.exit(1);
}
