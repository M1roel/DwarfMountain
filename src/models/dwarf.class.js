import * as PIXI from 'pixi.js';

export class Dwarf {
  constructor(x, y, app) {
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.targetX = x;
    this.targetY = y;
    this.inventory = [];
    this.maxInventorySize = 1;
    this.app = app;
    
    // Sprite für PixiJS erstellen
    this.sprite = PIXI.Sprite.from('public/img/dwarf.jpg');
    this.sprite.x = x * 32; // Falls das Tile 32x32 ist
    this.sprite.y = y * 32;
    this.sprite.anchor.set(0.5);
    this.app.stage.addChild(this.sprite);
  }

  move(tilemap) {
    if (this.targetX !== undefined && this.targetY !== undefined) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.sprite.x = this.x * 32;
      this.sprite.y = this.y * 32;
      this.targetX = undefined;
      this.targetY = undefined;
      this.collectRessources(tilemap);
    } else {
      this.setRandomTarget(tilemap);
    }
  }

  setRandomTarget(tilemap) {
    let directions = [0, 1, 2, 3];
    let found = false;

    while (directions.length > 0 && !found) {
      let index = Math.floor(Math.random() * directions.length);
      let direction = directions.splice(index, 1)[0];
      let newX = this.x;
      let newY = this.y;

      switch (direction) {
        case 0: newY -= 1; break;
        case 1: newX += 1; break;
        case 2: newY += 1; break;
        case 3: newX -= 1; break;
      }

      if (tilemap[newY] && tilemap[newY][newX] === "grass") {
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
          this.targetX = x + 2;
          this.targetY = y + 2;
          this.state = "digging";
          return;
        }
      }
    }
  }

  collectRessources(tilemap) {
    const directions = [ [-1, 0], [1, 0], [0, -1], [0, 1] ];
    for (let [dy, dx] of directions) {
      const newY = this.y + dy;
      const newX = this.x + dx;
      if (tilemap[newY] && tilemap[newY][newX] === "wood" && this.inventory.length < this.maxInventorySize) {
        this.inventory.push("wood");
        console.log("Holz gesammelt!");
        tilemap[newY][newX] = "grass";
        return;
      }
    }
    console.log("Kein Holz zum Sammeln oder Inventar voll");
  }
}
