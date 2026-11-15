// Variables globales pour les détails NFT
let currentNFT = null;
let allNFTs = [];

// Initialisation de la page de détails
document.addEventListener('DOMContentLoaded', function() {
    initializeNFTDetails();
});

// Fonction d'initialisation principale
function initializeNFTDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawId = urlParams.get('id');
    
    if (!rawId) {
        showErrorState();
        return;
    }
    
    loadNFTDetails(rawId);
    setupEventListeners();
    setupMobileMenu();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const shareBtn = document.getElementById('share-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const downloadMetadataBtn = document.getElementById('download-metadata');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', openShareModal);
    }
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    if (downloadMetadataBtn) {
        downloadMetadataBtn.addEventListener('click', downloadMetadata);
    }
    
    // Masquer le bouton de bascule vidéo/GIF devenu inutile
    const toggleMediaBtn = document.getElementById('toggle-media');
    if (toggleMediaBtn) {
        toggleMediaBtn.style.display = 'none';
    }
    
    // Modal de partage
    const closeShareModal = document.getElementById('close-share-modal');
    const shareModal = document.getElementById('share-modal');
    
    if (closeShareModal) {
        closeShareModal.addEventListener('click', closeShareModalHandler);
    }
    
    if (shareModal) {
        shareModal.addEventListener('click', function(e) {
            if (e.target === shareModal) {
                closeShareModalHandler();
            }
        });
    }
}

