-- Indexes for notification_templates to support versioned lookups and latest active queries

-- Ensure unique version per (template_key, locale, channel)
ALTER TABLE `notification_templates`
    ADD UNIQUE KEY `uq_tpl_key_locale_channel_version` (`template_key`,`locale`,`channel`,`version`);

-- Cover common lookups for latest active versions
CREATE INDEX `idx_tpl_active`
    ON `notification_templates` (`template_key`,`locale`,`channel`,`is_active`,`version`);

-- General lookup index without is_active to speed listing and filtering
CREATE INDEX `idx_tpl_lookup`
    ON `notification_templates` (`template_key`,`locale`,`channel`);


