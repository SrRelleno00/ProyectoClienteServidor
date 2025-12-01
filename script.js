// Obtener referencias a los elementos del DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksList = document.getElementById('tasks-list');
const errorMessage = document.getElementById('error-message'); // Referencia para la validación
const filterControls = document.getElementById('filter-controls'); // Referencia para los filtros

// 1. Event Listeners y Carga Inicial
document.addEventListener('DOMContentLoaded', loadTasks);
taskForm.addEventListener('submit', addTask);
filterControls.addEventListener('click', handleFilterClick);

/**
 * Carga las tareas aplicando el filtro por defecto ('all').
 */
function loadTasks() {
    // Al cargar, se aplica el filtro 'all' (o el filtro activo si lo hubiere)
    filterTasks('all'); 
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
 * Guarda una tarea en el localStorage.
 * @param {Object} task - El objeto de tarea a guardar.
 */
function saveTaskToStorage(task) {
    const tasks = getTasksFromStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Agrega una nueva tarea. (C de CRUD)
 */
function addTask(e) {
    e.preventDefault();

    const text = taskInput.value.trim();

    // 1. VALIDACIÓN MEJORADA
    if (text === '') {
        errorMessage.textContent = 'El campo de tarea no puede estar vacío.';
        errorMessage.style.display = 'block';
        return; 
    }

    // Ocultar el error si la validación es exitosa
    errorMessage.style.display = 'none';

    // Crear el objeto de tarea (ahora con el campo 'completed')
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false // Nuevo campo: por defecto, NO está completada
    };

    // 1. Agregar al localStorage
    saveTaskToStorage(newTask);

    // 2. Refrescar la lista aplicando el filtro actual
    const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    filterTasks(currentFilter);

    // 3. Limpiar el input
    taskInput.value = '';
}

/**
 * Crea el elemento HTML para una tarea.
 */
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.setAttribute('data-id', task.id);
    
    // Si la tarea ya está completada, añade la clase 'completed' para CSS
    if (task.completed) {
        taskItem.classList.add('completed');
    }

    // Contenedor del texto y botón de completar
    const contentWrapper = document.createElement('div');

    // 1. Botón de Completar/Incompletar (Toggle)
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.textContent = task.completed ? '✅' : '⚪';
    completeBtn.title = task.completed ? 'Marcar como Pendiente' : 'Marcar como Completada';
    completeBtn.addEventListener('click', () => toggleComplete(taskItem, task.id));

    // 2. Texto de la tarea
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    // 3. Campo de input para la edición
    const editInput = document.createElement('input');
    editInput.className = 'edit-input';
    editInput.type = 'text';
    editInput.value = task.text;
    editInput.style.display = 'none';

    // Ensamblar la parte izquierda (Botón, Texto y Input de Edición)
    contentWrapper.appendChild(completeBtn);
    contentWrapper.appendChild(taskText);
    contentWrapper.appendChild(editInput);

    // Contenedor de botones de Acción (Editar/Eliminar)
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
    
    actionsContainer.appendChild(editBtn);
    actionsContainer.appendChild(deleteBtn);
    
    // Ensamblar todos los elementos al taskItem principal
    taskItem.appendChild(contentWrapper);
    taskItem.appendChild(actionsContainer);

    return taskItem;
}

/**
 * Alterna el estado 'completado' de una tarea.
 */
function toggleComplete(taskItem, id) {
    // 1. Alternar la clase en el DOM
    taskItem.classList.toggle('completed');
    const isCompleted = taskItem.classList.contains('completed');
    
    // 2. Actualizar el icono del botón
    const completeBtn = taskItem.querySelector('.complete-btn');
    completeBtn.textContent = isCompleted ? '✅' : '⚪';
    completeBtn.title = isCompleted ? 'Marcar como Pendiente' : 'Marcar como Completada';

    // 3. Actualizar en localStorage
    let tasks = getTasksFromStorage();
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = isCompleted;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // 4. Re-aplicar el filtro actual para que la tarea se oculte/muestre si es necesario
    const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    filterTasks(currentFilter);
}

/**
 * Maneja la edición y guardado de una tarea. (U de CRUD)
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
 */
function removeTaskFromStorage(id) {
    let tasks = getTasksFromStorage();
    // Filtramos el array para mantener solo las tareas cuyo ID NO coincide con el ID a eliminar
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// -----------------------------------------------------
// LÓGICA DE FILTRADO
// -----------------------------------------------------

/**
 * Maneja el clic en los botones de filtro
 */
function handleFilterClick(e) {
    if (e.target.classList.contains('filter-btn')) {
        // Desactivar el botón activo actual
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activar el botón clicado
        e.target.classList.add('active');
        
        // Aplicar el filtro
        const filterType = e.target.dataset.filter;
        filterTasks(filterType);
    }
}

/**
 * Aplica el filtro seleccionado a la lista de tareas.
 */
function filterTasks(filterType) {
    // 1. Limpiar la lista actual en el DOM
    tasksList.innerHTML = '<h2>Lista de Tareas</h2>';

    // 2. Obtener todas las tareas
    const allTasks = getTasksFromStorage();
    let filteredTasks = [];

    // 3. Aplicar la lógica de filtrado
    if (filterType === 'pending') {
        filteredTasks = allTasks.filter(task => task.completed === false);
    } else if (filterType === 'completed') {
        filteredTasks = allTasks.filter(task => task.completed === true);
    } else { // 'all'
        filteredTasks = allTasks;
    }

    // 4. Inyectar las tareas filtradas en el DOM
    if (filteredTasks.length === 0) {
        tasksList.innerHTML += `<p style="text-align: center; color: #999;">No hay tareas ${filterType === 'all' ? '' : filterType === 'pending' ? 'pendientes' : 'completadas'} en este momento.</p>`;
    } else {
        filteredTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            tasksList.appendChild(taskItem);
        });
    }
}