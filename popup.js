document.addEventListener('DOMContentLoaded', () => {
    restoreCheckboxStates();

    document.getElementById('apply').addEventListener('click', () => {
        saveCheckboxStates();
        applyEffects();
    });

    document.getElementById('reset').addEventListener('click', resetEffects);

    document.getElementById('hue').addEventListener('input', function() {
        document.getElementById('hueValue').textContent = this.value;
        chrome.storage.local.set({ hueValue: this.value });
    });
});

function saveCheckboxStates() {
    const checkboxStates = {
        invertPage: document.getElementById('invertPage').checked,
        invertImages: document.getElementById('invertImages').checked,
        invertVideos: document.getElementById('invertVideos').checked,
        grayscalePage: document.getElementById('grayscalePage').checked,
        grayscaleImages: document.getElementById('grayscaleImages').checked,
        grayscaleVideos: document.getElementById('grayscaleVideos').checked
    };
    chrome.storage.local.set(checkboxStates);
}

function restoreCheckboxStates() {
    const checkboxIds = ['invertPage', 'invertImages', 'invertVideos', 'grayscalePage', 'grayscaleImages', 'grayscaleVideos'];

    chrome.storage.local.get([...checkboxIds, 'hueValue'], (items) => {
        checkboxIds.forEach(id => {
            if (typeof items[id] !== 'undefined') {
                document.getElementById(id).checked = items[id];
            } else {
                document.getElementById(id).checked = false;
            }
        });
        const hueValue = items.hueValue || 180; // Default hue value is 180
        document.getElementById('hue').value = hueValue;
        document.getElementById('hueValue').textContent = hueValue;
    });
}

function applyEffects() {
    const invertPage = document.getElementById('invertPage').checked;
    const invertImages = document.getElementById('invertImages').checked;
    const invertVideos = document.getElementById('invertVideos').checked;
    const grayscalePage = document.getElementById('grayscalePage').checked;
    const grayscaleImages = document.getElementById('grayscaleImages').checked;
    const grayscaleVideos = document.getElementById('grayscaleVideos').checked;
    const hueValue = document.getElementById('hue').value;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: (invertPage, invertImages, invertVideos, grayscalePage, grayscaleImages, grayscaleVideos, hueValue) => {
                const pageFilter = `${grayscalePage ? 'grayscale(1)' : ''} ${invertPage ? 'invert(1)' : ''} hue-rotate(${hueValue}deg)`;
                document.documentElement.style.filter = pageFilter.trim();

                const images = document.querySelectorAll('img');
                images.forEach((img) => {
                    const imgFilter = `${grayscaleImages ? 'grayscale(1)' : ''} ${invertImages ? 'invert(1)' : ''} hue-rotate(${hueValue}deg)`;
                    img.style.filter = imgFilter.trim();
                });

                const videos = document.querySelectorAll('video');
                videos.forEach((video) => {
                    const videoFilter = `${grayscaleVideos ? 'grayscale(1)' : ''} ${invertVideos ? 'invert(1)' : ''} hue-rotate(${hueValue}deg)`;
                    video.style.filter = videoFilter.trim();
                });
            },
            args: [invertPage, invertImages, invertVideos, grayscalePage, grayscaleImages, grayscaleVideos, hueValue]
        });
    });
}

function resetEffects() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
                document.documentElement.style.filter = '';

                document.querySelectorAll('img').forEach(img => img.style.filter = '');
                document.querySelectorAll('video').forEach(video => video.style.filter = '');
            }
        });

        // Reset checkboxes and hue to default
        const resetStates = {
            invertPage: false,
            invertImages: false,
            invertVideos: false,
            grayscalePage: false,
            grayscaleImages: false,
            grayscaleVideos: false,
            hueValue: 180
        };

        chrome.storage.local.set(resetStates, () => {
            restoreCheckboxStates();  // Refresh UI state
        });
    });
}