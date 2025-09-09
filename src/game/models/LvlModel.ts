import { CHIPS } from "./BoardModel";

export type LvlGoal = { type: CHIPS, goal: number }[];
const MAX_GOALS = 3;
const BASE_GOAL = 10;

export class LvlModel {
  static instance: LvlModel
  static getModel(): LvlModel {
    if (!LvlModel.instance) {
      LvlModel.instance = new LvlModel
    }

    return LvlModel.instance;
  }

  private _lvlDifficulty = 0;
  private _goals!: LvlGoal;

  public getNewGoals(): LvlGoal {
    const result: LvlGoal = [];

    const easy = [CHIPS.C1, CHIPS.C2, CHIPS.C3, CHIPS.C4, CHIPS.C5];
    const normal = [CHIPS.C1, CHIPS.C2, CHIPS.C3, CHIPS.C4, CHIPS.C5, CHIPS.C6];
    const hard = [CHIPS.C1, CHIPS.C2, CHIPS.C3, CHIPS.C4, CHIPS.C5, CHIPS.C6, CHIPS.C7];

    const lvlChips = [easy, normal, hard];
    const chips = lvlChips[this._lvlDifficulty];

    for (let i = 0; i < MAX_GOALS; i++) {
      const index = Phaser.Math.RND.between(0, chips.length - 1);
      const type = chips.splice(index, 1)[0];
      result.push({
        type: type,
        goal: BASE_GOAL
      })
    }

    this._goals = result;

    return result;
  }

  public get goals(): LvlGoal {
    return this._goals;
  }

  public set lvlDifficulty(val: number) {
    this._lvlDifficulty = val;
  }

  public get lvlDifficulty(): number {
    return this._lvlDifficulty;
  }

  public minusChip(id: CHIPS): boolean {
    let isGoal = false;

    for (const goal of this._goals) {
      if (goal.type === id) {
        goal.goal--;
        goal.goal = goal.goal < 0 ? 0 : goal.goal;
        isGoal = true;

        break;
      }
    }

    return isGoal
  }
}