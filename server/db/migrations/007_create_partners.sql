CREATE TABLE partners (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id    BIGINT UNSIGNED NOT NULL,
  type               ENUM('supplier','customer') NOT NULL,
  name               VARCHAR(150) NOT NULL,
  contact_person     VARCHAR(120) NULL,
  email              VARCHAR(190) NULL,
  phone              VARCHAR(30)  NULL,
  address            VARCHAR(300) NULL,
  tax_id             VARCHAR(30)  NULL,
  payment_terms_days SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  notes              VARCHAR(1000) NULL,
  is_active          TINYINT(1) NOT NULL DEFAULT 1,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_partner_name (organization_id, type, name),
  KEY idx_partner_list (organization_id, type, is_active),
  CONSTRAINT fk_partner_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB;