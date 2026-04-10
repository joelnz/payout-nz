document.addEventListener('DOMContentLoaded', () => {
    // Shared Share Button functionality
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                const originalText = shareBtn.innerHTML;
                shareBtn.innerHTML = '<span>✅</span> Copied!';
                
                // Track share event in GA4
                if (typeof gtag === 'function') {
                    gtag('event', 'share', {
                        'method': 'URL Copy',
                        'content_type': 'page',
                        'item_id': url
                    });
                }
                
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

    /**
     * Clamps an input element's value to its min/max attributes if present.
     * @param {HTMLInputElement} input 
     */
    window.clampInput = function(input) {
        if (!input || input.type !== 'number' && input.type !== 'text') return;
        
        const min = parseFloat(input.getAttribute('min'));
        const max = parseFloat(input.getAttribute('max'));
        
        // For text inputs (like our formatted currency fields), we need to parse manually
        let val = parseFloat(input.value.replace(/,/g, ''));
        
        if (isNaN(val)) return;

        let clamped = val;
        if (!isNaN(min) && val < min) clamped = min;
        if (!isNaN(max) && val > max) clamped = max;
        
        if (clamped !== val) {
            // If it's a number type, just set it
            if (input.type === 'number') {
                input.value = clamped;
            } else {
                // If it's a formatted text field, we'll let the specific script handle the re-formatting
                // but we update the raw numeric value if needed.
                // However, most scripts re-parse from the string, so we might need a more clever way.
                // For now, let's keep it simple for standard number inputs.
            }
        }
    };

});
