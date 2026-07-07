import { GAME_CONFIG } from "../js/config.js";
import { applyTargetPosition, setRandomTarget } from "../js/movementSystem.js";
import { collectRessources } from "../js/resourceSystem.js";
import { buildWoodHome } from "../js/buildingSystem.js";
import { isWalkable } from "../js/passability.js";
import { JOB_TYPES } from "../js/jobModel.js";
import { decideNextJob } from "../js/jobDecision.js";
import {
  expandCave,
  findMountain,
  startDigging,
} from "../js/caveExperimentalSystem.js";

export class Dwarf {
  constructor(x, y, id = null) {
    this.id = id;
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
    this.lastPositions = [];
    this.stuckCounter = 0;
    this.lastDistanceToTarget = null;
    this.currentJobId = null;
    this.currentJobType = JOB_TYPES.IDLE;
    this.jobState = null;
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

  resetTransportTracking() {
    this.lastPositions = [];
    this.stuckCounter = 0;
    this.lastDistanceToTarget = null;
  }

  rememberCurrentPosition() {
    const key = `${this.x},${this.y}`;

    this.lastPositions.push(key);
    if (this.lastPositions.length > 6) {
      this.lastPositions.shift();
    }
  }

  wasRecentlyVisited(x, y) {
    return this.lastPositions.includes(`${x},${y}`);
  }

  updateTransportProgress(distanceToTarget) {
    if (
      this.lastDistanceToTarget === null ||
      distanceToTarget < this.lastDistanceToTarget
    ) {
      this.stuckCounter = 0;
    } else {
      this.stuckCounter += 1;
    }

    this.lastDistanceToTarget = distanceToTarget;
  }

  getTransportStep(tilemap, settlementCenter, escapeMode = false) {
    const currentDistance = Math.abs(this.x - settlementCenter.x) + Math.abs(this.y - settlementCenter.y);
    const neighbors = [
      { x: this.x + 1, y: this.y },
      { x: this.x - 1, y: this.y },
      { x: this.x, y: this.y + 1 },
      { x: this.x, y: this.y - 1 },
    ]
      .filter(({ x, y }) => tilemap[y] && isWalkable(tilemap[y][x]))
      .map(({ x, y }) => ({
        x,
        y,
        distance: Math.abs(x - settlementCenter.x) + Math.abs(y - settlementCenter.y),
      }));

    if (neighbors.length === 0) {
      return null;
    }

    const nonRecentNeighbors = neighbors.filter(
      ({ x, y }) => !this.wasRecentlyVisited(x, y)
    );

    if (escapeMode) {
      if (nonRecentNeighbors.length === 0) {
        return null;
      }

      nonRecentNeighbors.sort((a, b) => a.distance - b.distance);
      return nonRecentNeighbors[0];
    }

    const reducingNeighbors = neighbors.filter(
      ({ distance }) => distance < currentDistance
    );

    const reducingNonRecentNeighbors = reducingNeighbors.filter(
      ({ x, y }) => !this.wasRecentlyVisited(x, y)
    );

    if (reducingNonRecentNeighbors.length > 0) {
      reducingNonRecentNeighbors.sort((a, b) => a.distance - b.distance);
      return reducingNonRecentNeighbors[0];
    }

    if (reducingNeighbors.length > 0) {
      reducingNeighbors.sort((a, b) => a.distance - b.distance);
      return reducingNeighbors[0];
    }

    if (nonRecentNeighbors.length > 0) {
      const randomNonRecent =
        nonRecentNeighbors[Math.floor(Math.random() * nonRecentNeighbors.length)];
      return randomNonRecent;
    }

    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    return randomNeighbor;
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
      this.rememberCurrentPosition();

      const distanceAfterMove =
        Math.abs(this.x - settlementCenter.x) +
        Math.abs(this.y - settlementCenter.y);
      this.updateTransportProgress(distanceAfterMove);
      this.status = "moving";
      return;
    }

    const currentDistance =
      Math.abs(this.x - settlementCenter.x) +
      Math.abs(this.y - settlementCenter.y);

    if (this.lastDistanceToTarget === null) {
      this.lastDistanceToTarget = currentDistance;
    }

    const isStuck = this.stuckCounter >= 3;
    const nextStep = this.getTransportStep(tilemap, settlementCenter, isStuck);

    if (!nextStep) {
      this.status = "idle";
      this.updateTransportProgress(currentDistance);
      this.rememberCurrentPosition();
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
    this.resetTransportTracking();
  }

  runNonTransportBehavior(tilemap, worldState) {
    this.resetTransportTracking();

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

  runGatherWoodBehavior(tilemap, worldState) {
    this.runNonTransportBehavior(tilemap, worldState);
  }

  runBuildHouseBehavior(tilemap, worldState) {
    this.runNonTransportBehavior(tilemap, worldState);
  }

  runIdleBehavior(tilemap, worldState) {
    this.runNonTransportBehavior(tilemap, worldState);
  }

  runBehaviorForCurrentJob(tilemap, worldState) {
    switch (this.currentJobType) {
      case JOB_TYPES.DEPOSIT_WOOD:
        this.runTransportMode(tilemap, worldState);
        return;
      case JOB_TYPES.GATHER_WOOD:
        this.runGatherWoodBehavior(tilemap, worldState);
        return;
      case JOB_TYPES.BUILD_HOUSE:
        this.runBuildHouseBehavior(tilemap, worldState);
        return;
      case JOB_TYPES.IDLE:
      default:
        this.runIdleBehavior(tilemap, worldState);
    }
  }

  // Funktion, die die Bewegung zur Zielposition berechnet
  move(tilemap, worldState) {
    this.currentJobType = decideNextJob(this, worldState);
    this.runBehaviorForCurrentJob(tilemap, worldState);
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
