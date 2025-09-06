import { EventBusComponent, EVENTS } from "../events/EventBusComponent";
import { CELL } from "../GameConfig";
import { Chip } from "../gameObjects/Chip";
import { Board, CHIPS } from "./BoardComponent";

export class SwapComponent {
  public readonly eventsBus = new EventBusComponent();

  private _input: Phaser.Input.InputPlugin;
  private _tweens: Phaser.Tweens.TweenManager;
  private _draggedChip: Chip | undefined;
  private _swapChipA: Chip | undefined;
  private _swapChipB: Chip | undefined;
  private _board: Board;
  private _model: CHIPS[][];

  constructor(input: Phaser.Input.InputPlugin, tweens: Phaser.Tweens.TweenManager) {
    this._tweens = tweens;
    this._input = input;
  }

  public awaitSwap(board: Board, model: CHIPS[][]): void {
    this._board = board;
    this._model = model;

    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[x].length; y++) {
        board[x][y]!.eventsBus.on(EVENTS.CHIP_POINTED, this._onPointed, this);
        board[x][y]!.awaitSwap();
      }
    }
    this._input.on('pointermove', this._onDrag, this);
    this._input.on('pointerup', this._onPointedUp, this);
  }

  private _onPointed(chip: Chip): void {
    // console.log("Pointed", chip.startDrag.x, chip.startDrag.y);
    this._draggedChip = chip;
  }

  private _onDrag(pointer: Phaser.Input.Pointer): void {
    if (this._draggedChip) {
      const draggedChip = this._draggedChip;
      const dx = pointer.x - this._draggedChip.startDrag.x;
      const dy = pointer.y - this._draggedChip.startDrag.y;

      // console.log("startDrag", this._draggedChip.startDrag.x, this._draggedChip.startDrag.y);
      // console.log("pointer", pointer.x, pointer.y);
      // console.log(dx, dy);
      const threshold = CELL.width / 3;
      const board = this._board;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        // свайп по горизонталі
        if (dx > 0) {
          this._trySwap(draggedChip, board[draggedChip.gridX + 1][draggedChip.gridY]!);
        } else {
          this._trySwap(draggedChip, board[draggedChip.gridX - 1][draggedChip.gridY]!)
        }

        this._draggedChip = undefined;
      }
      else if (Math.abs(dy) > threshold) {
        if (dy > 0) {
          this._trySwap(draggedChip, board[draggedChip.gridX][draggedChip.gridY + 1]!);
        } else {
          this._trySwap(draggedChip, board[draggedChip.gridX][draggedChip.gridY - 1]!);
        }

        this._draggedChip = undefined;
      }
    }
  }

  private _disableInputs(): void {
    const board = this._board;
    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[x].length; y++) {
        board[x][y]!.eventsBus.off(EVENTS.CHIP_POINTED, this._onPointed, this);
        board[x][y]!.disableInput();
      }
    }

    this._input.off('pointermove', this._onDrag, this);
    this._input.off('pointerup', this._onPointedUp, this);
  }

  private _trySwap(chipA: Chip, chipB: Chip): void {
    this._disableInputs();

    this._swapChipB = chipB;
    this._swapChipA = chipA;
    this._startSwap(chipA, chipB);
  }

  public swapBack(board: Board, model: CHIPS[][]): void {
    this._board = board;
    this._model = model;

    this._startSwap(this._swapChipB!, this._swapChipA!, true);
  }

  private _startSwap(chipA: Chip, chipB: Chip, isBack?: boolean): void {
    this._swapChipA = chipA;
    this._swapChipB = chipB;

    const posA = { x: chipA.x, y: chipA.y };
    const posB = { x: chipB.x, y: chipB.y };

    this._tweens.add({
      targets: chipA,
      x: posB.x,
      y: posB.y,
      duration: 350,
      ease: isBack ? 'Cubic.easeOut' : 'Back.easeIn'
    });

    this._tweens.add({
      targets: chipB,
      x: posA.x,
      y: posA.y,
      duration: 350,
      ease: isBack ? 'Cubic.easeOut' : 'Back.easeIn',
      onComplete: this._onSwap.bind(this)
    })
  }

  private _onPointedUp(): void {
    this._draggedChip = undefined;
  }

  private _onSwap(): void {
    const board = this._board;
    const model = this._model;

    const chipA = this._swapChipA!;
    const chipB = this._swapChipB!;

    model[chipA!.gridX][chipA!.gridY] = chipB!.typeID;
    model[chipB!.gridX][chipB!.gridY] = chipA!.typeID;

    const gridA = { x: chipA.gridX, y: chipA.gridY };
    const gridB = { x: chipB.gridX, y: chipB.gridY };

    board[gridA.x][gridA.y] = chipB;
    chipB.setNewGridPosition(gridA.x, gridA.y);

    board[gridB.x][gridB.y] = chipA;
    chipA.setNewGridPosition(gridB.x, gridB.y);

    this.eventsBus.emit(EVENTS.CHIPS_SWAPPED);
  }
}