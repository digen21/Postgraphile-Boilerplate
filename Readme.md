**<h1>Project Setup Guide 🚀</h1>**

Follow these steps to set up the project on your local environment:

1. <h3>Setup Environment Variables 🌐</h3>

- copy the .env.example and make new .env.
  - add the required values in env file.

💡 **Tip: Check the .env.example for guidance on the format of the values.**

<br>
<hr>
<br>

2.  <h3>Install Dependencies 📦</h3>

    - Open your terminal in the project directory and run the following command to install all the required packages:

             yarn

<br>

⏳ Note: This might take a few minutes depending on your internet speed. Make sure all dependencies are installed before proceeding.

<br>
<hr>
<br>

3.  <h3>Database Setup 🗃️ </h3>

    - Step 1: To set up the database, run the following command:

            yarn setup:db

    <br>

    - Step 2: You will be prompted to drop and create a new database. Type yes to allow the system to proceed.

      - 🚨 Warning: Dropping the database will delete any existing data, so make sure you're okay with that before proceeding.

<br>
<hr>
<br>

4. <h3>Explore Migrations 📜</h3>

   - After setting up the database, check out the migrations folder. This folder contains all the database migration files.

   - 🔍 Note: Migrations ensure that the database structure is up to date with the project. No need to modify anything unless you're making schema changes.

<br>
<hr>
<br>

5.  <h3>Start the Project 🏁</h3>

    - Finally, to run the project in development mode, use the command:

    <br>

        yarn dev

<br>
🚀 Pro Tip: Once the project is running, visit http://localhost:port in your browser to see it in action!

<br>
<hr>
<br>

You're all set! 🎉
If you run into any issues, feel free to check the logs for more details or contact the project maintainers.
