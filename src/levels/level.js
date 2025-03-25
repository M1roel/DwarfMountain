import { Noise } from 'noisejs';

export class Level {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tilemap = this.generateMap(); // Hier wird die Map generiert
    }

    generateMap() {
        const noise = new Noise(Math.random());
        let map = [];

        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                let value = noise.perlin2(x / 10, y / 10); // Skalierung anpassen
                if (value < -0.2) row.push('water');
                else if (value < 0.2) row.push('grass');
                else row.push('mountain');
            }
            map.push(row);
        }
        return map;
    }
}
