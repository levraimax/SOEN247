
document.addEventListener('DOMContentLoaded', () => {
    const contentsDiv = document.querySelector('.contents');

    const editModal = document.getElementById('editModal');
    const editResName = document.getElementById('editResName');
    const editResDesc = document.getElementById('editResDesc');
    const editResLoc = document.getElementById('editResLoc');
    const editResCap = document.getElementById('editResCap');
    const editSaveBtn = document.getElementById('editSaveBtn');
    const editCancelBtn = document.getElementById('editCancelBtn');
    const removeBtn = document.getElementById('removeBtn');
    const blockBtn = document.getElementById('blockBtn')

    const createBtn = document.getElementById('create');
    const createModal = document.getElementById('createModal');
    const createResName = document.getElementById('createResName');
    const createResDesc = document.getElementById('createResDesc');
    const createResLoc = document.getElementById('createResLoc');
    const createResCap = document.getElementById('createResCap');
    const createDropArea = document.getElementById('createDropArea');
    const createFileInput = document.getElementById('createFileInput');
    const createSaveBtn = document.getElementById('createSaveBtn');
    const createCancelBtn = document.getElementById('createCancelBtn');

    //let currentResourceId = null;
    let droppedImageData = null;
    let current = null;
 

    function loadResources() {
        return GET_SYNC("http://localhost:3000/resources")
        
    }

    function clearContents() {
        contentsDiv.innerHTML = '';
        contentsDiv.appendChild(createBtn);
    }

    function renderAllResources() {
        const resources = loadResources();
        //const resources = loadResources() || initialResourcesFromDom();
        clearContents();

        contentsDiv.appendChild(createBtn);

        // Handle error if resources is null (auth error or network issue)
        if (!resources) {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '10px';
            errorDiv.textContent = 'Failed to load resources. Please check if you are logged in as admin.';
            contentsDiv.appendChild(errorDiv);
            return;
        }

        resources.forEach(res => {
            console.log(res);
            const img = document.createElement('img');
            //img.src = binToImageSrc(res.image);
            img.src = "http://localhost:3000/resourceImage/" + res.reference;
            img.dataset.id = res.reference;
            img.dataset.name = res.name;
            img.dataset.description = res.description;
            img.dataset.location = res.location;
            img.dataset.capacity = res.capacity;
            //img.dataset.blocked = res.blocked ? 'true' : 'false';
            img.dataset.blocked = res.blocked;
            if (res.reference)
                img.id = res.reference;
            if (res.blocked)
                img.classList.add('blocked');
            img.addEventListener('click', () => openEditModalFor(img));
            contentsDiv.appendChild(img);
        });
        attachResourceClickHandlers();
    }


    function openEditModalFor(imgEl) {
        current = imgEl;
        //currentResourceId = imgEl.dataset.id;
        editResName.value = imgEl.dataset.name || '';
        editResDesc.value = imgEl.dataset.description || '';
        editResLoc.value = imgEl.dataset.location || '';
        editResCap.value = imgEl.dataset.capacity || '';
        //blockBtn.textContent = imgEl.dataset.blocked === 'true' ? 'Unblock' : 'Block';
        blockBtn.textContent = (imgEl.dataset.blocked == 1) ? 'Unblock' : 'Block';
        editModal.style.display = 'block';
        document.getElementById("editForm").id.value = imgEl.dataset.id;
        document.getElementById("editForm").blocked.value = imgEl.dataset.blocked;
    }

    function attachResourceClickHandlers(root = contentsDiv) {
        root.querySelectorAll('img:not(#create)').forEach(img => {
            img.style.cursor = 'pointer';
        });
    
    }


    editSaveBtn.addEventListener('click', () => {
        if (current == null) return;

    
        submitEdit(renderAllResources);

        editModal.style.display = 'none';

    });

    editCancelBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    removeBtn.addEventListener('click', (event) => {
        GET_SYNC(`http://localhost:3000/deleteResource?reference=${current.dataset.id}`);
        renderAllResources();
       
        current = null;
        editModal.style.display = 'none';
    });

    blockBtn.addEventListener('click', () => {
        if (current == null) return;
       
        let editForm = document.getElementById("editForm");
        let name = current.dataset.name;

        if (current.dataset.blocked == 0) {
            
            editForm.blocked.value = 1;
            current.classList.add("blocked");

        }
        else {

            editForm.blocked.value = 0;
            if (current.classList.contains("blocked")) current.classList.remove("blocked");


        }
        current = null;
        submitEdit(renderAllResources);
        editModal.style.display = 'none';
    });

    createBtn.addEventListener('click', () => {
        createResName.value = '';
        createResDesc.value = '';
        createResLoc.value = '';
        createResCap.value = '';
        droppedImageData = null;
        createDropArea.style.backgroundImage = '';
        createDropArea.textContent = 'Drop image here\nor click to choose';
        createModal.style.display = 'block';
    });

    createCancelBtn.addEventListener('click', () => {
        createModal.style.display = 'none';
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        createDropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    createDropArea.addEventListener('dragover', () => {
        createDropArea.style.borderColor = 'blue';
    });
    createDropArea.addEventListener('dragleave', () => {
        createDropArea.style.borderColor = 'gray';
    });

    createDropArea.addEventListener('drop', (e) => {
        createDropArea.style.borderColor = 'gray';
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please drop an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            droppedImageData = ev.target.result;
            createDropArea.style.backgroundImage = `url(${droppedImageData})`;
            createDropArea.style.backgroundSize = 'cover';
            createDropArea.textContent = '';
        };
        reader.readAsDataURL(file);
    });

    createDropArea.addEventListener('click', () => createFileInput.click());
    createFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please choose an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            droppedImageData = ev.target.result;
            createDropArea.style.backgroundImage = `url(${droppedImageData})`;
            createDropArea.style.backgroundSize = 'cover';
            createDropArea.textContent = '';
        };
        reader.readAsDataURL(file);
    });

    createSaveBtn.addEventListener('click', () => {
        processCreation(document.getElementById("creationForm")).then(() => {
            createModal.style.display = 'none';
            droppedImageData = null;
            createFileInput.value = '';
            renderAllResources();
        })
    });


    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (editModal.style.display === 'block') editModal.style.display = 'none';
            if (createModal.style.display === 'block') createModal.style.display = 'none';
        }
    });

    renderAllResources();
});

function submitEdit(renderAllResources) {
    sendQuery(document.getElementById("editForm"), "http://localhost:3000/updateResource", function () {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            renderAllResources();
        }
    });
}

function processCreation(form) {
    return sendResource(form).then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Server error: ${response.status} - ${text}`);
            });
        }
        return response.json();
    }).catch(error => {
        console.error('Error creating resource:', error);
        alert('Failed to create resource. Check console and admin permissions.');
        throw error;
    });
}