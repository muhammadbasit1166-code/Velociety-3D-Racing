VELOCITY 3D RACING - STARTER PROJECT
=====================================

PROJECT FILES
-------------
index.html                 Game screen and menus
style.css                  Interface design
script.js                  Three.js 3D game logic
main.cjs                   Electron desktop window
package.json               Project dependencies and Windows build settings
.github/workflows/
  build-windows.yml        Cloud workflow to build a Windows EXE on GitHub

RUN IN A BROWSER (requires Node.js and Python)
----------------------------------------------
1. Install Node.js from https://nodejs.org/
2. Open a terminal in this folder.
3. Run: npm install
4. Run: python -m http.server 8000
5. Open http://localhost:8000 in Chrome or Edge.

BUILD A WINDOWS EXE ON GITHUB (no local build tools required)
-------------------------------------------------------------
1. Sign in to GitHub and create a NEW repository.
2. For easiest free use of GitHub-hosted runners, make it PUBLIC.
   Note: a public repository makes your source code visible to everyone.
3. Extract this ZIP on your PC.
4. Upload all project files and folders to the repository's main branch.
   IMPORTANT: include the .github/workflows/build-windows.yml file and
   keep its folder structure exactly as shown.
5. Open the repository on GitHub.
6. Select the Actions tab.
7. Select "Build Windows EXE" from the left side.
8. Click "Run workflow" and confirm.
9. Wait for the workflow to finish successfully.
10. Open the completed workflow run and find its Artifacts section.
11. Download "Velocity-3D-Racing-Windows" and extract the downloaded ZIP.
12. Run the .exe inside it on Windows.

NOTES
-----
- GitHub Actions uses a cloud Windows computer to compile the EXE.
- The generated EXE is unsigned; Windows may show a SmartScreen warning.
  Only run it if you built it yourself from this project.
- The EXE is a portable Electron app and may be much larger than the
  original HTML/CSS/JS files because it includes a browser runtime.
- Three.js is included as an npm dependency in the app package.
- This is an early playable prototype. Cars are built from basic 3D
  shapes, not detailed imported sports-car models.
- Do not upload passwords, API keys, or private information to GitHub.
