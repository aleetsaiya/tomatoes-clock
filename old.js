// Navbar
const navLinks = document.querySelectorAll('a.nav-link');
const pages = document.querySelectorAll('.page');

//  Progress
const percent = document.querySelector('.percent');
const bar = document.querySelector('.custom-bar');
const progressInfo = document.querySelector('.custom-progress').getBoundingClientRect();

// Clock
const clock = document.querySelector('.alarm-clock>span');
const studyBtn = document.querySelectorAll('.timmer>button')[0];
const restBtn = document.querySelectorAll('.timmer>button')[1];
const playPause = document.querySelector('#playpause');
const muteBtn = document.querySelector('#mute');

// Todo
const input = document.querySelector('.input');
const itemList = document.querySelector('.item-list');
const send = document.querySelector('#send');

// Setting
let tomatoesNumber = 0;
let items = [
    {
      text: 'do homework',
      done: false,
    },
    {
    text: 'go swimming',
      done: true,
    }
];

const modes = 
[
    {label: 'study', btn: studyBtn, duration: 1500}, // 25 mins
    {label: 'rest', btn: restBtn, duration: 300} // 5 mins
];

const controls = {
    onStart: false,
    muted: false,
    currentTime: modes[0].duration,
    currentMode: modes[0].label,
    interval: 0 // intervalID
};

const toastify = Toastify({
    text: "⏰ Time's up !",
    duration: 300000, // 5 mins
    backgroundColor: '#dc3545', 
    close: true,
    offset: {
        x: 0, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
        y: '3em' // vertical axis - can be a number or a string indicating unity. eg: '2em'
      },
    stopOnFocus: true, // Prevents dismissing of toast on hover
  });

setTime(controls.currentTime);
// Get items from localStorage
items = JSON.parse(localStorage.getItem('items')) || items;
tomatoesNumber = parseInt(localStorage.getItem('tomatoesNumber')) || tomatoesNumber;
renderItems();

function renderItems() {
    itemList.innerHTML = items.map(item => 
            `<div class="item custom-row">
                <i class="${item.done? 'far fa-check-circle': 'far fa-circle'}"></i>
                <span class="${item.done? 'clear' : ''}">${item.text}</span>
                <i class="far fa-trash-alt delete"></i>
            </div>`
    ).join('');
    
    // tomatoes
    const tomatoes = document.querySelector('.tomatoes');
    tomatoes.innerHTML = `Total: 🍅 x ${tomatoesNumber}`;
}

function addItems(e) {
    if (e.type === 'keyup' && e.key !== 'Enter')  return;
    if (input.value === '') return;

    const alert = document.querySelector('.alert-warning');
    if (items.find(item => item.text === input.value)){
        alert.style.display = 'block';
        return;
    }

    if(alert.style.display === 'block')
        alert.style.display = 'none';

    const item = {
        text: input.value,
        done: false
    }
    items.push(item);
    localStorage.setItem('items', JSON.stringify(items));
    renderItems();
    input.value = '';
}

function deleteItem(e) {
    if (e.target.className !== 'far fa-trash-alt delete')  return;

    const node = items.find(item => 
        item.text === e.target.parentNode.textContent.trim()
    );
    items.splice(items.indexOf(node), 1);
    localStorage.setItem('items', JSON.stringify(items));
    renderItems();
}

function doneItem(e) {
    try{
        const node = items.find(item => 
            item.text === e.target.textContent.trim()
        );
        node.done = !node.done;
    }catch {
        const node = items.find(item => 
            item.text === e.target.parentNode.textContent.trim()
        );
        node.done = !node.done;
    }
    localStorage.setItem('items', JSON.stringify(items));
    renderItems();
}

function changePage(e) {
    // const target = [...pages].find(page => page.dataset.page === e.target.innerHTML.toLowerCase());
    
    for (let i = 0; i < pages.length; i++) {
        if (pages[i].dataset.page === e.target.innerHTML.toLowerCase()){
            pages[i].style.transform = 'translateX(-50%)';
            navLinks[i].classList.add('active');
        }
        else {
            pages[i].style.transform = 'translateX(-150vw)';
            navLinks[i].classList.remove('active');
        }
    }
}

function barAnimation(value) {
    const fullWidth = progressInfo.width;
    const width = (fullWidth / 100) * value;
    bar.style.width = width + 'px';
    percent.innerHTML = value + '%';
}

function changeMode(e) {
    const target = e.target.innerHTML.toLowerCase();
    if (target === controls.currentMode ) return ;
    if (controls.onStart && target !== controls.currentMode ){
        window.clearInterval(controls.interval);
    }

    modes.forEach(mode => {
        if (mode.label === target){
            mode.btn.classList.add('disabled');
            controls.currentMode = mode.label;
            setTime(mode.duration);
            playPause.innerHTML = '⏸️';
            start();
        }
        else{
            mode.btn.classList.remove('disabled');
            mode.btn.disabled = false;
        }
    })
}

// set currentTime
function setTime(time) {
    const duration = modes.find(mode => mode.label === controls.currentMode).duration;
    const value = Math.floor(((duration - time) / duration) * 100);
    barAnimation(value);

    controls.currentTime = time;
    let min = parseInt(controls.currentTime / 60);
    let sec = controls.currentTime % 60;

    if (min < 10)  min = '0' + min;
    if (sec < 10)  sec = '0' + sec;
    clock.innerHTML = min + ':' + sec;
}

function start() {
    if (controls.currentTime <= 0) return;

    controls.onStart = true;
    controls.interval = window.setInterval(() => {
        setTime(controls.currentTime - 1);
        if (controls.currentTime <= 0) {
            if (!controls.muted)  
                playSound();
            if (controls.currentMode === 'study'){
                tomatoesNumber += 1;
                localStorage.setItem('tomatoesNumber', tomatoesNumber);
                renderItems();
            }
            
            const currentPage = [...navLinks].find(navLink => navLink.className.includes('active'));
            if (currentPage.textContent !== 'Clock')
                toastify.showToast();
            

            window.clearInterval(controls.interval);
            playPause.innerHTML = '▶️';
        };
    }, 1000);
}

function stop(e) { 
    if (controls.currentTime <= 0) return;

    if (controls.onStart) {
        controls.onStart = false;
        e.target.innerHTML = '▶️';
        window.clearInterval(controls.interval);
    }
    else {
        controls.onStart = true;
        e.target.innerHTML = '⏸️';
        start();
    }
}

function toggleMute (e) {
    if (controls.muted) {
        controls.muted = false;
        e.target.innerHTML = '🔔'; //show not mute icon
    }
    else { //change to mute
        controls.muted = true;
        const alarm = document.querySelector('audio');
        alarm.pause();
        e.target.innerHTML = '🔕';  // show mute icon
    }
}

function playSound () {
    const alarm = document.querySelector('audio');
    alarm.currentTime = 0;
    alarm.play();
}

// Time
studyBtn.addEventListener('click', changeMode);
restBtn.addEventListener('click', changeMode);
playPause.addEventListener('click', stop);
muteBtn.addEventListener('click', toggleMute);
input.addEventListener('keyup', addItems);
send.addEventListener('click', addItems);
itemList.addEventListener('click', doneItem);
itemList.addEventListener('click', deleteItem);
navLinks.forEach(navLink => navLink.addEventListener('click', changePage));

