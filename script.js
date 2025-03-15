document.addEventListener("DOMContentLoaded", function () {
    const videoLinkInput = document.getElementById("videoLink");
    const checkButton = document.getElementById("check");
    const progressText = document.getElementById("progress");
    const titleElement = document.getElementById("title");
    const descriptionElement = document.getElementById("description");
    const thumbnailElement = document.getElementById("thumbnail");
    const resultElement = document.getElementById("result");
    const durationElement = document.getElementById("duration");
    const sizeElement = document.getElementById("size");
    const videoDownloadButton = document.getElementById("downloadVideo");
    const audioDownloadButton = document.getElementById("downloadAudio");

    const media = ''; // Media platform (YouTube, TikTok, Facebook, Instagram)

    resultElement.style.display = "none";




    videoLinkInput.addEventListener("input", function () {
        const videoLink = videoLinkInput.value;

        const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/|tiktok\.com\/@[a-zA-Z0-9_.-]+\/video|tiktok\.com\/t\/|facebook\.com\/(watch\/|reel\/|share\/v\/?)|fb\.watch\/|instagram\.com\/(p\/|reel\/|tv\/))([\w\-/?=.&%]+)$/;

        if (urlPattern.test(videoLink)) {
            checkButton.style.opacity = "1";
            checkButton.disabled = false;
            media = getMediaPlatform(videoLink);
        } else {
            checkButton.style.opacity = "0.5";
            checkButton.disabled = true;
        }
    });
    function getMediaPlatform(url) {
        const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/|tiktok\.com\/@[a-zA-Z0-9_.-]+\/video|tiktok\.com\/t\/|facebook\.com\/(watch\/|reel\/|share\/v\/?)|fb\.watch\/|instagram\.com\/(p\/|reel\/|tv\/))([\w\-/?=.&%]+)$/;
        
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            return "YouTube";
        } else if (url.includes("tiktok.com")) {
            return "TikTok";
        } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
            return "Facebook";
        } else if (url.includes("instagram.com")) {
            return "Instagram";
        } else {
            return "Unknown Platform";
        }
    }
    

    checkButton.addEventListener("click", function () {
        const videoLink = videoLinkInput.value;
        if (!videoLink) return;

        resultElement.style.display = "none";
        progressText.style.color = "black";
        progressText.textContent = "Checking details...";

        fetch("http://127.0.0.1:5000/details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ video_link: videoLink })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                progressText.textContent = "Error: Samething went wrong!";
                console.error("Error:", data.error);
            } else {
                resultElement.style.display = "flex";
                progressText.textContent = "Details loaded successfully!";
                progressText.style.color = "green";
                titleElement.textContent = data.title;
                descriptionElement.textContent = data.description;
                thumbnailElement.src = data.thumbnail;
                durationElement.textContent = data.duration;
                sizeElement.textContent = data.size_MB + " MB";
                console.log(data);
            }
        })
        .catch(error => {
            progressText.textContent = "Error fetching details.";
            console.error("Error:", error);
        });
    });

const platforms = ["YouTube", "TikTok", "Facebook", "Instagram"];
const mediaTypes = ["Videos", "Audio", "Image"];

let platformIndex = 0;
let mediaIndex = 0;
let typingSpeed = 100; // Speed of typing effect
let eraseSpeed = 50;   // Speed of erasing effect
let pauseBetween = 1000; // Pause before erasing

async function typeText(text, elementClass) {
    const element = document.querySelector(`.${elementClass}`);
    for (let i = 0; i <= text.length; i++) {
        element.textContent = text.substring(0, i);
        await new Promise(resolve => setTimeout(resolve, typingSpeed));
    }
}

async function eraseText(elementClass) {
    const element = document.querySelector(`.${elementClass}`);
    let text = element.textContent;
    for (let i = text.length; i >= 0; i--) {
        element.textContent = text.substring(0, i);
        await new Promise(resolve => setTimeout(resolve, eraseSpeed));
    }
}

async function startTyping() {
    while (true) {
        await typeText(platforms[platformIndex], "typing-text");
        await typeText(mediaTypes[mediaIndex], "typing-text-2");
        await new Promise(resolve => setTimeout(resolve, pauseBetween));

        await eraseText("typing-text-2");
        await eraseText("typing-text");
        
        platformIndex = (platformIndex + 1) % platforms.length;
        mediaIndex = (mediaIndex + 1) % mediaTypes.length;
    }
}

startTyping();

audioDownloadButton.addEventListener('click', function () {
    const url = document.getElementById('videoLink').value; // Get the audio URL
    const mediaType = getMediaPlatform(url); // Set the media platform (YouTube in this example)
    const downloadType = 'audio'; // Set the download type (audio in this case)

    const data = {
        url: url,
        mediaType: mediaType,
        downloadType: downloadType
    };

    // Log the data being sent to the server for debugging
    console.log('Sending data:', data);

    fetch('http://127.0.0.1:5000/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Send data as JSON
        },
        body: JSON.stringify(data) // Send the data as JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse response as JSON
    })
    .then(data => {
        console.log('Download started:', data);  // Log response from the server
    })
    .catch(error => {
        console.error('Error:', error);  // Log any error that occurs
    });
});


videoDownloadButton.addEventListener('click', function () {
    const url = document.getElementById('videoLink').value; // Get the video URL
    const mediaType = getMediaPlatform(url); // Set the media platform (YouTube in this example)
    const downloadType = 'video'; // Set the download type (video in this case)

    const data = {
        url: url,
        mediaType: mediaType,
        downloadType: downloadType
    };

    // Log the data being sent to the server for debugging
    console.log('Sending data:', data);

    fetch('http://127.0.0.1:5000/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Send data as JSON
        },
        body: JSON.stringify(data) // Send the data as JSON
    })
    .then(response => response.json())  // Expect JSON response from server
    .then(data => {
        console.log('Download started:', data);  // Log response from the server
    })
    .catch(error => {
        console.error('Error:', error);  // Log any error that occurs
    });
});
});

// I am trying to create a web app that can download videos from different platforms like YouTube, TikTok, Facebook, and Instagram. I have created a backend server using Flask that can download the videos and audios from the platforms. The backend server is working fine and I have tested it using Postman. Now I am trying to create a frontend using HTML, CSS, and JavaScript. I have created the frontend but I am facing an issue with the JavaScript code. The JavaScript code is not working as expected. I am trying to fetch the video details from the backend server and display them on the frontend. But the JavaScript code is not working as expected. I am new to JavaScript and I am not able to figure out the issue. Can someone please help me with this?
