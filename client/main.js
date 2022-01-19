(async function(){

const videoInput = document.getElementById('videoInput');
const videoInputMessage = document.getElementById('videoInputMessage');
const filtersSelect = document.getElementById('filtersSelect');

const video = document.createElement('video');

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const auxCanvas = document.createElement('canvas');
auxCanvas.width = canvas.width;
auxCanvas.height = canvas.height;
const auxContext = auxCanvas.getContext('2d');

const state = {
    filter: filters.None
};

video.addEventListener('play', function(){
    draw();
},false);

//init
const playImage = await newImage('play-image.png');
context.fillStyle = 'black';
context.fillRect(0, 0, canvas.width, canvas.height);
context.drawImage(playImage, 0, 0, playImage.width, playImage.height, 0, 0, canvas.width, canvas.height);

for(const key of Object.keys(filters)){
    const option = document.createElement('option');
    option.setAttribute('value', key);
    option.innerText = key;
    filtersSelect.appendChild(option);
}

async function newImage(src){
    const img = new Image();
    img.src = src;
    return new Promise((res, rej) => {
        img.onload = () => res(img);
        img.onerror = rej;
    });
}

function draw(){
    if(video.paused || video.ended) return;
    auxContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);

    const buffer = auxContext.getImageData(0, 0, auxCanvas.width, auxCanvas.height);
    const data = buffer.data;
    const filter = state.filter;

    for(let i = 0; i < data.length; i+=4) {
        const {r, g, b} = filter(data[i], data[i+1], data[i+2]);
        data[i] = r;
        data[i+1] = g;
        data[i+2] = b;
    }

    buffer.data = data;
    context.putImageData(buffer, 0, 0);

    const pp = video.currentTime / video.duration;
    context.fillStyle = '#224466AA';
    context.fillRect(0, canvas.height - 15, canvas.width * pp, 10);
    
    window.requestAnimationFrame(draw);
}

videoInput.onchange = () => {
    const file = videoInput.files[0];
    video.src = URL.createObjectURL(file);
    videoInputMessage.textContent = videoInput.value;
};

video.onpause = () => {
    const text = '| |';
    context.font = '50px sans-serif';
    context.fillStyle = '#224466AA';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
}

filtersSelect.onchange = () => {
    const key = filtersSelect.value;
    state.filter = filters[key];
}

document.onkeydown = (e) => {
    
    switch(e.key){    
        case ' ':
            if(!video.src)
            {
                alert('Selecione um vídeo!');
                return;
            }
            if(video.paused)
            video.play();
            else
            video.pause();
            break;
        case 'ArrowLeft':
            video.currentTime = video.currentTime - 15;
            video.play();
            break;
        case 'ArrowRight':
            video.currentTime = video.currentTime + 15;
            video.play();
            break;
        case 'ArrowUp':
            video.volume += .1;
            break;
        case 'ArrowDown':
            video.volume -= .1;
            break;
        case 'F11':
            canvas.webkitRequestFullscreen();
            break;
    }
}
})();