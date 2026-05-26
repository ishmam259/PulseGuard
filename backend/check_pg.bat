@echo off
set PGPASSWORD=wirelight
psql -U postgres -c "DROP DATABASE IF EXISTS pulseguard"
echo Dropped old local database.
