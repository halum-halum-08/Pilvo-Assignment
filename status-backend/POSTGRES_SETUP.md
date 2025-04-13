# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for use with the Status Page application.

## Installing PostgreSQL

### Windows

1. Download the installer from [PostgreSQL's official site](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the installation wizard
3. Keep note of the password you set for the 'postgres' user
4. Allow the installer to set up PostgreSQL as a service

### macOS

Using Homebrew:
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Creating a Database

Once PostgreSQL is installed, you need to create a database for the application:

### Windows

1. Open the PostgreSQL command line client (pgAdmin or psql from the Start menu)
2. Login with the postgres user and password you set during installation
3. Run the following commands:

```sql
CREATE DATABASE statuspage;
```

### macOS/Linux

```bash
sudo -u postgres psql
```

Then in the PostgreSQL prompt:

```sql
CREATE DATABASE statuspage;
\q
```

## Updating Your .env File

After setting up PostgreSQL, update your `.env` file with the correct connection string:

