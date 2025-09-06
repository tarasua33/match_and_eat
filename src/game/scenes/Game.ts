import { Scene } from 'phaser';
import { CELL, GAME_DIMENSIONS, MAX_CHIPS } from '../GameConfig';
import { BoardComponent } from '../components/BoardComponent';
import { Chip } from '../gameObjects/Chip';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create() {
    this.camera = this.cameras.main;
    // this.camera.setBackgroundColor(0x00ff00);

    // this.background = this.add.image(0, 0, 'background');
    // this.background.setOrigin(0);
    // // this.background.width = this.scale.width;
    // // this.background.height = this.scale.height;
    // this.background.setAlpha(0.5);

    const border = this.add.rectangle(0, 0, GAME_DIMENSIONS.width, GAME_DIMENSIONS.height, 0xffffff);
    border.setOrigin(0);

    // const chip = this.add.image(this.scale.width / 2, this.scale.height / 2, 'chip_1');
    // chip.setOrigin(0.5);

    // this.msg_text = this.add.text(this.scale.width / 2, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
    //   fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
    //   stroke: '#000000', strokeThickness: 8,
    //   align: 'center'
    // });
    // this.msg_text.setOrigin(0.5);

    // this.input.once('pointerdown', () => {

    //   this.scene.start('GameOver');

    // });

    this.scale.on('resize', this.resize, this);
    this.resize({ width: window.innerWidth, height: window.innerHeight });

    this.initGame();
  }

  public initGame(): void {
    const boardContainer = this.add.container();
    boardContainer.setPosition(CELL.width, CELL.height);
    const chipsPool = this.add.group({
      classType: Chip,
      maxSize: MAX_CHIPS,
    });

    const boardComponent = new BoardComponent(chipsPool, boardContainer, this.tweens, this.input);
    boardComponent.spawn();

    // const img = this.add.image(30, 30, "explosion_yellow_8");
    // const anim = this.add.
  }

  resize(gameSize: Partial<Phaser.Structs.Size>) {
    const { width, height } = gameSize;

    const vw = width!;
    const vh = height!;

    const baseWidth = GAME_DIMENSIONS.width;
    const baseHeight = GAME_DIMENSIONS.height;

    const scale = Math.min(
      vw / baseWidth,
      vh / baseHeight
    );

    this.cameras.main.setZoom(scale);
    this.cameras.main.centerOn(baseWidth / 2, baseHeight / 2);
  }
}
