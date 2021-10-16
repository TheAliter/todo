var TodoList = /** @class */ (function () {
    function TodoList(data) {
        this.id = data.id;
        this.name = data.name;
        this.tasks = data.tasks;
    }
    TodoList.prototype.toTodoListPrimitiveObject = function () {
        return {
            id: this.id,
            name: this.name,
            tasks: this.tasks.map(function (task) { return task.toPrimitiveObject(); }),
        };
    };
    return TodoList;
}());
export default TodoList;
