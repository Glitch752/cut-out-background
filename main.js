var video = document.createElement("video");

var canvas, progressBar, input, capturer, exportType, backgroundColor;

let frame = 0;

let rendering = false;

let frameCrops = [
    // {
    //     cropPositions: [
    //         {x: 0, y: 0},
    //         {x: 100, y: 0},
    //         {x: 100, y: 100},
    //         {x: 0, y: 100}
    //     ]
    // }
];
let frameCropMouse = {x: 0, y: 0};

video.addEventListener('loadeddata', function () {
    loadNextFrame(0);
}, false);

video.addEventListener('seeked', function () {
    if(rendering) return;

    renderCanvas();
}, false);

var playSelectedFile = function (event) {
    var file = this.files[0];
    var fileURL = URL.createObjectURL(file);
    video.src = fileURL;
    video.addEventListener( "loadedmetadata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        frameCrops = [];
        for(var i = 0; i < video.duration * 30; i++) {
            frameCrops.push({
                cropPositions: []
            })
        }
    });
}

window.onload = function() {
    canvas = document.getElementById("prevImgCanvas");
    progressBar = document.getElementById("progressBar");
    exportType = document.getElementById("exportType");
    backgroundColor = document.getElementById("backgroundColor");
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth / (16/9);
    input = document.getElementById('videoSelect');
    input.addEventListener('change', playSelectedFile, false);
    canvas.addEventListener("mousedown", canvasMouseDown);
    canvas.addEventListener("mousemove", canvasMouseMove);
    canvas.addEventListener("mouseup", canvasMouseUp);
    document.addEventListener("mouseup", documentMouseUp);
    document.addEventListener("keydown", documentKeyDown);
}

function loadNextFrame(frames) {
    if(rendering) return;

    if (!isNaN(video.duration)) {
        if(frame + (frames / 30) > video.duration) {
            return;
        }
        for(var i = Math.floor(frame * 30) + 1; i < Math.floor(frame * 30) + frames + 1; i++) {
            if(frameCrops[i].cropPositions.length === 0) {
                frameCrops[i].cropPositions = JSON.parse(JSON.stringify(
                    frameCrops[Math.floor(frame * 30)].cropPositions
                ));
            }
        }
        frame += (frames / 30);
        video.currentTime = frame;
        progressBar.style.setProperty("--progress", frame / video.duration);
    }
}

function loadLastFrame(frames) {
    if(rendering) return;

    if (!isNaN(video.duration)) {
        if(frame - (frames / 30) < 0) {
            return;
        }
        frame -= (frames / 30);
        video.currentTime = frame;
        progressBar.style.setProperty("--progress", frame / video.duration);
    }
}

function loadEnd() {
    if(rendering) return;

    if (!isNaN(video.duration)) {
        // for(var i = Math.floor(frame * 30) + 1; i < video.duration * 30; i++) {
        //     if(frameCrops[i].cropPositions.length === 0) {
        //         frameCrops[i].cropPositions = JSON.parse(JSON.stringify(
        //             frameCrops[Math.floor(frame * 30)].cropPositions
        //         ));
        //     }
        // }
        frame = video.duration;
        video.currentTime = frame;
        progressBar.style.setProperty("--progress", frame / video.duration);
    }
}

function loadStart() {
    if(rendering) return;

    if (!isNaN(video.duration)) {
        frame = 0;
        video.currentTime = frame;
        progressBar.style.setProperty("--progress", frame / video.duration);
    }
}

