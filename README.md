# Madurai CityBus Live — website prototype

A responsive static HTML/CSS/JavaScript prototype for exploring city bus routes around Madurai.

## Run on your Windows laptop
1. Extract the ZIP file.
2. Open the extracted folder.
3. Double-click `index.html`.

An internet connection is needed for the interactive OpenStreetMap map tiles and Leaflet library.

## Features
- Interactive map centred on Madurai
- Route list with route selection and route paths
- Sample stops that can be selected
- Bus markers that move along illustrative route lines
- Search for sample routes and stops
- Arrival cards with estimated demo ETAs
- Responsive layout for phone and desktop

## Important data notice
This is a **demo prototype**, not an official Madurai CityBus tracking service. Bus positions, route paths, speeds and ETAs are illustrative/simulated. It does not connect to real bus GPS devices, live government transport feeds, ticketing, or an operational backend. To offer genuine live tracking, you would need an authorized real-time vehicle location feed/API and a backend to securely process and publish that data.

## Deploy free with GitHub Pages
1. Create a **public** GitHub repository.
2. Upload the contents of this folder (not the ZIP itself) to the repository root. Keep `index.html`, `styles.css`, `script.js`, `README.md`, and `assets/` together.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**, select branch `main` and folder `/(root)`, then save.
5. After the deployment completes, open the Pages URL shown in Settings → Pages.

## Files
- `index.html` — page structure
- `styles.css` — responsive styling
- `script.js` — sample routes, simulated bus movement, search, and arrival UI
- `assets/bus.svg` — favicon
"# bus-connect-website" 
