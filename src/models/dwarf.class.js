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
    this.gatheringAction = null;
    this.buildingAction = null;
  }

  hasWoodInInventory() {
    return this.inventory.some((item) => item === "wood");
  }

  isNearSettlementCenter(settlementCenter) {
    return (
      Math.abs(this.x - settlementCenter.x) + Math.abs(this.y - settlementCenter.y) <= 1
    );
  }

  moveTowardSettlementCenter(settlementCenter) {
    const dx = settlementCenter.x - this.x;
    const dy = settlementCenter.y - this.y;

    let nextX = this.x;
    let nextY = this.y;

    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
      nextX += Math.sign(dx);
    } else if (dy !== 0) {
      nextY += Math.sign(dy);
    }

    this.targetX = nextX;
    this.targetY = nextY;
    this.status = "moving";
  }

  depositWood(worldState) {
    const woodAmount = this.inventory.filter((item) => item === "wood").length;

    if (woodAmount > 0 && worldState?.storage) {
      worldState.storage.wood += woodAmount;
      this.inventory = [];
    }

    this.targetX = undefined;
    this.targetY = undefined;
    this.status = "idle";
  }

  // Funktion, die die Bewegung zur Zielposition berechnet
  move(tilemap, worldState) {
    if (this.buildingAction) {
      const buildResult = this.buildWoodHome(tilemap);
      if (buildResult !== "in_progress") {
        this.status = "idle";
      }
      return;
    }

    if (this.gatheringAction) {
      const gatherResult = this.collectRessources(tilemap);
      if (gatherResult === "completed") {
        const buildResult = this.buildWoodHome(tilemap);
        if (buildResult === "none" || buildResult === "cancelled") {
          this.status = "idle";
        }
      } else if (gatherResult === "cancelled") {
        const buildResult = this.buildWoodHome(tilemap);
        if (buildResult === "none" || buildResult === "cancelled") {
          this.status = "idle";
        }
      }
      return;
    }

    const settlementCenter = worldState?.settlementCenter;

    if (this.hasWoodInInventory() && settlementCenter) {
      if (this.isNearSettlementCenter(settlementCenter)) {
        this.depositWood(worldState);
        return;
      }

      this.moveTowardSettlementCenter(settlementCenter);
    }

    if (this.targetX !== undefined && this.targetY !== undefined) {
      applyTargetPosition(this);
      this.status = "moving";
      const gatherResult = this.collectRessources(tilemap);

      if (gatherResult === "in_progress") {
        return;
      }

      const buildResult = this.buildWoodHome(tilemap);
      if (buildResult === "none" || buildResult === "cancelled") {
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
