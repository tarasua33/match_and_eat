import { MASKS } from "./BoardModelMasks";

export enum CHIPS {
  LOCK = "LOCK",
  EMPTY = "EMPTY",
  C1 = "chip_1",
  C2 = "chip_2",
  C3 = "chip_3",
  C4 = "chip_4",
  C5 = "chip_5",
  C6 = "chip_6",
  C7 = "chip_7",
};

const easy = [CHIPS.C1, CHIPS.C2, CHIPS.C3, CHIPS.C4, CHIPS.C5];
const normal = [CHIPS.C1, CHIPS.C2, CHIPS.C3, CHIPS.C4, CHIPS.C5, CHIPS.C6];
const hard = [CHIPS.C1, CHIPS.C2, CHIPS.C3, CHIPS.C4, CHIPS.C5, CHIPS.C6, CHIPS.C7];

const lvlChips = [easy, normal, hard];

export const BASE_MODEL = {
  WIDTH: 8,
  HEIGHT: 8
}

export const MAX_CHIPS = BASE_MODEL.HEIGHT * BASE_MODEL.WIDTH;

export const MIN_CLUSTER_SIZE = 3;

export interface Match3Win {
  positions: GridPosition[];
  id: CHIPS;
}

export interface GridPosition {
  x: number, y: number
}

export class BoardModel {
  static instance: BoardModel
  static getModel(): BoardModel {
    if (!BoardModel.instance) {
      BoardModel.instance = new BoardModel
    }

    return BoardModel.instance;
  }

  private _model: CHIPS[][];

  public generateNewModel(lvl: number, isInitial = true): CHIPS[][] {
    const result: CHIPS[][] = [];
    const { WIDTH, HEIGHT } = BASE_MODEL;
    for (let x = 0; x < WIDTH; x++) {
      result.push([]);
      for (let y = 0; y < HEIGHT; y++) {
        result[x].push(lvlChips[lvl][Math.floor(Math.random() * lvlChips[lvl].length)])
      }
    }

    if (isInitial) {
      const mask = MASKS[Math.floor(Math.random() * MASKS.length)];

      for (let x = 0; x < mask.length; x++) {
        for (let y = 0; y < mask[x].length; y++) {
          if (mask[x][y] === CHIPS.LOCK) {
            result[x][y] = mask[x][y];
          }
        }
      }
    }

    return result;
  }

  public get model(): CHIPS[][] {
    return this._model
  }

  public set model(val: CHIPS[][]) {
    this._model = val;
  }
}