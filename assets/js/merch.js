document.addEventListener("DOMContentLoaded", () => {
    const buyButtons = document.querySelectorAll('.merch-buy-btn');
    const modal = document.getElementById('merchModal');
    const closeBtn = document.getElementById('closeMerchModal');
    const modalImg = document.getElementById('modalItemImg');
    const modalTitle = document.getElementById('modalItemTitle');
    const modalPrice = document.getElementById('modalItemPrice');
    const sizeButtons = document.querySelectorAll('.size-btn');
    const confirmBtn = document.getElementById('confirmOrderBtn');
    const statusMsg = document.getElementById('merchStatusMsg');

    if (!modal || !buyButtons.length) return;

    let selectedSize = 'M';
    let currentItem = '';

    function openModal(item, price, img) {
        currentItem = item;
        modalTitle.textContent = item;
        modalPrice.textContent = price;
        modalImg.src = img;
        modalImg.alt = item;
        statusMsg.textContent = '';
        statusMsg.className = 'opium-status-msg';
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
    }

    buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            openModal(btn.dataset.item, btn.dataset.price, btn.dataset.img);
        });
    });

    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.dataset.size;
        });
    });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            statusMsg.textContent = `[CONFIRMED] ${currentItem} (SIZE ${selectedSize}) RESERVED IN ARCHIVE.`;
            statusMsg.className = 'opium-status-msg success';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
});
