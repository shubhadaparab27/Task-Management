const taskContainer = document.querySelector(".task__container");
const taskModal = document.querySelector(".task__modal__body");
const taskSearch = document.querySelector("#searchTask");
let globalTaskData = [];

const generateHTML = (taskData) =>
 `  <div id=${taskData.id} class="col-md-6 col-lg-4 my-4">
        <div class="card">
            <div class="card-header gap-2 d-flex justify-content-end">
            <button class="btn btn-outline-info" name=${taskData.id} onclick="editCard.apply(this, arguments)">
                <i class="fal fa-pencil" name=${taskData.id}></i>
            </button>
            <button class="btn btn-outline-danger" name=${taskData.id} onclick="deleteCard.apply(this, arguments)">
                <i class="far fa-trash-alt" name=${taskData.id} ></i>
            </button>
            </div>
            <div class="card-body">
                <img src=${taskData.image} alt="image" class="card-img">
            <h5 class="card-title mt-4">${taskData.title}</h5>
            <p class="card-text">${taskData.description}</p>
            <span class="badge bg-primary">${taskData.type}</span>
            </div>
            <div class="card-footer">
                <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#showTask" name=${taskData.id} onclick="openTask.apply(this, arguments)">
                    Open Task
                </button> 
            </div>
        </div>
    </div>`;

    const ModalHTML = (taskData) => {
        const date = new Date(parseInt(taskData.id));
        return ` <div id=${taskData.id}>
        <img src=${taskData.image} alt="card image" class="card-img mb-3"/>
        <strong class="text-sm text-muted">Created on ${date.toDateString()}</strong>
        <h2 class="my-3">${taskData.title}</h2>
        <p class="lead">${taskData.description}</p>
        <span class="badge bg-primary">${taskData.type}</span>
        </div>`;
      };

const insertToDOM = (content) => taskContainer.insertAdjacentHTML("beforeend", content);

const saveToLocalStorage = () => //update the local storage
localStorage.setItem("taskySAI", JSON.stringify({card: globalTaskData}));

const addNewCard = () => {
    //get tast data
    const taskData = {
        id: `${Date.now()}`,
        title: document.getElementById("taskTitle").value,
        image: document.getElementById("imageURL").value,
        type: document.getElementById("taskType").value,
        description: document.getElementById("taskDescription").value,
    };
    globalTaskData.push(taskData);

    //update the local storage
    saveToLocalStorage();

    //generate html code
    const newCard = generateHTML(taskData);
    //inject it to DOM
    insertToDOM(newCard);

    //clear the form
    document.getElementById("taskTitle").value="";
    document.getElementById("imageURL").value="";
    document.getElementById("taskType").value="";
    document.getElementById("taskDescription").value="";

    return;
};

const loadExistingCards = () => {
    //check local storage
    const getData = localStorage.getItem("taskySAI");
    //parse data, if exist
    if(!getData) return;

    const taskCards = JSON.parse(getData);

    globalTaskData = taskCards.card;

    //generate HTML code for those data
    globalTaskData.map((taskData) => {
        const newCard = generateHTML(taskData);;
        //inject to DOM
        insertToDOM(newCard);
    });
    return;
};

const deleteCard = (event) => {
    const targetId = event.target.getAttribute("name");
    const elementType =event.target.tagName;
    const removeTask = globalTaskData.filter((task) => task.id !== targetId);
    globalTaskData = removeTask;
    saveToLocalStorage();

    //access DOM to remove card
    if (elementType === "BUTTON") {
        return taskContainer.removeChild(
          event.target.parentNode.parentNode.parentNode
        );
      } else {
        return taskContainer.removeChild(
          event.target.parentNode.parentNode.parentNode.parentNode
        );
      }
};

const editCard = (event) => {
    const targetId = event.target.getAttribute("name");
    const elementType =event.target.tagName;
    
    let taskTitle;
    let taskType;
    let taskDescription;
    let parentElement;
    let submitButton;
    if(elementType === "BUTTON") {
        parentElement = event.target.parentNode.parentNode;
    } else {
        parentElement = event.target.parentNode.parentNode.parentNode;
    }
    taskTitle = parentElement.childNodes[3].childNodes[3];
    taskDescription =  parentElement.childNodes[3].childNodes[5];
    taskType = parentElement.childNodes[3].childNodes[7];
    submitButton = parentElement.childNodes[5].childNodes[1];
    
    taskTitle.setAttribute("contenteditable","true");
    taskType.setAttribute("contenteditable","true");
    taskDescription.setAttribute("contenteditable","true");
    submitButton.setAttribute("onclick", "saveEdit.apply(this, arguments)");
    submitButton.removeAttribute("data-bs-toggle");
    submitButton.removeAttribute("data-bs-target");
    submitButton.innerHTML="Save Changes";
};

const saveEdit = (event) => {
    const targetId = event.target.getAttribute("name");
    const elementType =event.target.tagName;

    let parentElement;
    if(elementType === "BUTTON") {
        parentElement = event.target.parentNode.parentNode;
    } else {
        parentElement = event.target.parentNode.parentNode.parentNode;
    }

    const taskTitle = parentElement.childNodes[3].childNodes[3];
    const taskDescription =  parentElement.childNodes[3].childNodes[5];
    const taskType = parentElement.childNodes[3].childNodes[7];
    const submitButton = parentElement.childNodes[5].childNodes[1];

    const updatedData = {
        title: taskTitle.innerHTML,
        type: taskType.innerHTML,
        description: taskDescription.innerHTML,
    };
    const updateGlobalTasks = globalTaskData.map((task) => {
        if(task.id === targetId) {
            return {...task, ...updatedData };
        }
        return task;
    });

    globalTaskData = updateGlobalTasks; 

    saveToLocalStorage();

    taskTitle.setAttribute("contenteditable","false");
    taskType.setAttribute("contenteditable","false");
    taskDescription.setAttribute("contenteditable","false");
    submitButton.setAttribute("onclick", "openTask.apply(this, arguments)");
    submitButton.setAttribute("data-bs-toggle", "modal");
    submitButton.setAttribute("data-bs-target", "#showTask");
    submitButton.innerHTML="Open task";
    
};

const openTask = (event) => {
    const taskId = event.target.getAttribute("name");
    console.log(taskId);
    const getTask = globalTaskData.filter(function(taskData) {
        return taskData.id === taskId;
    });
    console.log(getTask);
    taskModal.innerHTML = ModalHTML(getTask[0]);
};

const searchTask = (event) => {
    if (!event) event = window.event;
    while(taskContainer.firstChild) {
        taskContainer.removeChild(taskContainer.firstChild);
    }
    const search = event.target.value;
    const searchInTasks = globalTaskData.filter(function (string) {
        return (string.title.toLowerCase().includes(search) || string.type.toLowerCase().includes(search) || string.description.toLowerCase().includes(search));
    });
    searchInTasks.map(function (cardData) {
        taskContainer.insertAdjacentHTML("beforeend", generateHTML(cardData));
    });
};