// TASK: import helper functions from utils
// TASK: import initialData
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";
import {initialData} from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
//initializeData()   //check function as function is declared but its value is never read

//const tasksFromStorage = [...initialData,getTasks()]

// TASK: Get elements from the DOM
const elements = {
  //sideBar and theme DOM elements
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  sideBar: document.getElementById('side-bar-div'),
  //headerBoard DOM elements
  headerBoardName: document.getElementById('header-board-name'),
  dropDownBtn: document.getElementById('dropdownBtn'),
  threeDotsIcon: document.getElementById('three-dots-icon'),
  boardBtn: document.querySelectorAll('.board-btn'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  editBoardDiv: document.getElementById('editBoardDiv'),
  //container DOM elements for Doing etc.
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  tasksContainer: document.querySelector('.tasks-container'),
  //modal window DOM elements
  modalWindow: document.querySelector('.modal-window'),
  inputDIv: document.getElementsByClassName('input-div'),
  titleInput: document.getElementById('title-input'),
  //new task form DOM elements
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  //edit task Form DOM elements
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskHeader: document.getElementById('edit-task-header'),
  editTitleInput: document.getElementById('edit-task-title-input'),
  editDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  //edit task DOM button elements
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  createNewTaskBtn: document.getElementById('create-task-btn'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem('activeBoard'))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}
//fetchAndDisplayBoardsAndTasks()

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click',() => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute('data-status');
    
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement('div');
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement('div');
      taskElement.classList.add('task-div');
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  elements.boardBtn.forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  if (!elements.tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  elements.cancelEditBtn.addEventListener('click', () => {
    toggleModal(false, elements.editTaskModal)
  })

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
    putTask() //put task out there
  }); //edit disciption, task status, and save task

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    event.preventDefault();
    addTask(event)
  });

  //open modalWindow form when addNewTaskBtn is clicked
  elements.addNewTaskBtn.addEventListener('click', () => {
    elements.modalWindow.style.display = 'block';
  });

  //edit tasks when clicked and open its modal
  elements.tasksContainer.addEventListener('click', () => {
    elements.editTaskModal.style.display = 'block';
    openEditTaskModal();
  })

  //saves task changes and adds to the board...
  elements.saveTaskChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);  //saves changes
  })

  elements.deleteTaskBtn.addEventListener('click', () => {
    deleteTask();
  })
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Get new user inputs
  const titleInput = document.getElementById('title-input').value;
  const descInput = document.getElementById('desc-input').value;
  const selectStatus = document.getElementById('select-input');
  //const selectValue = selectStatus.options[selectStatus.selectedIndex].value
  //Assign user input to the task object
    const task = {
      title: titleInput,
      desc: descInput,
      status: selectStatus.value,
      board: activeBoard,
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
      //putTask()
    }
}
//addTask(event);


function toggleSidebar(show) {
  if(show){
    elements.showSideBarBtn.style.display = 'none';
    elements.sideBar.style.display = 'block';
    localStorage.setItem('showSideBar', 'true');
  } else {
    elements.showSideBarBtn.style.display = 'block';
    elements.sideBar.style.display = 'none';
    localStorage.setItem('showSideBar', 'false');
  }
}
toggleSidebar() //call function


function toggleTheme() {
  if(elements.themeSwitch.checked){
    document.body.classList.add('light-theme')
    document.body.classList.remove('dark-theme')
    localStorage.setItem('themeSwitch', 'light');
  } else {
    document.body.classList.add('dark-theme')
    document.body.classList.remove('light-theme')
    localStorage.setItem('themeSwitch', 'dark');
  }
}
//toggleTheme()   //call function


function openEditTaskModal(task) {
  // Set task details in modal inputs
  task.editTitleInput = elements.editTitleInput.value;
  task.editDescInput = elements.editDescInput.value;
  task.editSelectStatus = elements.editSelectStatus.value;
  // Got button elements from the task modal and placed in elements DOM

  // Call saveTaskChanges upon click of Save Changes button

  // Delete task using a helper function and close the task modal


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  

  // Create an object with the updated task details


  // Update task using a hlper functoin
 

  // Close the modal and refresh the UI to reflect the changes

  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
//init()