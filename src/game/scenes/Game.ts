import { Scene } from 'phaser';
import { CELL, GAME_DIMENSIONS } from '../GameConfig';
import { BoardComponent } from '../components/BoardComponent';
import { Chip } from '../gameObjects/Chip';
import { BgTile } from '../gameObjects/BgTile';
import { BASE_MODEL, MAX_CHIPS } from '../models/BoardModel';
import { GoalPopup } from '../ui/GoalPopup';
import { UiComponent } from '../components/UiComponent';
import { EventBusComponent, EVENTS } from '../events/EventBusComponent';
import IntroScreen from '../ui/IntroScreen';
import { ShuffleButton } from '../ui/ShuffleButton';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private _uiComponent: UiComponent
  private _boardComponent: BoardComponent;

  constructor() {
    super('Game');
  }

  create() {
    this.camera = this.cameras.main;
    // this.camera.setBackgroundColor(0x00ff00);

    this.scale.on('resize', this.resize, this);
    this.resize({ width: window.innerWidth, height: window.innerHeight });

    this.initGame();
  }

  public initGame(): void {
    const uiBoardEventsBus = new EventBusComponent();

    this._createBoard(uiBoardEventsBus);

    this._createUI(uiBoardEventsBus);

    this._boardComponent.eventsBus.once(EVENTS.WIN, this._restartGame, this);
    this._boardComponent.startGame();
    this._uiComponent.startGame();
  }

  private _restartGame(): void {
    const uiComponent = this._uiComponent;
    const boardComponent = this._boardComponent;

    uiComponent.resetComponent();
    boardComponent.resetComponent();

    boardComponent.eventsBus.once(EVENTS.WIN, this._restartGame, this);
    boardComponent.startGame();
    uiComponent.startGame();
  }

  private _createUI(uiBoardEventsBus: EventBusComponent): void {
    const uiGoalPopup = new GoalPopup(this);
    uiGoalPopup.setPosition(CELL.width * 2, CELL.height * (BASE_MODEL.HEIGHT + 1) - 15);

    const shuffleButton = new ShuffleButton(this, 0, 0);
    shuffleButton.setPosition(CELL.width * 6, CELL.height * (BASE_MODEL.HEIGHT + 2) - 15);

    const introScreen = new IntroScreen(this);
    introScreen.setPosition(GAME_DIMENSIONS.width / 2, GAME_DIMENSIONS.width / 2);

    this._uiComponent = new UiComponent(uiBoardEventsBus, uiGoalPopup, introScreen, shuffleButton);
  }

  private _createBoard(uiBoardEventsBus: EventBusComponent): void {
    const boardContainer = this.add.container();
    boardContainer.setPosition(0, CELL.height / 2);

    const bgBoardVfx = this._createBoardBgVfx(boardContainer);
    const chipsPool = this.add.group({
      classType: Chip,
      maxSize: MAX_CHIPS,
    });

    this._boardComponent = new BoardComponent(
      uiBoardEventsBus,
      chipsPool,
      boardContainer,
      bgBoardVfx,
      this.tweens,
      this.input
    );
  }

  private _createBoardBgVfx(container: Phaser.GameObjects.Container): BgTile[][] {
    const { WIDTH, HEIGHT } = BASE_MODEL;
    const result: BgTile[][] = [];
    for (let x = 0; x < WIDTH; x++) {
      result.push([]);
      for (let y = 0; y < HEIGHT; y++) {
        const vfx = new BgTile(this);
        container.add(vfx);
        vfx.setPositionOnGrid(x, y);
        result[x].push(vfx);
      }
    }

    return result;
  }

  resize(gameSize: Partial<Phaser.Structs.Size>) {
    const { width, height } = gameSize;

    const vw = width!;
    const vh = height!;

    const baseWidth = GAME_DIMENSIONS.width;
    const baseHeight = GAME_DIMENSIONS.height;

    const scale = Math.min(
      vw / baseWidth,
      vh / baseHeight
    );

    this.cameras.main.setZoom(scale);
    this.cameras.main.centerOn(baseWidth / 2, baseHeight / 2);
  }
}
