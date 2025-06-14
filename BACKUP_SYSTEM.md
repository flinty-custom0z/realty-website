# Database Backup System

This project includes an automatic database backup system that creates backups before every build to prevent data loss.

## How It Works

### Automatic Backups
- **When**: Automatically runs before every build (`npm run build`, `npm run build:prod`, `vercel-build`)
- **Where**: Backups are saved to `sql_backup/` directory
- **Format**: `auto_backup_YYYY-MM-DDTHH-MM-SS.sql`
- **Retention**: Keeps the 10 most recent backups, automatically deletes older ones

### Manual Backup
You can create a backup anytime:
```bash
npm run backup-db
```

### Restore from Backup
To see available backups:
```bash
npm run restore-db
```

To restore from a specific backup:
```bash
npm run restore-db auto_backup_2025-06-14T11-51-04.sql
```

## Backup Features

✅ **Automatic**: Runs before every build  
✅ **Safe**: Won't fail builds if backup fails  
✅ **Clean**: Automatically removes old backups  
✅ **Complete**: Full database dump with schema and data  
✅ **Timestamped**: Easy to identify when backup was created  

## Files

- `scripts/backup-db.js` - Creates database backups
- `scripts/restore-db.js` - Restores database from backups
- `sql_backup/` - Directory containing all backup files

## Requirements

- PostgreSQL client tools (`pg_dump`, `psql`)
- `DATABASE_URL` environment variable
- `dotenv` package for environment variables

## Troubleshooting

### Backup Fails
- Check that `pg_dump` is installed and accessible
- Verify `DATABASE_URL` is correct in `.env`
- Ensure database is accessible from your machine

### Restore Fails
- Check that `psql` is installed and accessible
- Verify the backup file exists and is not corrupted
- Ensure you have write permissions to the database

## Security Notes

- Backup files contain sensitive data - keep them secure
- Don't commit backup files to version control
- The `sql_backup/` directory is already in `.gitignore` 