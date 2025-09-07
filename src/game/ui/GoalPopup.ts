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
  private _goalsUi: GoalChip[] = [];
  private _lvlGoal!: Map<CHIPS, GoalChip>;

  constructor(...arr: ConstructorParameters<typeof Phaser.GameObjects.Container>) {
    super(...arr);

    const buble = this.scene.add.sprite(0, 0, "popup_buble");
    buble.setOrigin(0.5, 0);
    buble.setScale(4, 3);
    this.add(buble);

    const header = this.scene.add.sprite(0, 5, "popup_header");
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
}