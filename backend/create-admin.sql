USE fitchallenge;

INSERT INTO admin_users (username, password_hash, role, permissions, is_active) 
VALUES ('admin', '$2a$10$iYNYnbJCp.s2.tVnf6AJVOjq9ZDGAS1O8ykhktjgQExsxxWWJjbRu', 'admin', '["all"]', 1);
