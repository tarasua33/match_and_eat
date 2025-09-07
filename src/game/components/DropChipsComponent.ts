import { EVENTS } from "../events/EventBusComponent";
import { Chip } from "../gameObjects/Chip";
import { BaseComponent } from "./BaseComponent";
import { Board } from "./BoardComponent";

export class DropChipsComponent extends BaseComponent {
  private _movingChips: Chip[] = [];

  public drop(board: Board, tweens: Phaser.Tweens.TweenManager): void {
    const movingChips: Chip[] = this._movingChips = [];

    for (const col of board) {
      for (const chip of col) {
        if ((chip as Chip).isMoving) {
          movingChips.push(chip!);
        }
      }
    }

    tweens.add({
      targets: movingChips,
      y: this._getNewY,
      duration: 500,
      ease: 'Bounce.Out',
      onComplete: this._onCompleteDrop.bind(this)
    });
  }

  private _getNewY(chip: Chip): number {
    return chip.dropPositionY;
  }

  private _onCompleteDrop(): void {
    for (const chip of this._movingChips) {
      chip.isMoving = false;
    }

    this.eventsBus.emit(EVENTS.CHIPS_DROPPED);
  }
}