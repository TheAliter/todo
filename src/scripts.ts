import TodoList, { TodoListInterface } from "./classes/todo_list.js";
import Task from "./classes/task.js";

const TODO_LISTS_LOCAL_STORAGE: string = "todo.lists";
const ACTIVE_TODO_LIST_ID_LOCAL_STORAGE: string = "active.todo.list.id";

const todoListsContainer = document.querySelector(".todo-lists") as HTMLUListElement;
const addTodoListForm = document.querySelector(".add-todo-list") as HTMLFormElement;
const todoListInputElement = document.querySelector(".todo-list-input") as HTMLInputElement;
const addTodoListButton = document.querySelector(".add-todo-list .btn-add") as HTMLButtonElement;
const tasksSectionElement = document.querySelector(".tasks-section") as HTMLElement;
const tasksCountElement = document.querySelector(".tasks-count") as HTMLSpanElement;
const tasksContainer = document.querySelector(".tasks") as HTMLUListElement;
const addTaskForm = document.querySelector(".add-task") as HTMLFormElement;
const taskInputElement = document.querySelector(".task-input") as HTMLInputElement;
const addTaskButton = document.querySelector(".add-task .btn-add") as HTMLButtonElement;
const taskItemTemplateElement = document.querySelector(
  ".task-item-template"
) as HTMLTemplateElement;
const clearCompletedTasksButtonElement = document.querySelector(
  ".tasks-actions .btn-clear"
) as HTMLButtonElement;
const deleteListButtonElement = document.querySelector(
  ".tasks-actions .btn-delete"
) as HTMLButtonElement;

// ------------------------
// --- INITIAL SETUP --- //
// ------------------------

let todoLists: Array<TodoList> = getTodoListsFromLocalStorage();
let activeTodoListId: number = getActiveTodoListIdFromLocalStorage();

renderTodoLists();
if (activeTodoListId !== 0) {
  tasksSectionElement.style.display = "block";
  renderTasks();
}

// ------------------------
// --- INTERACTION --- //
// ------------------------

todoListsContainer.addEventListener("click", (e: Event) => {
  if ((e.target as HTMLElement).classList.contains("todo-list-item")) {
    const todoListId = (e.target as HTMLElement).dataset.id || "";
    if (parseInt(todoListId) !== activeTodoListId) {
      taskInputElement.value = "";
      updateActiveTodoListItem(parseInt(todoListId));
      renderTasks();
    }
  }
});

