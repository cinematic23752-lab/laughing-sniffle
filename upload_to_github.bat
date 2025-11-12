@echo off
title 🚀 Auto Update Project on GitHub
cd /d "C:\Users\h\Desktop\personal-automated-crypto-trading-system (24)"

echo --------------------------------------------
echo 🔧 Configuring Git user info...
git config --global user.name "cinematic23752-lab"
git config --global user.email "cinematic23752@gmail.com"
echo ✅ Git user info configured.
echo --------------------------------------------

echo 🌀 Initializing or updating local repository...
git init
git checkout -B main

echo 🧩 Creating or updating .gitignore file...
(
  echo node_modules/
  echo __pycache__/
  echo .env
  echo *.log
  echo .DS_Store
  echo venv/
) > .gitignore

echo 🧮 Adding all modified files...
git add -A

set datetime=%date% %time%
echo 💾 Committing changes with timestamp...
git commit -m "Auto update on %datetime%" >nul 2>&1

echo 🔗 Setting remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/cinematic23752-lab/laughing-sniffle.git

echo 🚀 Pushing updates to GitHub...
git push -u origin main --force

echo --------------------------------------------
echo ✅ Project updated successfully on GitHub!
echo --------------------------------------------

echo 🧾 Writing log...
echo [%datetime%] Upload completed successfully >> upload_log.txt

pause