// Chargement des détails du NFT (avec correction intelligente de l'ID)
async function loadNFTDetails(rawId) {
    try {
        const response = await fetch('data/nfts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allNFTs = await response.json();
        
        // Recherche flexible : accepte "bioglyph_Glyph-0001" ou "Glyph-0001"
        const cleanId = rawId.replace(/^bioglyph_/i, '');
        currentNFT = allNFTs.find(nft => 
            nft.id === rawId || 
            nft.id === cleanId || 
            nft.name === cleanId
        );
        
        if (!currentNFT) {
            showErrorState();
            return;
        }
        
        displayNFTDetails();
        loadRelatedNFTs();
        updatePageMeta();
        
    } catch (error) {
        console.error('Erreur lors du chargement du NFT:', error);
        showErrorState();
    }
}

// Affichage des détails du NFT
function displayNFTDetails() {
    hideLoadingState();
    
    document.getElementById('nft-title').textContent = currentNFT.name;
    document.getElementById('nft-id').textContent = `#${currentNFT.id}`;
    document.getElementById('breadcrumb-title').textContent = currentNFT.name;
    document.getElementById('nft-description').textContent = currentNFT.description;
    
    // Remplacer les médias cassés par la simulation interactive
    setupInteractiveSimulation();
    
    displayAttributes();
    updateTechnicalDetails();
    setupLinks();
    updateFavoriteButton();
    
    document.getElementById('nft-details').style.display = 'block';
}

// Configuration de la simulation interactive à la place de la vidéo et du GIF
function setupInteractiveSimulation() {
    const mediaContainer = document.querySelector('.media-container');
    if (!mediaContainer) return;

    const viewerUrl = currentNFT.media && currentNFT.media.viewer_html ? currentNFT.media.viewer_html : '';

    if (viewerUrl) {
        mediaContainer.innerHTML = `
            <div class="simulation-wrapper" style="position: relative; width: 100%; height: 500px; background: #0a0a0a; border-radius: 12px; overflow: hidden;">
                <iframe 
                    id="nft-simulation-iframe"
                    src="${viewerUrl}" 
                    title="Simulation Interactive - ${currentNFT.name}"
                    style="width: 100%; height: 100%; border: none; display: block;"
                    allowfullscreen
                    loading="lazy">
                </iframe>
                <div style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.75); color: #00ffcc; padding: 6px 12px; border-radius: 20px; font-size: 12px; pointer-events: none; border: 1px solid rgba(0,255,204,0.3);">
                    🟢 Simulation Interactive en Direct
                </div>
            </div>
        `;
        mediaContainer.classList.add('loaded');
    } else {
        mediaContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #888;">
                Simulation interactive non disponible pour cet élément.
            </div>
        `;
    }
}

// Affichage des attributs
function displayAttributes() {
    const attributesGrid = document.getElementById('nft-attributes');
    if (!attributesGrid || !currentNFT.attributes) return;
    
    attributesGrid.innerHTML = currentNFT.attributes.map(attr => `
        <div class="attribute-item">
            <div class="attribute-type">${attr.trait_type}</div>
            <div class="attribute-value">${attr.value}</div>
        </div>
    `).join('');
}

// Mise à jour des détails techniques
function updateTechnicalDetails() {
    const creationDate = document.getElementById('creation-date');
    const updateDate = document.getElementById('update-date');
    
    if (creationDate && currentNFT.created_at) {
        creationDate.textContent = formatDate(currentNFT.created_at);
    }
    
    if (updateDate && currentNFT.updated_at) {
        updateDate.textContent = formatDate(currentNFT.updated_at);
    }
}

// Configuration des liens (conservation uniquement des liens fonctionnels)
function setupLinks() {
    const viewerBtn = document.getElementById('viewer-btn');
    const openseaBtn = document.getElementById('opensea-btn');
    
    if (viewerBtn && currentNFT.media.viewer_html) {
        viewerBtn.href = currentNFT.media.viewer_html;
        viewerBtn.target = '_blank';
    }
    
    if (openseaBtn) {
        openseaBtn.href = currentNFT.opensea_url || '#';
        if (!currentNFT.opensea_url) {
            openseaBtn.style.opacity = '0.5';
            openseaBtn.style.pointerEvents = 'none';
        }
    }
    
    // Masquer les liens IPFS cassés (vidéo et GIF)
    const brokenIds = ['ipfs-video', 'ipfs-gif'];
    brokenIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
        }
    });

    // Garder les liens fonctionnels (Simulation et Métadonnées)
    const workingLinks = {
        'ipfs-viewer': currentNFT.media.viewer_html,
        'ipfs-metadata': currentNFT.media.metadata_json
    };
    
    Object.entries(workingLinks).forEach(([id, url]) => {
        const link = document.getElementById(id);
        if (link) {
            if (url) {
                link.href = url;
                link.target = '_blank';
            } else {
                link.style.display = 'none';
            }
        }
    });
}

// Chargement des NFTs similaires (sans images cassées, avec aperçu des attributs)
function loadRelatedNFTs() {
    const relatedGrid = document.getElementById('related-grid');
    if (!relatedGrid) return;
    
    const relatedNFTs = findSimilarNFTs(currentNFT, allNFTs, 3);
    
    if (relatedNFTs.length === 0) {
        relatedGrid.innerHTML = `
            <div class="no-related">
                <p>Aucun NFT similaire trouvé.</p>
            </div>
        `;
        return;
    }
    
    relatedGrid.innerHTML = relatedNFTs.map(nft => {
        const topTraits = (nft.attributes || []).slice(0, 2).map(a => `${a.trait_type}: ${a.value}`).join(' • ');
        return `
        <div class="related-card" onclick="goToNFT('${nft.id}')" style="cursor: pointer; border: 1px solid #2a2a2a; border-radius: 10px; padding: 16px; background: #141414; transition: transform 0.2s;">
            <div style="height: 110px; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; color: #00ffcc; font-weight: bold; font-size: 14px;">
                🎮 Lancer la simulation
            </div>
            <div class="related-content">
                <h4 class="related-title" style="margin: 0 0 6px 0;">${nft.name}</h4>
                <p style="font-size: 12px; color: #00ffcc; margin: 0 0 8px 0;">${topTraits}</p>
                <p class="related-description" style="font-size: 13px; color: #aaa; margin: 0;">${truncateText(nft.description, 80)}</p>
            </div>
        </div>
    `}).join('');
}

// Trouver des NFTs similaires
function findSimilarNFTs(targetNFT, allNFTs, maxResults) {
    const otherNFTs = allNFTs.filter(nft => nft.id !== targetNFT.id);
    
    const similarities = otherNFTs.map(nft => {
        let score = 0;
        const targetAttrs = targetNFT.attributes || [];
        const nftAttrs = nft.attributes || [];
        
        targetAttrs.forEach(targetAttr => {
            const matchingAttr = nftAttrs.find(attr => 
                attr.trait_type === targetAttr.trait_type && 
                attr.value === targetAttr.value
            );
            if (matchingAttr) {
                score += 1;
            }
        });
        
        return { nft, score };
    });
    
    return similarities
