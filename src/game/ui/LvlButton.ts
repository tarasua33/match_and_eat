import { EVENTS } from "../events/EventBusComponent";
import { BaseButton } from "./BaseButton";

const DIFFICULTY = ["Easy", "Normal", "Hard"];

export class LvlButton extends BaseButton {
  private _text: Phaser.GameObjects.Text;
  private _difficulty = 0;

  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Container>) {
    super(...arr);

    const bg = this._bg = this.scene.add.sprite(0, 0, "intro_button");
    bg.setScale(2)
    bg.setOrigin(0.5);

    const goalText = this._text = this.scene.add.text(0, 0, "0", {
      fontFamily: 'SnowDream, sans-serif',
      fontSize: '68px',
      fontStyle: 'normal',
      color: '#FF0100'
    });
    goalText.setOrigin(0.5, 0.5);

    this.add(bg);
    this.add(goalText);

    this.alpha = 1;
  }

  public setLvl(val: number): void {
    this._difficulty = val;
    this._text.text = DIFFICULTY[val];
  }

  public makeActive(): void {
    this._bg.setInteractive();
    this._bg.on("pointerdown", this._onChoose, this);
  }

  public makeInactive(): void {
    this._bg.disableInteractive();
    this._bg.off("pointerdown", this._onChoose, this);
  }

  private _onChoose(): void {
    this.eventsBus.emit(EVENTS.UI_CHOOSE_DIF, this._difficulty);

    this._playClick();
  }
}