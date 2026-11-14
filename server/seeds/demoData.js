import bcrypt from 'bcryptjs';

// Pre-hashed password for demo users: "Password123!"
// Generated with bcrypt salt rounds = 10
export const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

export const DEMO_INTERESTS = [
  // 1. Team sports
  { interestId: 'sports_badminton', name: 'Badminton doubles', category: 'Team sports', icon: 'activity' },
  { interestId: 'sports_football', name: 'Football / Soccer', category: 'Team sports', icon: 'trophy' },
  { interestId: 'sports_cricket', name: 'Cricket', category: 'Team sports', icon: 'target' },
  { interestId: 'sports_volleyball', name: 'Volleyball', category: 'Team sports', icon: 'circle' },
  { interestId: 'sports_basketball', name: 'Basketball', category: 'Team sports', icon: 'dribbble' },
  { interestId: 'sports_table_tennis', name: 'Table tennis', category: 'Team sports', icon: 'zap' },

  // 2. Fitness and wellness
  { interestId: 'fitness_running', name: 'Group running', category: 'Fitness and wellness', icon: 'footprints' },
  { interestId: 'fitness_gym', name: 'Gym workout partners', category: 'Fitness and wellness', icon: 'dumbbell' },
  { interestId: 'fitness_yoga', name: 'Morning yoga & meditation', category: 'Fitness and wellness', icon: 'sparkles' },
  { interestId: 'fitness_cycling', name: 'Weekend cycling club', category: 'Fitness and wellness', icon: 'bike' },

  // 3. Travel and exploration
  { interestId: 'travel_hiking', name: 'Mountain trips & hiking', category: 'Travel and exploration', icon: 'mountain' },
  { interestId: 'travel_camping', name: 'Stargazing & camping', category: 'Travel and exploration', icon: 'tent' },
  { interestId: 'travel_roadtrips', name: 'Weekend road trips', category: 'Travel and exploration', icon: 'compass' },

  // 4. Indoor, online and social games
  { interestId: 'games_chess', name: 'Chess matches & coffee', category: 'Indoor, online and social games', icon: 'award' },
  { interestId: 'games_board', name: 'Board game evenings', category: 'Indoor, online and social games', icon: 'box' },
  { interestId: 'games_video', name: 'Co-op gaming squads', category: 'Indoor, online and social games', icon: 'gamepad-2' },

  // 5. Food and dining
  { interestId: 'food_brunch', name: 'Weekend brunch discovery', category: 'Food and dining', icon: 'coffee' },
  { interestId: 'food_street', name: 'Street food crawlers', category: 'Food and dining', icon: 'utensils' },

  // 6. Entertainment and recreation
  { interestId: 'ent_movies', name: 'Film & cinema discussions', category: 'Entertainment and recreation', icon: 'film' },
  { interestId: 'ent_live_music', name: 'Live concerts & acoustic jams', category: 'Entertainment and recreation', icon: 'music' },

  // 7. Meeting new people
  { interestId: 'meet_coworking', name: 'Quiet cafe coworking', category: 'Meeting new people', icon: 'laptop' },
  { interestId: 'meet_tech_chat', name: 'Tech founders & developers meetup', category: 'Meeting new people', icon: 'code' }
];

