const generateTaskComponent = (task) => {
    return `
                <div class="task" id="task-${task._id}">
                    <h5>${task.description}</h5>

                    <div>
                        <button onclick="initiateUpdate('${task._id}')" class="update-btn btn btn-primary btn-sm"><i class="fas fa-edit"></i></button>
                        <button onclick="initiateDelete('${task._id}')" class="delete-btn btn btn-danger btn-sm"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
}

const getTasks = async (search) => {
    var url = "/api/tasks";

    if(search && search.length > 0){
        url = url + "?search=" + search;
    }

    try{
        const response = await fetch(url);
        const tasks = await response.json();

        var html = "";

        tasks.forEach(task => {
            html += generateTaskComponent(task);
        });

        $("#tasks-container").html(html);
    }catch(e){
        showError({msg: e.message});
    }
}

const createTask = async () => { 
    const form = createForm[0];

    const data = {
        description: form.description.value,
        completed: document.querySelector("#completed").checked
    }

    form.reset();
    closeModal("#create-modal");
    const btnContent = $("#add-btn").html();
    showLoader("#add-btn", addingLoader);

    try{
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers:{
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(data)
        });
    
        const task = await response.json();

        if(task.error){
            return showError({msg: task.error});
        }

        $("#tasks-container").append(generateTaskComponent(task));
        showSuccess({msg: "Task created successfully!"});
    }catch(e){
        showError({msg: "Something went wrong, unable to create task!"});
    }finally{
        hideLoader("#add-btn", btnContent);
    }
}

const initiateUpdate = async (id) => {
    const url = "/api/tasks/" + id;
    
    try{
        const response = await fetch(url);
        const task = await response.json();

        if(task.error){
            return alert(task.error);
        }

        $("#taskId").val(task._id);
        $("#updateDesc").val(task.description);
        $("#updateCompleted").prop("checked", task.completed);

        showModal("#update-modal");
    }catch(e){
        showError({msg: e.message});
    }
}

const updateTask = async () => {
    const id = $("#taskId").val();
    const url = "/api/tasks/" + id;

    const btnContent = $(`#task-${id} .update-btn`).html();
    showLoader(`#task-${id} .update-btn`, generalLoader);

    try{
        const data = {
            description: $("#updateDesc").val(),
            completed: $("#updateCompleted").prop("checked")
        }

        closeModal("#update-modal");

        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const task = await response.json();

        if(task.error){
            return showError({msg: task.error});
        }

        $(`#task-${id} h5`).text(task.description);
        showSuccess({msg: "Task Updated Successfully!"});
    }catch(e){
        showError({msg: e.message});
    }finally{
        hideLoader(`#task-${id} .update-btn`, btnContent);
    }
}

const initiateDelete = async (id) => {
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        buttons: true
    }).then((isConfirmed) => {
        if(isConfirmed){
            deleteTask(id);
        }
    });
}

const deleteTask = async (id) => {
    const url = "/api/tasks/" + id;

    const btnContent = $(`#task-${id} .delete-btn`).html();
    showLoader(`#task-${id} .delete-btn`, generalLoader);

    try{
        const response = await fetch(url, {
            method: "DELETE"
        });

        const task = await response.json();

        if(task.error){
            return showError({msg: task.error});
        }

        $("#task-" + id).hide();
        showSuccess({msg: "Task Deleted Successfully!"});
    }catch(e){
        showError({msg: e.message});
    }finally{
        hideLoader(`#task-${id} .delete-btn`, btnContent);
    }
}

getTasks();


// Form Setting
const createForm = $("#create-form");
const updateForm = $("#update-form");
const searchForm = $("#search-form")

createForm.validate({
    rules: {
        description: {
            required: true
        }
    },
    messages: {
        description:{
            required: "The description is required",
        }
    }
});

updateForm.validate({
    rules:{
        updateDesc: {
            required: true
        }
    }
});

createForm.on("submit", (e) => {
    e.preventDefault();

    if(createForm.valid()){
        createTask();
    }
});

updateForm.on("submit", (e) => {
    e.preventDefault();

    if(updateForm.valid()){
        updateTask();
    }
});

searchForm.on("submit", (e) => {
    e.preventDefault();

    const search = $("#search").val();
    getTasks(search);
});

