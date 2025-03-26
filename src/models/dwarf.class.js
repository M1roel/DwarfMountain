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
        if (this.targetX !== undefined && this.targetY !== undefined) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.targetX = undefined;
            this.targetY = undefined;
        } else {
            this.setRandomTarget(tilemap); // Falls kein Ziel gesetzt ist, neues wählen
        }
    }

    // Methode, um ein neues zufälliges Ziel auf einem "grass"-Tile zu setzen
    setRandomTarget(tilemap) {
        let directions = [0, 1, 2, 3]; // 0=oben, 1=rechts, 2=unten, 3=links
        let found = false;
    
        while (directions.length > 0 && !found) {
            let index = Math.floor(Math.random() * directions.length);
            let direction = directions.splice(index, 1)[0]; // Eine Richtung zufällig auswählen & entfernen
            
            let newX = this.x;
            let newY = this.y;
    
            switch (direction) {
                case 0: newY -= 1; break;
                case 1: newX += 1; break;
                case 2: newY += 1; break;
                case 3: newX -= 1; break;
            }
    
            if (tilemap[newY] && tilemap[newY][newX] === 'grass') {
                this.targetX = newX;
                this.targetY = newY;
                found = true;
            }
        }
    }
}