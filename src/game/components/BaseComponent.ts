import { EventBusComponent } from "../events/EventBusComponent";
import { BoardModel } from "../models/BoardModel";

export class BaseComponent {
  public readonly eventsBus = new EventBusComponent();
  protected _m3model: BoardModel;

  constructor() {
    this._m3model = BoardModel.getModel();
  }
}