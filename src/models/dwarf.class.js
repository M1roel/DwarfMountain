import { GAME_CONFIG } from "../js/config.js";
import { applyTargetPosition, setRandomTarget } from "../js/movementSystem.js";
import { collectRessources } from "../js/resourceSystem.js";
import { buildWoodHome } from "../js/buildingSystem.js";
import {
  expandCave,
  findMountain,
  startDigging,
} from "../js/caveExperimentalSystem.js";

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
    this.status = "idle";
  }

  // Funktion, die die Bewegung zur Zielposition berechnet
  move(tilemap) {
    if (this.targetX !== undefined && this.targetY !== undefined) {
      applyTargetPosition(this);
      this.status = "moving";
      const gathered = this.collectRessources(tilemap);
      const built = this.buildWoodHome(tilemap);

      if (!gathered && !built) {
        this.status = "idle";
      }
    } else {
      setRandomTarget(this, tilemap); // Falls kein Ziel gesetzt ist, neues wählen
    }
  }

  // Methode, um ein neues zufälliges Ziel auf einem "grass"-Tile zu setzen
  setRandomTarget(tilemap) {
    setRandomTarget(this, tilemap);
  }

  findMountain(tilemap) {
    findMountain(this, tilemap);
  }

  startDigging(tilemap) {
    startDigging(this, tilemap);
  }

  expandCave(tilemap) {
    expandCave(this, tilemap);
  }

  collectRessources(tilemap) {
    return collectRessources(this, tilemap);
  }

  buildWoodHome(tilemap) {
    return buildWoodHome(this, tilemap);
  }
}
