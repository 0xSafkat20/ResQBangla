/*
# NSDRMS Demo Data — Organizations & Audit Logs

Adds additional organizations and audit log entries for visualization.

## Data Inserted

1. **Additional Organizations** — 10 more response organizations across different districts.
2. **Audit Log Entries** — 25+ realistic audit log entries covering user creation, role assignment, district/org management, profile updates, login events, etc.

## Security

No security changes — only data inserts.
*/

-- ============================================================
-- ADDITIONAL ORGANIZATIONS (10 more)
-- ============================================================
INSERT INTO public.organizations (name, type, reference_number, district_id, email, phone, address)
SELECT o.name, o.type, o.ref_num, dist.id, o.email, o.phone, o.address FROM (VALUES
  ('Bangladesh Army Disaster Relief', 'MILITARY', 'BAR-001', 'DHK-01', 'relief@army.mil.bd', '+88029881200', 'Dhaka Cantonment, Dhaka'),
  ('Bangladesh Navy Relief Operations', 'MILITARY', 'BNR-001', 'CTG-01', 'navy.relief@navy.mil.bd', '+880316251234', 'Naval Base, Chittagong'),
  ('CARITAS Bangladesh', 'NGO', 'CB-001', 'MYM-01', 'info@caritasbd.org', '+8809162620', '2 Caritas Road, Mymensingh'),
  ('Islamic Relief Bangladesh', 'NGO', 'IRB-001', 'KHL-01', 'info@islamic-relief-bd.org', '+8804172000', 'Jessore Road, Khulna'),
  ('Fire Service Bogura', 'FIRE_SERVICE', 'BFS-003', 'RAJ-02', 'bogura-fire@bfsccd.gov.bd', '+88051652000', 'Station Road, Bogura'),
  ('Red Crescent Rajshahi', 'RED_CRESCENT', 'BDRCS-003', 'RAJ-01', 'rajshahi@bdrcs.org', '+880721712345', 'Alupotti, Rajshahi'),
  ('Fire Service Sylhet', 'FIRE_SERVICE', 'BFS-004', 'SYL-01', 'sylhet-fire@bfsccd.gov.bd', '+880821712345', 'Zindabazar, Sylhet'),
  ('BRAC Khulna', 'NGO', 'BRAC-DM-002', 'KHL-01', 'khulna@brac.net', '+8804172233', 'Khulna City, Khulna'),
  ('Red Crescent Barishal', 'RED_CRESCENT', 'BDRCS-004', 'BAR-01', 'barishal@bdrcs.org', '+880431712345', 'Bangla Bazar, Barishal'),
  ('Rangpur Fire Service', 'FIRE_SERVICE', 'BFS-005', 'RNG-01', 'rangpur-fire@bfsccd.gov.bd', '+880521712345', 'Station Road, Rangpur')
) AS o(name, type, ref_num, dist_code, email, phone, address)
JOIN public.districts dist ON dist.code = o.dist_code
ON CONFLICT DO NOTHING;

-- ============================================================
-- AUDIT LOG ENTRIES (25 entries spread over past 30 days)
-- ============================================================
INSERT INTO public.audit_logs (actor_id, actor_email, actor_type, action, entity_type, entity_id, entity_name, result, reason, metadata, created_at)
SELECT
  actor_id::uuid, actor_email, actor_type, action, entity_type, entity_id, entity_name, result, reason, metadata::jsonb, created_at
