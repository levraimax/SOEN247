document.addEventListener('DOMContentLoaded',()=>{
    const checkbox = document.getElementById('notifications');

    const notificationsOn = localStorage.getItem('notificationsAllowed');
    if(notificationsOn!=null){
        checkbox.checked= notificationsOn === 'true';
    }

    checkbox.addEventListener('change',() => {
        const isChecked = checkbox.checked;
        

        localStorage.setItem('notificationsAllowed',isChecked);
    });
});