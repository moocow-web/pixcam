const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pixelationFactor = 3; // Adjust this value for different pixel sizes

// 1. Get access to the webcam (or use a source video file)
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
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
    ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height);

    // ---- 1-bit color conversion ----
    // Get the image data from the canvas
    let imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;
    const threshold = 127; // Luminance threshold for black & white

    for (let i = 0; i < data.length; i += 4) {
        // Calculate luminance (perceptual brightness)
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        // Set pixel to black or white based on the threshold
        const value = luminance < threshold ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = value;
        // Alpha channel remains unchanged
    }
    ctx.putImageData(imageData, 0, 0);
}
