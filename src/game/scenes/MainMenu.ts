import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  create() {
    // this.background = this.add.image(512, 384, 'background');

    const logo = this.logo = this.add.image(this.scale.width / 2, this.scale.height / 2, 'logo');
    logo.alpha = 0;
    logo.scale = 5;

    this.tweens.add({
      targets: logo,
      scale: 0.5,
      alpha: 1,
      duration: 1500,
      ease: 'Bounce.Out',
      delay: 250,
      onComplete: this._onShowed.bind(this)
    });
  }

  private _onShowed(): void {
    this.tweens.add({
      targets: this.logo,
      scale: 5,
      alpha: 0,
      duration: 500,
      ease: 'Sine.Out',
      delay: 500,
      onComplete: this._onHide.bind(this)
    });
  }

  private _onHide(): void {
    this.scene.start('Game');
  }
}
