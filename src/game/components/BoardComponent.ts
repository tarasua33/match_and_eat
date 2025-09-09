import { EventBusComponent, EVENTS } from "../events/EventBusComponent";
import { BgTile } from "../gameObjects/BgTile";
import { Chip } from "../gameObjects/Chip";
import { BASE_MODEL, Match3Win } from "../models/BoardModel";
import { BaseComponent } from "./BaseComponent";
import { BoardCollectWinsComponent } from "./BoardCollectWinsComponent";
import { DropChipsComponent } from "./DropChipsComponent";
import { FindWinClustersComponent } from "./FindWinClustersComponent";
import { ShuffleComponent } from "./ShuffleComponent";
import { SwapComponent } from "./SwapComponent";
import { UpdateBoardComponent } from "./UpdateBoardComponent";

export type Board = (Chip | undefined)[][];

export class BoardComponent extends BaseComponent {
  public readonly boardCollectWinsComponent = new BoardCollectWinsComponent();
  public readonly findWinClustersComponent = new FindWinClustersComponent();
  public readonly updateBoardComponent = new UpdateBoardComponent();
  public readonly dropChipsComponent = new DropChipsComponent();
  public readonly swapComponent!: SwapComponent;
  public readonly uiBoardEventsBus: EventBusComponent;
  public readonly shuffleComponent = new ShuffleComponent();
  private _tweens: Phaser.Tweens.TweenManager;
  // private _input: Phaser.Input.InputPlugin;
  private _chipsPool: Phaser.GameObjects.Group;
  private _boardContainer: Phaser.GameObjects.Container;
  private _board: Board = [];
  private _wins: Match3Win[] = [];

  constructor(
    uiBoardEventsBus: EventBusComponent,
    chipsPool: Phaser.GameObjects.Group,
    boardContainer: Phaser.GameObjects.Container,
    bgBoardVfx: BgTile[][],
    tweens: Phaser.Tweens.TweenManager,
    input: Phaser.Input.InputPlugin
  ) {
    super();
    this.uiBoardEventsBus = uiBoardEventsBus;
    this._chipsPool = chipsPool;
    this._boardContainer = boardContainer;
    this._tweens = tweens;
    this.swapComponent = new SwapComponent(input, tweens, bgBoardVfx);

    this.boardCollectWinsComponent.eventsBus.on(EVENTS.CHIP_REMOVED, this._onChipRemoved, this);
  }

  public startGame(): void {
    this.uiBoardEventsBus.once(EVENTS.UI_CHOOSE_DIF, this._onChooseLvl, this);
  }

  private _onChooseLvl(): void {
    this._spawn();
    this._playShowBoard();
  }

  public _playShowBoard(): void {
    this.dropChipsComponent.eventsBus.once(EVENTS.CHIPS_DROPPED, this._onBoardShowed, this);
    this.dropChipsComponent.drop(this._board, this._tweens, 0.5);
  }

  public _onBoardShowed(): void {
    this.uiBoardEventsBus.once(EVENTS.UI_READY, this._startGame, this);
    this.uiBoardEventsBus.emit(EVENTS.CHIPS_DROPPED);
  }

  private _startGame(): void {
    this.findWins();
  }

  public _spawn(): void {
    const board: Board = this._board = [];
    const model = this._m3model.generateNewModel(this._lvlModel.lvlDifficulty);
    this._m3model.model = model;

    this.updateBoardComponent.spawn(this._chipsPool, this._boardContainer, board, model);
  }

  public findWins(): void {
    const wins = this.findWinClustersComponent.getWinClusters(this._m3model.model, BASE_MODEL.WIDTH, BASE_MODEL.HEIGHT);

    if (wins.length > 0) {
      this._collectWinSectors(wins);
    }
    else {
      this._awaitSwap();
    }
  }

  private _onTrySwap(): void {
    const model = this._m3model.model;
    const wins = this.findWinClustersComponent.getWinClusters(model, BASE_MODEL.WIDTH, BASE_MODEL.HEIGHT);

    if (wins.length > 0) {
      this._collectWinSectors(wins);
    } else {
      this.swapComponent.eventsBus.once(EVENTS.CHIPS_SWAPPED, this._awaitSwap, this);
      this.swapComponent.swapBack(this._board, model);
    }
  }

  private _awaitSwap(): void {
    this.uiBoardEventsBus.once(EVENTS.USER_ACTION_SHUFFLE, this._playShuffle, this);
    this.uiBoardEventsBus.emit(EVENTS.AWAIT_USER_ACTION);

    this.swapComponent.eventsBus.once(EVENTS.CHIPS_SWAPPED, this._onTrySwap, this);
    this.swapComponent.eventsBus.once(EVENTS.CHIPS_START_SWAP, this._disableWaitUserAction, this);
    this.swapComponent.awaitSwap(this._board, this._m3model.model);
  }

  private _disableWaitUserAction(): void {
    this.uiBoardEventsBus.off(EVENTS.USER_ACTION_SHUFFLE, this._playShuffle, this);
    this.uiBoardEventsBus.emit(EVENTS.USER_ACTION_SWAP);
  }

  private _playShuffle(): void {
    this.swapComponent.eventsBus.off(EVENTS.CHIPS_SWAPPED, this._onTrySwap, this);
    this.swapComponent.eventsBus.off(EVENTS.CHIPS_START_SWAP, this._disableWaitUserAction, this);
    this.swapComponent.disableUserActions();

    this.shuffleComponent.eventsBus.once(EVENTS.SHUFFLE, this._onShuffle, this);
    this.shuffleComponent.shuffle(this._board, this._m3model.model, this._tweens);
  }

  private _onShuffle(): void {
    this.findWins();
  }

  private _collectWinSectors(wins: Match3Win[]): void {
    this._wins = wins
    this.boardCollectWinsComponent.eventsBus.once(EVENTS.CHIP_COLLECTED, this._onCollected, this);
    this.boardCollectWinsComponent.collectWinSectors(this._board, wins)
  }

  private _onCollected(): void {
    const model = this._m3model.model;
    this.updateBoardComponent.updateModel(this._wins, this._m3model.model, this._board);
    const extraChipsModel = this._m3model.generateNewModel(this._lvlModel.lvlDifficulty, false);
    this.updateBoardComponent.spawnNewChips(this._chipsPool, model, extraChipsModel, this._board, this._boardContainer);

    this.dropChipsComponent.eventsBus.once(EVENTS.CHIPS_DROPPED, this.findWins, this)
    this.dropChipsComponent.drop(this._board, this._tweens);
  }

  private _onChipRemoved(chip: Chip): void {
    this._board[chip.gridX][chip.gridY] = undefined;
    this._chipsPool.killAndHide(chip);
    chip.active = false;
    chip.visible = false;

    this.uiBoardEventsBus.emit(EVENTS.CHIP_REMOVED, chip.typeID);
  }
}