export const DEMO_USERS = [
  {
    userId: 'u1111111-1111-1111-1111-111111111111',
    profileId: 'p1111111-1111-1111-1111-111111111111',
    email: 'alex@nearmates.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'user',
    displayName: 'Alex Turner',
    bio: 'Software engineer passionate about badminton, trail running, and acoustic indie rock. Always up for an evening game!',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    age: 26,
    locationName: 'Downtown Waterfront',
    latitude: 37.7749,
    longitude: -122.4194,
    availabilityStatus: 'available',
    searchRadiusKm: 15,
    isDiscoverable: true,
    interests: ['sports_badminton', 'fitness_running', 'meet_tech_chat', 'food_brunch'],
    rating: 4.9,
    reviewCount: 14
  },
  {
    userId: 'u2222222-2222-2222-2222-222222222222',
    profileId: 'p2222222-2222-2222-2222-222222222222',
    email: 'sarah@nearmates.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'user',
    displayName: 'Sarah Chen',
    bio: 'Product designer. Love weekend bouldering, board games, and finding hidden coffee shops with strong Wi-Fi.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    age: 28,
    locationName: 'Mission District',
    latitude: 37.7600,
    longitude: -122.4200,
    availabilityStatus: 'available',
    searchRadiusKm: 20,
    isDiscoverable: true,
    interests: ['games_board', 'games_chess', 'meet_coworking', 'travel_hiking'],
    rating: 5.0,
    reviewCount: 9
  },
  {
    userId: 'u3333333-3333-3333-3333-333333333333',
    profileId: 'p3333333-3333-3333-3333-333333333333',
    email: 'marcus@nearmates.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'user',
    displayName: 'Marcus Rivera',
    bio: 'Semi-pro cyclist and weekend hiker. Looking for cycling partners who can do 30-50km morning pacelines.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    age: 31,
    locationName: 'Presidio Heights',
    latitude: 37.7880,
    longitude: -122.4500,
    availabilityStatus: 'available',
    searchRadiusKm: 25,
    isDiscoverable: true,
    interests: ['fitness_cycling', 'fitness_running', 'travel_camping', 'sports_football'],
    rating: 4.8,
    reviewCount: 22
  },
  {
    userId: 'u4444444-4444-4444-4444-444444444444',
    profileId: 'p4444444-4444-4444-4444-444444444444',
    email: 'priya@nearmates.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'user',
    displayName: 'Priya Sharma',
    bio: 'Casual badminton player & food enthusiast. Always organizing weekend brunch walks and friendly sports matches.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    age: 24,
    locationName: 'SoMa Tech Hub',
    latitude: 37.7810,
    longitude: -122.3980,
    availabilityStatus: 'available',
    searchRadiusKm: 10,
    isDiscoverable: true,
    interests: ['sports_badminton', 'food_brunch', 'food_street', 'ent_live_music'],
    rating: 4.9,
    reviewCount: 17
  },
  {
    userId: 'u0000000-0000-0000-0000-000000000000',
    profileId: 'p0000000-0000-0000-0000-000000000000',
    email: 'admin@nearmates.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'admin',
    status: 'active',
    warningCount: 0,
    displayName: 'NearMates Admin',
    bio: 'Platform safety, moderation & community coordinator.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    age: 35,
    locationName: 'Headquarters',
    latitude: 37.7749,
    longitude: -122.4194,
    availabilityStatus: 'available',
    searchRadiusKm: 50,
    isDiscoverable: true,
    interests: ['meet_tech_chat'],
    rating: 5.0,
    reviewCount: 50,
    lastActiveAt: new Date().toISOString()
  },
  {
    userId: 'u5555555-5555-5555-5555-555555555555',
    profileId: 'p5555555-5555-5555-5555-555555555555',
    email: 'suspended.test@nearmates.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'user',
    status: 'suspended',
    suspensionReason: 'Repeatedly posting promotional external affiliate links in group chats',
    suspendedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    warningCount: 2,
    displayName: 'Liam Cooper (Suspended)',
    bio: 'Looking for casual runners and coffee meetups.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    age: 29,
    locationName: 'North Beach',
    latitude: 37.8000,
    longitude: -122.4100,
    availabilityStatus: 'offline',
    searchRadiusKm: 15,
    isDiscoverable: false,
    interests: ['fitness_running'],
    rating: 3.2,
    reviewCount: 3,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    userId: 'u6666666-6666-6666-6666-666666666666',
    profileId: 'p6666666-6666-6666-6666-666666666666',
    email: 'banned.spammer@nearmates.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'user',
    status: 'banned',
    banReason: 'Permanent ban: Automated fraudulent phishing bot and harassment violation',
    warningCount: 3,
    displayName: 'Crypto Promo Bot (Banned)',
    bio: 'Follow my channel for guaranteed activity rewards!',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    age: 22,
    locationName: 'Financial District',
    latitude: 37.7946,
    longitude: -122.3999,
    availabilityStatus: 'offline',
    searchRadiusKm: 10,
    isDiscoverable: false,
    interests: ['meet_tech_chat'],
    rating: 1.0,
    reviewCount: 1,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  }
];

