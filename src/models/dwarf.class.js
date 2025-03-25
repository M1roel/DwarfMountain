export class Dwarf {
    constructor(x, y) {
        this.x = x;  // Startposition X
        this.y = y;  // Startposition Y
        this.sprite = 'assets/dwarf.png'; // Dein Zwerg-Sprite
        this.speed = 1;  // Geschwindigkeit des Zwerge
        this.targetX = Math.floor(Math.random() * 50);  // Zufälliges Ziel in X-Richtung
        this.targetY = Math.floor(Math.random() * 50);  // Zufälliges Ziel in Y-Richtung
    }

    // Funktion, die die Bewegung zur Zielposition berechnet
    move() {
        // Berechne die Richtung zum Ziel
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Falls der Zwerg noch nicht beim Ziel ist, bewege ihn
        if (distance > this.speed) {
            this.x += this.speed * (dx / distance);  // Normalisiere die Bewegung in X-Richtung
            this.y += this.speed * (dy / distance);  // Normalisiere die Bewegung in Y-Richtung
        } else {
            // Erreicht das Ziel, setze ein neues zufälliges Ziel
            this.targetX = Math.floor(Math.random() * 50);
            this.targetY = Math.floor(Math.random() * 50);
        }
    }
}
