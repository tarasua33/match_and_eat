import { EVENTS } from "../events/EventBusComponent";
import { CELL } from "../GameConfig";
import { BgTile } from "../gameObjects/BgTile";
import { Chip } from "../gameObjects/Chip";
import { CHIPS } from "../models/BoardModel";
import { BaseComponent } from "./BaseComponent";
import { Board } from "./BoardComponent";

export class SwapComponent extends BaseComponent {
  private _input: Phaser.Input.InputPlugin;
  private _tweens: Phaser.Tweens.TweenManager;
  private _draggedChip: Chip | undefined;
  private _swapChipA: Chip | undefined;
  private _swapChipB: Chip | undefined;
  private _previousSwapChipA: Chip | undefined;
  private _previousSwapChipB: Chip | undefined;
  private _board: Board;
  private _model: CHIPS[][];
  private _bgBoardVfx: BgTile[][];


  constructor(
    input: Phaser.Input.InputPlugin,
    tweens: Phaser.Tweens.TweenManager,
    bgBoardVfx: BgTile[][]

  ) {
    super();
    this._tweens = tweens;
    this._input = input;
    this._bgBoardVfx = bgBoardVfx;
  }

  public awaitSwap(board: Board, model: CHIPS[][]): void {
    this._board = board;
    this._model = model;

    this._subscribeInputs();
  }

