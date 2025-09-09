import { EventBusComponent, EVENTS } from "../events/EventBusComponent";
import { CELL, GAME_DIMENSIONS } from "../GameConfig";
import { LvlButton } from "./LvlButton";

const POSITIONS = [
  { x: 0, y: -CELL.height * 2 },
  { x: 0, y: 0 },
  { x: 0, y: CELL.height * 2 }
]

export default class IntroScreen extends Phaser.GameObjects.Container {
  public readonly eventsBus = new EventBusComponent();

  private _lvls: LvlButton[] = [];
  private _bg: Phaser.GameObjects.Rectangle;

  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Container>) {
    super(...arr);

    const bg = this._bg = this.scene.add.rectangle(0, 0, GAME_DIMENSIONS.width * 3, GAME_DIMENSIONS.width * 2.5, 0x44F7F7);
    bg.setOrigin(0.5);
    bg.alpha = 0;
    this.add(bg);

    let i = 0;
    for (const { x, y } of POSITIONS) {
      const lvl = new LvlButton(this.scene);
      lvl.setPosition(x, y);
      // lvl.setLvl(i);
      this.add(lvl);
      this._lvls.push(lvl);
      i++;
    }

    this.scene.add.existing(this);

    this.visible = false;
    this.active = false;
  }

  public show(): void {
    this.visible = true;
    this.active = true;
    const bg = this._bg;
    bg.alpha = 0;

    this.scene.tweens.add({
      targets: bg,
      duration: 250,
      alpha: 1,
      ease: 'Sine.easeInOut',
    });

    const len = this._lvls.length;
    let i = 0
    for (const ui of this._lvls) {
      ui.setLvl(i);
      ui.setScale(10)
      ui.alpha = 0;
      i++;

      this.scene.tweens.add({
        targets: ui,
        scale: 1,
        alpha: 1,
        duration: 250,
        delay: 250 * (i + 1),
        ease: 'Back.easeOut',
        onComplete: len === i ? this._onCompleteShow.bind(this) : undefined
      });
    }
  }

  public hide(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 350,
      delay: 500,
      ease: 'Sine.easeInOut',
      onComplete: this._onCompleteHide.bind(this)
    });
  }

  private _onCompleteHide(): void {
    this._bg.alpha = 0;
    this.alpha = 1;
    this.visible = false;
    this.active = false;

    this.eventsBus.emit(EVENTS.UI_READY);
  }

  private _onCompleteShow(): void {
    for (const ui of this._lvls) {
      ui.eventsBus.once(EVENTS.UI_CHOOSE_DIF, this._onChoose, this);
      ui.awaitChoose();
    }
  }

  private _onChoose(val: number): void {
    for (const ui of this._lvls) {
      ui.eventsBus.removeAllListeners();
      ui.endAwait();
    }

    this.eventsBus.emit(EVENTS.UI_CHOOSE_DIF, val);
  }
}