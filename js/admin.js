// Variables globales pour l'administration
let isAuthenticated = false;
let adminNFTsData = [];
let currentEditingNFT = null;
const ADMIN_PASSWORD_HASH = 'bioglyphs2025'; // Mot de passe simple pour la démo

// Initialisation de l'interface d'administration
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// Fonction d'initialisation principale
function initializeAdmin() {
    checkAuthentication();
    setupEventListeners();
    setupMobileMenu();
}

// Vérification de l'authentification
function checkAuthentication() {
    const savedAuth = localStorage.getItem('bioglyphs-admin-auth');
    if (savedAuth === ADMIN_PASSWORD_HASH) {
        isAuthenticated = true;
        showDashboard();
    } else {
        showLoginForm();
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Boutons du dashboard
    const addNFTBtn = document.getElementById('add-nft-btn');
    const exportDataBtn = document.getElementById('export-data-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (addNFTBtn) {
        addNFTBtn.addEventListener('click', showAddNFTForm);
    }
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Recherche et filtres
    const searchInput = document.getElementById('search-nfts');
    const filterStatus = document.getElementById('filter-status');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterNFTs, 300));
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', filterNFTs);
    }
    
    // Formulaire NFT
    const nftForm = document.getElementById('nft-form');
    const closeFormModal = document.getElementById('close-form-modal');
    const cancelForm = document.getElementById('cancel-form');
    const addAttributeBtn = document.getElementById('add-attribute-btn');
    
    if (nftForm) {
        nftForm.addEventListener('submit', handleNFTSubmit);
    }
    
    if (closeFormModal) {
        closeFormModal.addEventListener('click', closeNFTForm);
    }
    
    if (cancelForm) {
        cancelForm.addEventListener('click', closeNFTForm);
    }
    
    if (addAttributeBtn) {
        addAttributeBtn.addEventListener('click', addAttributeField);
    }
    
    // Modal de confirmation
    const closeConfirmModal = document.getElementById('close-confirm-modal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmOk = document.getElementById('confirm-ok');
    
    if (closeConfirmModal) {
        closeConfirmModal.addEventListener('click', closeConfirmModal);
    }
    
    if (confirmCancel) {
        confirmCancel.addEventListener('click', closeConfirmModal);
    }
    
    // Fermeture des modals en cliquant à l'extérieur
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            if (e.target.id === 'nft-form-modal') {
                closeNFTForm();
            } else if (e.target.id === 'confirm-modal') {
                closeConfirmModal();
            }
        }
    });
}

