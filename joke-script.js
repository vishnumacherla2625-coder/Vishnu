// Joke API configuration
const JOKE_APIS = {
    general: 'https://api.api-ninjas.com/v1/jokes',
    programming: 'https://official-joke-api.appspot.com/jokes/programming/random',
    knock_knock: 'https://official-joke-api.appspot.com/jokes/knock-knock/random'
};

// DOM Elements
const getJokeBtn = document.getElementById('getJokeBtn');
const shareBtn = document.getElementById('shareBtn');
const copyBtn = document.getElementById('copyBtn');
const jokeText = document.getElementById('jokeText');
const jokeType = document.getElementById('jokeType');
const favoritesList = document.getElementById('favoritesList');
const clearFavBtn = document.getElementById('clearFavBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const notification = document.getElementById('notification');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentJoke = '';
let favorites = JSON.parse(localStorage.getItem('jokesFavorites')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayFavorites();
    getJokeBtn.addEventListener('click', fetchJoke);
    shareBtn.addEventListener('click', shareJoke);
    copyBtn.addEventListener('click', copyJoke);
    clearFavBtn.addEventListener('click', clearFavorites);
    jokeType.addEventListener('change', fetchJoke);
});

// Fetch Joke from API
async function fetchJoke() {
    const selectedType = jokeType.value;
    showSpinner(true);
    
    try {
        let joke = '';
        
        if (selectedType === 'general') {
            joke = await fetchGeneralJoke();
        } else if (selectedType === 'programming') {
            joke = await fetchProgrammingJoke();
        } else if (selectedType === 'knock-knock') {
            joke = await fetchKnockKnockJoke();
        }
        
        currentJoke = joke;
        jokeText.textContent = joke;
        jokeText.style.animation = 'none';
        setTimeout(() => {
            jokeText.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    } catch (error) {
        jokeText.textContent = '😅 Failed to load joke. Please try again!';
        console.error('Error fetching joke:', error);
    } finally {
        showSpinner(false);
    }
}

// Fetch General Joke
async function fetchGeneralJoke() {
    try {
        const response = await fetch(JOKE_APIS.general);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        return Array.isArray(data) ? data[0].joke : data.joke;
    } catch (error) {
        throw error;
    }
}

// Fetch Programming Joke
async function fetchProgrammingJoke() {
    try {
        const response = await fetch(JOKE_APIS.programming);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        return `${data.setup}\n\n${data.punchline}`;
    } catch (error) {
        throw error;
    }
}

// Fetch Knock-Knock Joke
async function fetchKnockKnockJoke() {
    try {
        const response = await fetch(JOKE_APIS.knock_knock);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        return `${data.setup}\n\n${data.punchline}`;
    } catch (error) {
        throw error;
    }
}

// Share Joke
function shareJoke() {
    if (!currentJoke) {
        showNotification('No joke to share!');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: 'Check out this joke!',
            text: currentJoke,
            url: window.location.href
        }).catch(() => {});
    } else {
        showNotification('Share feature not supported on your device');
    }
}

// Copy Joke to Clipboard
function copyJoke() {
    if (!currentJoke) {
        showNotification('No joke to copy!');
        return;
    }
    
    navigator.clipboard.writeText(currentJoke).then(() => {
        showNotification('Joke copied to clipboard! ✓');
    }).catch(() => {
        showNotification('Failed to copy joke');
    });
}

// Add to Favorites
function addToFavorites(joke) {
    if (!favorites.includes(joke)) {
        favorites.push(joke);
        localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
        displayFavorites();
        showNotification('Added to favorites! ⭐');
    } else {
        showNotification('Already in favorites!');
    }
}

// Remove from Favorites
function removeFromFavorites(joke) {
    favorites = favorites.filter(fav => fav !== joke);
    localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
    displayFavorites();
    showNotification('Removed from favorites');
}

// Display Favorites
function displayFavorites() {
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<li style="text-align: center; color: #999;">No favorites yet. Add some jokes!</li>';
        return;
    }
    
    favorites.forEach((joke, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${joke.substring(0, 60)}${joke.length > 60 ? '...' : ''}</span>
            <button onclick="removeFromFavorites('${joke.replace(/'/g, "\\'")}')">Remove</button>
        `;
        favoritesList.appendChild(li);
    });
}

// Clear All Favorites
function clearFavorites() {
    if (favorites.length === 0) {
        showNotification('No favorites to clear');
        return;
    }
    
    if (confirm('Are you sure you want to clear all favorites?')) {
        favorites = [];
        localStorage.setItem('jokesFavorites', JSON.stringify(favorites));
        displayFavorites();
        showNotification('Favorites cleared');
    }
}

// Show Loading Spinner
function showSpinner(show) {
    loadingSpinner.classList.toggle('hidden', !show);
}

// Show Notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Add favorite button to joke display (for future enhancement)
function addFavoriteButton() {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.textContent = '⭐ Add to Favorites';
    btn.onclick = () => addToFavorites(currentJoke);
    return btn;
}