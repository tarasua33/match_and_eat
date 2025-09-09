import { EVENTS } from "../events/EventBusComponent";
import { Chip } from "../gameObjects/Chip";
import { CHIPS } from "../models/BoardModel";
import { BaseComponent } from "./BaseComponent";
import { Board } from "./BoardComponent";

interface IPoint { x: number, y: number };

export class ShuffleComponent extends BaseComponent {
  private _movingChips: Chip[] = [];

  public shuffle(board: Board, model: CHIPS[][], tweens: Phaser.Tweens.TweenManager): void {
    const availablePositions = this._getAvailablePositions(model);
    this._shufflePositions(board, model, availablePositions);

    const movingChips: Chip[] = this._movingChips;

    for (const col of board) {
      for (const chip of col) {
        if (chip && (chip as Chip).isMoving) {
          movingChips.push(chip!);
        }
      }
    }

    tweens.add({
      targets: movingChips,
      y: this._getNewY,
      x: this._getNewX,
      duration: 500,
      ease: 'Back.easeInOut',
      // delay: 0,
      onComplete: this._onCompleteShuffle.bind(this)
    });
  }

  private _getAvailablePositions(model: CHIPS[][]): IPoint[] {
    const result = [];

    for (let x = 0; x < model.length; x++) {
      for (let y = 0; y < model[x].length; y++) {
        if (model[x][y] !== CHIPS.LOCK && model[x][y] !== CHIPS.EMPTY) {
          result.push({ x, y });
        }
      }
    }

    return result;
  }

  private _shufflePositions(board: Board, model: CHIPS[][], available: IPoint[]): void {
    this._movingChips = [];

    const chips: Chip[] = [];
    for (let x = 0; x < model.length; x++) {
      for (let y = 0; y < model[x].length; y++) {
        if (model[x][y] !== CHIPS.LOCK && model[x][y] !== CHIPS.EMPTY) {
          const index = Phaser.Math.RND.between(0, available.length - 1)
          const nePos = available.splice(index, 1)[0];

          board[x][y]!.setNewGridPosition(nePos.x, nePos.y);
          chips.push(board[x][y]!);
        }
      }
    }

    for (const chip of chips) {
      model[chip.gridX][chip.gridY] = chip.typeID;
      board[chip.gridX][chip.gridY] = chip;
      chip.isMoving;

      this._movingChips.push(chip);
    }
  }

  private _getNewY(chip: Chip): number {
    return chip.dropPositionY;
  }

  private _getNewX(chip: Chip): number {
    return chip.dropPositionX;
  }

  private _onCompleteShuffle(): void {
    for (const chip of this._movingChips) {
      chip.isMoving = false;
    }

    this.eventsBus.emit(EVENTS.SHUFFLE);
  }
}