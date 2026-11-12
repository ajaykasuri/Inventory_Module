CREATE TABLE warehouses (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  code            VARCHAR(20)  NOT NULL,
  name            VARCHAR(120) NOT NULL,
  address         VARCHAR(300) NULL,
  contact_person  VARCHAR(120) NULL,
  phone           VARCHAR(30)  NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wh_code (organization_id, code),
  UNIQUE KEY uq_wh_name (organization_id, name),
  CONSTRAINT fk_wh_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB;

CREATE TABLE locations (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  warehouse_id    BIGINT UNSIGNED NOT NULL,
  parent_id       BIGINT UNSIGNED NULL,
  type            ENUM('zone','rack','shelf','bin') NOT NULL,
  code            VARCHAR(40)  NOT NULL,
  description     VARCHAR(200) NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_loc_code (warehouse_id, code),
  KEY idx_loc_org (organization_id),
  KEY idx_loc_parent (parent_id),
  CONSTRAINT fk_loc_org       FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_loc_warehouse FOREIGN KEY (warehouse_id)    REFERENCES warehouses(id),
  CONSTRAINT fk_loc_parent    FOREIGN KEY (parent_id)       REFERENCES locations(id)
) ENGINE=InnoDB;