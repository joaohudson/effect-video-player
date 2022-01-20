(async function(){

const videoInput = document.getElementById('videoInput');
const videoInputMessage = document.getElementById('videoInputMessage');
const filtersSelect = document.getElementById('filtersSelect');
const effectChecbox = document.getElementById('effectCheckbox');

const video = document.createElement('video');

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const auxCanvas = document.createElement('canvas');
auxCanvas.width = canvas.width;
auxCanvas.height = canvas.height;
const auxContext = auxCanvas.getContext('2d');

const DT = 1/60;

const state = {
    filter: filters.None,
    particles: [],
    particlesEnabled: true
};

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

function rgbaToHex(r, g, b, a){
    return '#' + r.toString(16) + g.toString(16) + b.toString(16) + a.toString(16);
}

function disorderedRemove(array, index){
    const value = array[index];
    const last = array.length - 1;
    array[index] = array[last];
    array[last] = value;
    array.length--;
}

function update(){
    if(video.paused || video.ended) 
        return;

    draw();
    updateParticles();
    window.requestAnimationFrame(update);
}

function createParticle(x, y, count){
    for(let i = 0; i < count; i++)
    {
        state.particles.push({
            x: x,
            y: y,
            dx: -60,
            dy: Math.random() * 36 - 18,
            lifeTime: .6
        });
    }
}

function updateParticles(){
    const prevComposite = context.globalCompositeOperation;
    context.globalCompositeOperation = 'lighter';

    for(let i = 0; i < state.particles.length; i++){
        const p = state.particles[i];
        p.x += p.dx * DT;
        p.y += p.dy * DT;
        p.lifeTime -= DT;

        if(p.lifeTime <= 0){
            disorderedRemove(state.particles, i);
            i--;
            continue;
        }

        context.beginPath();
        context.fillStyle = rgbaToHex(220, 240, 250, p.lifeTime * 120);
        context.arc(p.x, p.y, 7.5 * p.lifeTime, 0, 360);
        context.fill();
        context.closePath();
    }
    context.globalCompositeOperation = prevComposite;
}

function draw(){
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
    
    if(state.particlesEnabled)
        createParticle(canvas.width * pp, canvas.height - 10, 3);
}

videoInput.onchange = () => {
    const file = videoInput.files[0];
    video.src = URL.createObjectURL(file);
    videoInputMessage.textContent = videoInput.value;
};

video.addEventListener('play', function(){
    update();
},false);

video.onpause = () => {
    const text = '| |';
    context.font = 'bold 50px sans-serif';
    context.fillStyle = '#224466AA';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
}

effectChecbox.onclick = (e) => {
    state.particlesEnabled = effectChecbox.checked;
}

filtersSelect.onchange = () => {
    const key = filtersSelect.value;
    state.filter = filters[key];
}

canvas.onmousedown = (e) => {
    const mx = (e.clientX - canvas.offsetLeft) * (canvas.width / canvas.clientWidth);
    const my = (e.clientY - canvas.offsetTop) * (canvas.height / canvas.clientHeight);

    //clicando na barra de progresso
    if(my > canvas.height - 25){
        const pp = mx / canvas.width;
        video.currentTime = pp * video.duration;
        video.play();
    }
    //qualquer outro lugar serve para play e pause
    else{
        if(!video.src){
            alert('Select a video!');
            return;
        }

        if(video.paused || video.ended){
            video.play();
        }
        else{
            video.pause();
        }
    }
};

document.onkeydown = (e) => {

    e.preventDefault();
    
    switch(e.key){    
        case ' ':
            if(!video.src)
            {
                alert('Selec a video!');
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