const Clock = (function(){
    const modeButtons = document.querySelectorAll('.timmer > button');
    const timerDisplay = document.querySelector('.alarm-clock > span');
    const barDisplay = document.querySelector('.custom-bar')
    const percentDisplay = document.querySelector('.custom-bar > .percent');
    const contorlButtons = document.querySelectorAll('.controls');
    const audio =  document.querySelector('.timmer > audio');
    const progressInfo = document.querySelector('.custom-progress').getBoundingClientRect();

    let intervalID, isMuted, isPause, isStudy, isRest, leftTime;
    const tomatoes = (function() {
        let tomatoesNumber;
        function init() {
            tomatoesNumber = parseInt(localStorage.getItem('tomatoesNumber')) || 0;
            setTomatoes(tomatoesNumber);
        }
    
        function getTomatoes() {
            return tomatoesNumber;
        }
    
        function setTomatoes(number) {
            const tomatoesDisplay = document.querySelector('.tomatoes');
            tomatoesNumber = number;
            localStorage.setItem("tomatoesNumber", tomatoesNumber);
            tomatoesDisplay.innerHTML = `Total: 🍅 x ${tomatoesNumber}`;
        }
    
        return {
            init: init,
            getTomatoes: getTomatoes,
            setTomatoes: setTomatoes
        }
    })();

    const toastify = Toastify({
        text: "",
        duration: 1500, // 3 secs
        backgroundColor: '#dc3545', 
        close: true,
        offset: {
            x: 0, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: '3em' // vertical axis - can be a number or a string indicating unity. eg: '2em'
        },
    });

    function init() {
        isMuted = false;
        isPause = true;
        isStudy = true;
        isRest = false;
        leftTime = parseInt(modeButtons[0].dataset.time);
        displayControls();
        displayTime(leftTime);
        displayBar(0);
        tomatoes.init();
    }

    function timer(seconds) {
        clearInterval(intervalID);

        const startTime = Date.now(); // milliseconds
        const endTime = startTime + seconds * 1000;
        displayTime(seconds);
    
        intervalID = setInterval(() => {
            leftTime = Math.round((endTime - Date.now()) / 1000);
            if (leftTime <= 0) {
                isPause = true;
                playAlarm();
                displayControls();
                if (isStudy)
                    tomatoes.setTomatoes(tomatoes.getTomatoes() + 1);
                clearInterval(intervalID);
            }
            const howLong = Math.round((endTime - startTime) / 1000);
            const percent = Math.round(((howLong - leftTime) / howLong) * 100);
            displayBar(percent);
            displayTime(leftTime);
        }, 1000);
    }

    function handleControl() {
        const name = this.dataset.name;

        // Error Check
        const errors = [
            {validate: isStudy && name === 'study', message: '⚠️ "Study" is the current mode.'},
            {validate: isRest && name === 'rest', message: `⚠️ "Rest" is the current mode.`},
            {validate: leftTime === 0 && name === 'playpause', message: '⚠️ Change the mode to keep going !'}
        ];
        const error = errors.find(error => error.validate ? error.message : false);
        if (error){
            toastify.options.text = error.message;
            toastify.showToast();
            return;
        }

        // toggle
        if (name === 'playpause') isPause = !isPause;
        if (name === 'muted') isMuted = !isMuted;
        if (name === 'study' || name === 'rest'){
            isStudy = !isStudy;
            isRest = !isRest;
        }
        
        // Condition
        if (name === 'playpause'){
            if(isPause) 
                clearInterval(intervalID);
            else
                timer(leftTime);
        }
        if (name === 'muted' && isMuted) {
            audio.pause();
            audio.currentTime = 0;
        }

        displayControls();
    }

    function displayBar(percent) {
        const fullWidth = progressInfo.width;
        const width = (fullWidth * percent) / 100;
        barDisplay.style.width = width + 'px';
        percentDisplay.innerHTML = percent + '%';
    }

    function displayControls() {
        const playPause = contorlButtons[0];
        const toggleMuted = contorlButtons[1];
        const studyMode = modeButtons[0];
        const restMode = modeButtons[1];

        isPause ? playPause.textContent = '▶️' : playPause.textContent = '⏸️';
        isMuted ? toggleMuted.textContent = '🔕' : toggleMuted.textContent = '🔔';
        isStudy ? studyMode.classList.add('disabled') : studyMode.classList.remove('disabled');
        isRest ? restMode.classList.add('disabled') : restMode.classList.remove('disabled');
    }

    function displayTime(currentSeconds) {
        const minutes = Math.floor((currentSeconds / 60));
        const seconds = currentSeconds % 60;
        timerDisplay.textContent = `${minutes > 10 ? minutes : '0' + minutes}:${seconds > 10 ? seconds : '0' + seconds}`;
    }

    function startTime() {
        const name = this.dataset.name;
        if (isStudy && name === 'study') return;
        if (isRest && name === 'rest') return;

        isPause = false;
        displayControls();
        displayBar(0);
        leftTime = parseInt(this.dataset.time);
        timer(leftTime);
    }

    function playAlarm() {
        if (isMuted) return;

        audio.currentTime = 0;
        audio.play();
    }

    modeButtons.forEach(button => button.addEventListener('click', startTime));
    modeButtons.forEach(button => button.addEventListener('click', handleControl));
    contorlButtons.forEach(button => button.addEventListener('click', handleControl));

    return{
        init: init
    };
})();

const TodoList = (function() {
    const input = document.querySelector('.input');
    const itemList = document.querySelector('.item-list');
    const send = document.querySelector('#send');
    // Private
    let items;

    function init() {
        const sample = [{text: 'do homework', done: false,},{text: 'go swimming', done: true,}];
        items = JSON.parse(localStorage.getItem('items')) || sample;
        renderItems();
    }
    
    function renderItems() {
        itemList.innerHTML = items.map(item => 
                `<div class="item custom-row">
                    <i class="${item.done? 'far fa-check-circle': 'far fa-circle'}"></i>
                    <span class="${item.done? 'clear' : ''}">${item.text}</span>
                    <i class="far fa-trash-alt delete"></i>
                </div>`
        ).join('');
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

    input.addEventListener('keyup', addItems);
    send.addEventListener('click', addItems);
    itemList.addEventListener('click', doneItem);
    itemList.addEventListener('click', deleteItem);

    return {
        init: init
    };
})();

const Pages = (function() {
    const pages = [...document.querySelectorAll('[data-page]')];
    const navLinks = [...document.querySelectorAll('.navbar-nav > .nav-link')];

    function changePage() {
        const pageName = this.textContent.toLowerCase();

        navLinks.map(navLink => {
            if(navLink.textContent === this.textContent)
                navLink.classList.add('active');
            else
                navLink.classList.remove('active');
        });
        pages.map(page => {
            if (page.dataset.page === pageName)
                page.style.transform = 'translateX(-50%)';
            else
                page.style.transform = 'translateX(-150vw)';
        });
    }

    navLinks.forEach(navLink => navLink.addEventListener('click', changePage));
})();

Clock.init();
TodoList.init();