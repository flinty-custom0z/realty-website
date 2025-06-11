-- Get the current max id
DO $$
DECLARE
    max_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM "_prisma_migrations";
    
    -- 20250510_fix_property_types
    IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250510_fix_property_types') THEN
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (max_id + 1, '42dfc44939b128c8713b056a1f4e52ce9949ae240d0baab4069e9032abeeed95', NOW(), '20250510_fix_property_types', NULL, NOW(), 1);
    END IF;
    
    -- 20250510_manual_add_district_model
    IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250510_manual_add_district_model') THEN
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (max_id + 2, '3a8f8f7d6e5d4c3b2a1098f7e6d5c4b3a2109f8e7d6c5b4a3', NOW(), '20250510_manual_add_district_model', NULL, NOW(), 1);
    END IF;
    
    -- 20250518212045_remove_rooms_field
    IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250518212045_remove_rooms_field') THEN
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (max_id + 3, '4b3a2109f8e7d6c5b4a3210f9e8d7c6b5a4321f0e9d8c7b6', NOW(), '20250518212045_remove_rooms_field', NULL, NOW(), 1);
    END IF;
    
    -- 20250520000000_add_coordinates_to_listings
    IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250520000000_add_coordinates_to_listings') THEN
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (max_id + 4, '5c4b3a210f9e8d7c6b5a4321f0e9d8c7b6a5432', NOW(), '20250520000000_add_coordinates_to_listings', NULL, NOW(), 1);
    END IF;
    
    -- 20250520000000_make_district_optional
    IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250520000000_make_district_optional') THEN
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (max_id + 5, '6d5c4b3a210f9e8d7c6b5a4321f0e9d8c7b6a543', NOW(), '20250520000000_make_district_optional', NULL, NOW(), 1);
    END IF;
    
    -- 20250607181619_make_property_type_optional
    IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250607181619_make_property_type_optional') THEN
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (max_id + 6, '7e6d5c4b3a210f9e8d7c6b5a4321f0e9d8c7b6a5', NOW(), '20250607181619_make_property_type_optional', NULL, NOW(), 1);
    END IF;
    
    -- 20250610000000_add_city_model_and_field
    IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250610000000_add_city_model_and_field') THEN
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (max_id + 7, '8f7e6d5c4b3a210f9e8d7c6b5a4321f0e9d8c7b6', NOW(), '20250610000000_add_city_model_and_field', NULL, NOW(), 1);
    END IF;
    
    -- 20250620000000_make_city_optional
    IF NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20250620000000_make_city_optional') THEN
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES (max_id + 8, '9g8f7e6d5c4b3a210f9e8d7c6b5a4321f0e9d8c7', NOW(), '20250620000000_make_city_optional', NULL, NOW(), 1);
    END IF;
END $$;
