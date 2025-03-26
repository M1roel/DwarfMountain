export class Dwarf {
    constructor(x, y) {
        this.x = x;  // Startposition X
        this.y = y;  // Startposition Y
        this.sprite = 'public/img/dwarf.jpg'; // Dein Zwerg-Sprite
        this.speed = 1;  // Geschwindigkeit des Zwergs
        this.targetX = x; // Initialisiere Zielposition X
        this.targetY = y; // Initialisiere Zielposition Y
    }

    // Funktion, die die Bewegung zur Zielposition berechnet
    move(tilemap) {
        // Berechne die Richtung zum Ziel
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Falls der Zwerg noch nicht beim Ziel ist, bewege ihn
        if (distance > this.speed) {
            const nextX = this.x + this.speed * (dx / distance); // Nächste X-Position
            const nextY = this.y + this.speed * (dy / distance); // Nächste Y-Position

            // Berechne die Tile-Koordinaten
            const tileX = Math.floor(nextX);
            const tileY = Math.floor(nextY);

            // Überprüfe, ob das nächste Tile "grass" ist
            if (tilemap[tileY] && tilemap[tileY][tileX] === 'grass') {
                this.x = nextX; // Bewege den Zwerg in X-Richtung
                this.y = nextY; // Bewege den Zwerg in Y-Richtung
            } else {
                // Wenn das Ziel kein "grass"-Tile ist, wähle ein neues Ziel
                this.setRandomTarget(tilemap);
            }
        } else {
            // Erreicht das Ziel, setze ein neues zufälliges Ziel
            this.setRandomTarget(tilemap);
        }
    }

    // Methode, um ein neues zufälliges Ziel auf einem "grass"-Tile zu setzen
    setRandomTarget(tilemap) {
        let targetTile;
        do {
            this.targetX = Math.floor(Math.random() * tilemap[0].length);
            this.targetY = Math.floor(Math.random() * tilemap.length);
            targetTile = tilemap[this.targetY][this.targetX];
        } while (targetTile !== 'grass'); // Wiederhole, bis ein "grass"-Tile gefunden wird
    }
}