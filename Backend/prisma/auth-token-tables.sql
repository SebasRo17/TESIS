CREATE TABLE IF NOT EXISTS `password_resets` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `used_at` DATETIME(0) NULL,
    `ip` VARCHAR(255) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    INDEX `idx_pw_resets_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `email_verifications` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `used_at` DATETIME(0) NULL,
    `ip` VARCHAR(255) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    INDEX `idx_email_verif_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `password_resets`
    ADD CONSTRAINT `fk_pw_resets_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `email_verifications`
    ADD CONSTRAINT `fk_email_verif_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
