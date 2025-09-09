import { EventBusComponent, EVENTS } from "../events/EventBusComponent";
import { CHIPS } from "../models/BoardModel";
import { GoalPopup } from "../ui/GoalPopup";
import IntroScreen from "../ui/IntroScreen";
import { ShuffleButton } from "../ui/ShuffleButton";
import { BaseComponent } from "./BaseComponent";

export class UiComponent extends BaseComponent {
  public readonly uiBoardEventsBus: EventBusComponent;
  private _introScreen: IntroScreen;
  private _shuffleButton: ShuffleButton

  private _goalPopup: GoalPopup;
  constructor(
    uiBoardEventsBus: EventBusComponent,
    goalPopup: GoalPopup,
    introScreen: IntroScreen,
    shuffleButton: ShuffleButton
  ) {
    super();
    this.uiBoardEventsBus = uiBoardEventsBus;
    this._goalPopup = goalPopup;
    this._introScreen = introScreen;
    this._shuffleButton = shuffleButton;

    uiBoardEventsBus.on(EVENTS.CHIP_REMOVED, this._chipCollected, this);

    shuffleButton.makeInactive();
    uiBoardEventsBus.on(EVENTS.AWAIT_USER_ACTION, this._waitUserAction, this);
  }

  private _waitUserAction(): void {
    const shuffleButton = this._shuffleButton;
    this.uiBoardEventsBus.once(EVENTS.USER_ACTION_SWAP, this._onAction, this);
    shuffleButton.eventsBus.once(EVENTS.SHUFFLE, this._onShuffle, this);
    shuffleButton.makeActive();
  }

  private _onShuffle() {
    this.uiBoardEventsBus.off(EVENTS.USER_ACTION_SWAP, this._onAction, this);
    this.uiBoardEventsBus.emit(EVENTS.USER_ACTION_SHUFFLE)
  }

  private _onAction() {
    this.uiBoardEventsBus.off(EVENTS.USER_ACTION_SWAP, this._onAction, this);
    this._shuffleButton.eventsBus.off(EVENTS.SHUFFLE, this._onShuffle, this);
    this._shuffleButton.makeInactive()
  }

  public startGame(): void {
    const introScreen = this._introScreen;

    introScreen.eventsBus.on(EVENTS.UI_CHOOSE_DIF, this._onChooseDifficulty, this);
    introScreen.show();
  }

  private _onChooseDifficulty(val: number): void {
    this._lvlModel.lvlDifficulty = val;

    const introScreen = this._introScreen;
    introScreen.eventsBus.on(EVENTS.UI_READY, this._playNewLvl, this);
    introScreen.hide();
  }

  public _playNewLvl(): void {
    this._lvlModel.getNewGoals();

    this.uiBoardEventsBus.once(EVENTS.CHIPS_DROPPED, this._showGoalsUI, this);
    this.uiBoardEventsBus.emit(EVENTS.UI_CHOOSE_DIF);
  }

  private _showGoalsUI(): void {
    const goalPopup = this._goalPopup;
    goalPopup.eventsBus.once(EVENTS.UI_READY, this._goalUIReady, this);
    this._goalPopup.resetGoals(this._lvlModel.goals);
    goalPopup.show()
  }

  private _goalUIReady(): void {
    this.uiBoardEventsBus.emit(EVENTS.UI_READY);
  }

  private _chipCollected(id: CHIPS): void {
    const isGoal = this._lvlModel.minusChip(id);

    if (isGoal) {
      this._goalPopup.updateGoals(this._lvlModel.goals);
    }
  }
}