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

  isTransportMode(worldState) {
    return this.hasWoodInInventory() && Boolean(worldState?.settlementCenter);
  }

  isNearSettlementCenter(settlementCenter) {
    return (
      Math.abs(this.x - settlementCenter.x) + Math.abs(this.y - settlementCenter.y) <= 1
    );
  }

  getTransportStep(tilemap, settlementCenter) {
    const currentDistance = Math.abs(this.x - settlementCenter.x) + Math.abs(this.y - settlementCenter.y);
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const candidates = [];

    for (const [dx, dy] of directions) {
      const nextX = this.x + dx;
      const nextY = this.y + dy;

      if (tilemap[nextY] && tilemap[nextY][nextX] === "grass") {
        const nextDistance = Math.abs(nextX - settlementCenter.x) + Math.abs(nextY - settlementCenter.y);

        if (nextDistance < currentDistance) {
          candidates.push({ x: nextX, y: nextY, distance: nextDistance });
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => a.distance - b.distance);
    return candidates[0];
  }

  runTransportMode(tilemap, worldState) {
    const settlementCenter = worldState.settlementCenter;

    this.gatheringAction = null;
    this.buildingAction = null;

    if (this.isNearSettlementCenter(settlementCenter)) {
      this.depositWood(worldState);
      return;
    }

    if (this.targetX !== undefined && this.targetY !== undefined) {
      applyTargetPosition(this);
      this.status = "moving";
      return;
    }

    const nextStep = this.getTransportStep(tilemap, settlementCenter);

    if (!nextStep) {
      this.status = "idle";
      return;
    }

    this.targetX = nextStep.x;
    this.targetY = nextStep.y;
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
    if (this.isTransportMode(worldState)) {
      this.runTransportMode(tilemap, worldState);
      return;
    }

    if (this.buildingAction) {
      const buildResult = this.buildWoodHome(tilemap, worldState);
      if (buildResult !== "in_progress") {
        this.status = "idle";
      }
      return;
    }

    if (this.gatheringAction) {
      const gatherResult = this.collectRessources(tilemap);
      if (gatherResult === "completed") {
        const buildResult = this.buildWoodHome(tilemap, worldState);
        if (buildResult === "none" || buildResult === "cancelled") {
          this.status = "idle";
        }
      } else if (gatherResult === "cancelled") {
        const buildResult = this.buildWoodHome(tilemap, worldState);
        if (buildResult === "none" || buildResult === "cancelled") {
          this.status = "idle";
        }
      }
      return;
    }

    if (this.targetX !== undefined && this.targetY !== undefined) {
      applyTargetPosition(this);
      this.status = "moving";
      const gatherResult = this.collectRessources(tilemap);

      if (gatherResult === "in_progress") {
        return;
      }

      const buildResult = this.buildWoodHome(tilemap, worldState);
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

  buildWoodHome(tilemap, worldState) {
    return buildWoodHome(this, tilemap, worldState);
  }
}
