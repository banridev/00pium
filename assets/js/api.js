document.addEventListener("DOMContentLoaded", () => {
    const apiGrid = document.getElementById('apiGrid');

    const SUPABASE_URL = "https://rkityybavauyjgifcygd.supabase.co";
    const SUPABASE_KEY = "sb_publishable_ttPcuBHfaDH4fEOGUK-OWQ_BFVxtPe_";

    function createFieldLine(label, value) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        p.appendChild(strong);
        p.appendChild(document.createTextNode(value || 'N/A'));
        return p;
    }

    async function fetchOpiumDatabase() {
        if (!apiGrid) return;

        try {
            const endpoint = `${SUPABASE_URL}/rest/v1/agendamentos?select=*&order=id.desc`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            apiGrid.innerHTML = '';

            if (!Array.isArray(data) || data.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.className = 'api-status-note';
                emptyMsg.textContent = 'NO RECORDS FOUND IN ARCHIVE.';
                apiGrid.appendChild(emptyMsg);
                return;
            }

            data.forEach(item => {
                const card = document.createElement('article');
                card.className = 'api-card';

                const title = document.createElement('h4');
                title.textContent = item.nome || 'UNNAMED ENTRY';

                card.appendChild(title);
                card.appendChild(createFieldLine('ARTIST', item.artista));
                card.appendChild(createFieldLine('DATE', item.data_aluguel));
                card.appendChild(createFieldLine('CONTACT', item.telefone));

                apiGrid.appendChild(card);
            });

        } catch (error) {
            console.error("Erro ao consumir a API do Supabase:", error);
            apiGrid.innerHTML = '';

            const errorBox = document.createElement('p');
            errorBox.className = 'api-status-error';
            errorBox.textContent = '[ERROR] DB CONNECTION FAILED // CHECK SUPABASE PROJECT STATUS.';
            apiGrid.appendChild(errorBox);
        }
    }

    window.fetchOpiumDatabase = fetchOpiumDatabase;

    if (apiGrid) {
        fetchOpiumDatabase();
    }
});
