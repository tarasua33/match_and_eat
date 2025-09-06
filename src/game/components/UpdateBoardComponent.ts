import { Chip } from "../gameObjects/Chip";
import { Board, CHIPS, GridPosition, Match3Win } from "./BoardComponent";

export class UpdateBoardComponent {
  updateModel(wins: Match3Win[], model: CHIPS[][], board: Board): void {
    for (const win of wins) {
      for (const { x, y } of win.positions) {
        model[x][y] = CHIPS.EMPTY;
      }
    }

    this._updatePositions(model, board);
  }

  private _updatePositions(model: CHIPS[][], board: Board): void {
    for (let x = 0; x < model.length; x++) {
      const col = model[x];
      for (let y = col.length - 1; y >= 0; y--) {
        if (model[x][y] === CHIPS.EMPTY) {
          const pos = this._getFallenChip(x, y, model);

          if (!pos) {
            break;
          } else {
            const newChip = board[pos.x][pos.y]!;
            model[x][y] = newChip.typeID;
            model[pos.x][pos.y] = CHIPS.EMPTY;
            board[pos.x][pos.y] = undefined;
            board[x][y] = newChip;
            newChip.setNewGridPosition(x, y);
            newChip.isMoving = true;
          }
        }
      }
    }
  }

  private _getFallenChip(x: number, startY: number, model: CHIPS[][]): GridPosition | undefined {
    for (let y = startY; y >= 0; y--) {
      if (model[x][y] !== CHIPS.EMPTY) {
        return { x, y };
      }
    }
  }

  public generateRandomModel(width: number, height: number, strip: CHIPS[]): CHIPS[][] {
    const result: CHIPS[][] = [];
    for (let x = 0; x < width; x++) {
      result.push([]);
      for (let y = 0; y < height; y++) {
        result[x].push(strip[Math.floor(Math.random() * strip.length)])
      }
    }

    return result;
  }

  public spawnNewChips(
    chipsPool: Phaser.GameObjects.Group,
    model: CHIPS[][],
    extraChipsModel: CHIPS[][],
    board: Board,
    boardContainer: Phaser.GameObjects.Container
  ): void {
    for (let x = 0; x < model.length; x++) {
      const col = model[x];

      for (let y = 0; y < col.length; y++) {
        if (col[y] === CHIPS.EMPTY) {
          const spawnY = col.length - y - 1;
          const chip = chipsPool.get(0, 0, extraChipsModel[x][spawnY]) as Chip;
          chip.spawnAbove(x, y, -spawnY, extraChipsModel[x][spawnY]);
          model[x][y] = extraChipsModel[x][spawnY];
          board[x][y] = chip;

          boardContainer.add(chip);
        }
      }
    }
  }
}