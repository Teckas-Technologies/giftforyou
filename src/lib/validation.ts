import { z } from 'zod';

// Shared validation rules — the single source of truth for form checks that
// used to be duplicated ad-hoc regexes/length checks across screens
// (LoginScreen, SignUpScreen, InvitationsScreen all had their own copy of
// the same email regex).

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(
    (data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  );

/** Drop-in replacement for the per-screen `isValidEmail` regex checks. */
export const isValidEmail = (email: string): boolean => emailSchema.safeParse(email).success;

/** Drop-in replacement for the per-screen `isValidPassword` length checks. */
export const isValidPassword = (password: string): boolean =>
  passwordSchema.safeParse(password).success;
