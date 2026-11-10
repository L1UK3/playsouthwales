# Leagues map styles

These files are the light and dark style templates for the leagues map. You add them to Google Cloud Console and attach them to one Map ID. The map then switches style with the site's dark-mode toggle.

## What the templates look like

- **[light.json](light.json)**: Warm paper land, soft blue water, and white roads. It matches the site's light theme.
- **[dark.json](dark.json)**: Slate land, deep navy water, and muted grey roads. It matches the site's dark theme.

Both templates hide businesses, other points of interest, and land parcels, so league markers stand out. They keep town names, parks, and railway stations to help players find each venue. The colours come from the design tokens in `frontend/src/assets/styles/global.css`.

## Set up the styles

1. In Google Cloud Console, open **Google Maps Platform** > **Map styles**.
2. Click **Create style**, open the **JSON** tab, and paste the contents of `light.json`. Name the style `Play South Wales light` and save it.
3. Repeat step 2 with `dark.json` and name it `Play South Wales dark`.
4. Open **Map management** and click **Create Map ID**. Choose the **JavaScript** map type and **Vector** rendering.
5. In the Map ID's **Map styles** section, click **Edit** next to light mode and pick the light style. Do the same for dark mode with the dark style.
6. Copy the Map ID into `VITE_GOOGLE_MAPS_MAP_ID` in `frontend/.env` and in your Vercel environment variables.

The console's JSON editor only accepts this format: an object with a `variant` and a `styles` list. It rejects the older array format of `featureType` and `stylers` rules.

## Without a Map ID

When `VITE_GOOGLE_MAPS_MAP_ID` is empty, the map uses Google's `DEMO_MAP_ID`. That ID shows Google's default style, and Google intends it for testing only.

## Change the look later

You can edit either style in the console's style editor. The live map picks up saved changes without a redeploy.
