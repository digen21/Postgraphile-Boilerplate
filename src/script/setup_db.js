const platform = require("os").platform();
const dotenv = require("dotenv");
const pg = require("pg");
const path = require("path");

const projectName = process.env.PROJECT_NAME;

const yarnCmd = platform === "win32" ? "yarn.cmd" : "yarn";

const runMain = (main) => {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
};

const outro = (message) => {
  console.log();
  console.log();
  console.log("____________________________________________________________");
  console.log();
  console.log();
  console.log(message);
  console.log();
  console.log();
  console.log("🙏 Please support our Open Source work:");
  console.log("     https://graphile.org/sponsor");
  console.log();
  console.log("____________________________________________________________");
  console.log();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runMain(async () => {
  // Source our environment
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });

  const {
    DATABASE_AUTHENTICATOR,
    DATABASE_AUTHENTICATOR_PASSWORD,
    DATABASE_NAME,
    DATABASE_OWNER,
    DATABASE_OWNER_PASSWORD,
    DATABASE_VISITOR,
    CONFIRM_DROP,
    ROOT_DATABASE_URL,
  } = process.env;

  if (!CONFIRM_DROP) {
    const { default: inquirer } = await import("inquirer");

    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "CONFIRM",
        default: false,
        message: `We're going to drop (if necessary):

  - database ${DATABASE_NAME}
  - database ${DATABASE_NAME}_shadow
  - database role ${DATABASE_VISITOR} (cascade)
  - database role ${DATABASE_AUTHENTICATOR} (cascade)
  - database role ${DATABASE_OWNER}`,
      },
    ]);
    if (!confirm.CONFIRM) {
      console.error("Confirmation failed; exiting");
      process.exit(1);
    }
  }

  console.log("Installing or reinstalling the roles and database...");
  const pgPool = new pg.Pool({
    connectionString: ROOT_DATABASE_URL,
  });

  pgPool.on("error", (err) => {
    // Ignore
    console.log(
      "An error occurred whilst trying to talk to the database: " + err.message
    );
  });

  // Wait for PostgreSQL to come up
  let attempts = 0;
  while (true) {
    try {
      await pgPool.query('select true as "Connection test";');
      break;
    } catch (e) {
      if (e.code === "28P01") {
        throw e;
      }
      attempts++;
      if (attempts <= 30) {
        console.log(
          `Database is not ready yet (attempt ${attempts}): ${e.message}`
        );
      } else {
        console.log(`Database never came up, aborting :(`);
        process.exit(1);
      }
      await sleep(1000);
    }
  }

  const client = await pgPool.connect();
  try {
    // Drop the roles if they already exist
    await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME} ;`);
    await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}_shadow ;`);
    await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}_test ;`);
    await client.query(`DROP ROLE IF EXISTS ${DATABASE_AUTHENTICATOR} ;`);
    await client.query(`DROP ROLE IF EXISTS ${DATABASE_OWNER} ;`);
    // await client.query(`DROP ROLE IF EXISTS ${DATABASE_VISITOR} ;`);

    // Create the database owner role with SUPERUSER privileges
    await client.query(
      `CREATE ROLE ${DATABASE_OWNER} WITH LOGIN PASSWORD '${DATABASE_OWNER_PASSWORD}' SUPERUSER;`
    );

    // Create the authenticator role with LOGIN and NOINHERIT privileges
    await client.query(
      `CREATE ROLE ${DATABASE_AUTHENTICATOR} WITH LOGIN PASSWORD '${DATABASE_AUTHENTICATOR_PASSWORD}' NOINHERIT;`
    );

    // Create the visitor role
    // await client.query(`CREATE ROLE ${DATABASE_VISITOR};`);

    // Create the databases
    await client.query(
      `CREATE DATABASE ${DATABASE_NAME} OWNER ${DATABASE_OWNER};`
    );
    await client.query(
      `CREATE DATABASE ${DATABASE_NAME}_shadow OWNER ${DATABASE_OWNER};`
    );

    // Grant the necessary permissions to the visitor role
    await client.query(
      `GRANT CONNECT ON DATABASE ${DATABASE_NAME} TO ${DATABASE_VISITOR};`
    );
    await client.query(`GRANT USAGE ON SCHEMA public TO ${DATABASE_VISITOR};`);
    await client.query(
      `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DATABASE_VISITOR};`
    );

    // Grant the visitor role to the authenticator role
    await client.query(
      `GRANT ${DATABASE_VISITOR} TO ${DATABASE_AUTHENTICATOR};`
    );
  } finally {
    // Release the client
    await client.release();
  }

  // Close the connection
  await pgPool.end();

  outro(`\
✅ Setup success

🚀 To get started, run:

${
  projectName
    ? // Probably Docker setup
      "  export UID; docker-compose up server"
    : `  ${yarnCmd} start`
}`);
});
