import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { uploadImages } from '../services/api.js';  // Import your API function

const ImageCapture = () => {
    const [screenshot, setScreenshot] = useState(null);
    const [webcamImage, setWebcamImage] = useState(null);
    const videoRef = useRef(null);
    const [sessionId, setSessionId] = useState(null);
    const capturingRef = useRef(false); // Prevent double captures

    // Function to capture a screenshot with reduced resolution and compression
    const captureScreenshot = async () => {
        const canvas = await html2canvas(document.body, { scale: 0.4 }); // Reduce resolution by 40%
        canvas.toBlob(blob => {
            const file = new File([blob], 'screenshot.jpg', { type: 'image/jpeg' });
            setScreenshot(file); // Save as JPEG with compression
        }, 'image/jpeg', 0.6); // JPEG with 0.6 quality for further compression
    };

    // Function to capture webcam image with reduced resolution and compression
    const captureWebcamImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth * 0.4; // Reduce resolution by 60%
            canvas.height = videoRef.current.videoHeight * 0.4;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
                setWebcamImage(file); // Save as JPEG with compression
            }, 'image/jpeg', 0.6); // JPEG with 0.6 quality for further compression
        }
    };

    // Single capture handler to avoid multiple triggers
    const captureImages = () => {
        if (!capturingRef.current) { // Check if capturing is already in progress
            capturingRef.current = true; // Lock capture to prevent double executions
            captureScreenshot();
            captureWebcamImage();
            setTimeout(() => {
                capturingRef.current = false; // Unlock capture after 1 second
            }, 1000); // Small delay to ensure no double captures
        }
    };

    // Upload images when both are ready
    useEffect(() => {
        const upload = async () => {
            if (screenshot && webcamImage && sessionId) {
                try {
                    await uploadImages(screenshot, webcamImage, sessionId);
                    console.log('Images uploaded successfully');
                    setScreenshot(null);  // Reset after upload
                    setWebcamImage(null);  // Reset after upload
                } catch (error) {
                    console.error('Error uploading images:', error);
                }
            }
        };
        upload();
    }, [screenshot, webcamImage, sessionId]);

    // Start webcam and create session ID on component mount (session starts)
    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                // Request server to create a new session and get the session ID
                const response = await fetch('http://localhost:5000/start-session');
                const data = await response.json();
                setSessionId(data.sessionId);
            } catch (error) {
                console.error('Error accessing webcam or creating session:', error);
            }
        };
        startWebcam();

        // Set an interval to capture images every 5 seconds
        const intervalId = setInterval(() => {
            captureImages(); // Call the single capture handler
        }, 5000);

        // Clear interval on component unmount
        return () => {
            clearInterval(intervalId);
        };
    }, []); // Empty dependency array ensures this effect only runs once

    return (
        <div>
            <video ref={videoRef} autoPlay style={{ display: 'none' }} /> {/* Hidden video element */}
        </div>
    );
};

export default ImageCapture;
