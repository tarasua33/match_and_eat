import { CELL } from "../GameConfig";

export class Tile extends Phaser.GameObjects.Sprite {
  public spawn(x: number, y: number): void {
    this.setPosition(
      CELL.width / 2 + x * CELL.width,
      CELL.height / 2 + y * CELL.height
    );
    this.active = true;
    this.visible = true;
  }
}