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
    const gaols = this._lvlModel.getNewGoals();

    this._goalPopup.resetGoals(gaols);
  }

  private _chipCollected(id: CHIPS): void {
    const isGoal = this._lvlModel.minusChip(id);

    if (isGoal) {
      this._goalPopup.resetGoals(this._lvlModel.goals);
    }
  }
}