// Replace with your actual app credentials and redirect URI
const APP_ID = '1635785580547582';
const REDIRECT_URI = 'https://ellyevents.com';
const APP_SECRET = '65a2456be76605212b7fd2ec7aeccd0c';
const AUTH_URL = `https://api.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;

// Check if we have an access token stored
let accessToken = localStorage.getItem('instagram_access_token');

async function fetchAccessToken(code) {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'client_id': APP_ID,
            'client_secret': APP_SECRET,
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
            'code': code
        })
    });
    const data = await response.json();
    return data.access_token;
}

async function fetchMedia(token) {
    const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}`);
    const data = await response.json();
    return data.data;
}

function displayMedia(mediaItems) {
    const content = document.getElementById('content');
    content.innerHTML = ''; // Clear any previous content

    mediaItems.slice(0, 6).forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        if (item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM') {
            card.innerHTML = `
                <img src="${item.media_url}" alt="Instagram Media">
                <div class="card-content">
                    <h3>${item.caption || 'No Caption'}</h3>
                    <p>Posted on: ${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
            `;
        } else if (item.media_type === 'VIDEO' || item.media_type === 'REELS') {
            card.innerHTML = `
                <video controls width="100%">
                    <source src="${item.media_url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="card-content">
                    <h3>${item.caption || 'No Caption'}</h3>
                    <p>Posted on: ${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
            `;
        }

        content.appendChild(card);
    });
}

(async () => {
    // Check if the URL contains an authorization code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !accessToken) {
        // Fetch the access token if we have an authorization code
        try {
            accessToken = await fetchAccessToken(code);
            localStorage.setItem('instagram_access_token', accessToken);
            // Remove the code from the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Error fetching access token:', error);
        }
    }

    if (accessToken) {
        try {
            // Fetch and display media
            const media = await fetchMedia(accessToken);
            displayMedia(media);
        } catch (error) {
            console.error('Error fetching media:', error);
        }
    } else {
        // Redirect the user to authorize the app
        window.location.href = AUTH_URL;
    }
})();
