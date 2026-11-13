import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchingEngine } from '../src/services/matchingEngine.js';
import { initializeRepository } from '../src/repositories/repositoryFactory.js';

test('Smart Matching Engine: deterministic scoring and ranking', async () => {
  const { repository } = await initializeRepository();

  const alex = await repository.findUserByEmail('alex@nearmates.com');
  const matches = await MatchingEngine.findMatches(alex.profileId, { radiusKm: 30 });

  assert.ok(Array.isArray(matches), 'Matches should return an array');
  assert.ok(matches.length > 0, 'Should find matching users nearby');

  // Verify match shape and constraints
  for (const m of matches) {
    assert.ok(m.user.profileId !== alex.profileId, 'Should exclude current user');
    assert.ok(m.matchScore >= 0 && m.matchScore <= 100, 'Score must be between 0 and 100');
    assert.ok(m.breakdown.locationScore >= 0);
    assert.ok(m.breakdown.interestScore >= 0);
    assert.ok(m.breakdown.availabilityScore >= 0);
  }

  // Verify matches are sorted by matchScore descending
  for (let i = 0; i < matches.length - 1; i++) {
    assert.ok(matches[i].matchScore >= matches[i + 1].matchScore, 'Matches must be sorted descending');
  }
});

