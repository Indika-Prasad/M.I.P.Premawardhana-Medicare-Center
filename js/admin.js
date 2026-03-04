document.addEventListener('DOMContentLoaded', () => {
    // Check auth one more time for safety
    if (localStorage.getItem('adminAuth') !== 'true') return;

    let patients = JSON.parse(localStorage.getItem('medicare_patients')) || [];
    let currentEditId = null;
    let qrCode = null;

    const patientList = document.getElementById('patientList');
    const emptyState = document.getElementById('emptyState');
    const patientForm = document.getElementById('patientForm');
    const searchInput = document.getElementById('searchInput');

    function savePatients() {
        localStorage.setItem('medicare_patients', JSON.stringify(patients));
        updateStats();
        renderPatients(patients);
    }

    function updateStats() {
        document.getElementById('totalPatients').innerText = patients.length;
        document.getElementById('totalQRCodes').innerText = patients.length;
    }

    function generateId() {
        return 'PAT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    function renderPatients(dataToRender) {
        patientList.innerHTML = '';

        if (dataToRender.length === 0) {
            emptyState.classList.remove('hidden');
            patientList.parentElement.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            patientList.parentElement.classList.remove('hidden');

            dataToRender.forEach((p) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 transition group border-b border-slate-50 last:border-0';

                tr.innerHTML = `
                    <td class="p-4 pl-6 whitespace-nowrap"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold font-mono tracking-wider">${p.id}</span></td>
                    <td class="p-4 font-bold text-slate-800">${p.name}</td>
                    <td class="p-4 text-slate-500 font-medium text-sm">${p.age} years, <span class="${p.gender === 'Male' ? 'text-blue-500' : p.gender === 'Female' ? 'text-pink-500' : 'text-purple-500'}">${p.gender}</span></td>
                    <td class="p-4 text-slate-500 text-sm font-medium"><i class="fas fa-phone-alt mr-2 text-slate-300"></i>${p.phone}</td>
                    <td class="p-4 text-sm text-slate-600 font-medium truncate max-w-[150px]">${p.condition || 'N/A'}</td>
                    <td class="p-4 text-center">
                        <div class="flex items-center justify-center space-x-2">
                            <button onclick="showQRCode('${p.id}')" class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center" title="Generate QR">
                                <i class="fas fa-qrcode"></i>
                            </button>
                            <button onclick="editPatient('${p.id}')" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center" title="Edit Record">
                                <i class="fas fa-pen text-xs"></i>
                            </button>
                            <button onclick="deletePatient('${p.id}')" class="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center" title="Delete Record">
                                <i class="fas fa-trash text-xs"></i>
                            </button>
                        </div>
                    </td>
                `;
                patientList.appendChild(tr);
            });
        }
    }

    patientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('patientId').value || generateId();
        const name = document.getElementById('pName').value;
        const age = document.getElementById('pAge').value;
        const gender = document.getElementById('pGender').value;
        const phone = document.getElementById('pPhone').value;
        const condition = document.getElementById('pCondition').value;

        const patientData = { id, name, age, gender, phone, condition };

        if (currentEditId) {
            const idx = patients.findIndex(p => p.id === currentEditId);
            if (idx > -1) patients[idx] = patientData;
        } else {
            patients.unshift(patientData);
        }

        savePatients();
        closePatientModal();
        e.target.reset();
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = patients.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.id.toLowerCase().includes(term) ||
            p.phone.includes(term)
        );
        renderPatients(filtered);
    });

    // Make functions available globally for inline onclick handlers
    window.openPatientModal = () => {
        currentEditId = null;
        patientForm.reset();
        document.getElementById('patientId').value = '';
        document.getElementById('modalTitle').innerText = 'Add New Patient';
        document.getElementById('patientModal').classList.add('active');
    };

    window.closePatientModal = () => {
        document.getElementById('patientModal').classList.remove('active');
    };

    window.editPatient = (id) => {
        const p = patients.find(p => p.id === id);
        if (p) {
            currentEditId = id;
            document.getElementById('patientId').value = p.id;
            document.getElementById('pName').value = p.name;
            document.getElementById('pAge').value = p.age;
            document.getElementById('pGender').value = p.gender;
            document.getElementById('pPhone').value = p.phone;
            document.getElementById('pCondition').value = p.condition;

            document.getElementById('modalTitle').innerText = 'Edit Patient Record';
            document.getElementById('patientModal').classList.add('active');
        }
    };

    window.deletePatient = (id) => {
        if (confirm('Are you sure you want to delete this patient record?')) {
            patients = patients.filter(p => p.id !== id);
            savePatients();
        }
    };

    window.showQRCode = (id) => {
        const p = patients.find(p => p.id === id);
        if (!p) return;

        document.getElementById('qrPatientName').innerText = p.name;
        document.getElementById('qrPatientId').innerText = 'ID: ' + p.id;

        const qrcodeBox = document.getElementById('qrcodeBox');
        qrcodeBox.innerHTML = '';

        // Data to encode in QR
        const qrData = JSON.stringify({
            id: p.id,
            name: p.name,
            age: p.age,
            blood: p.blood || 'N/A', // just dummy data structure
            condition: p.condition
        });

        // Generate QR Code inline
        qrCode = new QRCode(qrcodeBox, {
            text: qrData,
            width: 180,
            height: 180,
            colorDark: "#0f172a",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        document.getElementById('qrModal').classList.add('active');
    };

    window.closeQRModal = () => {
        document.getElementById('qrModal').classList.remove('active');
    };

    // Initial render
    updateStats();
    renderPatients(patients);
});
