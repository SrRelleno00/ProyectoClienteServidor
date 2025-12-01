// Obtener referencias a los elementos del DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
// Nuevas referencias para los campos de datos
const subjectInput = document.getElementById('subject-input'); 
const dueDateInput = document.getElementById('due-date-input'); 
const descriptionInput = document.getElementById('description-input'); 

const tasksList = document.getElementById('tasks-list');
const errorMessage = document.getElementById('error-message');
const filterControls = document.getElementById('filter-controls');
const clearAllBtn = document.getElementById('clear-all-btn'); 

// 1. Event Listeners y Carga Inicial
document.addEventListener('DOMContentLoaded', loadTasks);
taskForm.addEventListener('submit', addTask);
filterControls.addEventListener('click', handleFilterClick);
clearAllBtn.addEventListener('click', clearAllTasks); 

/**
 * Carga las tareas aplicando el filtro por defecto ('all').
 */
function loadTasks() {
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

    const title = taskInput.value.trim();
    const subject = subjectInput.value.trim();
    const dueDate = dueDateInput.value;
    const description = descriptionInput.value.trim();

    // 1. VALIDACIÓN
    if (title === '' || subject === '' || dueDate === '') {
        errorMessage.textContent = 'El título, materia y fecha límite no pueden estar vacíos.';
        errorMessage.style.display = 'block';
        return; 
    }

    errorMessage.style.display = 'none';

    // Crear el objeto de tarea con los nuevos campos
    const newTask = {
        id: Date.now(),
        title: title,
        subject: subject,
        dueDate: dueDate,
        description: description,
        completed: false
    };

    // 1. Agregar al localStorage
    saveTaskToStorage(newTask);

    // 2. Refrescar la lista aplicando el filtro actual
    const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    filterTasks(currentFilter);

    // 3. Limpiar los inputs
    taskInput.value = '';
    subjectInput.value = '';
    dueDateInput.value = '';
    descriptionInput.value = '';
}

/**
 * Formatea la fecha de YYYY-MM-DD a DD/MM/YYYY
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Crea el elemento HTML para una tarea.
 * Se asegura de que el formulario de edición esté oculto por defecto
 * para evitar duplicación visual.
 */
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.setAttribute('data-id', task.id);
    
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    // --- 1. Contenedor de Detalles (Título, Materia, Fecha, Descripción) ---
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'task-details-container';

    // Título
    detailsContainer.innerHTML += `<span class="task-title">${task.title}</span>`;
    
    // Materia y Fecha
    detailsContainer.innerHTML += `<div class="task-meta">
        Materia: <strong>${task.subject}</strong> | Límite: <strong>${formatDate(task.dueDate)}</strong>
    </div>`;

    // Descripción (solo si existe y está trimmeada)
    if (task.description.trim()) {
         detailsContainer.innerHTML += `<p class="task-description">${task.description}</p>`;
    }

    // --- 2. Formulario de Edición (Oculto por defecto) ---
    const editForm = document.createElement('div');
    editForm.className = 'edit-form'; // Oculto por defecto por CSS
    editForm.innerHTML = `
        <input type="text" id="edit-title-input-${task.id}" value="${task.title}" required>
        <input type="text" id="edit-subject-input-${task.id}" value="${task.subject}" required>
        <input type="date" id="edit-date-input-${task.id}" value="${task.dueDate}" required>
        <textarea id="edit-description-input-${task.id}" placeholder="Descripción...">${task.description}</textarea>
    `;

    // --- 3. Contenedor de Acciones (Botones) ---
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'actions-container';
    
    const topActions = document.createElement('div');
    topActions.className = 'top-actions';

    // Botón Editar/Guardar (U de CRUD)
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => editTask(taskItem, task.id));

    // Botón Eliminar (D de CRUD)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => deleteTask(taskItem, task.id));
    
    topActions.appendChild(editBtn);
    topActions.appendChild(deleteBtn);
    
    // Botón de Completar (Toggle)
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    updateCompleteButtonState(completeBtn, task.completed); 
    completeBtn.addEventListener('click', () => toggleComplete(taskItem, task.id));

    actionsContainer.appendChild(topActions);
    actionsContainer.appendChild(completeBtn);

    // --- 4. Ensamblar todo ---
    taskItem.appendChild(detailsContainer);
    taskItem.appendChild(editForm);
    taskItem.appendChild(actionsContainer);

    return taskItem;
}

/**
 * Función auxiliar para actualizar el texto y estilo del botón 'Terminada'
 */
function updateCompleteButtonState(button, isCompleted) {
    if (isCompleted) {
        button.textContent = 'Terminada ✅';
        button.classList.remove('pending');
        button.classList.add('completed');
    } else {
        button.textContent = 'Pendiente ⚪';
        button.classList.remove('completed');
        button.classList.add('pending');
    }
}