let mouseX = 0, mouseY = 0;
document.addEventListener("mousemove", function(e) {
    document.getElementById("progressBarLine").style.setProperty("--x", e.clientX);
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function transitionToSpot() {
    if(isNaN(video.duration)) return;

    let position = mouseX - 16;
    let width = window.innerWidth - 32;

    let progress = position / width;
    frame = video.duration * progress;
    loadNextFrame(0);
}

let circleRadius = 10;

function renderCanvas() {
    if(rendering) return;
    
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let cropPositions = frameCrops[Math.floor(frame * 30)].cropPositions;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 15]);

    if(cropPositions.length > 2) {
        ctx.fillStyle = "#ffffff44";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        for(var i = 0; i < cropPositions.length; i++) {
            ctx.lineTo(cropPositions[i].x, cropPositions[i].y);
        }
        ctx.clip();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
    ctx.beginPath();
    for(var i = 0; i < cropPositions.length; i++) {
        ctx.lineTo(cropPositions[i].x, cropPositions[i].y);
    }
    if(cropPositions.length > 2) {
        ctx.lineTo(cropPositions[0].x, cropPositions[0].y);
    }
    ctx.stroke();

    for(var i = 0; i < cropPositions.length; i++) {
        let bounds = canvas.getBoundingClientRect();
        let offsetMouseX = mouseX - bounds.left;
        let offsetMouseY = mouseY - bounds.top;
        let x = offsetMouseX / bounds.width * canvas.width;
        let y = offsetMouseY / bounds.height * canvas.height;

        if(draggingCircle === i) {
            ctx.fillStyle = "#55ffff";
        } else if(pointInCircle(cropPositions[i].x, cropPositions[i].y, circleRadius, x, y)) {
            ctx.fillStyle = "#55ff55";
        } else {
            ctx.fillStyle = "green";
        }
        ctx.beginPath();
        ctx.arc(cropPositions[i].x, cropPositions[i].y, circleRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = "grey";

    if(cropPositions.length > 0) {
        ctx.beginPath();
        ctx.moveTo(cropPositions[cropPositions.length - 1].x, cropPositions[cropPositions.length - 1].y);
        ctx.lineTo(frameCropMouse.x, frameCropMouse.y);
        ctx.stroke();
    }
}

let draggingCircle = null;

function canvasMouseDown(e) {
    if(rendering) return;
    
    let cropPositions = frameCrops[Math.floor(frame * 30)].cropPositions;

    for(var i = 0; i < cropPositions.length; i++) {
        let bounds = canvas.getBoundingClientRect();
        let offsetMouseX = mouseX - bounds.left;
        let offsetMouseY = mouseY - bounds.top;
        let x = offsetMouseX / bounds.width * canvas.width;
        let y = offsetMouseY / bounds.height * canvas.height;

        if(pointInCircle(cropPositions[i].x, cropPositions[i].y, circleRadius, x, y)) {
            draggingCircle = i;
            return;
        }
    }

    let bounds = canvas.getBoundingClientRect();
    let offsetMouseX = e.clientX - bounds.left;
    let offsetMouseY = e.clientY - bounds.top;

    let x = offsetMouseX / bounds.width * canvas.width;
    let y = offsetMouseY / bounds.height * canvas.height;

    cropPositions.push({
        x: x,
        y: y
    });

    renderCanvas();
}
function canvasMouseUp(e) {
    if(rendering) return;
    
    // draggingCircle = null;
}
function documentMouseUp(e) {
    if(rendering) return;
    
    draggingCircle = null;

    renderCanvas();
}
function canvasMouseMove(e) {
    if(rendering) return;
    
    let bounds = canvas.getBoundingClientRect();
    let offsetMouseX = e.clientX - bounds.left;
    let offsetMouseY = e.clientY - bounds.top;

    let x = offsetMouseX / bounds.width * canvas.width;
    let y = offsetMouseY / bounds.height * canvas.height;

    if(draggingCircle !== null) {
        let cropPositions = frameCrops[Math.floor(frame * 30)].cropPositions;
        for(var i = 0; i < cropPositions.length; i++) {
            if(i === draggingCircle) continue;
            if(pointInCircle(cropPositions[i].x, cropPositions[i].y, circleRadius, x, y)) {
                return;
            }
        }
        cropPositions[draggingCircle] = {
            x: x,
            y: y
        }
        renderCanvas();
        return;
    }

    frameCropMouse = {
        x: x,
        y: y
    };
    renderCanvas();
}

function pointInCircle(circleX, circleY, circleRadius, pointX, pointY) {
    let dx = circleX - pointX;
    let dy = circleY - pointY;
    return (dx * dx + dy * dy) < circleRadius * circleRadius;
}

function documentKeyDown(e) {
    if(rendering) return;
    
    let cropPositions = frameCrops[Math.floor(frame * 30)].cropPositions;

    let bounds = canvas.getBoundingClientRect();
    let offsetMouseX = mouseX - bounds.left;
    let offsetMouseY = mouseY - bounds.top;

    let x = offsetMouseX / bounds.width * canvas.width;
    let y = offsetMouseY / bounds.height * canvas.height;

    switch(e.key) {
        case "x":
            for(var i = 0; i < cropPositions.length; i++) {
                if(pointInCircle(cropPositions[i].x, cropPositions[i].y, circleRadius, x, y)) {
                    cropPositions.splice(i, 1);
                    if(draggingCircle === i) draggingCircle === null;
                    renderCanvas();
                }
            }
            break;
    }
}

let exportFrame = 0;
let firstTime = false;
let backgroundImage;

function render() {
    exportFrame = 0;
    rendering = true;
    
    for(var i = 0; i < video.duration * 30; i++) {
        if(frameCrops[i].cropPositions.length === 0) {
            if(i === 0) {
                frameCrops[i].cropPositions = JSON.parse(JSON.stringify(
                    {x: 0, y: 0},
                    {x: canvas.width, y: 0},
                    {x: canvas.width, y: canvas.height},
                    {x: 0, y: canvas.height}
                ))
            } else {
                frameCrops[i].cropPositions = JSON.parse(JSON.stringify(
                    frameCrops[i - 1].cropPositions
                ));
            }
        }
    }

    capturer = new CCapture({
        format: exportType.value ? exportType.value : "webm",
        framerate: 30,
        verbose: false
    });

    const selected = document.querySelector('input[name="background"]:checked').value;

    if(selected === "image") {
        backgroundImage = new Image();
        // backgroundImage.crossOrigin = "anonymous";
        backgroundImage.src = document.getElementById("imageUrl").value;
    }

    firstTime = true;
    requestAnimationFrame(renderExportFrame);
}

function renderExportFrame() {
    exportFrame++;
    requestAnimationFrame(renderExportFrame);

    if(firstTime) {
        firstTime = false;
        capturer.start();
    }
    if(exportFrame / 30 > video.duration) {
        stopAnimation();
        return;
    }
    video.currentTime = exportFrame / 30;
    
    let ctx = canvas.getContext("2d");
    if(exportType.value !== "gif") {
        const selected = document.querySelector('input[name="background"]:checked').value;

        if(selected === "color") {
            ctx.fillStyle = backgroundColor.value ? backgroundColor.value : "#00ff00";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let cropPositions = frameCrops[exportFrame].cropPositions;

    ctx.save();
    ctx.beginPath();
    for(var i = 0; i < cropPositions.length; i++) {
        ctx.lineTo(cropPositions[i].x, cropPositions[i].y);
    }
    ctx.clip();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    progressBar.style.setProperty("--progress", (exportFrame / 30) / video.duration);

    capturer.capture(canvas);
}

function stopAnimation() {
    capturer.stop();
    capturer.save();
    rendering = false;
}

function updateBackground() {
    const selected = document.querySelector('input[name="background"]:checked').value;
    const coloredBackground = document.getElementById("coloredBackground"), 
          urlBackground = document.getElementById("urlBackground");

    switch(selected) {
        case "color":
            coloredBackground.style.display = "block";
            urlBackground.style.display = "none";
            break;
        case "image":
            coloredBackground.style.display = "none";
            urlBackground.style.display = "block";
            break;
        default:
            coloredBackground.style.display = "none";
            urlBackground.style.display = "none";
            break;
    }
}