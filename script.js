const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pixelationFactor = 3; // Adjust for pixel size

// Make sure canvas has width/height
if (canvas.width === 0 || canvas.height === 0) {
    canvas.width = 320;
    canvas.height = 240;
}

// Try to get environment-facing camera, fallback to default
function startCamera() {
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } }
    })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(_ => {
        // Fallback to user/default camera
        return navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.play();
            });
    })
    .catch(err => {
        console.error("Error accessing webcam: ", err);
        alert("Could not access the camera.");
    });
}

startCamera();

// Draw pixelated frames continuously once video is playing
video.addEventListener('play', () => {
    function step() {
        drawPixelatedFrame(video, ctx, canvas.width, canvas.height, pixelationFactor);
        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
});

// Pixelation with EGA palette mapping
function drawPixelatedFrame(video, ctx, width, height, factor) {
    // Draw scaled-down video
    const scaledWidth = width / factor;
    const scaledHeight = height / factor;
    ctx.drawImage(video, 0, 0, scaledWidth, scaledHeight);

    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    // Upscale to full canvas (blocky pixels)
    ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height);

    // 16-color EGA palette
    const egaPalette = [
        [0, 0, 0],       [0, 0, 170],     [0, 170, 0],     [0, 170, 170],
        [170, 0, 0],     [170, 0, 170],   [170, 85, 0],    [170, 170, 170],
        [85, 85, 85],    [85, 85, 255],   [85, 255, 85],   [85, 255, 255],
        [255, 85, 85],   [255, 85, 255],  [255, 255, 85],  [255, 255, 255]
    ];
    function nearestColor(r, g, b) {
        let minDist = 1e9, idx = 0;
        for (let i = 0; i < egaPalette.length; i++) {
            const [pr, pg, pb] = egaPalette[i];
            const dist = (r-pr)*(r-pr) + (g-pg)*(g-pg) + (b-pb)*(b-pb);
            if (dist < minDist) { minDist = dist; idx = i; }
        }
        return egaPalette[idx];
    }

    // Map pixels to nearest EGA palette color
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const [nr, ng, nb] = nearestColor(data[i], data[i+1], data[i+2]);
        data[i] = nr; data[i+1] = ng; data[i+2] = nb;
    }
    ctx.putImageData(imageData, 0, 0);
}
