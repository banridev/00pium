document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const container = document.querySelector('.carousel-container');
    const counterEl = document.getElementById('carouselCounter');
    const artistEl = document.getElementById('carouselArtistName');

    if (!slides.length) return;

    let currentSlide = 0;
    let autoSlideTimer = null;

    function showSlide(index) {
        currentSlide = ((index % slides.length) + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlide);
        });

        const activeSlide = slides[currentSlide];
        const numberStr = String(currentSlide + 1).padStart(2, '0');
        const totalStr = String(slides.length).padStart(2, '0');

        if (counterEl) {
            counterEl.textContent = `[${numberStr} / ${totalStr}]`;
        }
        if (artistEl && activeSlide.dataset.artist) {
            artistEl.textContent = activeSlide.dataset.artist;
        }
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 4000);
    }

    function stopAutoSlide() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
            startAutoSlide();
        });
    }

    if (container) {
        container.addEventListener('mouseenter', stopAutoSlide);
        container.addEventListener('mouseleave', startAutoSlide);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            showSlide(currentSlide + 1);
            startAutoSlide();
        } else if (e.key === 'ArrowLeft') {
            showSlide(currentSlide - 1);
            startAutoSlide();
        }
    });

    showSlide(0);
    startAutoSlide();
});