/**
 * Alterna el estado 'completado' de una tarea.
 */
function toggleComplete(taskItem, id) {
    taskItem.classList.toggle('completed');
    const isCompleted = taskItem.classList.contains('completed');
    
    const completeBtn = taskItem.querySelector('.complete-btn');
    updateCompleteButtonState(completeBtn, isCompleted); 

    // Actualizar en localStorage
    let tasks = getTasksFromStorage();
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = isCompleted;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Re-aplicar el filtro actual
    const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    filterTasks(currentFilter);
}

/**
 * Maneja la edición y guardado de una tarea. (U de CRUD)
 */
function editTask(taskItem, taskId) {
    const isEditing = taskItem.classList.contains('editing');
    const editBtn = taskItem.querySelector('.edit-btn');
    const editForm = taskItem.querySelector('.edit-form');
    
    if (!isEditing) {
        // --- Modo Editar: Mostrar inputs ---
        taskItem.classList.add('editing');
        editForm.style.display = 'grid'; 
        editBtn.textContent = 'Guardar';
        
        // Enfocar el primer input
        editForm.querySelector(`#edit-title-input-${taskId}`).focus();

    } else {
        // --- Modo Guardar: Capturar y validar ---
        const newTitle = editForm.querySelector(`#edit-title-input-${taskId}`).value.trim();
        const newSubject = editForm.querySelector(`#edit-subject-input-${taskId}`).value.trim();
        const newDate = editForm.querySelector(`#edit-date-input-${taskId}`).value;
        const newDescription = editForm.querySelector(`#edit-description-input-${taskId}`).value.trim();

        if (newTitle === '' || newSubject === '' || newDate === '') {
            alert('El título, materia y fecha límite no pueden estar vacíos.');
            return;
        }

        // 1. Actualizar en localStorage
        updateTaskInStorage(taskId, {
            title: newTitle,
            subject: newSubject,
            dueDate: newDate,
            description: newDescription
        });

        // 2. Salir del modo edición y refrescar la lista para ver los cambios
        taskItem.classList.remove('editing');
        const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        filterTasks(currentFilter); // Recarga para actualizar DOM
    }
}

/**
 * Actualiza los campos de una tarea en el localStorage.
 */
function updateTaskInStorage(id, newValues) {
    let tasks = getTasksFromStorage();
    tasks = tasks.map(task => {
        if (task.id === id) {
            // Preservar el ID y el estado de completado
            return { ...task, ...newValues };
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
        taskItem.remove();
        removeTaskFromStorage(id);
    }
}

/**
 * Elimina una tarea del localStorage por su ID.
 */
function removeTaskFromStorage(id) {
    let tasks = getTasksFromStorage();
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// -----------------------------------------------------
// LÓGICA DE BORRADO MASIVO
// -----------------------------------------------------

/**
 * Borra todas las tareas del DOM y del localStorage.
 */
function clearAllTasks() {
    if (confirm('¿Estás seguro de que quieres BORRAR TODAS las tareas? Esta acción no se puede deshacer.')) {
        
        // 1. Borrar del localStorage
        localStorage.removeItem('tasks');

        // 2. Borrar del DOM y mostrar mensaje
        tasksList.innerHTML = '<h2>Lista de Tareas</h2>'; 
        tasksList.innerHTML += `<p style="text-align: center; color: #999; padding: 20px 0;">Todas las tareas han sido eliminadas.</p>`;
        
        // 3. Resetear el filtro a 'Todas'
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="all"]').classList.add('active');
    }
}


// -----------------------------------------------------
// LÓGICA DE FILTRADO
// -----------------------------------------------------

/**
 * Maneja el clic en los botones de filtro
 */
function handleFilterClick(e) {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        e.target.classList.add('active');
        
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

    // 2. Obtener y filtrar tareas
    const allTasks = getTasksFromStorage();
    let filteredTasks = [];

    if (filterType === 'pending') {
        filteredTasks = allTasks.filter(task => task.completed === false);
    } else if (filterType === 'completed') {
        filteredTasks = allTasks.filter(task => task.completed === true);
    } else { // 'all'
        filteredTasks = allTasks;
    }

    // 3. Inyectar tareas o mensaje de vacío
    if (filteredTasks.length === 0) {
        const message = filterType === 'all' ? 'No hay tareas' : filterType === 'pending' ? 'No hay tareas pendientes' : 'No hay tareas completadas';
        tasksList.innerHTML += `<p style="text-align: center; color: #999; padding: 20px 0;">${message} en este momento.</p>`;
    } else {
        filteredTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            tasksList.appendChild(taskItem);
        });
    }
}