document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cmsForm');
    const tourList = document.getElementById('tourList');
    const addTourBtn = document.getElementById('addTourBtn');
    const notification = document.getElementById('notification');

    // Fetch existing data
    fetch('/api/data')
        .then(res => res.json())
        .then(data => {
            document.getElementById('artistName').value = data.artistName || '';
            document.getElementById('tagline').value = data.tagline || '';
            document.getElementById('contactEmail').value = data.contactEmail || '';
            
            if (data.musicReleases && data.musicReleases.length > 0) {
                data.musicReleases.forEach(code => addMusicItem(code));
            } else {
                addMusicItem();
            }

            if (data.tourDates && data.tourDates.length > 0) {
                data.tourDates.forEach(date => addTourItem(date));
            } else {
                addTourItem(); // add one empty by default
            }
        })
        .catch(err => showNotification('Error loading data', 'error'));

    // Add Tour Date functionality
    addTourBtn.addEventListener('click', () => addTourItem());

    // Add Music functionality
    const addMusicBtn = document.getElementById('addMusicBtn');
    const musicList = document.getElementById('musicList');
    addMusicBtn.addEventListener('click', () => addMusicItem());

    function addMusicItem(code = '') {
        const div = document.createElement('div');
        div.className = 'tour-editor-item music-editor-item';
        div.innerHTML = `
            <button type="button" class="remove-tour-btn">Remove</button>
            <div class="form-group" style="margin-bottom:0">
                <label>Spotify Embed Code</label>
                <input type="text" class="music-code" value='${code.replace(/'/g, "&apos;")}' placeholder='<iframe src="https://open.spotify.com/embed/..." ...></iframe>' required>
            </div>
        `;

        div.querySelector('.remove-tour-btn').addEventListener('click', () => {
            div.remove();
        });

        musicList.appendChild(div);
    }

    function addTourItem(data = { date: '', venue: '', location: '', link: '' }) {
        const div = document.createElement('div');
        div.className = 'tour-editor-item';
        div.innerHTML = `
            <button type="button" class="remove-tour-btn">Remove</button>
            <div class="tour-grid">
                <div class="form-group">
                    <label>Date</label>
                    <input type="text" class="tour-date" value="${data.date}" placeholder="e.g. Nov 15" required>
                </div>
                <div class="form-group">
                    <label>Venue</label>
                    <input type="text" class="tour-venue" value="${data.venue}" placeholder="e.g. The Echo Lounge" required>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" class="tour-location" value="${data.location}" placeholder="e.g. Los Angeles, CA" required>
                </div>
                <div class="form-group">
                    <label>Ticket Link</label>
                    <input type="text" class="tour-link" value="${data.link}" placeholder="e.g. https://tickets.com" required>
                </div>
            </div>
        `;

        div.querySelector('.remove-tour-btn').addEventListener('click', () => {
            div.remove();
        });

        tourList.appendChild(div);
    }

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const tourItems = [];
        document.querySelectorAll('.tour-editor-item').forEach(item => {
            tourItems.push({
                date: item.querySelector('.tour-date').value,
                venue: item.querySelector('.tour-venue').value,
                location: item.querySelector('.tour-location').value,
                link: item.querySelector('.tour-link').value
            });
        });

        const musicItems = [];
        document.querySelectorAll('.music-editor-item').forEach(item => {
            musicItems.push(item.querySelector('.music-code').value);
        });

        const newData = {
            artistName: document.getElementById('artistName').value,
            tagline: document.getElementById('tagline').value,
            contactEmail: document.getElementById('contactEmail').value,
            musicReleases: musicItems,
            tourDates: tourItems
        };

        fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                showNotification('Changes saved successfully! The live site will now reflect these updates.', 'success');
            } else {
                showNotification('Failed to save changes.', 'error');
            }
        })
        .catch(err => {
            showNotification('Error saving data.', 'error');
        })
        .finally(() => {
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
        });
    });

    function showNotification(msg, type) {
        notification.textContent = msg;
        notification.className = `notification ${type}`;
        setTimeout(() => {
            notification.style.display = 'none';
            notification.className = 'notification';
        }, 5000);
    }
});
