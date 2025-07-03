#!/bin/bash
cd /var/www/oporadom
export NODE_OPTIONS="--max-old-space-size=1536"
npm start