  private _subscribeInputs(): void {
    const board = this._board;

    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[x].length; y++) {
        if (board[x][y]) {
          board[x][y]!.eventsBus.on(EVENTS.CHIP_POINTED, this._onPointed, this);
          board[x][y]!.awaitSwap();
        }
      }
    }

    this._input.on('pointermove', this._onDrag, this);
    this._input.on('pointerup', this._onPointedUp, this);
  }

  private _onPointed(chip: Chip): void {
    this._draggedChip = chip;

    if (this._swapChipB) {
      this._bgBoardVfx[this._swapChipB.gridX][this._swapChipB.gridY].visible = false;
    }

    if (this._swapChipA) {
      const swapChipA = this._swapChipA;
      this._swapChipB = swapChipA;
      this._bgBoardVfx[swapChipA.gridX][swapChipA.gridY].visible = true;
    }

    this._bgBoardVfx[chip.gridX][chip.gridY].visible = true;
    this._swapChipA = chip;

    if (this._swapChipB && this._swapChipA && this._swapChipB !== this._swapChipA) {
      if (this._canSwap()) {
        this._trySwap(this._swapChipA, this._swapChipB!);
      } else {
        this._playCantSwap(this._swapChipA, this._swapChipB!)
      }
    }
  }

  private _playCantSwap(chipA: Chip, chipB: Chip): void {
    this._disableInputs();
    this._hideVfx();
    this._disablePickedChips();

    this._showVfx(chipA, chipB);
    this._swapChipA = chipA;
    this._swapChipB = chipB;

    this._tweens.add({
      targets: chipA,
      rotation: Math.PI / 18,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeInOut'
    });

    this._tweens.add({
      targets: chipB,
      rotation: Math.PI / 18,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeInOut',
      onComplete: this._onNotSwap.bind(this)
    })
  }

  private _onNotSwap(): void {
    this._hideVfx();
    this._disablePickedChips();

    this._subscribeInputs();
  }

  private _canSwap(): boolean {
    const swapChipB = this._swapChipB;
    const swapChipA = this._swapChipA;
    const res = swapChipB &&
      swapChipA &&
      swapChipB !== swapChipA &&
      ((Math.abs(swapChipB.gridX - swapChipA.gridX) === 1 && Math.abs(swapChipB.gridY - swapChipA.gridY) === 0) ||
        (Math.abs(swapChipB.gridX - swapChipA.gridX) === 0 && Math.abs(swapChipB.gridY - swapChipA.gridY) === 1))

    return !!res;
  }

  private _onDrag(pointer: Phaser.Input.Pointer): void {
    if (this._draggedChip) {
      const draggedChip = this._draggedChip;
      const dx = pointer.x - this._draggedChip.startDrag.x;
      const dy = pointer.y - this._draggedChip.startDrag.y;

      const threshold = CELL.width / 3;
      const board = this._board;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (board[draggedChip.gridX + 1] && board[draggedChip.gridX + 1][draggedChip.gridY] && dx > 0) {
          this._trySwap(draggedChip, board[draggedChip.gridX + 1][draggedChip.gridY]!);
        } else if (board[draggedChip.gridX - 1] && board[draggedChip.gridX - 1][draggedChip.gridY]) {
          this._trySwap(draggedChip, board[draggedChip.gridX - 1][draggedChip.gridY]!)
        }

        this._draggedChip = undefined;
      }
      else if (Math.abs(dy) > threshold) {
        if (board[draggedChip.gridX][draggedChip.gridY + 1] && dy > 0) {
          this._trySwap(draggedChip, board[draggedChip.gridX][draggedChip.gridY + 1]!);
        } else if (board[draggedChip.gridX][draggedChip.gridY - 1]) {
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
        if (board[x][y]) {
          board[x][y]!.eventsBus.off(EVENTS.CHIP_POINTED, this._onPointed, this);
          board[x][y]!.disableInput();
        }
      }
    }

    this._input.off('pointermove', this._onDrag, this);
    this._input.off('pointerup', this._onPointedUp, this);
  }

  private _trySwap(chipA: Chip, chipB: Chip): void {
    this._disableInputs();

    this._hideVfx();
    this._disablePickedChips();

    this._startSwap(chipA, chipB);
  }

  public swapBack(board: Board, model: CHIPS[][]): void {
    this._board = board;
    this._model = model;

    this._startSwap(this._previousSwapChipB!, this._previousSwapChipA!, true);
  }

  private _showVfx(chipA: Chip, chipB: Chip): void {
    const bgBoardVfx = this._bgBoardVfx;
    bgBoardVfx[chipA.gridX][chipA.gridY].visible = true;
    bgBoardVfx[chipB.gridX][chipB.gridY].visible = true;
  }

  private _startSwap(chipA: Chip, chipB: Chip, isBack?: boolean): void {
    this._showVfx(chipA, chipB);
    this._swapChipA = chipA;
    this._swapChipB = chipB;

    const posA = { x: chipA.x, y: chipA.y };
    const posB = { x: chipB.x, y: chipB.y };

    this._tweens.add({
      targets: chipA,
      x: posB.x,
      y: posB.y,
      duration: 350,
      ease: isBack ? 'Cubic.easeOut' : 'Back.easeInOut'
    });

    this._tweens.add({
      targets: chipB,
      x: posA.x,
      y: posA.y,
      duration: 350,
      ease: isBack ? 'Cubic.easeOut' : 'Back.easeInOut',
      onComplete: this._onSwap.bind(this)
    })
  }

  private _onPointedUp(): void {
    this._draggedChip = undefined;
  }

  private _onSwap(): void {
    const board = this._board;
    const model = this._model;

    const chipA = this._previousSwapChipA = this._swapChipA!;
    const chipB = this._previousSwapChipB = this._swapChipB!;

    this._hideVfx();
    this._disablePickedChips();

    model[chipA!.gridX][chipA!.gridY] = chipB!.typeID;
    model[chipB!.gridX][chipB!.gridY] = chipA!.typeID;

    const gridA = { x: chipA.gridX, y: chipA.gridY };
    const gridB = { x: chipB.gridX, y: chipB.gridY };

    board[gridA.x][gridA.y] = chipB;
    chipB.setNewGridPosition(gridA.x, gridA.y);

    board[gridB.x][gridB.y] = chipA;
    chipA.setNewGridPosition(gridB.x, gridB.y);

    this._hideVfx();

    this.eventsBus.emit(EVENTS.CHIPS_SWAPPED);
  }

  private _disablePickedChips(): void {
    this._swapChipB = undefined;
    this._swapChipA = undefined;
    this._draggedChip = undefined;
  }

  private _hideVfx(): void {
    const bgBoardVfx = this._bgBoardVfx;
    if (this._swapChipB) {
      bgBoardVfx[this._swapChipB.gridX][this._swapChipB.gridY].visible = false;
    }

    if (this._swapChipA) {
      bgBoardVfx[this._swapChipA.gridX][this._swapChipA.gridY].visible = false;
    }
  }
}