# Fixing database issues

## Reset the database

npx prisma migrate reset --force

---

DATABASE_URL="postgresql://neondb_owner:npg_GqERPDthux54@ep-white-poetry-a2mjwfkd.eu-central-1.aws.neon.tech/neondb?sslmode=require"

---

psql "postgresql://neondb_owner:npg_GqERPDthux54@ep-white-poetry-a2mjwfkd.eu-central-1.aws.neon.tech/neondb?sslmode=require" < "$BACKUP_SQL"

---

npx prisma migrate resolve --applied 20250510134606_add_district_model

---

## Create a SQL script to check and add missing columns

cat > fix_missing_columns.sql << 'EOL'
-- Check if title column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Listing' AND column_name = 'title'
    ) THEN
        ALTER TABLE "Listing" ADD COLUMN "title" TEXT NOT NULL DEFAULT '';
    END IF;
END
$$;
EOL

# Run the SQL script
psql "$DATABASE_URL" -f fix_missing_columns.sql

---

npx prisma migrate deploy

---

npx prisma generate

---

## Failed Migrations

The most common fix is to mark the failed migration as rolled back or applied, then re-run npx prisma migrate deploy. This will unblock your migration system.

npx prisma migrate resolve --rolled-back <migration_name>

OR

npx prisma migrate resolve --applied <migration_name>


---

## To solve

npx prisma migrate resolve --applied 20250510134606_add_district_model

npx prisma migrate status

npx prisma migrate deploy