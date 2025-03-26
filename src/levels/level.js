import * as PIXI from 'pixi.js';

export class Level {
    constructor(width, height, app) {
        this.width = width;
        this.height = height;
        this.app = app; // PixiJS App Instanz
        this.tileSize = 32; // Größe der Kacheln
        this.tiles = {}; // Speicherung der Pixi-Sprites
        this.container = new PIXI.Container();
        this.tilemap = this.generateMap();
        this.createTiles();
    }

    generateMap() {
        const simplex = new SimplexNoise();
        let map = [];

        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                let value = simplex.noise2D(x / 20, y / 20);
                if (value < -0.7) row.push('water');
                else if (value < 0.1) row.push('grass');
                else if (value < 0.3) row.push('wood');
                else row.push('mountain');
            }
            map.push(row);
        }
        return map;
    }

    createTiles() {
        const textures = {
            water: PIXI.Texture.from('img/water.jpg'),
            grass: PIXI.Texture.from('img/grass.jpg'),
            wood: PIXI.Texture.from('img/wood.jpg'),
            mountain: PIXI.Texture.from('img/mountain.jpg'),
        };

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let tileType = this.tilemap[y][x];
                let sprite = new PIXI.Sprite(textures[tileType]);
                sprite.x = x * this.tileSize;
                sprite.y = y * this.tileSize;
                sprite.width = this.tileSize;
                sprite.height = this.tileSize;
                this.container.addChild(sprite);
                this.tiles[`${x},${y}`] = sprite;
            }
        }

        this.app.stage.addChild(this.container);
    }
}
