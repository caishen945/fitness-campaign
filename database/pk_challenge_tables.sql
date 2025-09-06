-- PK挑战表
CREATE TABLE IF NOT EXISTS pk_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenger_id INT NOT NULL,
    opponent_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    reward_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    step_target INT NOT NULL DEFAULT 0,
    challenger_steps INT NOT NULL DEFAULT 0,
    opponent_steps INT NOT NULL DEFAULT 0,
    winner_id INT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (challenger_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opponent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PK挑战历史记录表
CREATE TABLE IF NOT EXISTS pk_challenge_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    steps INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES pk_challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (challenge_id, user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PK挑战消息表
CREATE TABLE IF NOT EXISTS pk_challenge_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES pk_challenges(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 添加索引
CREATE INDEX idx_pk_challenges_challenger_id ON pk_challenges(challenger_id);
CREATE INDEX idx_pk_challenges_opponent_id ON pk_challenges(opponent_id);
CREATE INDEX idx_pk_challenges_status ON pk_challenges(status);
CREATE INDEX idx_pk_challenge_history_challenge_id ON pk_challenge_history(challenge_id);
CREATE INDEX idx_pk_challenge_history_user_id ON pk_challenge_history(user_id);
CREATE INDEX idx_pk_challenge_messages_challenge_id ON pk_challenge_messages(challenge_id);
CREATE INDEX idx_pk_challenge_messages_sender_id ON pk_challenge_messages(sender_id);
CREATE INDEX idx_pk_challenge_messages_receiver_id ON pk_challenge_messages(receiver_id);
