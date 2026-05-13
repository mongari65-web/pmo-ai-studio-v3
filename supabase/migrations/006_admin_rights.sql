-- Donner accès total à mongari65@gmail.com
UPDATE profiles
SET plan = 'team',
    ai_calls_count = 0,
    is_banned = false
WHERE email = 'mongari65@gmail.com';

-- Vérification
SELECT id, email, plan, ai_calls_count FROM profiles WHERE email = 'mongari65@gmail.com';

-- Ajouter comme super_admin si pas déjà fait
INSERT INTO admin_users (user_id, role)
SELECT id, 'super_admin'
FROM profiles
WHERE email = 'mongari65@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
