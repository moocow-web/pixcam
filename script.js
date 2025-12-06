const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pixelationFactor = 3; // Adjust this value for different pixel sizes

// 1. Get access to the webcam (or use a source video file)
navigator.mediaDevices.getUserMedia({
    video: { facingMode: { exact: "environment" } }
})
.then(stream => {
    video.srcObject = stream;
    video.play();
})
.catch(err => {
    // Fallback to default camera if environment camera isn’t found
    return navigator.mediaDevices.getUserMedia({ video: true });
})
.then(stream => {
    // This will only run if fallback is used
    if (stream) {
        video.srcObject = stream;
        video.play();
    }
})
.catch(err => {
    console.error("Error accessing webcam: ", err);
});

// 2. Process the video frame by frame
video.addEventListener('play', () => {
    function step() {
        drawPixelatedFrame(video, ctx, canvas.width, canvas.height, pixelationFactor);
        requestAnimationFrame(step); // Loop the process
    }
    requestAnimationFrame(step);
});

// 3. Pixelation function with 1-bit conversion
function drawPixelatedFrame(video, ctx, width, height, factor) {
    // Draw the current video frame onto the canvas at a reduced scale
    const scaledWidth = width / factor;
    const scaledHeight = height / factor;
    
    ctx.drawImage(video, 0, 0, scaledWidth, scaledHeight);

    // Turn off image smoothing (aliasing) so pixels look blocky when scaled up
    ctx.imageSmoothingEnabled = false; 
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    // Draw the small, pixelated image back onto the full canvas size
// Define a 16-color (EGA) palette
const egaPalette = [
    [0, 0, 0],       // 0: Black
    [0, 0, 170],     // 1: Blue
    [0, 170, 0],     // 2: Green
    [0, 170, 170],   // 3: Cyan
    [170, 0, 0],     // 4: Red
    [170, 0, 170],   // 5: Magenta
    [170, 85, 0],    // 6: Brown
    [170, 170, 170], // 7: Light gray
    [85, 85, 85],    // 8: Dark gray
    [85, 85, 255],   // 9: Light blue
    [85, 255, 85],   // 10: Light green
    [85, 255, 255],  // 11: Light cyan
    [255, 85, 85],   // 12: Light red
    [255, 85, 255],  // 13: Light magenta
    [255, 255, 85],  // 14: Yellow
    [255, 255, 255], // 15: White
];

// Helper: Find nearest EGA palette color
function nearestColor(r, g, b) {
    let minDist = 1e9, idx = 0;
    for (let i = 0; i < egaPalette.length; i++) {
        const pr = egaPalette[i][0], pg = egaPalette[i][1], pb = egaPalette[i][2];
        const dist = (r-pr)*(r-pr) + (g-pg)*(g-pg) + (b-pb)*(b-pb);
        if (dist < minDist) {
            minDist = dist;
            idx = i;
        }
    }
    return egaPalette[idx];
}

// Replace this section inside drawPixelatedFrame
for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Find the nearest EGA palette color for 4-bit
    const [nr, ng, nb] = nearestColor(r, g, b);

    data[i]     = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
    // Alpha channel remains unchanged
}
    }
    ctx.putImageData(imageData, 0, 0);
}
