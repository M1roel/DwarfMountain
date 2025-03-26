import { Application, Assets, Sprite } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/browser/pixi.min.js';
import { Dwarf } from '../models/dwarf.class.js';
import { Level } from '../levels/level.js';

// PixiJS-Anwendung erstellen
(async () => {
    const app = new Application({ 
        backgroundColor: 0x87CEEB, 
        resizeTo: window 
    });

    document.body.appendChild(app.canvas);

    const TILE_SIZE = 12;
    const level = new Level(100, 100);

    const textures = {};
    const imagePaths = {
        'water': 'public/img/water.jpg',
        'grass': 'public/img/grass.jpg',
        'mountain': 'public/img/mountain.jpg',
        'wood': 'public/img/wood.jpg',
        'dwarf': 'public/img/dwarf.jpg'
    };

    // Lade die Texturen asynchron
    await Promise.all(Object.values(imagePaths).map(path => Assets.load(path)));
    
    // Speicher die Texturen
    Object.keys(imagePaths).forEach(key => {
        textures[key] = Assets.get(imagePaths[key]);
    });

    // Initialisiere das Spiel
    drawMap(level);
    app.ticker.add(gameLoop);

    function drawMap(level) {
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                let tileType = level.tilemap[y][x];
                if (textures[tileType]) {
                    let sprite = new Sprite(textures[tileType]);
                    sprite.x = x * TILE_SIZE;
                    sprite.y = y * TILE_SIZE;
                    sprite.width = TILE_SIZE;
                    sprite.height = TILE_SIZE;
                    app.stage.addChild(sprite);
                }
            }
        }
    }

    function gameLoop(delta) {
        // Hier kannst du Zwerge und andere Spielfunktionen animieren
    }
})();
