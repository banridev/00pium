document.addEventListener("DOMContentLoaded", () => {
    const apiGrid = document.getElementById('apiGrid');

    const SUPABASE_URL = "https://rkityybavauyjgifcygd.supabase.co";
    const SUPABASE_KEY = "sb_publishable_ttPcuBHfaDH4fEOGUK-OWQ_BFVxtPe_";

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

            if (data.length === 0) {
                apiGrid.innerHTML = '<p style="color: #888; text-align: center;">NO RECORDS FOUND IN ARCHIVE.</p>';
                return;
            }

            data.forEach(item => {
                const card = `
                    <div class="api-card">
                        <h4>${item.nome}</h4>
                        <p><strong>ARTIST:</strong> ${item.artista}</p>
                        <p><strong>DATE:</strong> ${item.data_aluguel}</p>
                        <p><strong>CONTACT:</strong> ${item.telefone}</p>
                    </div>
                `;
                apiGrid.innerHTML += card;
            });

        } catch (error) {
            console.error("Erro ao consumir a API do Supabase:", error);
            apiGrid.innerHTML = '<p style="color: red; text-align: center;">[ERROR] DB CONNECTION FAILED.</p>';
        }
    }

    window.fetchOpiumDatabase = fetchOpiumDatabase;

    if (apiGrid) {
        fetchOpiumDatabase();
    }
});
