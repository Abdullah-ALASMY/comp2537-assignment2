COMP 2537 - Assignment 2

Student: Abdullah Al Asmy Set 1B
=================================================
=================================================

Self-graded Assignment 2 Checklist

    Criteria	
    ========
    
[x]  The /admin page redirects to the /login page if not logged in.

[x]  The /admin page shows an error message if logged in, but not an admin.

[x]  The /admin page shows a list of all users.

[x]  The /admin page allows for promoting and demoting users to/from admin type.

[x]  All pages use a CSS Framework like Bootstrap (you must incorporate a header, footer, responsive grid, forms, buttons).

[x]  The site uses EJS as a templating engine.

[x]  Common headers and footers are shared across all pages.

[x]  Code used within loop is templated using EJS (ex: list of users in admin page).

[x]  The members page has a responsive grid of 3 images.

[x]  Your site is hosted on Render or other hosting site.
 
50/50 (Total grade out of 50, 5 marks each x 10 items).

*Note items are considered *fully* complete (marked with an x inside the box: [x]), OR incomplete (box is left empty: [ ])


=================================================
=================================================


Description:
This is a Node.js web application featuring user authentication and role-based authorization. Users can sign up, log in, and access a members-only page displaying a responsive grid of three images. Admins have access to an admin panel where they can view all users and promote or demote them. The app is built using EJS for templating and Bootstrap for responsive design. User sessions are securely managed with MongoDB, and the app is deployed on Render with secure environment variables.

Technologies Used:
- Node.js
- Express
- MongoDB Atlas
- bcrypt
- Joi
- express-session
- connect-mongo
- dotenv

To Run the Project:
1. Run 'npm install'
2. Create a .env file with the required keys (MONGO_URL, secrets, etc.)
3. Run 'node server.js'
4. Open http://localhost:3000 in your browser

Note:
- All secrets are kept in the .env file and not uploaded to GitHub.
- Sessions expire after 1 hour and are stored in MongoDB.

Thank you.
