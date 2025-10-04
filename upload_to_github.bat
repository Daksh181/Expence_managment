@echo off
echo Initializing git repository...
git init

echo Adding remote origin...
git remote add origin https://github.com/Daksh181/Expence_managment.git

echo Adding all files...
git add .

echo Committing changes...
git commit -m "Initial commit"

echo Pushing to GitHub...
git push -u origin main

echo Done! Your project has been uploaded to GitHub.
pause