export const DEMO_ACTIVITIES = [
  {
    activityId: 'a1111111-1111-1111-1111-111111111111',
    hostProfileId: 'p1111111-1111-1111-1111-111111111111',
    hostName: 'Alex Turner',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Badminton Doubles — Intermediate Friendly Match',
    description: 'Looking for 3 badminton enthusiasts for a fast-paced but friendly doubles match at the indoor community center. Synthetic court booked for 2 hours!',
    categoryId: 'sports_badminton',
    categoryName: 'Badminton doubles',
    categoryGroup: 'Team sports',
    locationName: 'Central Indoor Sports Arena',
    locationDescription: 'Court #2 (Indoor wooden flooring), lockers and drinking water available',
    latitude: 37.7760,
    longitude: -122.4180,
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(), // ~20 hrs from now
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    minParticipants: 2,
    maxParticipants: 4,
    estimatedCost: 15.00,
    visibility: 'public',
    joinPolicy: 'approval',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    activityId: 'a2222222-2222-2222-2222-222222222222',
    hostProfileId: 'p2222222-2222-2222-2222-222222222222',
    hostName: 'Sarah Chen',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'Board Games & Artisan Coffee Session',
    description: 'Bringing Catan, Ticket to Ride, and Wingspan. Let’s grab a quiet corner table, enjoy pour-over coffee, and roll some dice!',
    categoryId: 'games_board',
    categoryName: 'Board game evenings',
    categoryGroup: 'Indoor, online and social games',
    locationName: 'The Daily Grind Roasters',
    locationDescription: 'Back lounge area with large community wood tables',
    latitude: 37.7590,
    longitude: -122.4210,
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 31).toISOString(),
    minParticipants: 3,
    maxParticipants: 6,
    estimatedCost: 5.00,
    visibility: 'public',
    joinPolicy: 'auto_join',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    activityId: 'a3333333-3333-3333-3333-333333333333',
    hostProfileId: 'p3333333-3333-3333-3333-333333333333',
    hostName: 'Marcus Rivera',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Morning Paceline Cycling Loop (40km)',
    description: 'Smooth morning ride over the bridge and through the headlands. Steady 24-28 km/h rolling pace. Helmets mandatory!',
    categoryId: 'fitness_cycling',
    categoryName: 'Weekend cycling club',
    categoryGroup: 'Fitness and wellness',
    locationName: 'Presidio Golden Gate Plaza',
    locationDescription: 'Meeting right by the visitor pavilion fountain',
    latitude: 37.8010,
    longitude: -122.4600,
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 39).toISOString(),
    minParticipants: 2,
    maxParticipants: 10,
    estimatedCost: 0.00,
    visibility: 'public',
    joinPolicy: 'approval',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    activityId: 'a4444444-4444-4444-4444-444444444444',
    hostProfileId: 'p4444444-4444-4444-4444-444444444444',
    hostName: 'Priya Sharma',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    title: 'Weekend Farmers Market & Brunch Crawl',
    description: 'Discovering fresh pastries, artisanal sourdough, and local fruit stands, then sitting down for brunch.',
    categoryId: 'food_brunch',
    categoryName: 'Weekend brunch discovery',
    categoryGroup: 'Food and dining',
    locationName: 'Ferry Building Marketplace',
    locationDescription: 'Clock tower entrance',
    latitude: 37.7955,
    longitude: -122.3937,
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 51).toISOString(),
    minParticipants: 2,
    maxParticipants: 6,
    estimatedCost: 20.00,
    visibility: 'public',
    joinPolicy: 'auto_join',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
  }
];

export const DEMO_MEMBERSHIPS = [
  {
    membershipId: 'm1111111-1111-1111-1111-111111111111',
    activityId: 'a1111111-1111-1111-1111-111111111111',
    profileId: 'p4444444-4444-4444-4444-444444444444',
    role: 'participant',
    status: 'approved',
    requestedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    decidedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
  },
  {
    membershipId: 'm2222222-2222-2222-2222-222222222222',
    activityId: 'a1111111-1111-1111-1111-111111111111',
    profileId: 'p2222222-2222-2222-2222-222222222222',
    role: 'participant',
    status: 'requested',
    requestedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    decidedAt: null
  }
];

