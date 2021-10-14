export default class TodoList {
  constructor({ id, name, tasks }) {
    this.id = id;
    this.name = name;
    this.tasks = tasks;
  }

  toMap() {
    return {
      id: this.id,
      name: this.name,
      tasks: this.tasks.map((task) => task.toMap()),
    };
  }
}
