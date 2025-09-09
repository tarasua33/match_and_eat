import { EVENTS } from "../events/EventBusComponent";
import { BaseButton } from "./BaseButton";

export class ShuffleButton extends BaseButton {
  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Container>) {
    super(...arr);

    this._baseScale = 2;
    const bg = this._bg = this.scene.add.sprite(0, 0, "button_shuffle");
    bg.setOrigin(0.5);
    this.add(bg);

    this.setScale(this._baseScale);
    this.alpha = 0;
  }

  public makeActive(): void {
    this._bg.setInteractive();

    this._bg.on("pointerdown", this._onClick, this);
  }

  public makeInactive(): void {
    this._bg.disableInteractive();

    this._bg.off("pointerdown", this._onClick, this);

    this.eventsBus.removeAllListeners();
  }

  private _onClick(): void {
    this.eventsBus.emit(EVENTS.SHUFFLE);

    this._playClick();
  }

  public show(): void {
    this.scale = this._baseScale * 2;

    this.scene.tweens.add({
      targets: this,
      scale: this._baseScale,
      alpha: 1,
      duration: 250,
      ease: 'Bounce.Out',
      delay: 500
    });
  }

  public hide(): void {
    this.alpha = 0
  }
}