export const DEMO_MESSAGES = [
  {
    messageId: 'msg11111-1111-1111-1111-111111111111',
    activityId: 'a1111111-1111-1111-1111-111111111111',
    senderProfileId: 'p1111111-1111-1111-1111-111111111111',
    senderName: 'Alex Turner',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Hey everyone! Court #2 is confirmed for tomorrow evening. Bring indoor non-marking shoes!',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    messageId: 'msg22222-2222-2222-2222-222222222222',
    activityId: 'a1111111-1111-1111-1111-111111111111',
    senderProfileId: 'p4444444-4444-4444-4444-444444444444',
    senderName: 'Priya Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    content: 'Awesome! I have a can of Yonex Aerosensa feather shuttles I will bring along too.',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  }
];

export const DEMO_NOTIFICATIONS = [
  {
    notificationId: 'notif111-1111-1111-1111-111111111111',
    recipientProfileId: 'p1111111-1111-1111-1111-111111111111',
    type: 'join_request',
    title: 'New Join Request',
    message: 'Sarah Chen requested to join your Badminton Doubles match.',
    activityId: 'a1111111-1111-1111-1111-111111111111',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    notificationId: 'notif222-2222-2222-2222-222222222222',
    recipientProfileId: 'p4444444-4444-4444-4444-444444444444',
    type: 'request_approved',
    title: 'Request Approved!',
    message: 'Alex Turner approved your request for Badminton Doubles.',
    activityId: 'a1111111-1111-1111-1111-111111111111',
    readAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
  }
];

export const DEMO_REVIEWS = [
  {
    reviewId: 'r1111111-1111-1111-1111-111111111111',
    activityId: 'a1111111-1111-1111-1111-111111111111',
    reviewerProfileId: 'p4444444-4444-4444-4444-444444444444',
    reviewerName: 'Priya Sharma',
    revieweeProfileId: 'p1111111-1111-1111-1111-111111111111',
    rating: 5,
    comment: 'Super organized host! Great sportsmanship and punctual.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

export const DEMO_REPORTS = [
  {
    reportId: 'rep-1111111-1111-1111',
    reporterProfileId: 'p1111111-1111-1111-1111-111111111111',
    reporterName: 'Alex Turner',
    reporterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    reportedProfileId: 'p5555555-5555-5555-5555-555555555555',
    reportedName: 'Liam Cooper',
    reportedAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    activityId: null,
    activityTitle: null,
    category: 'spam',
    reason: 'Spamming meetup comment section with paid external courses',
    description: 'This user joined our badminton discussion group and posted 4 suspicious telegram affiliate links asking for money.',
    evidenceUrl: 'https://telegram.org/example-spam-screenshot',
    evidenceText: 'Check out my guaranteed coaching system on t.me/fake_channel for only $50!',
    status: 'pending',
    adminNotes: '',
    actionTaken: 'none',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    reportId: 'rep-2222222-2222-2222',
    reporterProfileId: 'p2222222-2222-2222-2222-222222222222',
    reporterName: 'Sarah Chen',
    reporterAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    reportedProfileId: 'p6666666-6666-6666-6666-666666666666',
    reportedName: 'Crypto Promo Bot',
    reportedAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    activityId: null,
    activityTitle: null,
    category: 'fake_profile',
    reason: 'Fake automated bot account using stolen celebrity picture',
    description: 'This account messaged several members within seconds with automated crypto solicitations.',
    evidenceUrl: '',
    evidenceText: 'Join our private investment meetup at this shortened bit.ly URL',
    status: 'investigating',
    adminNotes: 'Investigating IP logs and message batch timestamps.',
    actionTaken: 'none',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    reportId: 'rep-3333333-3333-3333',
    reporterProfileId: 'p4444444-4444-4444-4444-444444444444',
    reporterName: 'Priya Sharma',
    reporterAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    reportedProfileId: null,
    reportedName: null,
    activityId: 'a3333333-3333-3333-3333-333333333333',
    activityTitle: 'Sunset Road Cycling Paceline — Hawk Hill Loop',
    category: 'suspicious_activity',
    reason: 'Unsafe route during extreme storm warning',
    description: 'Organizer is scheduling high-speed descents on wet roads during active gale warnings with no helmet requirements.',
    evidenceUrl: '',
    evidenceText: 'Starts at dusk in rainy conditions',
    status: 'pending',
    adminNotes: '',
    actionTaken: 'none',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
  }
];

