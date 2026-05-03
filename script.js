let tasks = []; // { id, text, completed }
let currentFilter = "all"; // 'all', 'pending', 'completed'

// DOM Elements
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addTaskBtn");
const tasksContainer = document.getElementById("tasksContainer");
const totalCountSpan = document.getElementById("totalCount");
const completedCountSpan = document.getElementById("completedCount");
const pendingCountSpan = document.getElementById("pendingCount");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterBtns = document.querySelectorAll(".filter-btn");

// ---------- UTILITIES ----------
function saveToLocalStorage() {
  localStorage.setItem("luminaTasks", JSON.stringify(tasks));
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem("luminaTasks");
  if (stored) {
    tasks = JSON.parse(stored);
  } else {
    tasks = [];
  }
}

// Update counters (total, completed, pending)
function updateCounters() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  totalCountSpan.textContent = total;
  completedCountSpan.textContent = completed;
  pendingCountSpan.textContent = pending;
}

// Get filtered tasks based on currentFilter
function getFilteredTasks() {
  if (currentFilter === "all") return tasks;
  if (currentFilter === "completed")
    return tasks.filter((t) => t.completed === true);
  if (currentFilter === "pending")
    return tasks.filter((t) => t.completed === false);
  return tasks;
}

// Render tasks dynamically with animation (fade-in via CSS)
function renderTasks() {
  const filtered = getFilteredTasks();
  tasksContainer.innerHTML = "";

  if (filtered.length === 0) {
    let message =
      tasks.length === 0
        ? "No tasks yet. Create your first task above."
        : `No ${currentFilter} tasks found.`;
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "empty-state-message";
    emptyDiv.innerHTML = `
  <span class="empty-icon">
    <i class="fa-solid fa-clipboard-list"></i>
  </span>
  <p>${message}</p>
`;

    tasksContainer.appendChild(emptyDiv);
    updateCounters();
    return;
  }

  filtered.forEach((task) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task-item ${task.completed ? "task-complete" : ""}`;
    taskDiv.setAttribute("data-id", task.id);

    const leftDiv = document.createElement("div");
    leftDiv.className = "task-left";

    const checkSpan = document.createElement("span");
    checkSpan.className = "custom-checkbox";
    checkSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleComplete(task.id);
    });

    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.innerText = task.text;

    textSpan.addEventListener("dblclick", () =>
      startInlineEdit(task.id, textSpan),
    );

    leftDiv.appendChild(checkSpan);
    leftDiv.appendChild(textSpan);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';

    editBtn.className = "edit-task-btn";
    editBtn.title = "Edit task";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      startInlineEdit(task.id, textSpan);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.className = "delete-task-btn";
    deleteBtn.title = "Delete task";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    taskDiv.appendChild(leftDiv);
    taskDiv.appendChild(actionsDiv);

    tasksContainer.appendChild(taskDiv);
  });

  updateCounters();
}

// Inline edit functionality (replaces text with input)
function startInlineEdit(taskId, textSpanElement) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const originalText = task.text;
  const input = document.createElement("input");
  input.type = "text";
  input.value = originalText;
  input.className = "edit-input";

  const parent = textSpanElement.parentNode;
  parent.replaceChild(input, textSpanElement);
  input.focus();

  const saveEdit = () => {
    let newText = input.value.trim();
    if (newText === "") {
      newText = originalText; 
    }
    if (newText !== task.text) {
      task.text = newText;
      saveToLocalStorage();
      renderTasks(); 
    } else {
      renderTasks();
    }
  };

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
    }
  });
}

// ---------- CORE CRUD & TOGGLE ----------
function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return;

  const newTask = {
    id: Date.now() + Math.random() * 1000,
    text: text,
    completed: false,
  };
  tasks.push(newTask);
  taskInput.value = "";
  saveToLocalStorage();
  renderTasks(); 
  tasksContainer.scrollTop = tasksContainer.scrollHeight;
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveToLocalStorage();
  renderTasks();
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveToLocalStorage();
    renderTasks();
  }
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveToLocalStorage();
  renderTasks();
}

function setFilter(filterType) {
  currentFilter = filterType;
  filterBtns.forEach((btn) => {
    const btnFilter = btn.getAttribute("data-filter");
    if (btnFilter === filterType) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  renderTasks();
}

// ---------- EVENT LISTENERS & INIT ----------
function setupEventListeners() {
  addBtn.addEventListener("click", addTask);

  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  });

  clearCompletedBtn.addEventListener("click", clearCompletedTasks);

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filterValue = btn.getAttribute("data-filter");
      if (filterValue === "all") setFilter("all");
      else if (filterValue === "pending") setFilter("pending");
      else if (filterValue === "completed") setFilter("completed");
    });
  });
}

// Initialization
function init() {
  loadFromLocalStorage();
  setupEventListeners();
  setFilter("all"); 
}

init();
