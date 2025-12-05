const videoElement = document.getElementById('video');
const startButton = document.getElementById('startButton');

startButton.addEventListener('click', async () => {
    try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        startButton.style.display = 'none'; // Hide button after starting
    } catch (error) {
        console.error('Error accessing the camera:', error);
        // Handle errors (e.g., permission denied, no camera)
        alert('Could not access camera. Check permissions or try a different browser/device.');
    }
});
