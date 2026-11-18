const SUPABASE_URL = "https://rkityybavauyjgifcygd.supabase.co";
const SUPABASE_KEY = "sb_publishable_ttPcuBHfaDH4fEOGUK-OWQ_BFVxtPe_";

let supabaseClient = null;

if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.warn("Supabase library not loaded.");
}

const bookingForm = document.getElementById('bookingForm');
const tableBody = document.getElementById('crudTableBody');
const submitBtn = document.getElementById('submitBtn');
const editIdInput = document.getElementById('editId');
const nomeInput = document.getElementById('nome');
const telefoneInput = document.getElementById('telefone');
const emailInput = document.getElementById('email');
const dataInput = document.getElementById('dataAluguel');
const feedbackEl = document.getElementById('formFeedback');

function setFeedback(message, type = 'error') {
    if (!feedbackEl) {
        alert(message);
        return;
    }
    feedbackEl.textContent = message;
    feedbackEl.className = `opium-status-msg ${type === 'success' ? 'success' : 'error'}`;
}

function clearFeedback() {
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'opium-status-msg';
    }
}

function preselectArtistFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const artistParam = params.get('artist');
    if (!artistParam) return;

    const requested = artistParam.split(',').map(a => a.trim().toUpperCase());
    document.querySelectorAll('input[name="artista"]').forEach(cb => {
        if (requested.includes(cb.value.toUpperCase())) {
            cb.checked = true;
        }
    });
}

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

function isValidDate(dateStr) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
    if (!match) return false;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (month < 1 || month > 12 || year < 2024 || year > 2100) return false;
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

async function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">LOADING OPIUM DATABASE...</td></tr>';

    if (!supabaseClient) {
        tableBody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">DATABASE OFFLINE.</td></tr>';
        return;
    }

    try {
        const { data: agendamentos, error } = await supabaseClient
            .from('agendamentos')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            tableBody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">DATABASE ERROR.</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        agendamentos.forEach((item) => {
            const tr = document.createElement('tr');

            [item.nome, item.telefone, item.email, item.data_aluguel, item.artista].forEach(val => {
                const td = document.createElement('td');
                td.textContent = val || '';
                tr.appendChild(td);
            });

            const actionTd = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'action-btn';
            editBtn.textContent = 'EDIT';
            editBtn.addEventListener('click', () => window.editItem(
                item.id,
                item.nome || '',
                item.telefone || '',
                item.email || '',
                item.data_aluguel || '',
                item.artista || ''
            ));

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'action-btn delete';
            delBtn.textContent = 'DEL';
            delBtn.addEventListener('click', () => window.deleteItem(item.id));

            actionTd.append(editBtn, delBtn);
            tr.appendChild(actionTd);
            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error("Database connection error:", err);
        tableBody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">[ERROR] DB CONNECTION FAILED.</td></tr>';
    }
}

if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFeedback();

        const nome = nomeInput ? nomeInput.value.trim() : '';
        const telefone = telefoneInput ? telefoneInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const dataAluguel = dataInput ? dataInput.value.trim() : '';

        if (nome.length < 2) {
            return setFeedback('[ERROR] ENTER A VALID FULL NAME.');
        }

        const digitsPhone = telefone.replace(/\D/g, '');
        if (digitsPhone.length < 10 || digitsPhone.length > 11) {
            return setFeedback('[ERROR] ENTER A VALID PHONE NUMBER: (00) 00000-0000.');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return setFeedback('[ERROR] ENTER A VALID EMAIL ADDRESS.');
        }

        if (!isValidDate(dataAluguel)) {
            return setFeedback('[ERROR] ENTER A VALID RENTAL DATE: DD/MM/YYYY.');
        }

        const artistasSelecionados = Array.from(document.querySelectorAll('input[name="artista"]:checked'))
            .map(cb => cb.value)
            .join(', ');

        if (artistasSelecionados === "") {
            return setFeedback('[ERROR] SELECT AT LEAST ONE ARTIST.');
        }

        if (!supabaseClient) {
            return setFeedback('[ERROR] SUPABASE CLIENT UNAVAILABLE / OFFLINE.');
        }

        const originalBtnText = submitBtn ? submitBtn.textContent : 'SUBMIT INQUIRY';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'TRANSMITTING...';
        }

        try {
            const id = editIdInput ? editIdInput.value : '';
            const formData = {
                nome,
                telefone,
                email,
                data_aluguel: dataAluguel,
                artista: artistasSelecionados
            };

            if (id === "") {
                const { error } = await supabaseClient.from('agendamentos').insert([formData]);
                if (error) {
                    setFeedback(`[ERROR] ${error.message.toUpperCase()}`);
                    return;
                }
                setFeedback('[SUCCESS] INQUIRY REGISTERED IN OPIUM SYSTEM.', 'success');
            } else {
                const { error } = await supabaseClient.from('agendamentos').update(formData).eq('id', id);
                if (error) {
                    setFeedback(`[ERROR] ${error.message.toUpperCase()}`);
                    return;
                }
                if (editIdInput) editIdInput.value = "";
                setFeedback('[SUCCESS] INQUIRY ENTRY UPDATED.', 'success');
            }

            bookingForm.reset();
            if (submitBtn) submitBtn.textContent = "SUBMIT INQUIRY";
            await renderTable();

            if (typeof window.fetchOpiumDatabase === 'function') {
                await window.fetchOpiumDatabase();
            }
        } catch (err) {
            console.error("Submission error:", err);
            setFeedback('[ERROR] UNABLE TO REACH SUPABASE SERVER (OFFLINE OR PROJECT PAUSED).');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                if (submitBtn.textContent === 'TRANSMITTING...') {
                    submitBtn.textContent = originalBtnText;
                }
            }
        }
    });
}

window.editItem = function(id, nome, telefone, email, data_aluguel, artista) {
    if (nomeInput) nomeInput.value = nome;
    if (telefoneInput) telefoneInput.value = telefone;
    if (emailInput) emailInput.value = email;
    if (dataInput) dataInput.value = data_aluguel;

    const artistArray = artista.split(',').map(a => a.trim());
    document.querySelectorAll('input[name="artista"]').forEach(cb => {
        cb.checked = artistArray.includes(cb.value);
    });

    if (editIdInput) editIdInput.value = id;
    if (submitBtn) submitBtn.textContent = "UPDATE ENTRY";
    clearFeedback();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteItem = async function(id) {
    if (!supabaseClient) {
        return setFeedback('[ERROR] DATABASE OFFLINE.');
    }
    if (confirm("DELETE THIS INQUIRY FROM OPIUM SYSTEM PERMANENTLY?")) {
        try {
            const { error } = await supabaseClient.from('agendamentos').delete().eq('id', id);
            if (error) {
                setFeedback(`[ERROR] ${error.message.toUpperCase()}`);
                return;
            }
            setFeedback('[SUCCESS] INQUIRY REMOVED FROM SYSTEM.', 'success');
            await renderTable();

            if (typeof window.fetchOpiumDatabase === 'function') {
                await window.fetchOpiumDatabase();
            }
        } catch (err) {
            console.error("Delete error:", err);
            setFeedback('[ERROR] DB CONNECTION FAILED.');
        }
    }
};

preselectArtistFromQuery();
renderTable();
