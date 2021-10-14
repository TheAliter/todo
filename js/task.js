export default class Task {
  constructor({ id, name, completed }) {
    this.id = id;
    this.name = name;
    this.completed = completed;
  }

  toMap() {
    return {
      id: this.id,
      name: this.name,
      completed: this.completed,
    };
  }
}
