import { promises as fs } from 'fs';
import * as path from 'path';

async function seed() {
  const users = JSON.parse(await fs.readFile(path.join(__dirname, 'fixtures', 'users.json'), 'utf-8'));

  // Here you would typically make API calls to your backend to create these users
  console.log('Seeding users:', users);

  // Example of a fake API call
  for (const user of users) {
    console.log(`Creating user: ${user.username}`);
    // await api.createUser(user);
  }
}

async function reset() {
  // Here you would typically make API calls to your backend to delete all users
  console.log('Resetting database...');
}

if (require.main === module) {
  const command = process.argv[2];
  if (command === 'seed') {
    seed();
  } else if (command === 'reset') {
    reset();
  } else {
    console.log('Usage: ts-node test-data/seed.ts [seed|reset]');
  }
}
