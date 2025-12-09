# How to Fix and Start PrepPioneer

It seems like the previous startup script didn't work, likely because dependencies weren't installed or PowerShell permissions blocked the script.

I have created a new, more robust Windows Batch script that will:
1.  Check if Node.js is installed.
2.  Install all necessary dependencies for both the Server and Client.
3.  Set up the database.
4.  Launch both the Backend and Frontend in separate windows.

## Option 1: The Easy Way (Double Click)

1.  Open the folder `d:\Desktop\prepioneer-project-main` in your File Explorer.
2.  Find the file named **`install-and-start.bat`**.
3.  Double-click it.
4.  Wait for the black terminal windows to appear and finish setting up.

## Option 2: Run from VS Code

1.  Press `Ctrl+Shift+P`.
2.  Type **"Run Task"**.
3.  Select **"Start PrepPioneer (Windows Batch)"**.

## Troubleshooting

If you see an error saying `'node' is not recognized`, you need to install Node.js from [nodejs.org](https://nodejs.org/).

If the windows open and close immediately:
1.  Open a terminal in VS Code (`Ctrl+` `).
2.  Type `.\install-and-start.bat` and press Enter.
3.  Read the error message displayed.
