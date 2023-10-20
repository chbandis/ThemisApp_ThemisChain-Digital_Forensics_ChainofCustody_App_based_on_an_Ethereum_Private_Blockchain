let btn = document.querySelector('#btn');
let sidebar = document.querySelector('.sidebar');

//Function to expand-collapse sidebar on button click
btn.onclick = function() {
    if (sidebar.classList.contains('active')) {
        btn.src= '/img/circled-menu.png';
        sidebar.classList.toggle('active');
    } else {
        btn.src= '/img/close.png';
        sidebar.classList.toggle('active');
    }
}