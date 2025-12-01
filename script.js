// Obtener referencias a los elementos del DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksList = document.getElementById('tasks-list');

// 1. Cargar tareas desde localStorage al inicio
document.addEventListener('DOMContentLoaded', loadTasks);

// 2. Manejar la creación de tareas (C)
taskForm.addEventListener('submit', addTask);

/**
 * Carga y muestra las tareas guardadas en localStorage. (R de CRUD)
 */
function loadTasks() {
    // Obtener las tareas del almacenamiento local o usar un array vacío si no hay
    const tasks = getTasksFromStorage();
    
    // Generar el HTML para cada tarea
    tasks.forEach(task => {
        const taskItem = createTaskElement(task);
        tasksList.appendChild(taskItem);
    });
}

/**
 * Obtiene las tareas del localStorage.
 * @returns {Array} La lista de tareas.
 */
function getTasksFromStorage() {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    return tasks;
}

/**
 * Agrega una nueva tarea. (C de CRUD)
 * @param {Event} e - El evento de submit del formulario.
 */
function addTask(e) {
    e.preventDefault(); // Evita que el formulario se envíe realmente

    const text = taskInput.value.trim();

    if (text === '') {
        alert('Por favor, añade una tarea');
        return;
    }

    // Crear un objeto de tarea simple
    const newTask = {
        id: Date.now(), // ID único basado en la marca de tiempo
        text: text
    };

    // 1. Agregar al DOM
    const taskItem = createTaskElement(newTask);
    tasksList.appendChild(taskItem);

    // 2. Agregar al localStorage
    saveTaskToStorage(newTask);

    // 3. Limpiar el input
    taskInput.value = '';
}

/**
 * Crea el elemento HTML para una tarea.
 * @param {Object} task - El objeto de tarea ({id, text}).
 * @returns {HTMLElement} El elemento div que representa la tarea.
 */
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.setAttribute('data-id', task.id); // Guardar el ID en el elemento

    // Contenedor del texto de la tarea
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    // Campo de input para la edición (inicialmente oculto)
    const editInput = document.createElement('input');
    editInput.className = 'edit-input';
    editInput.type = 'text';
    editInput.value = task.text;
    editInput.style.display = 'none';

    // Contenedor de botones
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'actions-container';

    // Botón Editar/Guardar (U de CRUD)
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => editTask(taskItem, editInput, editBtn));

    // Botón Eliminar (D de CRUD)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => deleteTask(taskItem, task.id));

    // Ensamblar los elementos
    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);

    taskItem.appendChild(taskText);
    taskItem.appendChild(editInput);
    taskItem.appendChild(actionsContainer);

    return taskItem;
}

/**
 * Guarda una tarea en el localStorage.
 * @param {Object} task - El objeto de tarea a guardar.
 */
function saveTaskToStorage(task) {
    const tasks = getTasksFromStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Maneja la edición y guardado de una tarea. (U de CRUD)
 * @param {HTMLElement} taskItem - El contenedor de la tarea.
 * @param {HTMLInputElement} editInput - El campo de entrada para editar.
 * @param {HTMLButtonElement} editBtn - El botón de edición.
 */
function editTask(taskItem, editInput, editBtn) {
    const isEditing = taskItem.classList.contains('editing');
    const taskText = taskItem.querySelector('.task-text');
    const taskId = parseInt(taskItem.getAttribute('data-id'));

    if (!isEditing) {
        // Modo Editar:
        taskItem.classList.add('editing');
        taskText.style.display = 'none';
        editInput.style.display = 'block';
        editBtn.textContent = 'Guardar';
        editInput.focus();
    } else {
        // Modo Guardar:
        const newText = editInput.value.trim();

        if (newText === '') {
            alert('La tarea no puede estar vacía.');
            editInput.focus();
            return;
        }

        // 1. Actualizar en el DOM
        taskText.textContent = newText;
        taskText.style.display = 'block';
        editInput.style.display = 'none';
        editBtn.textContent = 'Editar';
        taskItem.classList.remove('editing');

        // 2. Actualizar en localStorage
        updateTaskInStorage(taskId, newText);
    }
}

/**
 * Actualiza el texto de una tarea en el localStorage.
 * @param {number} id - El ID de la tarea a actualizar.
 * @param {string} newText - El nuevo texto de la tarea.
 */
function updateTaskInStorage(id, newText) {
    let tasks = getTasksFromStorage();
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.text = newText;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


/**
 * Elimina una tarea. (D de CRUD)
 * @param {HTMLElement} taskItem - El elemento HTML de la tarea a eliminar.
 * @param {number} id - El ID de la tarea.
 */
function deleteTask(taskItem, id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        // 1. Eliminar del DOM
        taskItem.remove();

        // 2. Eliminar del localStorage
        removeTaskFromStorage(id);
    }
}

/**
 * Elimina una tarea del localStorage por su ID.
 * @param {number} id - El ID de la tarea a eliminar.
 */
function removeTaskFromStorage(id) {
    let tasks = getTasksFromStorage();
    // Filtramos el array para mantener solo las tareas cuyo ID NO coincide con el ID a eliminar
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}