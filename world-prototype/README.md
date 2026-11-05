# Baseborn World Prototype

Interactive 3D world for Baseborn Industries. One self contained `index.html` built with three.js r128 and GSAP (loaded from CDN).

## Run it
Open `index.html` in a browser, or serve the folder:

```
npx serve world-prototype
```

## What is inside
* **The Room (hub):** the Foundlings' bedroom with clickable pins for Shop, About, Collectibles, Learn, News, Listen, Watch, Lore and each brother
* **Starsus Co. (city):** coastal street with Baseborn Supply Co., Starsus Academy, Baseborn Ind., One Love Records, the Rooftop, the Back Alley and Grill Comma
* **Foundlings:** Poach, Cypher and Neo built in code from the turnaround sheets, with a shared pose library
* Day and rainy night modes, generated ambient audio, index menu, deep links by hash (for example `#supply`, `#cypher`)

## Next steps
* Swap the code built Foundlings and props for Blender GLB models
* Port into a Next.js app on Vercel and connect real product routes
