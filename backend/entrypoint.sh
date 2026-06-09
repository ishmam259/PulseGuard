#!/bin/sh
npm run migrate
npm run seed
node scripts/import-fcdb.js
node server.js
