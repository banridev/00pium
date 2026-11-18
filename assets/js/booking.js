const SUPABASE_URL = "https://rkityybavauyjgifcygd.supabase.co";
const SUPABASE_KEY = "sb_publishable_ttPcuBHfaDH4fEOGUK-OWQ_BFVxtPe_";

let supabaseClient = null;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error("Erro: A biblioteca do Supabase não foi carregada no HTML!");
}

const bookingForm = document.getElementById('bookingForm');
const tableBody = document.getElementById('crudTableBody');
const submitBtn = document.getElementById('submitBtn');
const editIdInput = document.getElementById('editId');
const telefoneInput = document.getElementById('telefone');
const dataInput = document.getElementById('dataAluguel');

if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 6) {
            e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            e.target.value = `(${value}`;
        } else {
            e.target.value = "";
        }
    });
}

if (dataInput) {
    dataInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 8) value = value.slice(0, 8);

        if (value.length > 4) {
            e.target.value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            e.target.value = `${value.slice(0, 2)}/${value.slice(2)}`;
        } else {
            e.target.value = value;
        }
    });
}

async function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">LOADING OPIUM DATABASE...</td></tr>';

    if (supabaseClient) {
        const { data: agendamentos, error } = await supabaseClient
            .from('agendamentos')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            tableBody.innerHTML = '<tr><td colspan="6" style="color:red;">DATABASE ERROR.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        agendamentos.forEach((item) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${item.nome}</td>
                    <td>${item.telefone}</td>
                    <td>${item.email}</td>
                    <td>${item.data_aluguel}</td>
                    <td>${item.artista}</td>
                    <td>
                        <button class="action-btn" onclick="editItem('${item.id}', '${item.nome}', '${item.telefone}', '${item.email}', '${item.data_aluguel}', '${item.artista}')">EDIT</button>
                        <button class="action-btn delete" onclick="deleteItem('${item.id}')">DEL</button>
                    </td>
                </tr>
            `;
        });
    }
}

if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!supabaseClient) return alert("Banco de dados offline.");

        const artistasSelecionados = Array.from(document.querySelectorAll('input[name="artista"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        if (artistasSelecionados === "") {
            return alert("SELECT AT LEAST ONE ARTIST.");
        }

        const id = editIdInput.value;
        const formData = {
            nome: document.getElementById('nome').value,
            telefone: telefoneInput.value,
            email: document.getElementById('email').value,
            data_aluguel: dataInput.value,
            artista: artistasSelecionados
        };

        if (id === "") {
            const { error } = await supabaseClient.from('agendamentos').insert([formData]);
            if (error) return alert("Error: " + error.message);
        } else {
            const { error } = await supabaseClient.from('agendamentos').update(formData).eq('id', id);
            if (error) return alert("Error: " + error.message);
            submitBtn.textContent = "SUBMIT INQUIRY";
            editIdInput.value = "";
        }

        bookingForm.reset();
        renderTable();

        if (typeof window.fetchOpiumDatabase === 'function') {
            window.fetchOpiumDatabase();
        }
    });
}

window.editItem = function(id, nome, telefone, email, data_aluguel, artista) {
    document.getElementById('nome').value = nome;
    telefoneInput.value = telefone;
    document.getElementById('email').value = email;
    dataInput.value = data_aluguel;

    const artistArray = artista.split(', ');
    document.querySelectorAll('input[name="artista"]').forEach(cb => {
        cb.checked = artistArray.includes(cb.value);
    });

    editIdInput.value = id;
    submitBtn.textContent = "UPDATE ENTRY";
};

window.deleteItem = async function(id) {
    if (confirm("DELETE THIS INQUIRY FROM OPIUM SYSTEM PERMANENTLY?")) {
        const { error } = await supabaseClient.from('agendamentos').delete().eq('id', id);
        if (error) alert("Error deleting registry: " + error.message);
        renderTable();

        if (typeof window.fetchOpiumDatabase === 'function') {
            window.fetchOpiumDatabase();
        }
    }
};

renderTable();
