import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().uri().required(),

  AUTH_DISABLED: Joi.string().valid('true', 'false').default('false'),

  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),

  CLOUDFLARE_R2_PUBLIC_BASE_URL: Joi.string().uri().required(),
  CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN: Joi.string().min(3).required(),
}).unknown(true);