// Gestion de la connexion
function handleLogin(e) {
    e.preventDefault();
    
    const passwordInput = document.getElementById('admin-password');
    const errorDiv = document.getElementById('login-error');
    const password = passwordInput.value.trim();
    
    if (password === ADMIN_PASSWORD_HASH) {
        isAuthenticated = true;
        localStorage.setItem('bioglyphs-admin-auth', ADMIN_PASSWORD_HASH);
        showDashboard();
        errorDiv.style.display = 'none';
    } else {
        errorDiv.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Affichage du dashboard
function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    
    loadNFTsData();
    updateDashboardStats();
}

// Affichage du formulaire de connexion
function showLoginForm() {
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

// Déconnexion
function logout() {
    showConfirmModal(
        'Confirmer la déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        function() {
            isAuthenticated = false;
            localStorage.removeItem('bioglyphs-admin-auth');
            showLoginForm();
            closeConfirmModal();
        }
    );
}

// Chargement des données NFT
async function loadNFTsData() {
    try {
        const response = await fetch('data/nfts.json');
        if (response.ok) {
            adminNFTsData = await response.json();
        } else {
            adminNFTsData = [];
        }
        
        displayNFTsTable();
        updateDashboardStats();
        
    } catch (error) {
        console.error('Erreur lors du chargement des NFTs:', error);
        adminNFTsData = [];
        displayNFTsTable();
    }
}

// Affichage du tableau des NFTs
function displayNFTsTable() {
    const tableBody = document.getElementById('nfts-table-body');
    const noNFTsMessage = document.getElementById('no-nfts-message');
    
    if (!tableBody) return;
    
    if (adminNFTsData.length === 0) {
        tableBody.innerHTML = '';
        if (noNFTsMessage) {
            noNFTsMessage.style.display = 'block';
        }
        return;
    }
    
    if (noNFTsMessage) {
        noNFTsMessage.style.display = 'none';
    }
    
    tableBody.innerHTML = adminNFTsData.map(nft => `
        <tr>
            <td>
                <img src="${nft.media.preview_gif}" 
                     alt="${nft.name}" 
                     class="nft-preview"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiPk5GVDwvdGV4dD4KPC9zdmc+Cg=='">
            </td>
            <td>
                <div class="nft-name">${nft.name}</div>
            </td>
            <td>
                <div class="nft-id">${nft.id}</div>
            </td>
            <td>
                <div class="nft-date">${formatDate(nft.created_at)}</div>
            </td>
            <td>
                <div class="nft-date">${formatDate(nft.updated_at)}</div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn-small edit" onclick="editNFT('${nft.id}')" title="Modifier">
                        ✏️
                    </button>
                    <button class="action-btn-small" onclick="viewNFT('${nft.id}')" title="Voir">
                        👁️
                    </button>
                    <button class="action-btn-small delete" onclick="deleteNFT('${nft.id}')" title="Supprimer">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Mise à jour des statistiques du dashboard
function updateDashboardStats() {
    const totalNFTs = adminNFTsData.length;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // NFTs ajoutés ce mois
    const recentNFTs = adminNFTsData.filter(nft => {
        const createdDate = new Date(nft.created_at);
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear;
    }).length;
    
    // NFTs modifiés récemment (derniers 7 jours)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const updatedNFTs = adminNFTsData.filter(nft => {
        const updatedDate = new Date(nft.updated_at);
        return updatedDate >= weekAgo;
    }).length;
    
    // Dernière sauvegarde
    const lastBackup = localStorage.getItem('bioglyphs-last-backup');
    const backupDate = lastBackup ? formatDate(lastBackup) : 'Jamais';
    
    // Mise à jour des éléments
    document.getElementById('total-nfts').textContent = totalNFTs;
    document.getElementById('recent-nfts').textContent = recentNFTs;
    document.getElementById('updated-nfts').textContent = updatedNFTs;
    document.getElementById('backup-date').textContent = backupDate;
}

// Filtrage des NFTs
function filterNFTs() {
    const searchTerm = document.getElementById('search-nfts')?.value.toLowerCase().trim() || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';
    
    let filteredData = adminNFTsData;
    
    // Filtre de recherche
    if (searchTerm) {
        filteredData = filteredData.filter(nft => 
            nft.name.toLowerCase().includes(searchTerm) ||
            nft.id.toLowerCase().includes(searchTerm) ||
            nft.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtre de statut (pour l'instant, tous sont considérés comme actifs)
    if (statusFilter === 'draft') {
        filteredData = []; // Aucun brouillon pour l'instant
    }
    
    // Mettre à jour l'affichage avec les données filtrées
    const originalData = adminNFTsData;
    adminNFTsData = filteredData;
    displayNFTsTable();
    adminNFTsData = originalData;
}

// Affichage du formulaire d'ajout de NFT
function showAddNFTForm() {
    currentEditingNFT = null;
    document.getElementById('form-title').textContent = 'Ajouter un NFT';
    document.getElementById('submit-text').textContent = 'Ajouter le NFT';
    
    // Réinitialiser le formulaire
    document.getElementById('nft-form').reset();
    clearAttributeFields();
    addDefaultAttributes();
    
    document.getElementById('nft-form-modal').style.display = 'flex';
}

// Modification d'un NFT
function editNFT(nftId) {
    const nft = adminNFTsData.find(n => n.id === nftId);
    if (!nft) return;
    
    currentEditingNFT = nft;
    document.getElementById('form-title').textContent = 'Modifier le NFT';
    document.getElementById('submit-text').textContent = 'Sauvegarder les modifications';
    
    // Remplir le formulaire avec les données existantes
    fillFormWithNFTData(nft);
    
    document.getElementById('nft-form-modal').style.display = 'flex';
}

// Remplissage du formulaire avec les données du NFT
function fillFormWithNFTData(nft) {
    document.getElementById('nft-id').value = nft.id;
    document.getElementById('nft-name').value = nft.name;
    document.getElementById('nft-description').value = nft.description;
    document.getElementById('animation-url').value = nft.media.animation_url;
    document.getElementById('preview-gif').value = nft.media.preview_gif;
    document.getElementById('viewer-html').value = nft.media.viewer_html;
    document.getElementById('metadata-json').value = nft.media.metadata_json || '';
    document.getElementById('opensea-url').value = nft.opensea_url || '';
    
    // Remplir les attributs
    clearAttributeFields();
    if (nft.attributes && nft.attributes.length > 0) {
        nft.attributes.forEach(attr => {
            addAttributeField(attr.trait_type, attr.value);
        });
    } else {
        addDefaultAttributes();
    }
}

// Suppression d'un NFT
function deleteNFT(nftId) {
    const nft = adminNFTsData.find(n => n.id === nftId);
    if (!nft) return;
    
    showConfirmModal(
        'Supprimer le NFT',
        `Êtes-vous sûr de vouloir supprimer "${nft.name}" ? Cette action est irréversible.`,
        function() {
            adminNFTsData = adminNFTsData.filter(n => n.id !== nftId);
            saveNFTsData();
            displayNFTsTable();
            updateDashboardStats();
            closeConfirmModal();
            showSuccessMessage('NFT supprimé avec succès');
        }
    );
}

// Visualisation d'un NFT
function viewNFT(nftId) {
    window.open(`nft-details.html?id=${nftId}`, '_blank');
}

// Gestion du formulaire NFT
function handleNFTSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nftData = {
        id: formData.get('id').trim(),
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        media: {
            animation_url: formData.get('animation_url').trim(),
            preview_gif: formData.get('preview_gif').trim(),
            viewer_html: formData.get('viewer_html').trim(),
            metadata_json: formData.get('metadata_json').trim() || null
        },
        opensea_url: formData.get('opensea_url').trim() || null,
        attributes: collectAttributes(),
        created_at: currentEditingNFT ? currentEditingNFT.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Validation
    if (!validateNFTData(nftData)) {
        return;
    }
    
    // Vérifier l'unicité de l'ID
    if (!currentEditingNFT && adminNFTsData.some(nft => nft.id === nftData.id)) {
        showFieldError('nft-id', 'Cet ID existe déjà');
        return;
    }
    
    // Ajouter ou modifier le NFT
    if (currentEditingNFT) {
        const index = adminNFTsData.findIndex(nft => nft.id === currentEditingNFT.id);
        if (index !== -1) {
            adminNFTsData[index] = nftData;
        }
        showSuccessMessage('NFT modifié avec succès');
    } else {
        adminNFTsData.push(nftData);
        showSuccessMessage('NFT ajouté avec succès');
    }
    
    saveNFTsData();
    displayNFTsTable();
    updateDashboardStats();
    closeNFTForm();
}

// Validation des données NFT
function validateNFTData(nftData) {
    let isValid = true;
    
    // Réinitialiser les erreurs
    clearFormErrors();
    
    // Validation de l'ID
    if (!nftData.id || !/^[a-zA-Z0-9_]+$/.test(nftData.id)) {
        showFieldError('nft-id', 'ID invalide (lettres, chiffres, tirets bas uniquement)');
        isValid = false;
    }
    
    // Validation du nom
    if (!nftData.name || nftData.name.length < 3) {
        showFieldError('nft-name', 'Le nom doit contenir au moins 3 caractères');
        isValid = false;
    }
    
    // Validation de la description
    if (!nftData.description || nftData.description.length < 10) {
        showFieldError('nft-description', 'La description doit contenir au moins 10 caractères');
        isValid = false;
    }
    
    // Validation des URLs
    const urlFields = [
        { field: 'animation-url', value: nftData.media.animation_url, name: 'URL de la vidéo' },
        { field: 'preview-gif', value: nftData.media.preview_gif, name: 'URL du GIF' },
        { field: 'viewer-html', value: nftData.media.viewer_html, name: 'URL du viewer' }
    ];
    
    urlFields.forEach(({ field, value, name }) => {
        if (!value || !isValidURL(value)) {
            showFieldError(field, `${name} invalide`);
            isValid = false;
        }
    });
    
    return isValid;
}

// Validation d'URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Affichage d'erreur de champ
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('error');
        
        // Supprimer l'ancienne erreur
        const existingError = formGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Ajouter la nouvelle erreur
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }
}

// Effacement des erreurs de formulaire
function clearFormErrors() {
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });
    
    document.querySelectorAll('.field-error').forEach(error => {
        error.remove();
    });
}

// Gestion des attributs
function addAttributeField(traitType = '', value = '') {
    const container = document.getElementById('attributes-container');
    const attributeDiv = document.createElement('div');
    attributeDiv.className = 'attribute-item';
    
    attributeDiv.innerHTML = `
        <div class="form-group">
            <label>Type d'attribut</label>
            <input type="text" class="attribute-type" value="${traitType}" placeholder="ex: Form, Behavior">
        </div>
        <div class="form-group">
            <label>Valeur</label>
            <input type="text" class="attribute-value" value="${value}" placeholder="ex: Glider, Mobile">
        </div>
        <button type="button" class="remove-attribute-btn" onclick="removeAttributeField(this)">
            ×
        </button>
    `;
    
    container.appendChild(attributeDiv);
}

function removeAttributeField(button) {
    button.closest('.attribute-item').remove();
}

function clearAttributeFields() {
    document.getElementById('attributes-container').innerHTML = '';
}

function addDefaultAttributes() {
    const defaultAttributes = [
        { type: 'Form', value: '' },
        { type: 'Behavior', value: '' },
        { type: 'Color Scheme', value: '' }
    ];
    
    defaultAttributes.forEach(attr => {
        addAttributeField(attr.type, attr.value);
    });
}

function collectAttributes() {
    const attributes = [];
    const attributeItems = document.querySelectorAll('.attribute-item');
    
    attributeItems.forEach(item => {
        const type = item.querySelector('.attribute-type').value.trim();
        const value = item.querySelector('.attribute-value').value.trim();
        
        if (type && value) {
            attributes.push({
                trait_type: type,
                value: value
            });
        }
    });
    
    return attributes;
}

// Fermeture du formulaire NFT
function closeNFTForm() {
    document.getElementById('nft-form-modal').style.display = 'none';
    currentEditingNFT = null;
    clearFormErrors();
}

// Sauvegarde des données NFT
function saveNFTsData() {
    try {
        // Sauvegarder dans le localStorage pour la démo
        localStorage.setItem('bioglyphs-nfts-data', JSON.stringify(adminNFTsData));
        localStorage.setItem('bioglyphs-last-backup', new Date().toISOString());
        
        // Dans un vrai projet, ceci ferait un appel API pour sauvegarder sur le serveur
        console.log('Données NFT sauvegardées:', adminNFTsData);
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showErrorMessage('Erreur lors de la sauvegarde des données');
    }
}

// Exportation des données
function exportData() {
    const dataToExport = {
        nfts: adminNFTsData,
        exported_at: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bioglyphs_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccessMessage('Données exportées avec succès');
}

// Modal de confirmation
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const confirmOk = document.getElementById('confirm-ok');
    confirmOk.onclick = onConfirm;
    
    document.getElementById('confirm-modal').style.display = 'flex';
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
}

// Messages de succès et d'erreur
function showSuccessMessage(message) {
    showToast(message, 'success');
}

function showErrorMessage(message) {
    showToast(message, 'error');
}

function showToast(message, type) {
    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Styles du toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #4ecdc4;' : 'background: #ff6b6b;'}
    `;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Fonctions utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Configuration du menu mobile (réutilise la fonction de main.js)
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Fermer le menu lors du clic sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Fonction d'aide
function showHelp() {
    const helpContent = `
        <h3>Guide d'utilisation de l'interface d'administration</h3>
        <h4>Ajouter un NFT :</h4>
        <ul>
            <li>Cliquez sur "Ajouter un NFT"</li>
            <li>Remplissez tous les champs obligatoires (*)</li>
            <li>Les URLs doivent pointer vers des fichiers hébergés sur IPFS/Pinata</li>
            <li>Ajoutez des attributs pour décrire votre NFT</li>
        </ul>
        <h4>Modifier un NFT :</h4>
        <ul>
            <li>Cliquez sur l'icône de modification (✏️) dans le tableau</li>
            <li>Modifiez les champs souhaités</li>
            <li>Sauvegardez les modifications</li>
        </ul>
        <h4>Exporter les données :</h4>
        <ul>
            <li>Cliquez sur "Exporter les données" pour télécharger un fichier JSON</li>
            <li>Ce fichier contient toute votre collection</li>
            <li>Conservez-le comme sauvegarde</li>
        </ul>
    `;
    
    showConfirmModal('Guide d\'utilisation', '', function() {
        closeConfirmModal();
    });
    
    document.getElementById('confirm-message').innerHTML = helpContent;
    document.getElementById('confirm-ok').textContent = 'Fermer';
}

// Chargement des données sauvegardées au démarrage
document.addEventListener('DOMContentLoaded', function() {
    const savedData = localStorage.getItem('bioglyphs-nfts-data');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            if (Array.isArray(parsedData)) {
                adminNFTsData = parsedData;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données sauvegardées:', error);
        }
    }
});

// Export des fonctions pour utilisation globale
window.AdminApp = {
    showAddNFTForm,
    editNFT,
    deleteNFT,
    viewNFT,
    exportData,
    showHelp
};

