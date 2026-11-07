-- Demo data. Run after schema.sql.
-- Demo login: username demo_user, password Demo123!
USE vector_geometry;

INSERT INTO users (userID, username) VALUES (1, 'demo_user');

-- hashedPassword = password_hash('Demo123!' . passwordSalt, PASSWORD_BCRYPT)
INSERT INTO loginInformation (userID, hashedPassword, passwordSalt) VALUES
  (1, '$2y$12$qwEhgOr3xL087WGoRcjihuMkPEKJcDw93DE.nvYxxMMoZTfiFd3R.', '2f2066053ca334e89073fbe031bf86ab');