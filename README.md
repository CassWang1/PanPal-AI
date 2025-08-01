# PanPal AI - Final Project

## Project Description

PanPal AI is a web application designed to help users find recipe ideas based on the ingredients they currently have available. Users can manage a list of their ingredients, set dietary and meal preferences, and receive tailored recipe suggestions generated by an AI assistant (powered by OpenAI's GPT model). Users can also save their favorite recipes, mark them as "cooked", and share their creations with the community.

The application features a clean, responsive user interface built with React and Vite, supported by a robust Express.js backend that handles user authentication, data storage (in-memory), community features, and interaction with the OpenAI API. It utilizes modern JavaScript practices (ESM) on both client and server.

## Features

*   **User Authentication:** Simple username-based registration and login (no passwords). Reserved username 'dog' is disallowed. Admin role provides additional capabilities.
*   **Ingredient Management:** Add, view, and delete ingredients in your personal list. Quick-add feature for common ingredients.
*   **Recipe Preferences:** Configure detailed preferences before getting suggestions:
    *   Dietary Restrictions (Vegetarian, Vegan, Gluten-Free, Dairy-Free, Low-Carb)
    *   Cuisine Type (Italian, Mexican, Chinese, etc.)
    *   Spice Level (Mild, Medium, Hot)
    *   Meal Type (Breakfast, Lunch, Dinner, Snack, Dessert)
    *   Number of Servings
    *   Number of Recipes to Suggest (1-5)
*   **AI-Powered Suggestions:** Receive recipe suggestions based on your ingredients and preferences using OpenAI. Suggestions include:
    *   Title & Description
    *   Main Ingredients (from your list)
    *   Other Common Ingredients Needed
    *   Estimated Prep Time & Difficulty
    *   Step-by-step Instructions (with emphasis on authenticity where applicable)
*   **Recipe History:** Automatically tracks recently suggested recipes to avoid immediate repetition.
*   **Saved Recipes:** Save interesting suggestions to a personal list.
*   **Mark as Cooked:** Track which saved recipes you have prepared.
*   **Filter Saved Recipes:** View all, cooked, or uncooked saved recipes.
*   **Community Page:**
    *   View recipes shared by other users.
    *   Share your own saved recipes (with optional notes).
    *   Like/Unlike recipes shared by others.
    *   Sort community recipes by "Newest" or "Most Liked" (defaults to Most Liked).
    *   Content updates periodically via **polling**.
*   **Admin Dashboard:** (Accessible only to users with `isAdmin` flag, e.g., username 'admin')
    *   Manage the list of "Common Ingredients" used in the Quick Add feature.
    *   User Management: View registered users, including their registration date/time and duration.
    *   Ban or Unban users.
*   **SPA Navigation:** Uses the **Browser History API** for seamless navigation between views without full page reloads, supporting back/forward buttons.
*   **Responsive Design:** Adapts to different screen sizes.

## Setup and Running

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **API Key Configuration:**
    *   **Important:** For course review purposes, the OpenAI API Key is currently **hardcoded** in `server.js`. This allows the project to run without needing a separate `.env` file setup by the reviewer.
    *   The key is only used on the server-side and is never exposed to the client.
    *   In a production environment, this key would typically be stored in an environment variable (e.g., via a `.env` file and the `dotenv` package) and not committed to version control.
    *   The recipe suggestion feature will not work if the hardcoded key in `server.js` is invalid or removed.

3.  **Build the Frontend:**
    ```bash
    npm run build
    ```
    This compiles the React application into static assets in the `dist/` directory.

4.  **Start the Server:**
    ```bash
    npm start
    ```
    This command starts the Express server (`node server.js`), which serves both the static frontend application (`dist/` folder) and the backend API.

5.  **Access the Application:**
    *   Open your web browser and navigate to `http://localhost:3000` (the default port).

## How to Use

1.  **Register:** Create a unique alphanumeric username (including `_` or `-`). Cannot be "dog".
2.  **Login:** Log in with your registered username. (Try username 'admin' for admin features).
3.  **Add Ingredients:** Go to "My Ingredients", type and add, or use the "Quick Add" section.
4.  **Set Preferences:** Click "Set Recipe Preferences", configure options in the sidebar.
5.  **Get Suggestions:** Click "Get Recipe Suggestions". Review the cards.
6.  **Save Recipes:** Click "Save Recipe" on a suggestion card.
7.  **View Saved Recipes:** Navigate to "Saved Recipes". Filter, mark as cooked, or remove recipes.
8.  **Explore Community:** Navigate to "Community". View shared recipes (sorted by likes by default), like recipes, share one of your saved recipes using the button on the Saved Recipes page.
9.  **Admin Panel (if logged in as 'admin'):** Navigate to "Admin Dashboard". Add or remove ingredients from the "Common Ingredients" list or manage users (ban/unban).
10. **Navigate:** Use the header links or browser back/forward buttons.
11. **Logout:** Click "Logout" in the header.

## Security Notes

*   Authentication is username-based (no passwords).
*   Username "dog" is disallowed to login (403 Forbidden).
*   Admin functionality requires the `isAdmin` flag (checked via middleware).
*   User sessions are managed via secure `httpOnly` cookies (`sid`).
*   Basic input validation is performed client and server-side. React prevents XSS in rendering.

## Technology Stack

*   **Frontend:** React, Vite, CSS (no CSS preprocessors or UI libraries like Bootstrap)
*   **Backend:** Node.js, Express.js
*   **API:** OpenAI GPT-4.1-nano (for recipe suggestions)
*   **Key Dependencies:** `express`, `cookie-parser`

## Course Requirements & Bonus Features Met

This project aims to fulfill the final project requirements, including:
*   Vite-based React SPA and Express/Node.js backend.
*   RESTful services with multiple HTTP methods (GET, POST, PATCH, DELETE).
*   Server-side state management (users, ingredients, recipes, sessions).
*   User registration and authentication (session cookie based).
*   Input validation (client/server).
*   Conditional rendering for view management (no routing libraries).
*   Proper use of `fetch` and Promises (no `async/await`).
*   Semantic HTML/CSS, component-based structure with associated CSS files.
*   Adherence to specified "do not" restrictions (e.g., allowed libraries, no inline styles).

**Implemented Bonus Features:**
*   **Polling:** Community page and user management section in the admin dashboard poll for updates.
*   **Multiple HTTP Methods:** GET, POST, PATCH, DELETE used RESTfully.
*   **Authorization Levels:** Different permissions for regular users vs. admins.
*   **State-Managed Pages:** Views managed via state and conditional rendering.
*   **Back Button/Deeplinking:** Browser History API used for navigation.
*   **Good Architecture:** Clear separation of concerns (frontend/backend, services, data).

## Acknowledgments

*   Logo Icon: <a href="https://www.flaticon.com/free-icons/recipe" title="recipe icons">Recipe icons created by Freepik - Flaticon</a>. This icon is used under the Flaticon Free License, which permits free use for personal and commercial purposes with attribution.
*   Fonts: 'Ovo' and 'Poppins' sourced from <a href="https://fonts.google.com/">Google Fonts</a>.
*   Mascot Image (`panpan.png`): Generated using ChatGPT AI image generation.
