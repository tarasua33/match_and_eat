import { ChipsAnimationComponent } from "../components/ChipsAnimationComponent";
import { EventBusComponent, EVENTS } from "../events/EventBusComponent";
import { CELL } from "../GameConfig";
import { CHIPS } from "../models/BoardModel";

export class Chip extends Phaser.GameObjects.Sprite {
  public readonly animationComponent: ChipsAnimationComponent;
  public readonly eventsBus = new EventBusComponent();
  private _typeID: CHIPS;
  private _gridX!: number;
  private _gridY!: number;
  private _isMoving!: boolean;
  public startDrag!: { x: number, y: number };

  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Sprite>) {
    super(...arr);
    this.animationComponent = new ChipsAnimationComponent(this);
    // this.setScale(0.4);
    // this.setOrigin()
  }

  public get dropPositionX(): number {
    return CELL.width / 2 + this._gridX * CELL.width;
  }

  public get dropPositionY(): number {
    return CELL.height / 2 + this._gridY * CELL.height;
  }

  public get gridX(): number {
    return this._gridX;
  }

  public get gridY(): number {
    return this._gridY;
  }

  public get typeID(): CHIPS {
    return this._typeID;
  }

  public get isMoving(): boolean {
    return this._isMoving;
  }

  public set isMoving(val: boolean) {
    this._isMoving = val;
  }

  public spawn(x: number, y: number, typeID: CHIPS): void {
    this._typeID = typeID;
    this.setPosition(
      CELL.width / 2 + x * CELL.width,
      CELL.height / 2 + y * CELL.height
    );
    this._setGridPosition(x, y);
  }

  private _setGridPosition(x: number, y: number): void {
    this._gridX = x;
    this._gridY = y;
  }

  public spawnAbove(x: number, y: number, spawnY: number, typeID: CHIPS): void {
    this._typeID = typeID;
    this.setPosition(
      CELL.width / 2 + x * CELL.width,
      CELL.height / 2 + spawnY * CELL.height
    );
    this._isMoving = true;
    this.active = true;
    this.visible = true;
    this.setTexture(typeID);
    this._setGridPosition(x, y);
  }

  public setNewGridPosition(newX: number, newY: number,): void {
    this._gridX = newX;
    this._gridY = newY;
  }

  public awaitSwap(): void {
    this.setInteractive();

    this.on("pointerdown", this._onPointed, this)
  }

  public disableInput(): void {
    this.disableInteractive();

    this.off("pointerdown", this._onPointed, this)
  }

  private _onPointed(pointer: Phaser.Input.Pointer): void {
    this.startDrag = { x: pointer.x, y: pointer.y };
    this.eventsBus.emit(EVENTS.CHIP_POINTED, this);
  }
}