addTodoListForm.addEventListener("submit", (e: Event) => {
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

tasksContainer.addEventListener("click", (e: Event) => {
  const targetElement = e.target as HTMLElement;
  if (targetElement.classList.contains("task-custom-checkbox")) {
    const checkboxElement = targetElement.previousElementSibling as HTMLInputElement;
    checkboxElement.checked = !checkboxElement.checked;
  }

  if (
    targetElement.classList.contains("task-custom-checkbox") ||
    targetElement.classList.contains("task-name")
  ) {
    const taskItemElement = targetElement.parentElement!;
    toogleTaskCompletedState(parseInt(taskItemElement.dataset.id || "0"));
    updateTasksCount();
    updateTodoListsInLocalStorage();
  }
});

addTaskForm.addEventListener("submit", (e: Event) => {
  e.preventDefault();

  addTask(taskInputElement.value);
  taskInputElement.value = "";
  renderTasks();
  addTaskButton.blur();
});

clearCompletedTasksButtonElement.addEventListener("click", (e: Event) => {
  deleteCompletedTasks();
  updateTasksIds();
  updateTodoListsInLocalStorage();
  renderTasks();

  (e.target as HTMLElement).blur();
});

deleteListButtonElement.addEventListener("click", (e) => {
  deleteTodoList(activeTodoListId);
  taskInputElement.value = "";

  let nextActiveTodoListId;
  if (todoLists.length === 0) {
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

  (e.target as HTMLElement).blur();
});

// ------------------------
// --- TODO LISTS HELPERS --- //
// ------------------------

function addTodoList(listName: string): void {
  const newTodoList = new TodoList({
    id: todoLists.length + 1,
    name: listName,
    tasks: [],
  });
  todoLists.push(newTodoList);
  updateTodoListsInLocalStorage();
}

function deleteTodoList(listId: number): void {
  todoLists = todoLists.filter((todoList) => todoList.id !== listId);
  updateTodoListsIds();
  updateTodoListsInLocalStorage();
}

function updateActiveTodoListItem(listId: number): void {
  if (listId === 0) return;

  todoListsContainer.querySelector(".active")?.classList?.remove("active");
  todoListsContainer.querySelector(`[data-id="${listId}"]`)?.classList.add("active");
  updateActiveTodoListId(listId);
}

function updateActiveTodoListId(id: number): void {
  activeTodoListId = id;
  updateActiveTodoListIdInLocalStorage(id);
}

function updateTodoListsIds(): void {
  let index = 1;
  todoLists.forEach((todoList) => {
    todoList.id = index;
    index++;
  });
}

function renderTodoLists(): void {
  todoListsContainer.innerHTML = "";
  todoLists.forEach((todoList) => {
    const todoListItemElement = document.createElement("li");
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

function addTask(taskName: string): void {
  const newTask = new Task({
    id: todoLists[activeTodoListId - 1].tasks.length + 1,
    name: taskName,
    completed: false,
  });
  todoLists[activeTodoListId - 1].tasks.push(newTask);
  updateTodoListsInLocalStorage();
}

function deleteCompletedTasks(): void {
  todoLists[activeTodoListId - 1].tasks = todoLists[activeTodoListId - 1].tasks.filter(
    (task) => !task.completed
  );
}

function toogleTaskCompletedState(taskId: number): void {
  if (taskId === 0) return;

  todoLists[activeTodoListId - 1].tasks[taskId - 1].completed =
    !todoLists[activeTodoListId - 1].tasks[taskId - 1].completed;
}

function updateTasksCount(): void {
  if (todoLists[activeTodoListId - 1].tasks.length === 0) {
    tasksCountElement.textContent = "";
    return;
  }

  const activeTasksCount: number = todoLists[activeTodoListId - 1].tasks.filter(
    (task) => !task.completed
  ).length;
  const tasksName = activeTasksCount === 1 ? "task" : "tasks";
  tasksCountElement.textContent = `${activeTasksCount} ${tasksName} remaining`;
}

function updateTasksIds(): void {
  let index = 1;
  todoLists[activeTodoListId - 1].tasks.forEach((task) => {
    task.id = index;
    index++;
  });
}

function renderTasks() {
  tasksContainer.innerHTML = "";
  todoLists[activeTodoListId - 1].tasks.forEach((task) => {
    const taskItemBlock = taskItemTemplateElement.content.cloneNode(true) as HTMLElement;
    (taskItemBlock.querySelector(".task-item")! as HTMLElement).dataset.id = task.id.toString();
    taskItemBlock.querySelector(".task-checkbox")!.id = `task-${task.id}`;
    if (task.completed) {
      (taskItemBlock.querySelector(".task-checkbox")! as HTMLInputElement).checked = true;
    }
    taskItemBlock.querySelector(".task-checkbox")!.setAttribute("name", `task-${task.id}`);
    taskItemBlock.querySelector(".task-name")!.setAttribute("for", `task-${task.id}`);
    taskItemBlock.querySelector(".task-name")!.textContent = task.name;
    tasksContainer.append(taskItemBlock);
  });
  updateTasksCount();
}

// ------------------------
// --- LOCAL STORAGE --- //
// ------------------------

function getTodoListsFromLocalStorage(): TodoList[] {
  const todoListsString = localStorage.getItem(TODO_LISTS_LOCAL_STORAGE);
  if (todoListsString !== null) {
    return JSON.parse(todoListsString).map(
      (todoList: TodoListInterface) =>
        new TodoList({
          id: todoList.id,
          name: todoList.name,
          tasks: todoList.tasks.map((task) => new Task(task)),
        })
    );
  }
  return [];
}

function updateTodoListsInLocalStorage(): void {
  localStorage.setItem(
    TODO_LISTS_LOCAL_STORAGE,
    JSON.stringify(todoLists.map((todoList) => todoList.toTodoListPrimitiveObject()))
  );
}

function getActiveTodoListIdFromLocalStorage(): number {
  return parseInt(localStorage.getItem(ACTIVE_TODO_LIST_ID_LOCAL_STORAGE) || "0");
}

function updateActiveTodoListIdInLocalStorage(id: number): void {
  localStorage.setItem(ACTIVE_TODO_LIST_ID_LOCAL_STORAGE, id.toString());
}
