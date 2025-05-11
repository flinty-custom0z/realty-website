#!/bin/bash

# Exit on error
set -e

echo "==== Step 1: Creating districts from seed data ===="
npx ts-node scripts/create-districts-from-seed.ts

echo "==== Step 2: Updating listings with district references ===="
npx ts-node scripts/update-listing-districts.ts

echo "==== District fix completed successfully ====" 