@echo off
echo Running database update script...

echo Generating Prisma client with new schema...
npx prisma generate

echo Creating and applying migration for organization fields...
npx prisma migrate dev --name add_organization_fields --skip-seed

echo Migration complete!
echo.
echo The database schema has been updated with the new organization fields.
echo Restart your backend server to apply the changes.
pause