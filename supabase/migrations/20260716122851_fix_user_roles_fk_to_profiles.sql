/*
# Fix user_roles foreign key to reference profiles instead of auth.users

## Problem
The `user_roles.user_id` column currently has a foreign key pointing to `auth.users.id`
(in the `auth` schema). PostgREST — which powers Supabase's auto-generated REST API —
only inspects the `public` schema for relationship discovery. Because the FK crosses into
the `auth` schema, PostgREST cannot infer the join between `profiles` and `user_roles`,
causing the error: "Could not find a relationship between 'profiles' and 'user_roles'
in the schema cache".

## Fix
1. Drop the existing FK constraint from `user_roles.user_id` → `auth.users.id`.
2. Add a new FK constraint from `user_roles.user_id` → `public.profiles.id`.

Since `profiles.id` is itself a FK to `auth.users.id` and shares the same UUID values,
this is a safe re-pointing — no data is changed or lost.

## Result
PostgREST can now discover the relationship and the query
`profiles.select('*, user_roles(*)')` will work correctly.
*/

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
