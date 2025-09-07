import { EventBusComponent, EVENTS } from "../events/EventBusComponent";
import { CHIPS } from "../models/BoardModel";
import { GoalPopup } from "../ui/GoalPopup";
import { BaseComponent } from "./BaseComponent";

export class UiComponent extends BaseComponent {
  public readonly uiBoardEventsBus: EventBusComponent;
  private _goalPopup: GoalPopup;
  constructor(uiBoardEventsBus: EventBusComponent, goalPopup: GoalPopup) {
    super();
    this.uiBoardEventsBus = uiBoardEventsBus;
    this._goalPopup = goalPopup;

    uiBoardEventsBus.on(EVENTS.CHIP_REMOVED, this._chipCollected, this);
  }

  public playNewLvl(): void {
    this._lvlModel.getNewGoals();
    this.uiBoardEventsBus.once(EVENTS.CHIPS_DROPPED, this._showGoalsUI, this);
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