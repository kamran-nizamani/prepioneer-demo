# Deploying PrepPioneer Client to GitHub Pages

This guide will help you deploy the **frontend (client)** of PrepPioneer to GitHub Pages as a live demo.

## ⚠️ Important Limitation
GitHub Pages only hosts **static websites**. It cannot run the backend server (Node.js/Express/Prisma).
- **What will work:** The user interface (UI), pages, and navigation.
- **What won't work:** Logging in, fetching data, saving data, or any feature that requires the backend server.
- **Solution for Demo:** You can show the UI to your teacher. If you need a fully functional live demo, you would need to deploy the server to a service like Render, Railway, or Fly.io.

## Prerequisites
1.  You must have a **GitHub account**.
2.  You must have **Git** installed on your computer.

## Step 1: Prepare the Project (Already Done)
I have already configured the project for you:
1.  Updated `client/vite.config.js` to use relative paths (`base: './'`).
2.  Installed `gh-pages` package.
3.  Added `deploy` scripts to `client/package.json`.

## Step 2: Create a GitHub Repository
1.  Go to [GitHub.com](https://github.com) and sign in.
2.  Click the **+** icon in the top right and select **New repository**.
3.  Name it `prepioneer-demo` (or any name you like).
4.  Make it **Public**.
5.  Click **Create repository**.

## Step 3: Push Your Code to GitHub
Open a terminal in the root folder (`d:\Desktop\prepioneer-project-main`) and run these commands:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for deployment"

# Link to your new GitHub repository (Replace URL with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/prepioneer-demo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy the Client
Now, deploy the frontend to GitHub Pages.

1.  Open your terminal and navigate to the `client` folder:
    ```bash
    cd client
    ```

2.  Run the deploy command:
    ```bash
    npm run deploy
    ```

3.  This command will:
    - Build the project.
    - Upload the `dist` folder to a `gh-pages` branch on your repository.

## Step 5: View Your Live Demo
1.  Go to your GitHub repository page.
2.  Click on **Settings** > **Pages**.
3.  You should see a message saying "Your site is live at...".
4.  Click the link to view your demo!

## Troubleshooting
- **404 Error:** Wait a few minutes, it takes time to update.
- **Blank Page:** Ensure `vite.config.js` has `base: './'` (I added this for you).
- **API Errors:** As mentioned, the backend is not running, so you will see errors if you try to login or fetch data.
