// javascript
const KEY = "list";

let activeCategory = null;

const $ = id => document.getElementById(id);


/* ---------------- Storage ---------------- */

function getData() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        return [];
    }
}

function saveData(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}


/* ---------------- Initialization ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    migrateData();
    render();

    $("addCategoryBtn").onclick = openCategory;
    $("addCategoryBtn2").onclick = openCategory;
    $("emptyAddBtn").onclick = openCategory;

    $("categoryForm").onsubmit = createCategory;
    $("todoForm").onsubmit = addTodo;

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeAll();
    });
});


/* ---------------- Data migration ---------------- */

function migrateData() {
    const data = getData();
    let changed = false;

    data.forEach(category => {
        if (!Array.isArray(category.todos)) {
            const oldTodos =
                JSON.parse(localStorage.getItem(category.name)) || [];

            category.todos = oldTodos.map(text => ({
                text: String(text),
                completed: false
            }));

            changed = true;
        }
    });

    if (changed) saveData(data);
}


/* ---------------- Rendering ---------------- */

function render() {
    const data = getData();
    const table = $("categoryTable");

    table.innerHTML = "";

    let total = 0;
    let completed = 0;

    data.forEach((category, index) => {
        const todos = category.todos || [];
        const done = todos.filter(todo => todo.completed).length;
        const balance = todos.length - done;

        total += todos.length;
        completed += done;

        table.insertAdjacentHTML("beforeend", `
            <tr>
                <td>${index + 1}</td>

                <td>
                    <div class="title" title="${escapeHtml(category.name)}">
                        ${escapeHtml(category.name)}
                    </div>
                </td>

                <td>
                    <span class="badge">${todos.length}</span>
                </td>

                <td>
                    <span class="badge success">${done}</span>
                </td>

                <td>
                    <span class="badge ${balance ? "warning" : "success"}">
                        ${balance}
                    </span>
                </td>

                <td>
                    <button
                        class="btn primary small"
                        data-view="${index}"
                    >
                        <span class="material-icons">visibility</span>
                        View All
                    </button>

                    <button
                        class="btn danger small"
                        data-delete-category="${index}"
                    >
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            </tr>
        `);
    });

    $("emptyState").style.display =
        data.length ? "none" : "block";

    $("categoryCount").textContent = data.length;
    $("todoCount").textContent = total;
    $("completedCount").textContent = completed;
    $("balanceCount").textContent = total - completed;
}


/* ---------------- Category ---------------- */

function openCategory() {
    show("categoryModal");

    $("categoryInput").value = "";
    $("categoryError").textContent = "";

    setTimeout(() => $("categoryInput").focus(), 100);
}


function createCategory(event) {
    event.preventDefault();

    const input = $("categoryInput");
    const name = input.value.trim();

    if (name.length < 2) {
        $("categoryError").textContent =
            "Category name must contain at least 2 characters.";
        return;
    }

    const data = getData();

    if (
        data.some(
            category =>
                category.name.toLowerCase() === name.toLowerCase()
        )
    ) {
        $("categoryError").textContent =
            "This category already exists.";
        return;
    }

    data.push({
        name,
        todos: []
    });

    saveData(data);
    render();
    close("categoryModal");

    openTodo(data.length - 1);
}


/* ---------------- Todos ---------------- */

function openTodo(index) {
    const data = getData();

    if (!data[index]) return;

    activeCategory = index;

    $("modalTitle").textContent = data[index].name;

    show("todoModal");
    renderTodos();

    setTimeout(() => $("todoInput").focus(), 100);
}


function addTodo(event) {
    event.preventDefault();

    if (activeCategory === null) return;

    const input = $("todoInput");
    const text = input.value.trim();

    if (!text) {
        $("todoError").textContent = "Please enter a TODO.";
        return;
    }

    const data = getData();

    data[activeCategory].todos.push({
        text,
        completed: false
    });

    saveData(data);

    input.value = "";
    $("todoError").textContent = "";

    render();
    renderTodos();

    input.focus();
}


function renderTodos() {
    const data = getData();
    const todos = data[activeCategory]?.todos || [];
    const list = $("todoList");

    list.innerHTML = "";

    if (!todos.length) {
        list.innerHTML =
            `<div class="no-todos">No TODOs yet.</div>`;
    }

    todos.forEach((todo, index) => {
        list.insertAdjacentHTML("beforeend", `
            <div class="todo-item">

                <input
                    type="checkbox"
                    ${todo.completed ? "checked" : ""}
                    data-toggle="${index}"
                >

                <span class="todo-text ${todo.completed ? "done" : ""}">
                    ${escapeHtml(todo.text)}
                </span>

                <button
                    class="delete"
                    data-delete-todo="${index}"
                >
                    <span class="material-icons">delete</span>
                </button>

            </div>
        `);
    });

    const done =
        todos.filter(todo => todo.completed).length;

    $("modalTotal").textContent = todos.length;
    $("modalCompleted").textContent = done;
    $("modalBalance").textContent = todos.length - done;
}


/* ---------------- Events ---------------- */

function handleClick(event) {
    const target = event.target.closest("[data-view]");

    if (target) {
        openTodo(Number(target.dataset.view));
        return;
    }

    const deleteCategory =
        event.target.closest("[data-delete-category]");

    if (deleteCategory) {
        removeCategory(
            Number(deleteCategory.dataset.deleteCategory)
        );
        return;
    }

    const toggle =
        event.target.closest("[data-toggle]");

    if (toggle) {
        toggleTodo(Number(toggle.dataset.toggle));
        return;
    }

    const deleteTodo =
        event.target.closest("[data-delete-todo]");

    if (deleteTodo) {
        removeTodo(
            Number(deleteTodo.dataset.deleteTodo)
        );
        return;
    }

    const closeButton =
        event.target.closest("[data-close]");

    if (closeButton) {
        close(closeButton.dataset.close);
    }
}


/* ---------------- Todo Actions ---------------- */

function toggleTodo(index) {
    const data = getData();

    data[activeCategory].todos[index].completed =
        !data[activeCategory].todos[index].completed;

    saveData(data);

    render();
    renderTodos();
}


function removeTodo(index) {
    const data = getData();
    const todo = data[activeCategory].todos[index];

    if (!confirm(`Delete "${todo.text}"?`)) return;

    data[activeCategory].todos.splice(index, 1);

    saveData(data);

    render();
    renderTodos();
}


function removeCategory(index) {
    const data = getData();

    if (
        !confirm(
            `Delete "${data[index].name}" and all its TODOs?`
        )
    ) return;

    data.splice(index, 1);

    saveData(data);

    render();
}


/* ---------------- Modal ---------------- */

function show(id) {
    $(id).classList.add("show");
}


function close(id) {
    $(id).classList.remove("show");
}


function closeAll() {
    document
        .querySelectorAll(".modal")
        .forEach(modal => modal.classList.remove("show"));

    activeCategory = null;
}


/* ---------------- Helpers ---------------- */

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
