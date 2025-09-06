import { EventBusComponent, EVENTS } from "../events/EventBusComponent";
import { Chip } from "../gameObjects/Chip";

export class ChipsAnimationComponent {
  public readonly eventsBus = new EventBusComponent();
  private _chip: Chip;
  constructor(chip: Chip) {
    this._chip = chip;
  }

  public playCollect(): void {
    const chip = this._chip;
    chip.on("animationcomplete", this._onCompleteAnimation, this);
    chip.play(chip.typeID);
  }

  private _onCompleteAnimation(): void {
    this.eventsBus.emit(EVENTS.CHIP_COLLECTED, this._chip);
  }
}