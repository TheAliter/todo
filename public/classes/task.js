var Task = /** @class */ (function () {
    function Task(data) {
        this.id = data.id;
        this.name = data.name;
        this.completed = data.completed;
    }
    Task.prototype.toPrimitiveObject = function () {
        return {
            id: this.id,
            name: this.name,
            completed: this.completed,
        };
    };
    return Task;
}());
export default Task;
