import pg from 'pg';
import { IRepository } from './IRepository.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export class SupabaseRepository extends IRepository {
  constructor(databaseUrl) {
    super();
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000
    });
  }

  async testConnection() {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT NOW()');
      return true;
    } finally {
      client.release();
    }
  }

  // --- Users & Auth ---
  async createUser(userData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3)
         RETURNING user_id, email, role, created_at`,
        [userData.email.toLowerCase(), userData.passwordHash, userData.role || 'user']
      );
      const user = userRes.rows[0];

      const profileRes = await client.query(
        `INSERT INTO profiles (user_id, display_name, bio, avatar_url, age, location_name, location_point)
         VALUES ($1, $2, $3, $4, $5, $6,
           CASE WHEN $7::double precision IS NOT NULL AND $8::double precision IS NOT NULL
           THEN ST_SetSRID(ST_MakePoint($8::double precision, $7::double precision), 4326)::geography
           ELSE NULL END)
         RETURNING profile_id, display_name, bio, avatar_url, age, location_name, availability_status, is_discoverable, rating, created_at`,
        [
          user.user_id,
          userData.displayName || 'New Explorer',
          userData.bio || '',
          userData.avatarUrl || null,
          userData.age || null,
          userData.locationName || 'Local Area',
          userData.latitude || null,
          userData.longitude || null
        ]
      );
      const profile = profileRes.rows[0];
      await client.query('COMMIT');

      return {
        userId: user.user_id,
        profileId: profile.profile_id,
        email: user.email,
        role: user.role,
        displayName: profile.display_name,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        availabilityStatus: profile.availability_status,
        isDiscoverable: profile.is_discoverable,
        rating: profile.rating,
        interests: []
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email) {
    const res = await this.pool.query(
      `SELECT u.user_id, u.email, u.password_hash, u.role, p.profile_id, p.display_name, p.bio, p.avatar_url
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.user_id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      userId: row.user_id,
      profileId: row.profile_id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      displayName: row.display_name,
      bio: row.bio,
      avatarUrl: row.avatar_url
    };
  }

  async findUserById(userId) {
    const res = await this.pool.query(
      `SELECT u.user_id, u.email, u.role, p.profile_id, p.display_name, p.bio, p.avatar_url
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.user_id
       WHERE u.user_id = $1`,
      [userId]
    );
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      userId: row.user_id,
      profileId: row.profile_id,
      email: row.email,
      role: row.role,
      displayName: row.display_name,
      bio: row.bio,
      avatarUrl: row.avatar_url
    };
  }

  // --- Profiles ---
  async getProfileById(profileId) {
    const res = await this.pool.query(
      `SELECT profile_id, user_id, display_name, bio, avatar_url, age, location_name,
              availability_status, search_radius_km, is_discoverable, rating,
              ST_Y(location_point::geometry) as latitude, ST_X(location_point::geometry) as longitude
       FROM profiles WHERE profile_id = $1`,
      [profileId]
    );
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    const interests = await this.getUserInterests(profileId);
    return {
      profileId: row.profile_id,
      userId: row.user_id,
      displayName: row.display_name,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      age: row.age,
      locationName: row.location_name,
      latitude: row.latitude,
      longitude: row.longitude,
      availabilityStatus: row.availability_status,
      searchRadiusKm: row.search_radius_km,
      isDiscoverable: row.is_discoverable,
      rating: parseFloat(row.rating) || 5.0,
      interests: interests.map(i => i.interestId)
    };
  }

  async getProfileByUserId(userId) {
    const res = await this.pool.query('SELECT profile_id FROM profiles WHERE user_id = $1', [userId]);
    if (!res.rows[0]) return null;
    return this.getProfileById(res.rows[0].profile_id);
  }

  async updateProfile(profileId, updateData) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updateData.displayName !== undefined) {
      fields.push(`display_name = $${idx++}`);
      values.push(updateData.displayName);
    }
    if (updateData.bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      values.push(updateData.bio);
    }
    if (updateData.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      values.push(updateData.avatarUrl);
    }
    if (updateData.availabilityStatus !== undefined) {
      fields.push(`availability_status = $${idx++}`);
      values.push(updateData.availabilityStatus);
    }
    if (updateData.searchRadiusKm !== undefined) {
      fields.push(`search_radius_km = $${idx++}`);
      values.push(updateData.searchRadiusKm);
    }
    if (updateData.isDiscoverable !== undefined) {
      fields.push(`is_discoverable = $${idx++}`);
      values.push(updateData.isDiscoverable);
    }
    if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
      fields.push(`location_point = ST_SetSRID(ST_MakePoint($${idx++}, $${idx++}), 4326)::geography`);
      values.push(updateData.longitude, updateData.latitude);
    }

    if (fields.length > 0) {
      values.push(profileId);
      await this.pool.query(
        `UPDATE profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE profile_id = $${idx}`,
        values
      );
    }

    return this.getProfileById(profileId);
  }

  // --- PostGIS Spatial Discovery ---
  async findNearbyProfiles(lat, lng, radiusKm = 15, currentProfileId = null) {
    const params = [lng, lat, radiusKm * 1000];
    let query = `
      SELECT p.profile_id, p.display_name, p.bio, p.avatar_url, p.availability_status, p.rating,
             ROUND((ST_Distance(p.location_point, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000)::numeric, 1) as approx_distance_km
      FROM profiles p
      WHERE p.location_point IS NOT NULL
        AND p.is_discoverable = TRUE
        AND ST_DWithin(p.location_point, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
    `;

    if (currentProfileId) {
      params.push(currentProfileId);
      query += ` AND p.profile_id != $${params.length}`;
    }

    query += ` ORDER BY approx_distance_km ASC LIMIT 50`;

    const res = await this.pool.query(query, params);
    return Promise.all(res.rows.map(async r => {
      const interests = await this.getUserInterests(r.profile_id);
      return {
        profileId: r.profile_id,
        displayName: r.display_name,
        bio: r.bio,
        avatarUrl: r.avatar_url,
        availabilityStatus: r.availability_status,
        rating: parseFloat(r.rating) || 5.0,
        approxDistanceKm: parseFloat(r.approx_distance_km),
        interests: interests.map(i => i.interestId)
      };
    }));
  }

  // --- Interests ---
  async getAllInterests() {
    const res = await this.pool.query(
      'SELECT interest_id as "interestId", name, category, icon FROM interests WHERE is_active = TRUE ORDER BY category, name'
    );
    return res.rows;
  }

  async getUserInterests(profileId) {
    const res = await this.pool.query(
      `SELECT i.interest_id as "interestId", i.name, i.category, i.icon
       FROM interests i
       JOIN user_interests ui ON ui.interest_id = i.interest_id
       WHERE ui.profile_id = $1`,
      [profileId]
    );
    return res.rows;
  }

  async setUserInterests(profileId, interestIds) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM user_interests WHERE profile_id = $1', [profileId]);
      for (const id of interestIds) {
        await client.query(
          'INSERT INTO user_interests (profile_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [profileId, id]
        );
      }
      await client.query('COMMIT');
      return this.getUserInterests(profileId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // --- Activities ---
  async createActivity(activityData) {
    const res = await this.pool.query(
      `INSERT INTO activities (
         host_profile_id, title, description, category_id, location_name, location_description,
         location_point, starts_at, ends_at, min_participants, max_participants, estimated_cost,
         visibility, join_policy
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         CASE WHEN $7::double precision IS NOT NULL AND $8::double precision IS NOT NULL
         THEN ST_SetSRID(ST_MakePoint($8::double precision, $7::double precision), 4326)::geography
         ELSE NULL END,
         $9, $10, $11, $12, $13, $14, $15
       ) RETURNING activity_id`,
      [
        activityData.hostProfileId,
        activityData.title,
        activityData.description,
        activityData.categoryId,
        activityData.locationName,
        activityData.locationDescription || '',
        activityData.latitude || null,
        activityData.longitude || null,
        activityData.startsAt,
        activityData.endsAt || null,
        activityData.minParticipants || 1,
        activityData.maxParticipants || 10,
        activityData.estimatedCost || 0,
        activityData.visibility || 'public',
        activityData.joinPolicy || 'approval'
      ]
    );

    return this.getActivityById(res.rows[0].activity_id);
  }

  async getActivityById(activityId) {
    const res = await this.pool.query(
      `SELECT a.activity_id as "activityId", a.host_profile_id as "hostProfileId",
              p.display_name as "hostName", p.avatar_url as "hostAvatar",
              a.title, a.description, a.category_id as "categoryId", i.name as "categoryName", i.category as "categoryGroup",
              a.location_name as "locationName", a.location_description as "locationDescription",
              ST_Y(a.location_point::geometry) as latitude, ST_X(a.location_point::geometry) as longitude,
              a.starts_at as "startsAt", a.ends_at as "endsAt",
              a.min_participants as "minParticipants", a.max_participants as "maxParticipants",
              a.estimated_cost as "estimatedCost", a.visibility, a.join_policy as "joinPolicy",
              a.status, a.created_at as "createdAt"
       FROM activities a
       JOIN profiles p ON p.profile_id = a.host_profile_id
       JOIN interests i ON i.interest_id = a.category_id
       WHERE a.activity_id = $1`,
      [activityId]
    );

    if (!res.rows[0]) return null;
    const act = res.rows[0];
    const participants = await this.listActivityParticipants(activityId);

    return {
      ...act,
      participantCount: participants.length + 1,
      remainingPlaces: Math.max(0, act.maxParticipants - (participants.length + 1)),
      participants
    };
  }

  async listActivities(filters = {}) {
    let query = `
      SELECT a.activity_id as "activityId", a.host_profile_id as "hostProfileId",
             p.display_name as "hostName", p.avatar_url as "hostAvatar",
             a.title, a.description, a.category_id as "categoryId", i.name as "categoryName", i.category as "categoryGroup",
             a.location_name as "locationName",
             a.starts_at as "startsAt", a.ends_at as "endsAt",
             a.min_participants as "minParticipants", a.max_participants as "maxParticipants",
             a.estimated_cost as "estimatedCost", a.visibility, a.join_policy as "joinPolicy",
             a.status, a.created_at as "createdAt",
             1 + (SELECT COUNT(*) FROM activity_memberships m WHERE m.activity_id = a.activity_id AND m.status = 'approved') as "participantCount"
      FROM activities a
      JOIN profiles p ON p.profile_id = a.host_profile_id
      JOIN interests i ON i.interest_id = a.category_id
      WHERE a.status != 'cancelled'
    `;
    const params = [];

    if (filters.categoryId) {
      params.push(filters.categoryId);
      query += ` AND a.category_id = $${params.length}`;
    }
    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (a.title ILIKE $${params.length} OR a.description ILIKE $${params.length} OR a.location_name ILIKE $${params.length})`;
    }
    if (filters.from) {
      params.push(filters.from);
      query += ` AND a.starts_at >= $${params.length}`;
    }

    query += ` ORDER BY a.starts_at ASC LIMIT 50`;
    const res = await this.pool.query(query, params);
    return res.rows.map(r => ({
      ...r,
      participantCount: parseInt(r.participantCount) || 1,
      remainingPlaces: Math.max(0, r.maxParticipants - (parseInt(r.participantCount) || 1))
    }));
  }

  async findNearbyActivities(lat, lng, radiusKm = 15, filters = {}) {
    const params = [lng, lat, radiusKm * 1000];
    let query = `
      SELECT a.activity_id as "activityId", a.host_profile_id as "hostProfileId",
             p.display_name as "hostName", p.avatar_url as "hostAvatar",
             a.title, a.description, a.category_id as "categoryId", i.name as "categoryName", i.category as "categoryGroup",
             a.location_name as "locationName", a.starts_at as "startsAt", a.ends_at as "endsAt",
             a.max_participants as "maxParticipants", a.status,
             ROUND((ST_Distance(a.location_point, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000)::numeric, 1) as "approxDistanceKm",
             1 + (SELECT COUNT(*) FROM activity_memberships m WHERE m.activity_id = a.activity_id AND m.status = 'approved') as "participantCount"
      FROM activities a
      JOIN profiles p ON p.profile_id = a.host_profile_id
      JOIN interests i ON i.interest_id = a.category_id
      WHERE a.location_point IS NOT NULL
        AND a.status = 'open'
        AND ST_DWithin(a.location_point, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
    `;

    if (filters.categoryId) {
      params.push(filters.categoryId);
      query += ` AND a.category_id = $${params.length}`;
    }

    query += ` ORDER BY "approxDistanceKm" ASC LIMIT 50`;
    const res = await this.pool.query(query, params);
    return res.rows.map(r => ({
      ...r,
      approxDistanceKm: parseFloat(r.approxDistanceKm),
      participantCount: parseInt(r.participantCount) || 1,
      remainingPlaces: Math.max(0, r.maxParticipants - (parseInt(r.participantCount) || 1))
    }));
  }

  // --- Memberships ---
  async getMembership(activityId, profileId) {
    const res = await this.pool.query(
      `SELECT membership_id as "membershipId", activity_id as "activityId", profile_id as "profileId",
              role, status, requested_at as "requestedAt", decided_at as "decidedAt"
       FROM activity_memberships
       WHERE activity_id = $1 AND profile_id = $2`,
      [activityId, profileId]
    );
    return res.rows[0] || null;
  }

  async createMembership(membershipData) {
    const res = await this.pool.query(
      `INSERT INTO activity_memberships (activity_id, profile_id, role, status, decided_at)
       VALUES ($1, $2, $3, $4, CASE WHEN $4 = 'approved' THEN NOW() ELSE NULL END)
       RETURNING membership_id as "membershipId", activity_id as "activityId", profile_id as "profileId", role, status, requested_at as "requestedAt"`,
      [
        membershipData.activityId,
        membershipData.profileId,
        membershipData.role || 'participant',
        membershipData.status || 'requested'
      ]
    );
    return res.rows[0];
  }

  async updateMembershipStatus(membershipId, status) {
    const res = await this.pool.query(
      `UPDATE activity_memberships
       SET status = $1, decided_at = NOW(), updated_at = NOW()
       WHERE membership_id = $2
       RETURNING membership_id as "membershipId", activity_id as "activityId", profile_id as "profileId", role, status, decided_at as "decidedAt"`,
      [status, membershipId]
    );
    return res.rows[0] || null;
  }

  async listActivityParticipants(activityId) {
    const res = await this.pool.query(
      `SELECT m.membership_id as "membershipId", m.profile_id as "profileId",
              p.display_name as "displayName", p.avatar_url as "avatarUrl",
              m.role, m.decided_at as "joinedAt"
       FROM activity_memberships m
       JOIN profiles p ON p.profile_id = m.profile_id
       WHERE m.activity_id = $1 AND m.status = 'approved'`,
      [activityId]
    );
    return res.rows;
  }

  async listActivityRequests(activityId) {
    const res = await this.pool.query(
      `SELECT m.membership_id as "membershipId", m.profile_id as "profileId",
              p.display_name as "displayName", p.avatar_url as "avatarUrl", p.bio,
              m.requested_at as "requestedAt"
       FROM activity_memberships m
       JOIN profiles p ON p.profile_id = m.profile_id
       WHERE m.activity_id = $1 AND m.status = 'requested'`,
      [activityId]
    );
    return res.rows;
  }

  // --- Chat ---
  async ensureDirectChatTables() {
    if (this._chatTablesReady) return;
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS direct_conversations (
            conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_one UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
            member_two UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT direct_conversations_unique_members UNIQUE (member_one, member_two)
        );
        CREATE TABLE IF NOT EXISTS direct_messages (
            message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID NOT NULL REFERENCES direct_conversations(conversation_id) ON DELETE CASCADE,
            sender_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
            content VARCHAR(2000) NOT NULL CHECK (length(btrim(content)) >= 1),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_direct_conv_m1 ON direct_conversations(member_one);
        CREATE INDEX IF NOT EXISTS idx_direct_conv_m2 ON direct_conversations(member_two);
        CREATE INDEX IF NOT EXISTS idx_direct_messages_conv ON direct_messages(conversation_id, created_at DESC);
      `);
      this._chatTablesReady = true;
    } catch (err) {
      logger.warn(`Could not auto-create direct chat tables: ${err.message}`);
    }
  }

  async createActivityMessage(activityId, senderProfileId, content) {
    const res = await this.pool.query(
      `INSERT INTO activity_messages (activity_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING message_id as "messageId", activity_id as "activityId", sender_id as "senderProfileId", content, created_at as "createdAt"`,
      [activityId, senderProfileId, content]
    );
    const row = res.rows[0];
    const profile = await this.getProfileById(senderProfileId);
    return {
      ...row,
      senderName: profile?.displayName || 'User',
      senderAvatar: profile?.avatarUrl
    };
  }

  async getActivityMessages(activityId, limit = 50, offset = 0) {
    const res = await this.pool.query(
      `SELECT m.message_id as "messageId", m.activity_id as "activityId", m.sender_id as "senderProfileId",
              p.display_name as "senderName", p.avatar_url as "senderAvatar",
              m.content, m.created_at as "createdAt"
       FROM activity_messages m
       JOIN profiles p ON p.profile_id = m.sender_id
       WHERE m.activity_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [activityId, limit, offset]
    );
    return { items: res.rows, pagination: { limit, offset, total: res.rows.length } };
  }

  async getOrCreateDirectConversation(profileId1, profileId2) {
    await this.ensureDirectChatTables();
    const [m1, m2] = [profileId1, profileId2].sort();
    let res = await this.pool.query(
      `SELECT conversation_id as "conversationId", member_one as "member1", member_two as "member2", updated_at as "updatedAt"
       FROM direct_conversations
       WHERE member_one = $1 AND member_two = $2`,
      [m1, m2]
    );

    if (res.rows.length === 0) {
      res = await this.pool.query(
        `INSERT INTO direct_conversations (member_one, member_two)
         VALUES ($1, $2)
         ON CONFLICT (member_one, member_two) DO UPDATE SET updated_at = NOW()
         RETURNING conversation_id as "conversationId", member_one as "member1", member_two as "member2", updated_at as "updatedAt"`,
        [m1, m2]
      );
    }

    const partnerId = profileId1 === m1 ? m2 : m1;
    const partner = await this.getProfileById(partnerId);

    return {
      conversationId: res.rows[0].conversationId,
      partner: partner ? {
        profileId: partner.profileId,
        displayName: partner.displayName,
        avatarUrl: partner.avatarUrl,
        availabilityStatus: partner.availabilityStatus
      } : null,
      lastMessage: null,
      updatedAt: res.rows[0].updatedAt
    };
  }

  async getConversationsForProfile(profileId) {
    await this.ensureDirectChatTables();
    try {
      const res = await this.pool.query(
        `SELECT c.conversation_id as "conversationId", c.member_one as "member1", c.member_two as "member2", c.updated_at as "updatedAt",
                (SELECT json_build_object('messageId', m.message_id, 'content', m.content, 'createdAt', m.created_at, 'senderId', m.sender_id)
                 FROM direct_messages m
                 WHERE m.conversation_id = c.conversation_id
                 ORDER BY m.created_at DESC LIMIT 1) as "lastMessage"
         FROM direct_conversations c
         WHERE c.member_one = $1 OR c.member_two = $1
         ORDER BY c.updated_at DESC`,
        [profileId]
      );

      const items = await Promise.all(res.rows.map(async row => {
        const partnerId = row.member1 === profileId ? row.member2 : row.member1;
        const partner = await this.getProfileById(partnerId);
        return {
          conversationId: row.conversationId,
          partner: partner ? {
            profileId: partner.profileId,
            displayName: partner.displayName,
            avatarUrl: partner.avatarUrl,
            availabilityStatus: partner.availabilityStatus
          } : null,
          lastMessage: row.lastMessage || null,
          updatedAt: row.updatedAt
        };
      }));

      return items;
    } catch (err) {
      logger.warn(`Could not load direct conversations: ${err.message}`);
      return [];
    }
  }

  async createDirectMessage(conversationId, senderProfileId, content) {
    await this.ensureDirectChatTables();
    const res = await this.pool.query(
      `INSERT INTO direct_messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING message_id as "messageId", conversation_id as "conversationId", sender_id as "senderProfileId", content, created_at as "createdAt"`,
      [conversationId, senderProfileId, content]
    );

    await this.pool.query(
      `UPDATE direct_conversations SET updated_at = NOW() WHERE conversation_id = $1`,
      [conversationId]
    );

    const profile = await this.getProfileById(senderProfileId);
    return {
      ...res.rows[0],
      senderName: profile?.displayName || 'User',
      senderAvatar: profile?.avatarUrl
    };
  }

  async getDirectMessages(conversationId, limit = 50, offset = 0) {
    await this.ensureDirectChatTables();
    try {
      const res = await this.pool.query(
        `SELECT m.message_id as "messageId", m.conversation_id as "conversationId", m.sender_id as "senderProfileId",
                p.display_name as "senderName", p.avatar_url as "senderAvatar",
                m.content, m.created_at as "createdAt"
         FROM direct_messages m
         JOIN profiles p ON p.profile_id = m.sender_id
         WHERE m.conversation_id = $1
         ORDER BY m.created_at ASC
         LIMIT $2 OFFSET $3`,
        [conversationId, limit, offset]
      );
      return { items: res.rows, pagination: { limit, offset, total: res.rows.length } };
    } catch (err) {
      logger.warn(`Could not load direct messages: ${err.message}`);
      return { items: [], pagination: { limit, offset, total: 0 } };
    }
  }

  // --- Notifications ---
  async createNotification(notifData) {
    const res = await this.pool.query(
      `INSERT INTO notifications (recipient_id, type, title, message, activity_id, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING notification_id as "notificationId", recipient_id as "recipientProfileId", type, title, message, activity_id as "activityId", read_at as "readAt", created_at as "createdAt"`,
      [notifData.recipientProfileId, notifData.type, notifData.title, notifData.message, notifData.activityId || null, JSON.stringify(notifData.data || {})]
    );
    return res.rows[0];
  }

  async getUserNotifications(profileId, limit = 20, offset = 0) {
    const res = await this.pool.query(
      `SELECT notification_id as "notificationId", recipient_id as "recipientProfileId", type, title, message, activity_id as "activityId", read_at as "readAt", created_at as "createdAt"
       FROM notifications
       WHERE recipient_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [profileId, limit, offset]
    );
    const countRes = await this.pool.query(
      `SELECT COUNT(*) as unread FROM notifications WHERE recipient_id = $1 AND read_at IS NULL`,
      [profileId]
    );
    return {
      items: res.rows,
      unreadCount: parseInt(countRes.rows[0]?.unread) || 0,
      pagination: { limit, offset, total: res.rows.length }
    };
  }

  async markNotificationRead(notificationId, profileId) {
    await this.pool.query(
      `UPDATE notifications SET read_at = NOW() WHERE notification_id = $1 AND recipient_id = $2`,
      [notificationId, profileId]
    );
    return true;
  }

  async markAllNotificationsRead(profileId) {
    await this.pool.query(
      `UPDATE notifications SET read_at = NOW() WHERE recipient_id = $1 AND read_at IS NULL`,
      [profileId]
    );
    return true;
  }

  async listUsers(filters = {}) {
    let query = `
      SELECT u.user_id as "userId", u.email, u.role, u.status, u.warning_count as "warningCount",
             u.ban_reason as "banReason", u.suspended_until as "suspendedUntil", u.suspension_reason as "suspensionReason",
             u.last_active_at as "lastActiveAt", u.created_at as "createdAt",
             p.profile_id as "profileId", p.display_name as "displayName", p.avatar_url as "avatarUrl",
             p.location_name as "locationName", p.rating, p.review_count as "reviewCount",
             (SELECT COUNT(*) FROM reports r WHERE r.reported_profile_id = p.profile_id) as "reportsCount"
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    if (filters.search) {
      params.push(`%${filters.search.toLowerCase()}%`);
      query += ` AND (LOWER(p.display_name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`;
    }
    if (filters.status && filters.status !== 'all') {
      params.push(filters.status);
      query += ` AND u.status = $${params.length}`;
    }
    if (filters.role && filters.role !== 'all') {
      params.push(filters.role);
      query += ` AND u.role = $${params.length}`;
    }
    query += ` ORDER BY u.created_at DESC`;

    const res = await this.pool.query(query, params);
    let rows = res.rows.map(r => ({ ...r, reportsCount: parseInt(r.reportsCount) || 0 }));
    if (filters.reportedOnly === 'true' || filters.reportedOnly === true) {
      rows = rows.filter(r => r.reportsCount > 0);
    }
    return rows;
  }

  async banUser(userId, reason, adminId = null) {
    await this.pool.query(
      `UPDATE users SET status = 'banned', ban_reason = $1, is_active = false, updated_at = NOW() WHERE user_id = $2`,
      [reason, userId]
    );
    const profileRes = await this.pool.query(`SELECT profile_id FROM profiles WHERE user_id = $1`, [userId]);
    if (profileRes.rows[0]) {
      await this.createNotification({
        recipientProfileId: profileRes.rows[0].profile_id,
        type: 'account_banned',
        title: 'Account Permanently Banned',
        message: `Your account was permanently banned by moderation. Reason: ${reason}`
      });
    }
    return this.findUserById(userId);
  }

  async suspendUser(userId, suspendedUntil, reason, adminId = null) {
    await this.pool.query(
      `UPDATE users SET status = 'suspended', suspended_until = $1, suspension_reason = $2, updated_at = NOW() WHERE user_id = $3`,
      [suspendedUntil, reason, userId]
    );
    const profileRes = await this.pool.query(`SELECT profile_id FROM profiles WHERE user_id = $1`, [userId]);
    if (profileRes.rows[0]) {
      await this.createNotification({
        recipientProfileId: profileRes.rows[0].profile_id,
        type: 'account_suspended',
        title: 'Account Suspended',
        message: `Your account is suspended until ${new Date(suspendedUntil).toLocaleDateString()}. Reason: ${reason}`
      });
    }
    return this.findUserById(userId);
  }

  async unsuspendUser(userId) {
    await this.pool.query(
      `UPDATE users SET status = 'active', suspended_until = NULL, suspension_reason = NULL, ban_reason = NULL, is_active = true, updated_at = NOW() WHERE user_id = $1`,
      [userId]
    );
    const profileRes = await this.pool.query(`SELECT profile_id FROM profiles WHERE user_id = $1`, [userId]);
    if (profileRes.rows[0]) {
      await this.createNotification({
        recipientProfileId: profileRes.rows[0].profile_id,
        type: 'account_reactivated',
        title: 'Account Reinstated',
        message: 'Your account status has been restored to active standing.'
      });
    }
    return this.findUserById(userId);
  }

  async warnUser(userId, reason, adminId = null) {
    const res = await this.pool.query(
      `UPDATE users SET warning_count = COALESCE(warning_count, 0) + 1, updated_at = NOW() WHERE user_id = $1 RETURNING warning_count`,
      [userId]
    );
    const count = res.rows[0]?.warning_count || 1;
    const profileRes = await this.pool.query(`SELECT profile_id FROM profiles WHERE user_id = $1`, [userId]);
    if (profileRes.rows[0]) {
      await this.createNotification({
        recipientProfileId: profileRes.rows[0].profile_id,
        type: 'moderation_warning',
        title: `Formal Moderation Warning (${count}/3)`,
        message: `Warning issued by moderation: ${reason}`
      });
    }
    return this.findUserById(userId);
  }

  async listActivitiesAdmin(filters = {}) {
    let query = `
      SELECT a.activity_id as "activityId", a.host_profile_id as "hostProfileId",
             a.title, a.description, a.category_id as "categoryId", i.name as "categoryName",
             a.location_name as "locationName", a.starts_at as "startsAt", a.ends_at as "endsAt",
             a.max_participants as "maxParticipants", a.status, a.cancellation_reason as "cancellationReason",
             a.moderation_notes as "moderationNotes", a.created_at as "createdAt",
             p.display_name as "hostName", p.avatar_url as "hostAvatar", u.email as "hostEmail",
             (SELECT COUNT(*) FROM activity_memberships m WHERE m.activity_id = a.activity_id AND m.status = 'approved') + 1 as "approvedParticipantsCount",
             (SELECT COUNT(*) FROM activity_memberships m WHERE m.activity_id = a.activity_id AND m.status = 'requested') as "pendingRequestsCount",
             (SELECT COUNT(*) FROM reports r WHERE r.activity_id = a.activity_id) as "reportsCount"
      FROM activities a
      LEFT JOIN profiles p ON p.profile_id = a.host_profile_id
      LEFT JOIN users u ON u.user_id = p.user_id
      LEFT JOIN interests i ON i.interest_id = a.category_id
      WHERE 1=1
    `;
    const params = [];
    if (filters.search) {
      params.push(`%${filters.search.toLowerCase()}%`);
      query += ` AND (LOWER(a.title) LIKE $${params.length} OR LOWER(a.location_name) LIKE $${params.length} OR LOWER(i.name) LIKE $${params.length})`;
    }
    if (filters.status && filters.status !== 'all') {
      params.push(filters.status);
      query += ` AND a.status = $${params.length}`;
    }
    if (filters.category && filters.category !== 'all') {
      params.push(filters.category);
      query += ` AND a.category_id = $${params.length}`;
    }
    query += ` ORDER BY a.created_at DESC`;

    const res = await this.pool.query(query, params);
    return res.rows.map(r => ({
      ...r,
      approvedParticipantsCount: parseInt(r.approvedParticipantsCount) || 1,
      pendingRequestsCount: parseInt(r.pendingRequestsCount) || 0,
      reportsCount: parseInt(r.reportsCount) || 0
    }));
  }

  async getActivityWithParticipants(activityId) {
    const actRes = await this.pool.query(
      `SELECT a.*, p.display_name as "hostName", p.avatar_url as "hostAvatar", u.email as "hostEmail"
       FROM activities a
       LEFT JOIN profiles p ON p.profile_id = a.host_profile_id
       LEFT JOIN users u ON u.user_id = p.user_id
       WHERE a.activity_id = $1`,
      [activityId]
    );
    if (!actRes.rows[0]) return null;

    const memRes = await this.pool.query(
      `SELECT m.membership_id as "membershipId", m.role, m.status, m.requested_at as "requestedAt",
              p.profile_id as "profileId", p.display_name as "displayName", p.avatar_url as "avatarUrl", p.rating, u.email
       FROM activity_memberships m
       JOIN profiles p ON p.profile_id = m.profile_id
       JOIN users u ON u.user_id = p.user_id
       WHERE m.activity_id = $1`,
      [activityId]
    );

    const repRes = await this.pool.query(
      `SELECT r.report_id as "reportId", r.reason, r.category, r.description, r.status, r.created_at as "createdAt"
       FROM reports r WHERE r.activity_id = $1`,
      [activityId]
    );

    return {
      activity: actRes.rows[0],
      participants: memRes.rows,
      reports: repRes.rows
    };
  }

  async moderateActivity(activityId, action, reason, adminId = null) {
    const status = action === 'remove' ? 'removed' : 'cancelled';
    const noteCol = action === 'remove' ? 'moderation_notes' : 'cancellation_reason';
    await this.pool.query(
      `UPDATE activities SET status = $1, ${noteCol} = $2, updated_at = NOW() WHERE activity_id = $3`,
      [status, reason, activityId]
    );

    const act = (await this.pool.query(`SELECT host_profile_id, title FROM activities WHERE activity_id = $1`, [activityId])).rows[0];
    if (act) {
      await this.createNotification({
        recipientProfileId: act.host_profile_id,
        type: 'activity_moderated',
        title: action === 'remove' ? 'Activity Removed by Moderation' : 'Activity Cancelled by Moderation',
        message: `Your activity "${act.title}" was ${action === 'remove' ? 'removed for guidelines violation' : 'cancelled'}. Reason: ${reason}`,
        activityId
      });
    }

    return true;
  }

  async createReport(reportData) {
    const res = await this.pool.query(
      `INSERT INTO reports (reporter_profile_id, reported_profile_id, activity_id, category, reason, description, evidence_url, evidence_text, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING report_id as "reportId", category, reason, description, status, created_at as "createdAt"`,
      [
        reportData.reporterProfileId,
        reportData.reportedProfileId || null,
        reportData.activityId || null,
        reportData.category || 'other',
        reportData.reason,
        reportData.description || null,
        reportData.evidenceUrl || null,
        reportData.evidenceText || null
      ]
    );
    return res.rows[0];
  }

  async listReports(filters = {}) {
    let query = `
      SELECT r.report_id as "reportId", r.reporter_profile_id as "reporterProfileId",
             rp.display_name as "reporterName", rp.avatar_url as "reporterAvatar",
             r.reported_profile_id as "reportedProfileId",
             tp.display_name as "reportedName", tp.avatar_url as "reportedAvatar",
             r.activity_id as "activityId", a.title as "activityTitle",
             r.category, r.reason, r.description, r.evidence_url as "evidenceUrl",
             r.evidence_text as "evidenceText", r.status, r.admin_notes as "adminNotes",
             r.action_taken as "actionTaken", r.moderated_at as "moderatedAt", r.created_at as "createdAt"
      FROM reports r
      LEFT JOIN profiles rp ON rp.profile_id = r.reporter_profile_id
      LEFT JOIN profiles tp ON tp.profile_id = r.reported_profile_id
      LEFT JOIN activities a ON a.activity_id = r.activity_id
      WHERE 1=1
    `;
    const params = [];
    if (filters.status && filters.status !== 'all') {
      params.push(filters.status);
      query += ` AND r.status = $${params.length}`;
    }
    if (filters.category && filters.category !== 'all') {
      params.push(filters.category);
      query += ` AND r.category = $${params.length}`;
    }
    query += ` ORDER BY r.created_at DESC`;

    const res = await this.pool.query(query, params);
    return res.rows;
  }

  async getReportById(reportId) {
    const res = await this.pool.query(
      `SELECT r.report_id as "reportId", r.reporter_profile_id as "reporterProfileId",
              rp.display_name as "reporterName", rp.avatar_url as "reporterAvatar",
              r.reported_profile_id as "reportedProfileId",
              tp.display_name as "reportedName", tp.avatar_url as "reportedAvatar",
              r.activity_id as "activityId", a.title as "activityTitle",
              r.category, r.reason, r.description, r.evidence_url as "evidenceUrl",
              r.evidence_text as "evidenceText", r.status, r.admin_notes as "adminNotes",
              r.action_taken as "actionTaken", r.moderated_at as "moderatedAt", r.created_at as "createdAt"
       FROM reports r
       LEFT JOIN profiles rp ON rp.profile_id = r.reporter_profile_id
       LEFT JOIN profiles tp ON tp.profile_id = r.reported_profile_id
       LEFT JOIN activities a ON a.activity_id = r.activity_id
       WHERE r.report_id = $1`,
      [reportId]
    );
    return res.rows[0] || null;
  }

  async updateReportStatus(reportId, status) {
    const res = await this.pool.query(
      `UPDATE reports SET status = $1, updated_at = NOW() WHERE report_id = $2 RETURNING *`,
      [status, reportId]
    );
    return res.rows[0];
  }

  async resolveReport(reportId, updateData) {
    const res = await this.pool.query(
      `UPDATE reports
       SET status = $1, admin_notes = $2, action_taken = $3, moderated_by = $4, moderated_at = NOW(), updated_at = NOW()
       WHERE report_id = $5
       RETURNING report_id as "reportId", status, admin_notes as "adminNotes", action_taken as "actionTaken"`,
      [
        updateData.status || 'resolved',
        updateData.adminNotes || null,
        updateData.actionTaken || 'none',
        updateData.moderatedBy || null,
        reportId
      ]
    );
    return res.rows[0];
  }

  async getAdminStats() {
    const [uTotal, uDaily, uWeekly, uMonthly, uSuspended, uBanned, aTotal, aOpen, aCompleted, aCancelled, aRemoved, rTotal, repTotal, repPending] = await Promise.all([
      this.pool.query('SELECT COUNT(*) FROM users'),
      this.pool.query("SELECT COUNT(*) FROM users WHERE last_active_at >= NOW() - INTERVAL '1 day'"),
      this.pool.query("SELECT COUNT(*) FROM users WHERE last_active_at >= NOW() - INTERVAL '7 days'"),
      this.pool.query("SELECT COUNT(*) FROM users WHERE last_active_at >= NOW() - INTERVAL '30 days'"),
      this.pool.query("SELECT COUNT(*) FROM users WHERE status = 'suspended'"),
      this.pool.query("SELECT COUNT(*) FROM users WHERE status = 'banned'"),
      this.pool.query('SELECT COUNT(*) FROM activities'),
      this.pool.query("SELECT COUNT(*) FROM activities WHERE status = 'open'"),
      this.pool.query("SELECT COUNT(*) FROM activities WHERE status = 'completed'"),
      this.pool.query("SELECT COUNT(*) FROM activities WHERE status = 'cancelled'"),
      this.pool.query("SELECT COUNT(*) FROM activities WHERE status = 'removed'"),
      this.pool.query('SELECT COUNT(*) FROM reviews'),
      this.pool.query('SELECT COUNT(*) FROM reports'),
      this.pool.query("SELECT COUNT(*) FROM reports WHERE status = 'pending'")
    ]);

    return {
      totalUsers: parseInt(uTotal.rows[0]?.count) || 0,
      activeUsersDaily: parseInt(uDaily.rows[0]?.count) || 0,
      activeUsersWeekly: parseInt(uWeekly.rows[0]?.count) || 0,
      activeUsersMonthly: parseInt(uMonthly.rows[0]?.count) || 0,
      suspendedUsers: parseInt(uSuspended.rows[0]?.count) || 0,
      bannedUsers: parseInt(uBanned.rows[0]?.count) || 0,
      totalActivities: parseInt(aTotal.rows[0]?.count) || 0,
      openActivities: parseInt(aOpen.rows[0]?.count) || 0,
      completedActivities: parseInt(aCompleted.rows[0]?.count) || 0,
      cancelledActivities: parseInt(aCancelled.rows[0]?.count) || 0,
      removedActivities: parseInt(aRemoved.rows[0]?.count) || 0,
      totalReviews: parseInt(rTotal.rows[0]?.count) || 0,
      totalReports: parseInt(repTotal.rows[0]?.count) || 0,
      pendingReports: parseInt(repPending.rows[0]?.count) || 0
    };
  }
}