FROM (
  VALUES
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-1111-1111-1111-111111111111', 'ayesha.rahman@bdrcs.org', 'SUCCESS', NULL, '{"firstName": "Ayesha", "lastName": "Rahman"}'::text, now() - interval '25 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-2222-2222-2222-222222222222', 'm.hossain@bfsccd.gov.bd', 'SUCCESS', NULL, '{"firstName": "Mohammed", "lastName": "Hossain"}'::text, now() - interval '20 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-3333-3333-3333-333333333333', 'fatima.begum@brac.net', 'SUCCESS', NULL, '{"firstName": "Fatima", "lastName": "Begum"}'::text, now() - interval '18 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-4444-4444-4444-444444444444', 'rashid.khan@bfsccd.gov.bd', 'SUCCESS', NULL, '{"firstName": "Rashid", "lastName": "Khan"}'::text, now() - interval '15 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-5555-5555-5555-555555555555', 'nusrat.jahan@bdrcs.org', 'SUCCESS', NULL, '{"firstName": "Nusrat", "lastName": "Jahan"}'::text, now() - interval '2 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-6666-6666-6666-666666666666', 'tariq.ahmed@brac.net', 'SUCCESS', NULL, '{"firstName": "Tariq", "lastName": "Ahmed"}'::text, now() - interval '12 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-7777-7777-7777-777777777777', 'sadia.islam@gov.bd', 'SUCCESS', NULL, '{"firstName": "Sadia", "lastName": "Islam"}'::text, now() - interval '30 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-8888-8888-8888-888888888888', 'imran.chowdhury@bfsccd.gov.bd', 'SUCCESS', NULL, '{"firstName": "Imran", "lastName": "Chowdhury"}'::text, now() - interval '10 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-9999-9999-9999-999999999999', 'nadia.akter@bdrcs.org', 'SUCCESS', NULL, '{"firstName": "Nadia", "lastName": "Akter"}'::text, now() - interval '22 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hasan.mahmud@gov.bd', 'SUCCESS', NULL, '{"firstName": "Hasan", "lastName": "Mahmud"}'::text, now() - interval '8 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'lubna.karim@brac.net', 'SUCCESS', NULL, '{"firstName": "Lubna", "lastName": "Karim"}'::text, now() - interval '1 day'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_CREATED', 'USER', 'a1b2c3d4-cccc-cccc-cccc-cccccccccccc', 'faisal.rahman@bfsccd.gov.bd', 'SUCCESS', NULL, '{"firstName": "Faisal", "lastName": "Rahman"}'::text, now() - interval '5 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'ROLE_ASSIGNED', 'USER', 'a1b2c3d4-1111-1111-1111-111111111111', 'ayesha.rahman@bdrcs.org', 'SUCCESS', NULL, '{"role": "District Coordinator", "district": "Dhaka"}'::text, now() - interval '25 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'ROLE_ASSIGNED', 'USER', 'a1b2c3d4-3333-3333-3333-333333333333', 'fatima.begum@brac.net', 'SUCCESS', NULL, '{"role": "Organization Administrator", "organization": "BRAC Disaster Management"}'::text, now() - interval '18 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'ROLE_ASSIGNED', 'USER', 'a1b2c3d4-7777-7777-7777-777777777777', 'sadia.islam@gov.bd', 'SUCCESS', NULL, '{"role": "Auditor"}'::text, now() - interval '30 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_SUSPENDED', 'USER', 'a1b2c3d4-7777-7777-7777-777777777777', 'sadia.islam@gov.bd', 'SUCCESS', 'Policy violation - unauthorized data access attempt', '{}'::text, now() - interval '5 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_LOCKED', 'USER', 'a1b2c3d4-9999-9999-9999-999999999999', 'nadia.akter@bdrcs.org', 'SUCCESS', 'Too many failed login attempts (5)', '{}'::text, now() - interval '3 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'DISTRICT_UPDATED', 'DISTRICT', 'a1b2c3d4-1111-1111-1111-111111111111', 'Dhaka', 'SUCCESS', NULL, '{"field": "name_bn"}'::text, now() - interval '14 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'DISTRICT_DEACTIVATED', 'DISTRICT', 'a1b2c3d4-2222-2222-2222-222222222222', 'Faridpur', 'SUCCESS', 'Administrative reorganization', '{}'::text, now() - interval '7 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'DISTRICT_RESTORED', 'DISTRICT', 'a1b2c3d4-2222-2222-2222-222222222222', 'Faridpur', 'SUCCESS', NULL, '{}'::text, now() - interval '2 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'ORGANIZATION_CREATED', 'ORGANIZATION', 'a1b2c3d4-3333-3333-3333-333333333333', 'Bangladesh Army Disaster Relief', 'SUCCESS', NULL, '{"type": "MILITARY"}'::text, now() - interval '10 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'ORGANIZATION_UPDATED', 'ORGANIZATION', 'a1b2c3d4-4444-4444-4444-444444444444', 'CARITAS Bangladesh', 'SUCCESS', NULL, '{"field": "phone"}'::text, now() - interval '4 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'ORGANIZATION_DEACTIVATED', 'ORGANIZATION', 'a1b2c3d4-5555-5555-5555-555555555555', 'Islamic Relief Bangladesh', 'WARNING', 'Under review for compliance', '{}'::text, now() - interval '1 day'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'PROFILE_UPDATED', 'USER', '1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'SUCCESS', NULL, '{"fields": ["first_name", "phone"]}'::text, now() - interval '6 hours'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'PASSWORD_CHANGED', 'USER', '1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'SUCCESS', NULL, '{}'::text, now() - interval '3 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_LOGIN', 'USER', '1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'SUCCESS', NULL, '{}'::text, now() - interval '2 hours'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'USER_LOGIN_FAILED', 'USER', 'a1b2c3d4-9999-9999-9999-999999999999', 'nadia.akter@bdrcs.org', 'FAILURE', 'Invalid password', '{}'::text, now() - interval '3 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'ROLE_CREATED', 'ROLE', 'a1b2c3d4-dddd-dddd-dddd-dddddddddddd', 'Field Operations Lead', 'SUCCESS', NULL, '{"permissions": 8}'::text, now() - interval '9 days'),
    ('1361b3b1-1d74-4ec4-8c11-70634203c933', 'safkatkhan420@gmail.com', 'USER', 'ROLE_UPDATED', 'ROLE', 'a1b2c3d4-dddd-dddd-dddd-dddddddddddd', 'Field Operations Lead', 'SUCCESS', NULL, '{"added": ["organizations.deactivate"]}'::text, now() - interval '6 days')
) AS t(actor_id, actor_email, actor_type, action, entity_type, entity_id, entity_name, result, reason, metadata, created_at)
ON CONFLICT DO NOTHING;