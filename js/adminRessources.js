
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

    //const STORAGE_KEY = 'resources';

    //function saveResources(resources) {
    //    console.log("SAVE TO LOCAL STORAGE NO LONGER IMPLEMENTED");
    //    //localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    //}

    function loadResources() {
        return GET_SYNC("http://localhost:3000/resources")
        //const items = localStorage.getItem(STORAGE_KEY);
        //if (!items) return null;
        //try {
        //    return JSON.parse(items);
        //} catch (e) {
        //    console.warn('Failed to parse resources from local Storage', e);
        //    return null;
        //}
    }

    //function initialResourcesFromDom() {
    //    let resources = loadResources();
    //    if (resources && Array.isArray(resources))
    //        return resources;

    //    let resources = [];

    //    contentsDiv.querySelectorAll('img:not(#create)').forEach((imgEl) => {
    //        resources.push({
    //            //id: imgEl.id,
    //            name: imgEl.dataset.name,
    //            description: imgEl.dataset.description,
    //            location: imgEl.dataset.location,
    //            capacity: imgEl.dataset.capacity,
    //            img: imgEl.src || '',
    //            //blocked: imgEl.dataset.blocked == 'true' || false
    //        });
    //    });
    //    //saveResources(resources);
    //    return resources;
    //}

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

        //resources.forEach(res => {
        //    console.log(res)
        //    const img = document.createElement('img');
        //    img.src = res.img;
        //    img.dataset.id = res.id;
        //    img.dataset.name = res.name;
        //    img.dataset.description = res.description;
        //    img.dataset.location = res.location;
        //    img.dataset.capacity = res.capacity;
        //    img.dataset.blocked = res.blocked ? 'true' : 'false';
        //    if (res.id)
        //        img.id = res.id;
        //    if (res.blocked)
        //        img.classList.add('blocked');
        //    img.addEventListener('click', () => openEditModalFor(img));
        //    contentsDiv.appendChild(img);
        //});
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

    // function updateResourceStorage(updated){
    //     const resources = loadResources();
    //     const idx = resources.findIndex(r=>r.id === updated.id);
    //     if(idx>=0) 
    //         resources[idx] = updated;
    //     else 
    //         resources.push(updated);
    //     saveResources(resources); 
    // }

    //function removeResourcebyID(id) {
    //    let resources = loadResources() || [];
    //    resources = resources.filter(r => r.id !== id);
    //    saveResources(resources);
    //}

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
        // root.querySelectorAll('img:not(#create)').forEach(img => {
        //     img.replaceWith(img.cloneNode(true));
        // });
        // root.querySelectorAll('img:not(#create)').forEach(img => {
        //     img.addEventListener('click', () => openEditModalFor(img));
        // });
    }


    editSaveBtn.addEventListener('click', () => {
        //if (!currentResourceId) return;
        if (current == null) return;

        //sendQuery(document.getElementById("editForm"), "http://localhost:3000/updateResource", function () {
        //    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        //        renderAllResources();
        //    }
        //});
        submitEdit(renderAllResources);

        editModal.style.display = 'none';



        //resources[idx] = updated;
        //saveResources(resources);
        //renderAllResources();
        //editModal.style.display = 'none';
        //alert('Resource updated!');
    });

    editCancelBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    removeBtn.addEventListener('click', (event) => {
        //GET_SYNC(`http://localhost:3000/deleteResource?reference=${currentResourceId}`);
        GET_SYNC(`http://localhost:3000/deleteResource?reference=${current.dataset.id}`);
        renderAllResources();
        //if (!currentResourceId)
        //    return;
        //const resources = loadResources();
        //const idx = resources.findIndex(r => r.id === currentResourceId);
        //if (idx === -1)
        //    return;
        //const name = resources[idx].name;
        //const confirmed = confirm('Are you sure you want to delete ' + name + '?');
        //if (!confirmed)
        //    return;
        //removeResourcebyID(currentResourceId);
        //currentResourceId = null;
        current = null;
        //renderAllResources();
        editModal.style.display = 'none';
        //alert('Resource deleted!');
    });

    blockBtn.addEventListener('click', () => {
        //if (!currentResourceId) return;
        if (current == null) return;
        //const resources = loadResources() || [];
        //const idx = resources.findIndex(r => r.id === currentResourceId);
        //if (idx === -1)
        //    return;
        //const currentlyBlocked = resources[idx].blocked === true;
        //const name = resources[idx].name;

        //if (!currentlyBlocked) {
        //    const confirmed = confirm('Do you want to block ' + name + '?');
        //    if (!confirmed) return;
        //    resources[idx].blocked = true;
        //    saveResources(resources);
        //    renderAllResources();
        //    alert(name + ' is now blocked!');
        //}
        //else {
        //    const confirmed = confirm('Do you want to unblock ' + name + '?');
        //    if (!confirmed) return;
        //    resources[idx].blocked = false;
        //    saveResources(resources);
        //    renderAllResources();
        //    alert(name + ' is now unblocked!');
        //}
        let editForm = document.getElementById("editForm");
        let name = current.dataset.name;

        if (current.dataset.blocked == 0) {
            //const confirmed = confirm('Do you want to block ' + name + '?');
            //if (!confirmed) return;
            //resources[idx].blocked = true;
            editForm.blocked.value = 1;
            current.classList.add("blocked");
            //saveResources(resources);
            //renderAllResources();
            //alert(name + ' is now blocked!');
        }
        else {
            //const confirmed = confirm('Do you want to unblock ' + name + '?');
            //if (!confirmed) return;
            editForm.blocked.value = 0;
            if (current.classList.contains("blocked")) current.classList.remove("blocked");

            //resources[idx].blocked = false;
            //saveResources(resources);
            //renderAllResources();
            //alert(name + ' is now unblocked!');
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