export default class Task {
  public id: number;
  readonly name: string;
  public completed: boolean;

  constructor(data: _taskPrimitiveObject) {
    this.id = data.id;
    this.name = data.name;
    this.completed = data.completed;
  }

  toPrimitiveObject(): _taskPrimitiveObject {
    return {
      id: this.id,
      name: this.name,
      completed: this.completed,
    };
  }
}

export interface _taskPrimitiveObject {
  id: number;
  name: string;
  completed: boolean;
}
