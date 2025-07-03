#!/bin/bash

# Stop unnecessary services
pm2 stop all
sudo systemctl stop postgresql nginx

# Clear memory
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches

# Build with specific settings
cd /var/www/oporadom
export NODE_OPTIONS="--max-old-space-size=1024"
export NEXT_TELEMETRY_DISABLED=1

# Remove cache
rm -rf .next

# Build
npm run build

# Restart services
sudo systemctl start postgresql nginx
pm2 start all
