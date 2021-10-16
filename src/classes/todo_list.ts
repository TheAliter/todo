import Task, { _taskPrimitiveObject } from "./task.js";

export default class TodoList {
  public id: number;
  readonly name: string;
  public tasks: Array<Task>;

  constructor(data: TodoListInterface) {
    this.id = data.id;
    this.name = data.name;
    this.tasks = data.tasks;
  }

  toTodoListPrimitiveObject(): TodoListPrimitiveObject {
    return {
      id: this.id,
      name: this.name,
      tasks: this.tasks.map((task) => task.toPrimitiveObject()),
    };
  }
}

export interface TodoListInterface {
  id: number;
  name: string;
  tasks: Task[];
}

interface TodoListPrimitiveObject {
  id: number;
  name: string;
  tasks: Array<_taskPrimitiveObject>;
}
