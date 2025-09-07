import { CHIPS } from "../models/BoardModel";

export class GoalChip extends Phaser.GameObjects.Container {
  private _bg: Phaser.GameObjects.Sprite;
  private _goalText: Phaser.GameObjects.Text;

  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Container>) {
    super(...arr);

    const bg = this._bg = this.scene.add.sprite(0, 0, "chip_1");
    bg.setOrigin(0.5);

    const sticker = this.scene.add.sprite(0, 0, "sticker");
    sticker.setOrigin(0.5, 0.5);
    sticker.setScale(0.5, 0.5);
    sticker.setPosition(- bg.width / 2 + 15, bg.height / 2 - 15);

    const goalText = this._goalText = this.scene.add.text(sticker.x, sticker.y, "0", {
      fontFamily: 'SnowDream',
      fontSize: '20px',
      color: '#FF0100'
    });
    goalText.setOrigin(0.5, 0.5);

    this.add(bg);
    this.add(sticker);
    this.add(goalText);

    this.scene.add.existing(this);
  }

  public resetGoal(type: CHIPS, goal: number): void {
    this._bg.setTexture(type);
    this._goalText.text = goal.toString();

    this.alpha = 1;
  }

  public setGoal(goal: number): void {
    let updatedGoal = goal;
    if (goal <= 0) {
      this.alpha = 0.5;
      updatedGoal = 0;
    }

    this._goalText.text = updatedGoal.toString();
  }
}