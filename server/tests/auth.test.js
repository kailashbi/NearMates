import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../src/services/authService.js';
import { initializeRepository } from '../src/repositories/repositoryFactory.js';

test('Authentication: Login with seeded demo user Alex Turner', async () => {
  await initializeRepository();

  const res = await AuthService.login('alex@nearmates.com', 'Password123!');
  assert.ok(res.token, 'Should return a valid JWT token');
  assert.equal(res.user.email, 'alex@nearmates.com');
  assert.equal(res.profile.displayName, 'Alex Turner');
});

test('Authentication: Register a new user with hashed password and profile', async () => {
  await initializeRepository();

  const email = `testuser_${Date.now()}@nearmates.com`;
  const res = await AuthService.register({
    email,
    password: 'Password123!',
    displayName: 'Test Explorer',
    bio: 'Looking for tennis partners',
    locationName: 'Uptown',
    latitude: 37.77,
    longitude: -122.41,
    interests: ['sports_badminton']
  });

  assert.ok(res.token, 'Should return token');
  assert.equal(res.user.email, email);
  assert.equal(res.profile.displayName, 'Test Explorer');

  // Verify can login with newly created user
  const loginRes = await AuthService.login(email, 'Password123!');
  assert.ok(loginRes.token);
});

test('Authentication: Reject invalid password', async () => {
  await initializeRepository();

  await assert.rejects(
    async () => {
      await AuthService.login('alex@nearmates.com', 'WrongPassword!');
    },
    (err) => {
      assert.equal(err.statusCode, 401);
      return true;
    }
  );
});

