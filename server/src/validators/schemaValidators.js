import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().min(8).max(100).required(),
  displayName: Joi.string().min(2).max(50).required().trim(),
  avatarUrl: Joi.string().allow('', null),
  bio: Joi.string().max(500).allow('', null),
  age: Joi.number().integer().min(13).max(120).allow(null),
  locationName: Joi.string().max(150).allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  interests: Joi.array().items(Joi.string()).default([])
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(50).trim(),
  bio: Joi.string().max(500).allow('', null),
  avatarUrl: Joi.string().allow('', null),
  age: Joi.number().integer().min(13).max(120).allow(null),
  locationName: Joi.string().max(150).allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  availabilityStatus: Joi.string().valid('available', 'busy', 'offline'),
  searchRadiusKm: Joi.number().integer().min(1).max(100),
  isDiscoverable: Joi.boolean(),
  interests: Joi.array().items(Joi.string())
});

export const createActivitySchema = Joi.object({
  title: Joi.string().min(3).max(100).required().trim(),
  description: Joi.string().min(1).max(2000).required().trim(),
  categoryId: Joi.string().required().trim(),
  locationName: Joi.string().min(2).max(150).required().trim(),
  locationDescription: Joi.string().max(500).allow('', null),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  startsAt: Joi.date().iso().greater('now').required(),
  endsAt: Joi.date().iso().greater(Joi.ref('startsAt')).allow(null),
  minParticipants: Joi.number().integer().min(1).default(1),
  maxParticipants: Joi.number().integer().min(1).max(100).required(),
  estimatedCost: Joi.number().min(0).max(1000000).default(0),
  visibility: Joi.string().valid('public', 'invite_only').default('public'),
  joinPolicy: Joi.string().valid('approval', 'auto_join').default('approval')
});

export const updateActivitySchema = Joi.object({
  title: Joi.string().min(3).max(100).trim(),
  description: Joi.string().min(1).max(2000).trim(),
  locationName: Joi.string().min(2).max(150).trim(),
  locationDescription: Joi.string().max(500).allow('', null),
  startsAt: Joi.date().iso(),
  endsAt: Joi.date().iso().allow(null),
  maxParticipants: Joi.number().integer().min(1).max(100),
  estimatedCost: Joi.number().min(0).max(1000000),
  status: Joi.string().valid('open', 'full', 'completed', 'cancelled')
});

export const reviewSchema = Joi.object({
  activityId: Joi.string().required(),
  revieweeProfileId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow('', null)
});

export const reportSchema = Joi.object({
  reportedProfileId: Joi.string().allow(null),
  activityId: Joi.string().allow(null),
  reason: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).allow('', null)
});

