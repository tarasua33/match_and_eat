import { CELL } from "../GameConfig";

export class BgTile extends Phaser.GameObjects.Graphics {
  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Graphics>) {
    super(...arr);

    this.fillStyle(0xFF0000, 0.5);
    this.fillRoundedRect(0, 0, CELL.width, CELL.height, 32);
    this.visible = false;
  }

  public setPositionOnGrid(x: number, y: number): void {
    this.setPosition(
      x * CELL.width,
      y * CELL.height
    );
  }
}