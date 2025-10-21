document.addEventListener('DOMContentLoaded', () => {
    const contentsDiv = document.querySelector('.contents');

    const editModal = document.getElementById('editModal');
    const editResName = document.getElementById('editResName');
    const editResDesc = document.getElementById('editResDesc');
    const editResLoc = document.getElementById('editResLoc');
    const editResCap = document.getElementById('editResCap');
    const editSaveBtn = document.getElementById('editSaveBtn');
    const editCancelBtn = document.getElementById('editCancelBtn');

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

    let currentResource = null;         
    let droppedImageData = null;        

    function openEditModalFor(imgEl) {
        currentResource = imgEl;
        editResName.value = imgEl.dataset.name || '';
        editResDesc.value = imgEl.dataset.description || '';
        editResLoc.value = imgEl.dataset.location || '';
        editResCap.value = imgEl.dataset.capacity || '';
        editModal.style.display = 'block';
    }

    function attachResourceClickHandlers(root = contentsDiv) {
        root.querySelectorAll('img:not(#create)').forEach(img => {
            img.replaceWith(img.cloneNode(true));
        });
        root.querySelectorAll('img:not(#create)').forEach(img => {
            img.addEventListener('click', () => openEditModalFor(img));
        });
    }

    attachResourceClickHandlers();

    editSaveBtn.addEventListener('click', () => {
        if (!currentResource) return;
        currentResource.dataset.name = editResName.value;
        currentResource.dataset.description = editResDesc.value;
        currentResource.dataset.location = editResLoc.value;
        currentResource.dataset.capacity = editResCap.value;
        editModal.style.display = 'none';
        alert('Resource updated!');
    });

    editCancelBtn.addEventListener('click', () => {
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

    ['dragenter','dragover','dragleave','drop'].forEach(eventName => {
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
        const newImg = document.createElement('img');
        newImg.src = droppedImageData || '../img/default.png'; // fallback image
        newImg.setAttribute('data-name', createResName.value || '');
        newImg.setAttribute('data-description', createResDesc.value || '');
        newImg.setAttribute('data-location', createResLoc.value || '');
        newImg.setAttribute('data-capacity', createResCap.value || '');

        newImg.addEventListener('click', () => openEditModalFor(newImg));

        contentsDiv.appendChild(newImg);

        droppedImageData = null;
        createFileInput.value = '';
        createModal.style.display = 'none';

        attachResourceClickHandlers(contentsDiv);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (editModal.style.display === 'block') editModal.style.display = 'none';
            if (createModal.style.display === 'block') createModal.style.display = 'none';
        }
    });
});
