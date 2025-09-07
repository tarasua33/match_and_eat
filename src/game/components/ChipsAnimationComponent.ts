import { EVENTS } from "../events/EventBusComponent";
import { Chip } from "../gameObjects/Chip";
import { BaseComponent } from "./BaseComponent";

export class ChipsAnimationComponent extends BaseComponent {
  private _chip: Chip;
  constructor(chip: Chip) {
    super();
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