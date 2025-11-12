@echo off
title 🚀 Uploading project to GitHub...
cd /d "C:\Users\h\Desktop\personal-automated-crypto-trading-system (24)"

echo --------------------------------------------
echo 🔧 Configuring Git user info...
git config --global user.name "cinematic23752-lab"
git config --global user.email "cinematic23752@gmail.com"
echo ✅ Git user info configured.
echo --------------------------------------------

echo 🌀 Initializing local repository...
git init

echo 🧩 Switching or creating branch 'main'...
git checkout -B main

echo 🧮 Adding all files...
git add .

set datetime=%date% %time%
echo 💾 Committing changes with timestamp...
git commit -m "Auto upload on %datetime%"

echo 🔗 Setting remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/cinematic23752-lab/laughing-sniffle.git

echo 🚀 Uploading to GitHub...
git push -u origin main --force

echo --------------------------------------------
echo ✅ Upload completed successfully!
echo --------------------------------------------
pause
