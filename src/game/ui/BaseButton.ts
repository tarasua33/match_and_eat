import { EventBusComponent } from "../events/EventBusComponent";

export class BaseButton extends Phaser.GameObjects.Container {
  public readonly eventsBus = new EventBusComponent();
  protected _bg: Phaser.GameObjects.Image;
  protected _baseScale = 1;

  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Container>) {
    super(...arr);
    this.scene.add.existing(this);
  }

  protected _playClick(): void {
    this.scene.tweens.add({
      targets: this,
      duration: 125,
      scale: 0.8 * this._baseScale,
      yoyo: true,
      ease: 'Back.easeInOut'
    });
  }
}