CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  role_id         BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_email (email),
  KEY idx_users_org (organization_id),
  CONSTRAINT fk_users_org  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE invitations (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  role_id         BIGINT UNSIGNED NOT NULL,
  email           VARCHAR(190) NOT NULL,
  token_hash      CHAR(64)     NOT NULL,
  expires_at      DATETIME     NOT NULL,
  accepted_at     DATETIME     NULL,
  invited_by      BIGINT UNSIGNED NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_inv_org (organization_id),
  KEY idx_inv_token (token_hash),
  CONSTRAINT fk_inv_org  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_inv_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_inv_by   FOREIGN KEY (invited_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  CHAR(64) NOT NULL,
  expires_at  DATETIME NOT NULL,
  revoked_at  DATETIME NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rt_user (user_id),
  KEY idx_rt_token (token_hash),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;