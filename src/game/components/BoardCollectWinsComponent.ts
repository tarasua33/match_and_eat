import { EVENTS } from "../events/EventBusComponent";
import { Chip } from "../gameObjects/Chip";
import { Match3Win } from "../models/BoardModel";
import { BaseComponent } from "./BaseComponent";
import { Board } from "./BoardComponent";

export class BoardCollectWinsComponent extends BaseComponent {
  private _winChipsCounter = 0;

  public collectWinSectors(board: Board, wins: Match3Win[]): void {
    this._winChipsCounter = 0;

    for (const win of wins) {
      for (const { x, y } of win.positions) {
        this._winChipsCounter++;
        const chip = board[x][y]!;

        chip.animationComponent.eventsBus.once(EVENTS.CHIP_COLLECTED, this._onCollected, this);
        chip.animationComponent.playCollect();
      }
    }
  }

  private _onCollected(chip: Chip): void {
    this._winChipsCounter--;
    this.eventsBus.emit(EVENTS.CHIP_REMOVED, chip);

    if (this._winChipsCounter === 0) {
      this.eventsBus.emit(EVENTS.CHIP_COLLECTED);
    }
  }
}