import { EventBusComponent, EVENTS } from "../events/EventBusComponent";
import { CELL } from "../GameConfig";
import { CHIPS } from "../models/BoardModel";
import { LvlGoal } from "../models/LvlModel";
import { GoalChip } from "./GoalChip";

const POSITIONS = [
  { x: -CELL.width, y: CELL.height - 20 },
  { x: 0, y: CELL.height - 20 },
  { x: CELL.width, y: CELL.height - 20 }
]

export class GoalPopup extends Phaser.GameObjects.Container {
  public readonly eventsBus = new EventBusComponent();

  private _buble!: Phaser.GameObjects.Sprite;
  private _header!: Phaser.GameObjects.Sprite;
  private _goalsUi: GoalChip[] = [];
  private _lvlGoal!: Map<CHIPS, GoalChip>;

  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Container>) {
    super(...arr);

    const buble = this._buble = this.scene.add.sprite(0, 0, "popup_buble");
    buble.setOrigin(0.5, 0);
    buble.setScale(4, 3);
    buble.alpha = 0;
    this.add(buble);

    const header = this.scene.add.sprite(0, 5, "popup_header");
    header.alpha = 0,
      header.setOrigin(0.5, 0.5);
    header.setScale(0.9, 1);
    this.add(header);

    for (const { x, y } of POSITIONS) {
      const goal = new GoalChip(this.scene);
      goal.setPosition(x, y);
      this._goalsUi.push(goal);
      this.add(goal);
    }

    this.scene.add.existing(this);
  }

  public resetGoals(goals: LvlGoal): void {
    this._lvlGoal = new Map();
    let i = 0;
    for (const { type, goal } of goals) {
      this._goalsUi[i].resetGoal(type, goal);
      this._lvlGoal.set(type, this._goalsUi[i]);
      i++;
    }
  }

  public updateGoals(goals: LvlGoal): void {
    for (const { type, goal } of goals) {
      const goalUi = this._lvlGoal.get(type)!;
      goalUi.setGoal(goal);
    }
  }

  public show(): void {
    const len = this._goalsUi.length;
    let i = 0
    for (const ui of this._goalsUi) {
      i++
      this.scene.tweens.add({
        targets: ui,
        scale: 1,
        duration: 500,
        delay: 250 * (i + 1),
        ease: 'Back.easeOut',
        onComplete: len === i ? this._onCompleteShow.bind(this) : undefined
      });
    }

    this.scene.tweens.add({
      targets: [this._buble, this._header],
      alpha: 1,
      duration: 250,
      ease: 'Sine.easeInOut'
    })
  }

  private _onCompleteShow(): void {
    this.eventsBus.emit(EVENTS.UI_READY);
  }
}