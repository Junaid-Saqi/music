document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Fetch dynamic data from CMS API
    fetch('/api/data')
        .then(res => res.json())
        .then(data => {
            if (data.artistName) {
                document.getElementById('siteArtistName').textContent = data.artistName;
                document.getElementById('siteLogo').textContent = data.artistName.toUpperCase();
                document.title = `${data.artistName} - Official Website`;
            }
            if (data.tagline) {
                document.getElementById('siteTagline').textContent = data.tagline;
            }
            if (data.musicReleases && data.musicReleases.length > 0) {
                const musicGrid = document.getElementById('siteMusicGrid');
                musicGrid.innerHTML = ''; // clear loading state
                data.musicReleases.forEach(embedCode => {
                    const musicItem = document.createElement('div');
                    musicItem.className = 'music-item glass-card';
                    musicItem.innerHTML = embedCode;
                    musicGrid.appendChild(musicItem);
                });
            }

            if (data.contactEmail) {
                const emailEl = document.getElementById('siteEmail');
                emailEl.textContent = data.contactEmail;
                emailEl.href = `mailto:${data.contactEmail}`;
            }
            if (data.tourDates && data.tourDates.length > 0) {
                const tourList = document.getElementById('siteTourList');
                tourList.innerHTML = ''; // clear loading state
                data.tourDates.forEach(tour => {
                    const tourItem = document.createElement('div');
                    tourItem.className = 'tour-item';
                    tourItem.innerHTML = `
                        <div class="tour-date">${tour.date}</div>
                        <div class="tour-venue">${tour.venue}</div>
                        <div class="tour-location">${tour.location}</div>
                        <a href="${tour.link}" class="ticket-btn">Tickets</a>
                    `;
                    tourList.appendChild(tourItem);
                });
            } else {
                document.getElementById('siteTourList').innerHTML = '<p style="text-align:center;color:var(--accent-color);padding:1rem;">No upcoming tours.</p>';
            }
        })
        .catch(err => console.error('Error loading site data:', err));
});
