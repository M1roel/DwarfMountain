import { GAME_CONFIG } from "../js/config.js";
import { applyTargetPosition, setRandomTarget } from "../js/movementSystem.js";

export class Dwarf {
  constructor(x, y) {
    this.x = x; // Startposition X
    this.y = y; // Startposition Y
    this.sprite = "public/img/dwarf.jpg"; // Dein Zwerg-Sprite
    this.speed = 1; // Geschwindigkeit des Zwergs
    this.targetX = x; // Initialisiere Zielposition X
    this.targetY = y; // Initialisiere Zielposition Y
    this.inventory = [];
    this.maxInventorySize = GAME_CONFIG.INVENTORY_LIMIT;
  }

  // Funktion, die die Bewegung zur Zielposition berechnet
  move(tilemap) {
    if (this.targetX !== undefined && this.targetY !== undefined) {
      applyTargetPosition(this);
      this.collectRessources(tilemap);
      this.buildWoodHome(tilemap);
    } else {
      setRandomTarget(this, tilemap); // Falls kein Ziel gesetzt ist, neues wählen
    }
  }

  // Methode, um ein neues zufälliges Ziel auf einem "grass"-Tile zu setzen
  setRandomTarget(tilemap) {
    setRandomTarget(this, tilemap);
  }

  findMountain(tilemap) {
    for (let y = 0; y < tilemap.length - 4; y++) {
      for (let x = 0; x < tilemap[0].length - 4; x++) {
        let isMountain = true;

        // Prüfe, ob das ganze 5x5-Feld aus "mountain" besteht
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            if (tilemap[y + i][x + j] !== "mountain") {
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

  collectRessources(tilemap) {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (let [dy, dx] of directions) {
      const newY = this.y + dy;
      const newX = this.x + dx;

      if (
        tilemap[newY] && tilemap[newY][newX] === "wood" &&
        this.inventory.length < this.maxInventorySize
      ) {
        this.inventory.push("wood");
        console.log("Holz gesammelt!");
        tilemap[newY][newX] = "grass";
        return;
      }
    }
    console.log('Kein Holz zum sammeln oder Inventar voll');
  }

  buildWoodHome(tilemap) {
    if (this.inventory.length === this.maxInventorySize) {
      const newY = this.y;
      const newX = this.x;

      if (tilemap[newY] && tilemap[newY][newX] === "grass") {
        tilemap[newY][newX] = "wood_home";
        this.inventory = [];
        console.log("Holzhaus gebaut!");
      } else {
        console.log("Das aktuelle Feld ist nicht geeignet, um ein Holzhaus zu bauen!");
      }
    } else {
      console.log("Nicht genug Holz!");
    }
  }
}
