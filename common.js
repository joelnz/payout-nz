document.addEventListener('DOMContentLoaded', () => {
    // Shared Share Button functionality
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                const originalText = shareBtn.innerHTML;
                shareBtn.innerHTML = '<span>✅</span> Copied!';
                setTimeout(() => shareBtn.innerHTML = originalText, 2000);
            });
        });
    }

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-pill').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Set active state on Top Navigation
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navPills = document.querySelectorAll('.nav-pill');
    navPills.forEach(pill => {
        const href = pill.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });

});
