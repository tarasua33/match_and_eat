import { EVENTS } from "../events/EventBusComponent";
import { BgTile } from "../gameObjects/BgTile";
import { Chip } from "../gameObjects/Chip";
import { baseModel, Match3Win } from "../models/BoardModel";
import { BaseComponent } from "./BaseComponent";
import { BoardCollectWinsComponent } from "./BoardCollectWinsComponent";
import { DropChipsComponent } from "./DropChipsComponent";
import { FindWinClustersComponent } from "./FindWinClustersComponent";
import { SwapComponent } from "./SwapComponent";
import { UpdateBoardComponent } from "./UpdateBoardComponent";

export type Board = (Chip | undefined)[][];

export class BoardComponent extends BaseComponent {
  public readonly boardCollectWinsComponent = new BoardCollectWinsComponent();
  public readonly findWinClustersComponent = new FindWinClustersComponent();
  public readonly updateBoardComponent = new UpdateBoardComponent();
  public readonly dropChipsComponent = new DropChipsComponent();
  public readonly swapComponent!: SwapComponent;
  private _tweens: Phaser.Tweens.TweenManager;
  // private _input: Phaser.Input.InputPlugin;
  private _chipsPool: Phaser.GameObjects.Group;
  private _boardContainer: Phaser.GameObjects.Container;
  private _board: Board = [];
  private _wins: Match3Win[] = [];
  // private _bgBoardVfx: BgTile[][];

  constructor(
    chipsPool: Phaser.GameObjects.Group,
    boardContainer: Phaser.GameObjects.Container,
    bgBoardVfx: BgTile[][],
    tweens: Phaser.Tweens.TweenManager,
    input: Phaser.Input.InputPlugin
  ) {
    super();
    this._chipsPool = chipsPool;
    this._boardContainer = boardContainer;
    this._tweens = tweens;
    this.swapComponent = new SwapComponent(input, tweens, bgBoardVfx);

    this.boardCollectWinsComponent.eventsBus.on(EVENTS.CHIP_REMOVED, this._onChipRemoved, this);
  }

  public spawn(): void {
    const board: Chip[][] = this._board = [];
    const model = this._m3model.generateNewModel();
    this._m3model.model = model;

    for (let x = 0; x < model.length; x++) {
      board.push([]);

      for (let y = 0; y < model[x].length; y++) {
        const chip = this._chipsPool.get(0, 0, model[x][y]) as Chip;
        chip.spawn(x, y, model[x][y]);
        board[x].push(chip);

        this._boardContainer.add(chip);
      }
    }

    // console.log(model);
    this.findWins();
  }

  public findWins(): void {
    const wins = this.findWinClustersComponent.getWinClusters(this._m3model.model, baseModel.WIDTH, baseModel.HEIGHT);

    if (wins.length > 0) {
      this._collectWinSectors(wins);
    }
    else {
      this._awaitSwap();
    }
  }

  private _onTrySwap(): void {
    const model = this._m3model.model;
    const wins = this.findWinClustersComponent.getWinClusters(model, baseModel.WIDTH, baseModel.HEIGHT);

    if (wins.length > 0) {
      this._collectWinSectors(wins);
    } else {
      this.swapComponent.eventsBus.once(EVENTS.CHIPS_SWAPPED, this._awaitSwap, this);
      this.swapComponent.swapBack(this._board, model);
    }
  }

  private _awaitSwap(): void {
    this.swapComponent.eventsBus.once(EVENTS.CHIPS_SWAPPED, this._onTrySwap, this);
    this.swapComponent.awaitSwap(this._board, this._m3model.model);
  }

  private _collectWinSectors(wins: Match3Win[]): void {
    this._wins = wins
    this.boardCollectWinsComponent.eventsBus.once(EVENTS.CHIP_COLLECTED, this._onCollected, this);
    this.boardCollectWinsComponent.collectWinSectors(this._board, wins)
  }

  private _onCollected(): void {
    const model = this._m3model.model;
    this.updateBoardComponent.updateModel(this._wins, this._m3model.model, this._board);
    const extraChipsModel = this._m3model.generateNewModel();
    this.updateBoardComponent.spawnNewChips(this._chipsPool, model, extraChipsModel, this._board, this._boardContainer);

    this.dropChipsComponent.eventsBus.once(EVENTS.CHIPS_DROPPED, this.findWins, this)
    this.dropChipsComponent.drop(this._board, this._tweens);
  }

  private _onChipRemoved(chip: Chip): void {
    this._board[chip.gridX][chip.gridY] = undefined;
    this._chipsPool.killAndHide(chip);
    chip.active = false;
    chip.visible = false;
  }
}