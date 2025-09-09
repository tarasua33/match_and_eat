import { EventBusComponent, EVENTS } from "../events/EventBusComponent";

export class ShuffleButton extends Phaser.GameObjects.Image {
  private _baseScale = 2;
  public readonly eventsBus = new EventBusComponent();

  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Image>) {
    super(...arr);

    this.setScale(this._baseScale);
    this.alpha = 0;
  }

  public makeActive(): void {
    this.setInteractive();

    this.on("pointerdown", this._onClick, this);
  }

  public makeInactive(): void {
    this.disableInteractive();

    this.off("pointerdown", this._onClick, this);

    this.eventsBus.removeAllListeners();
  }

  private _onClick(): void {
    this.eventsBus.emit(EVENTS.SHUFFLE);

    this._playClick();
  }

  private _playClick(): void {
    this.scene.tweens.add({
      targets: this,
      duration: 250,
      scale: 0.9,
      yoyo: true,
      ease: 'Back.easeOut'
    });
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