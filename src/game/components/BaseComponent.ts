import { EventBusComponent } from "../events/EventBusComponent";
import { BoardModel } from "../models/BoardModel";
import { LvlModel } from "../models/LvlModel";

export class BaseComponent {
  public readonly eventsBus = new EventBusComponent();
  protected _m3model: BoardModel;
  protected _lvlModel: LvlModel;

  constructor() {
    this._m3model = BoardModel.getModel();
    this._lvlModel = LvlModel.getModel();
  }
}