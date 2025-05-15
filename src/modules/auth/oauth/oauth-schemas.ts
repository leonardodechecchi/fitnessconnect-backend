import { z } from 'zod';

export const googleLoginSchema = z.object({
  redirectUrl: z.string().optional(),
});

export const googleLoginCbSchema = z.union([
  z.object({
    state: z.string(),
    code: z.string(),
  }),
  z.object({
    error: z.string(),
    error_description: z.string().optional(),
    error_uri: z.string().optional(),
  }),
]);

export const facebookLoginSchema = googleLoginSchema;

export const facebookLoginCbSchema = z.union([
  z.object({
    state: z.string(),
    code: z.string(),
    granted_scopes: z.string(),
  }),
  z.object({
    state: z.string(),
    error_reason: z.string(),
    error: z.string(),
    error_description: z.string(),
  }),
]);

export type GoogleLoginSchema = z.infer<typeof googleLoginSchema>;
export type GoogleLoginCbSchema = z.infer<typeof googleLoginCbSchema>;
export type FacebookLoginSchema = z.infer<typeof facebookLoginSchema>;
export type FacebookLoginCbSchema = z.infer<typeof facebookLoginCbSchema>;
