const startBtn = document.querySelector('[data-start]');
const stopBtn = document.querySelector('[data-stop]');

let intervalId;
stopBtn.disabled = true;
function startColorSwitching() {
    startBtn.disabled = true;
    stopBtn.disabled = false;
  intervalId = setInterval(() => {
    const randomColor = getRandomHexColor();
    document.body.style.backgroundColor = randomColor;
  }, 1000);
}

function stopColorSwitching() {
  clearInterval(intervalId);
    startBtn.disabled = false; 
    stopBtn.disabled = true;
    
}

startBtn.addEventListener('click', startColorSwitching);
stopBtn.addEventListener('click', stopColorSwitching);

function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
