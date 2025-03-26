export class Level {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tilemap = this.generateMap(); // Hier wird die Map generiert
    }

    generateMap() {
        const simplex = new SimplexNoise(); // Simplex Noise Instanz erstellen
        let map = [];

        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                let value = simplex.noise2D(x / 20, y / 20); // Skalierung anpassen
                if (value < -0.7) row.push('water');
                else if (value < 0.1) row.push('grass');
                else if (value < 0.3) row.push('wood');
                else row.push('mountain');
            }
            map.push(row);
        }
        return map;
    }
}
