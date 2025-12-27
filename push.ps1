cd "C:\Users\visha\Desktop\Varanasihub.com-main"

# Initialize git if needed
if (-not (Test-Path .git)) {
    git init
}

# Remove existing remote and add new one
git remote remove origin 2>$null
git remote add origin https://github.com/VishalSingh1431/Safehandstravels.git

# Add all files
git add -A

# Commit
git commit -m "Push Varanasihub website" --allow-empty

# Set branch to main
git branch -M main

# Push with force
Write-Host "Pushing to GitHub..."
git push -u origin main --force

Write-Host "Done!"




