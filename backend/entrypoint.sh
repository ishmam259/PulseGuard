#!/bin/sh
npm run migrate
npm run seed
node server.js