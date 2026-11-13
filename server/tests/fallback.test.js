import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeRepository, getStorageStatus } from '../src/repositories/repositoryFactory.js';

test('Database Fallback System: starts cleanly and activates InMemoryRepository without crashing', async () => {
  const { repository, storageMode, dbConnectionStatus } = await initializeRepository();

  assert.ok(repository, 'Repository should be initialized');
  assert.equal(storageMode, 'memory', 'Storage mode should be memory when no DB is connected');
  assert.equal(dbConnectionStatus, 'disconnected', 'Database status should be disconnected');

  const status = getStorageStatus();
  assert.equal(status.storageMode, 'memory');

  // Verify demo data is loaded
  const interests = await repository.getAllInterests();
  assert.ok(interests.length > 5, 'Should have seeded interests');

  const user = await repository.findUserByEmail('alex@nearmates.com');
  assert.ok(user, 'Demo user Alex should exist');
  assert.equal(user.displayName, 'Alex Turner');

  const activities = await repository.listActivities();
  assert.ok(activities.length > 0, 'Should have seeded activities');
});

