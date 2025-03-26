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

    findMountain(tilemap) {
        for (let y = 0; y < tilemap.length - 4; y++) {
            for (let x = 0; x < tilemap[0].length - 4; x++) {
                let isMountain = true;
    
                // Prüfe, ob das ganze 5x5-Feld aus "mountain" besteht
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 5; j++) {
                        if (tilemap[y + i][x + j] !== 'mountain') {
                            isMountain = false;
                            break;
                        }
                    }
                    if (!isMountain) break;
                }
    
                if (isMountain) {
                    this.targetX = x + 2; // Setze das Ziel in die Mitte des Berges
                    this.targetY = y + 2;
                    this.state = "digging"; // Wechsle in den Grab-Modus
                    return;
                }
            }
        }
    }
    
    startDigging(tilemap) {
        // Gräbt 2 Felder in den Berg
        for (let i = 0; i < 2; i++) {
            if (tilemap[this.y + i] && tilemap[this.y + i][this.x] === "mountain") {
                tilemap[this.y + i][this.x] = "grass"; // Ändere das Feld zu "grass"
            }
        }
    
        this.state = "expanding"; // Wechsle in den Modus, um ein 3x3-Feld zu graben
    }

    expandCave(tilemap) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                let newY = this.y + dy;
                let newX = this.x + dx;
    
                if (tilemap[newY] && tilemap[newY][newX] === "mountain") {
                    tilemap[newY][newX] = "grass"; // Ersetze das Tile mit "grass"
                }
            }
        }
    }
}