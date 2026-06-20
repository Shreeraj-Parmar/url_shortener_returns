# URL Shortener API

* Uses **Node.js**
* Uses **PostgreSQL** database
* Uses **Express.js** framework for building the server
* Uses **dotenv** for environment variable imports

## Database Connection

The application connects to PostgreSQL using the following environment variables:

1. `DB_USER`
2. `DB_HOST`
3. `DB_NAME`
4. `DB_PASS`
5. `DB_PORT`

You can check the `db.js` file for the database connection configuration.

## Database Table

Make sure you have created a PostgreSQL table with the following columns:

1. `id`
2. `original_url`
3. `short_code`
4. `created_at`
5. `updated_at`
6. `visit_count`

**Important:** The code uses the table name `url_shortener`. Please use this exact table name; otherwise, the application will not work correctly.

## Run the Project

1. `npm install`
2. `npm run dev`
