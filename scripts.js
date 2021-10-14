import TodoList from "./js/todo_list.js";
import Task from "./js/task.js";

const TODO_LISTS_LOCAL_STORAGE = "todo.lists";
const ACTIVE_TODO_LIST_ID_LOCAL_STORAGE = "active.todo.list.id";

const todoListsContainer = document.querySelector(".todo-lists");
const addTodoListForm = document.querySelector(".add-todo-list");
const todoListInputElement = document.querySelector(".todo-list-input");
const addTodoListButton = document.querySelector(".add-todo-list .btn-add");
const tasksSectionElement = document.querySelector(".tasks-section");
const tasksContainer = document.querySelector(".tasks");
const tasksCountElement = document.querySelector(".tasks-count");
const addTaskForm = document.querySelector(".add-task");
const taskInputElement = document.querySelector(".task-input");
const addTaskButton = document.querySelector(".add-task .btn-add");
const taskItemTemplateElement = document.querySelector(".task-item-template");
const clearCompletedTasksButtonElement = document.querySelector(
  ".tasks-actions .btn-clear"
);
const deleteListButtonElement = document.querySelector(
  ".tasks-actions .btn-delete"
);

// ------------------------
// --- INITIAL SETUP --- //
// ------------------------

let todoLists = getTodoListsFromLocalStorage();
let activeTodoListId = getActiveTodoListIdFromLocalStorage();

renderTodoLists();
if (activeTodoListId !== 0) {
  tasksSectionElement.style.display = "block";
  renderTasks();
}

// ------------------------
// --- INTERACTION --- //
// ------------------------

todoListsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("todo-list-item")) {
    updateActiveTodoListItem(parseInt(e.target.dataset.id));
  }
  renderTasks();
});

addTodoListForm.addEventListener("submit", (e) => {
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

tasksContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-custom-checkbox")) {
    e.target.previousElementSibling.checked =
      !e.target.previousElementSibling.checked;
  }

  if (
    e.target.classList.contains("task-custom-checkbox") ||
    e.target.classList.contains("task-name")
  ) {
    toogleTaskCompletedState(e.target.parentElement.dataset.id);
    updateTasksCount();
    updateTodoListsInLocalStorage();
  }
});

addTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  addTask(taskInputElement.value);
  taskInputElement.value = "";
  renderTasks();
  addTaskButton.blur();
});

clearCompletedTasksButtonElement.addEventListener("click", (e) => {
  deleteCompletedTasks();
  updateTasksIds();
  updateTodoListsInLocalStorage();
  renderTasks();

  e.target.blur();
});

deleteListButtonElement.addEventListener("click", (e) => {
  deleteTodoList(activeTodoListId);

  let nextActiveTodoListId;
  if (todoLists.lenght === 0) {
    nextActiveTodoListId = 0;
  } else if (todoLists[activeTodoListId]) {
    nextActiveTodoListId = activeTodoListId;
  } else {
    nextActiveTodoListId = todoLists.length;
  }

  updateActiveTodoListId(nextActiveTodoListId);
  renderTodoLists();

  if (todoLists.length === 0) {
    tasksSectionElement.style.display = "none";
  } else {
    renderTasks();
  }

  e.target.blur();
});

// ------------------------
// --- TODO LISTS HELPERS --- //
// ------------------------

function addTodoList(listName) {
  const newTodoList = new TodoList({
    id: todoLists.length + 1,
    name: listName,
    active: true,
    tasks: [],
  });
  todoLists.push(newTodoList);
  updateTodoListsInLocalStorage();
}

function deleteTodoList(listId) {
  todoLists = todoLists.filter((todoList) => todoList.id !== listId);
  updateTodoListsIds();
  updateTodoListsInLocalStorage();
}

function updateActiveTodoListItem(listId) {
  todoListsContainer.querySelector(".active")?.classList?.remove("active");
  todoListsContainer
    .querySelector(`[data-id="${listId}"]`)
    .classList.add("active");
  updateActiveTodoListId(listId);
}

function updateActiveTodoListId(id) {
  activeTodoListId = id;
  updateActiveTodoListIdInLocalStorage(id);
}

