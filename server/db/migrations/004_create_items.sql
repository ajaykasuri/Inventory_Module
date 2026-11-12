CREATE TABLE units (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(60) NOT NULL,
  abbreviation    VARCHAR(12) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_unit_name (organization_id, name),
  CONSTRAINT fk_units_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(100) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_category_name (organization_id, name),
  CONSTRAINT fk_categories_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB;

CREATE TABLE items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  sku             VARCHAR(60)  NOT NULL,
  name            VARCHAR(190) NOT NULL,
  description     TEXT NULL,
  category_id     BIGINT UNSIGNED NULL,
  unit_id         BIGINT UNSIGNED NOT NULL,
  tracking_type   ENUM('none','batch','serial') NOT NULL DEFAULT 'none',
  barcode         VARCHAR(80) NULL,
  cost_price      DECIMAL(14,2) NOT NULL DEFAULT 0,
  selling_price   DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax_rate        DECIMAL(5,2)  NOT NULL DEFAULT 0,
  reorder_level   DECIMAL(14,3) NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_item_sku (organization_id, sku),
  UNIQUE KEY uq_item_barcode (organization_id, barcode),
  KEY idx_items_org_name (organization_id, name),
  KEY idx_items_category (category_id),
  CONSTRAINT fk_items_org      FOREIGN KEY (organization_id) REFERENCES organizations(id),
  CONSTRAINT fk_items_category FOREIGN KEY (category_id)     REFERENCES categories(id),
  CONSTRAINT fk_items_unit     FOREIGN KEY (unit_id)         REFERENCES units(id)
) ENGINE=InnoDB;