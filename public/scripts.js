import TodoList from "./classes/todo_list.js";
import Task from "./classes/task.js";
var TODO_LISTS_LOCAL_STORAGE = "todo.lists";
var ACTIVE_TODO_LIST_ID_LOCAL_STORAGE = "active.todo.list.id";
var todoListsContainer = document.querySelector(".todo-lists");
var addTodoListForm = document.querySelector(".add-todo-list");
var todoListInputElement = document.querySelector(".todo-list-input");
var addTodoListButton = document.querySelector(".add-todo-list .btn-add");
var tasksSectionElement = document.querySelector(".tasks-section");
var tasksCountElement = document.querySelector(".tasks-count");
var tasksContainer = document.querySelector(".tasks");
var addTaskForm = document.querySelector(".add-task");
var taskInputElement = document.querySelector(".task-input");
var addTaskButton = document.querySelector(".add-task .btn-add");
var taskItemTemplateElement = document.querySelector(".task-item-template");
var clearCompletedTasksButtonElement = document.querySelector(".tasks-actions .btn-clear");
var deleteListButtonElement = document.querySelector(".tasks-actions .btn-delete");
// ------------------------
// --- INITIAL SETUP --- //
// ------------------------
var todoLists = getTodoListsFromLocalStorage();
var activeTodoListId = getActiveTodoListIdFromLocalStorage();
renderTodoLists();
if (activeTodoListId !== 0) {
    tasksSectionElement.style.display = "block";
    renderTasks();
}
// ------------------------
// --- INTERACTION --- //
// ------------------------
todoListsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("todo-list-item")) {
        var todoListId = e.target.dataset.id || "";
        if (parseInt(todoListId) !== activeTodoListId) {
            taskInputElement.value = "";
            updateActiveTodoListItem(parseInt(todoListId));
            renderTasks();
        }
    }
});
addTodoListForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addTodoList(todoListInputElement.value);
    todoListInputElement.value = "";
    updateActiveTodoListId(todoLists.length);
    renderTodoLists();
    if (getComputedStyle(tasksSectionElement).display === "none") {
        tasksSectionElement.style.display = "block";
    }
    renderTasks();
    addTodoListButton.blur();
});
tasksContainer.addEventListener("click", function (e) {
    var targetElement = e.target;
    if (targetElement.classList.contains("task-custom-checkbox")) {
        var checkboxElement = targetElement.previousElementSibling;
        checkboxElement.checked = !checkboxElement.checked;
    }
    if (targetElement.classList.contains("task-custom-checkbox") ||
        targetElement.classList.contains("task-name")) {
        var taskItemElement = targetElement.parentElement;
        toogleTaskCompletedState(parseInt(taskItemElement.dataset.id || "0"));
        updateTasksCount();
        updateTodoListsInLocalStorage();
    }
});
addTaskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addTask(taskInputElement.value);
    taskInputElement.value = "";
    renderTasks();
    addTaskButton.blur();
});
clearCompletedTasksButtonElement.addEventListener("click", function (e) {
    deleteCompletedTasks();
    updateTasksIds();
    updateTodoListsInLocalStorage();
    renderTasks();
    e.target.blur();
});
deleteListButtonElement.addEventListener("click", function (e) {
    deleteTodoList(activeTodoListId);
    taskInputElement.value = "";
    var nextActiveTodoListId;
    if (todoLists.length === 0) {
        nextActiveTodoListId = 0;
    }
    else if (todoLists[activeTodoListId]) {
        nextActiveTodoListId = activeTodoListId;
    }
    else {
        nextActiveTodoListId = todoLists.length;
    }
    updateActiveTodoListId(nextActiveTodoListId);
    renderTodoLists();
    if (todoLists.length === 0) {
        tasksSectionElement.style.display = "none";
    }
    else {
        renderTasks();
    }
    e.target.blur();
});
// ------------------------
// --- TODO LISTS HELPERS --- //
// ------------------------
function addTodoList(listName) {
    var newTodoList = new TodoList({
        id: todoLists.length + 1,
        name: listName,
        tasks: [],
    });
    todoLists.push(newTodoList);
    updateTodoListsInLocalStorage();
}
function deleteTodoList(listId) {
    todoLists = todoLists.filter(function (todoList) { return todoList.id !== listId; });
    updateTodoListsIds();
    updateTodoListsInLocalStorage();
}
function updateActiveTodoListItem(listId) {
    var _a, _b, _c;
    if (listId === 0)
        return;
    (_b = (_a = todoListsContainer.querySelector(".active")) === null || _a === void 0 ? void 0 : _a.classList) === null || _b === void 0 ? void 0 : _b.remove("active");
    (_c = todoListsContainer.querySelector("[data-id=\"" + listId + "\"]")) === null || _c === void 0 ? void 0 : _c.classList.add("active");
    updateActiveTodoListId(listId);
}
function updateActiveTodoListId(id) {
    activeTodoListId = id;
    updateActiveTodoListIdInLocalStorage(id);
}
function updateTodoListsIds() {
    var index = 1;
    todoLists.forEach(function (todoList) {
        todoList.id = index;
        index++;
    });
}
function renderTodoLists() {
    todoListsContainer.innerHTML = "";
    todoLists.forEach(function (todoList) {
        var todoListItemElement = document.createElement("li");
        todoListItemElement.classList.add("todo-list-item");
        if (todoList.id == activeTodoListId) {
            todoListItemElement.classList.add("active");
        }
        todoListItemElement.tabIndex = 0;
        todoListItemElement.textContent = todoList.name;
        todoListItemElement.dataset.id = todoList.id.toString();
        todoListsContainer.append(todoListItemElement);
    });
}
// ------------------------
// --- TASKS HELPERS --- //
// ------------------------
function addTask(taskName) {
    var newTask = new Task({
        id: todoLists[activeTodoListId - 1].tasks.length + 1,
        name: taskName,
        completed: false,
    });
    todoLists[activeTodoListId - 1].tasks.push(newTask);
    updateTodoListsInLocalStorage();
}
function deleteCompletedTasks() {
    todoLists[activeTodoListId - 1].tasks = todoLists[activeTodoListId - 1].tasks.filter(function (task) { return !task.completed; });
}
function toogleTaskCompletedState(taskId) {
    if (taskId === 0)
        return;
    todoLists[activeTodoListId - 1].tasks[taskId - 1].completed =
        !todoLists[activeTodoListId - 1].tasks[taskId - 1].completed;
}
function updateTasksCount() {
    if (todoLists[activeTodoListId - 1].tasks.length === 0) {
        tasksCountElement.textContent = "";
        return;
    }
    var activeTasksCount = todoLists[activeTodoListId - 1].tasks.filter(function (task) { return !task.completed; }).length;
    var tasksName = activeTasksCount === 1 ? "task" : "tasks";
    tasksCountElement.textContent = activeTasksCount + " " + tasksName + " remaining";
}
function updateTasksIds() {
    var index = 1;
    todoLists[activeTodoListId - 1].tasks.forEach(function (task) {
        task.id = index;
        index++;
    });
}
function renderTasks() {
    tasksContainer.innerHTML = "";
    todoLists[activeTodoListId - 1].tasks.forEach(function (task) {
        var taskItemBlock = taskItemTemplateElement.content.cloneNode(true);
        taskItemBlock.querySelector(".task-item").dataset.id = task.id.toString();
        taskItemBlock.querySelector(".task-checkbox").id = "task-" + task.id;
        if (task.completed) {
            taskItemBlock.querySelector(".task-checkbox").checked = true;
        }
        taskItemBlock.querySelector(".task-checkbox").setAttribute("name", "task-" + task.id);
        taskItemBlock.querySelector(".task-name").setAttribute("for", "task-" + task.id);
        taskItemBlock.querySelector(".task-name").textContent = task.name;
        tasksContainer.append(taskItemBlock);
    });
    updateTasksCount();
}
// ------------------------
// --- LOCAL STORAGE --- //
// ------------------------
function getTodoListsFromLocalStorage() {
    var todoListsString = localStorage.getItem(TODO_LISTS_LOCAL_STORAGE);
    if (todoListsString !== null) {
        return JSON.parse(todoListsString).map(function (todoList) {
            return new TodoList({
                id: todoList.id,
                name: todoList.name,
                tasks: todoList.tasks.map(function (task) { return new Task(task); }),
            });
        });
    }
    return [];
}
function updateTodoListsInLocalStorage() {
    localStorage.setItem(TODO_LISTS_LOCAL_STORAGE, JSON.stringify(todoLists.map(function (todoList) { return todoList.toTodoListPrimitiveObject(); })));
}
function getActiveTodoListIdFromLocalStorage() {
    return parseInt(localStorage.getItem(ACTIVE_TODO_LIST_ID_LOCAL_STORAGE) || "0");
}
function updateActiveTodoListIdInLocalStorage(id) {
    localStorage.setItem(ACTIVE_TODO_LIST_ID_LOCAL_STORAGE, id.toString());
}