function updateTodoListsIds() {
  let index = 1;
  todoLists.forEach((todoList) => {
    todoList.id = index;
    index++;
  });
}

function renderTodoLists() {
  todoListsContainer.innerHTML = "";
  todoLists.forEach((todoList) => {
    const todoListItemElement = document.createElement("li");
    todoListItemElement.classList.add("todo-list-item");
    if (todoList.id == activeTodoListId)
      todoListItemElement.classList.add("active");
    todoListItemElement.tabIndex = 0;
    todoListItemElement.textContent = todoList.name;
    todoListItemElement.dataset.id = todoList.id;
    todoListsContainer.append(todoListItemElement);
  });
}

// ------------------------
// --- TASKS HELPERS --- //
// ------------------------

function addTask(taskName) {
  const newTask = new Task({
    id: todoLists[activeTodoListId - 1].tasks.length + 1,
    name: taskName,
    completed: false,
  });
  todoLists[activeTodoListId - 1].tasks.push(newTask);
  updateTodoListsInLocalStorage();
}

function deleteCompletedTasks() {
  todoLists[activeTodoListId - 1].tasks = todoLists[
    activeTodoListId - 1
  ].tasks.filter((task) => !task.completed);
}

function toogleTaskCompletedState(taskId) {
  todoLists[activeTodoListId - 1].tasks[taskId - 1].completed =
    !todoLists[activeTodoListId - 1].tasks[taskId - 1].completed;
}

function updateTasksCount() {
  if (todoLists[activeTodoListId - 1].tasks.length === 0) {
    tasksCountElement.textContent = "";
    return;
  }

  const activeTasksCount = todoLists[activeTodoListId - 1].tasks.filter(
    (task) => !task.completed
  ).length;
  const tasksName = activeTasksCount === 1 ? "task" : "tasks";
  tasksCountElement.textContent = `${activeTasksCount} ${tasksName} remaining`;
}

function updateTasksIds() {
  let index = 1;
  todoLists[activeTodoListId - 1].tasks.forEach((task) => {
    task.id = index;
    index++;
  });
}

function renderTasks() {
  tasksContainer.innerHTML = "";
  todoLists[activeTodoListId - 1].tasks.forEach((task) => {
    const taskItemBlock = taskItemTemplateElement.content.cloneNode(true);
    taskItemBlock.querySelector(".task-item").dataset.id = task.id;
    taskItemBlock.querySelector(".task-checkbox").id = `task-${task.id}`;
    if (task.completed) {
      taskItemBlock.querySelector(".task-checkbox").checked = true;
    }
    taskItemBlock
      .querySelector(".task-checkbox")
      .setAttribute("name", `task-${task.id}`);
    taskItemBlock
      .querySelector(".task-name")
      .setAttribute("for", `task-${task.id}`);
    taskItemBlock.querySelector(".task-name").textContent = task.name;
    tasksContainer.append(taskItemBlock);
  });
  updateTasksCount();
}

// ------------------------
// --- LOCAL STORAGE --- //
// ------------------------

function getTodoListsFromLocalStorage() {
  const todoListsString = localStorage.getItem(TODO_LISTS_LOCAL_STORAGE);
  if (todoListsString !== null) {
    return JSON.parse(todoListsString).map(
      (todoList) =>
        new TodoList({
          id: todoList.id,
          name: todoList.name,
          tasks: todoList.tasks.map((task) => new Task(task)),
        })
    );
  }
  return [];
}

function updateTodoListsInLocalStorage() {
  localStorage.setItem(
    TODO_LISTS_LOCAL_STORAGE,
    JSON.stringify(todoLists.map((todoList) => todoList.toMap()))
  );
}

function getActiveTodoListIdFromLocalStorage() {
  return parseInt(localStorage.getItem(ACTIVE_TODO_LIST_ID_LOCAL_STORAGE) || 0);
}

function updateActiveTodoListIdInLocalStorage(id) {
  localStorage.setItem(ACTIVE_TODO_LIST_ID_LOCAL_STORAGE, id.toString());
}
