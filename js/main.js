// Variables globales
let nftsData = [];
let particlesCanvas, particlesCtx;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Fonction d'initialisation principale
function initializeApp() {
    setupNavigation();
    initParticles();
    loadNFTsData();
    setupScrollAnimations();
    setupMobileMenu();
}

// Configuration de la navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Gestion des liens internes (ancres)
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Mise à jour de l'état actif
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Mise à jour de l'état actif lors du scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

// Mise à jour du lien de navigation actif
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Initialisation des particules d'arrière-plan
function initParticles() {
    particlesCanvas = document.getElementById('particles-canvas');
    if (!particlesCanvas) return;
    
    particlesCtx = particlesCanvas.getContext('2d');
    
    // Redimensionnement du canvas
    function resizeCanvas() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Création des particules
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * particlesCanvas.width,
            y: Math.random() * particlesCanvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            life: Math.random() * 100
        });
    }
    
    // Animation des particules
    function animateParticles() {
        particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        
        particles.forEach(particle => {
            // Mise à jour de la position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += 0.5;
            
            // Rebond sur les bords
            if (particle.x < 0 || particle.x > particlesCanvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > particlesCanvas.height) {
                particle.vy *= -1;
            }
            
            // Effet de pulsation
            const pulse = Math.sin(particle.life * 0.02) * 0.5 + 0.5;
            const currentSize = particle.size * (0.5 + pulse * 0.5);
            const currentOpacity = particle.opacity * pulse;
            
            // Dessin de la particule
            particlesCtx.beginPath();
            particlesCtx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
            particlesCtx.fillStyle = `rgba(255, 0, 64, ${currentOpacity})`;
            particlesCtx.fill();
            
            // Halo
            const gradient = particlesCtx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, currentSize * 3
            );
            gradient.addColorStop(0, `rgba(255, 0, 64, ${currentOpacity * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 0, 64, 0)');
            
            particlesCtx.beginPath();
            particlesCtx.arc(particle.x, particle.y, currentSize * 3, 0, Math.PI * 2);
            particlesCtx.fillStyle = gradient;
            particlesCtx.fill();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// Chargement des données NFT
async function loadNFTsData() {
    try {
        const response = await fetch('data/nfts.json');
        nftsData = await response.json();
        displayPreviewNFTs();
    } catch (error) {
        console.error('Erreur lors du chargement des NFTs:', error);
        displayErrorMessage();
    }
}

// Affichage des NFTs en aperçu
function displayPreviewNFTs() {
    const previewGrid = document.getElementById('preview-grid');
    if (!previewGrid) return;
    
    // Afficher les 6 premiers NFTs (ou moins s'il y en a moins)
    const previewNFTs = nftsData.slice(0, 6);
    
    if (previewNFTs.length === 0) {
        previewGrid.innerHTML = `
            <div class="no-nfts-message">
                <p>Aucun NFT disponible pour le moment.</p>
                <p>Revenez bientôt pour découvrir notre collection !</p>
            </div>
        `;
        return;
    }
    
    previewGrid.innerHTML = previewNFTs.map(nft => `
        <div class="preview-card" onclick="goToNFTDetails('${nft.id}')">
            <img src="${nft.media.preview_gif}" 
                 alt="${nft.name}" 
                 class="preview-image"
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDMwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2NjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K'">
            <div class="preview-content">
                <h3 class="preview-title">${nft.name}</h3>
                <p class="preview-description">${truncateText(nft.description, 100)}</p>
                <div class="preview-attributes">
                    ${nft.attributes.slice(0, 2).map(attr => `
                        <span class="attribute-tag">${attr.trait_type}: ${attr.value}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    // Ajouter les styles pour les attributs
    if (!document.getElementById('preview-styles')) {
        const style = document.createElement('style');
        style.id = 'preview-styles';
        style.textContent = `
            .preview-attributes {
                margin-top: 1rem;
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
            }
            
            .attribute-tag {
                background: rgba(255, 0, 64, 0.1);
                color: #ff0040;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                border: 1px solid rgba(255, 0, 64, 0.3);
            }
            
            .no-nfts-message {
                grid-column: 1 / -1;
                text-align: center;
                padding: 3rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .no-nfts-message p {
                color: #cccccc;
                margin-bottom: 1rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// Affichage d'un message d'erreur
function displayErrorMessage() {
    const previewGrid = document.getElementById('preview-grid');
    if (!previewGrid) return;
    
    previewGrid.innerHTML = `
        <div class="error-message">
            <p>Erreur lors du chargement de la collection.</p>
            <p>Veuillez réessayer plus tard.</p>
            <button onclick="loadNFTsData()" class="btn btn-secondary">Réessayer</button>
        </div>
    `;
}

// Fonction utilitaire pour tronquer le texte
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Navigation vers les détails d'un NFT
function goToNFTDetails(nftId) {
    window.location.href = `nft-details.html?id=${nftId}`;
}

// Configuration des animations au scroll
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observer les éléments à animer
    const elementsToAnimate = document.querySelectorAll(
        '.about-card, .category-card, .preview-card, .tech-feature'
    );
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Configuration du menu mobile
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
    
    // Ajouter les styles pour le menu mobile
    if (!document.getElementById('mobile-menu-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-menu-styles';
        style.textContent = `
            @media (max-width: 768px) {
                .nav-menu {
                    position: fixed;
                    top: 70px;
                    left: -100%;
                    width: 100%;
                    height: calc(100vh - 70px);
                    background: rgba(26, 26, 26, 0.98);
                    backdrop-filter: blur(10px);
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding-top: 2rem;
                    transition: left 0.3s ease;
                    z-index: 999;
                }
                
                .nav-menu.active {
                    left: 0;
                }
                
                .nav-menu li {
                    margin: 1rem 0;
                }
                
                .hamburger.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                
                .hamburger.active span:nth-child(2) {
                    opacity: 0;
                }
                
                .hamburger.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Fonction utilitaire pour valider les URLs IPFS
function isValidIPFSUrl(url) {
    return url && (url.startsWith('https://ipfs.io/ipfs/') || url.startsWith('ipfs://'));
}

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', function() {
    // Redimensionner le canvas des particules si nécessaire
    if (particlesCanvas) {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    }
});

// Export des fonctions pour utilisation dans d'autres scripts
window.BioglyphsApp = {
    nftsData,
    loadNFTsData,
    goToNFTDetails,
    formatDate,
    isValidIPFSUrl,
    truncateText
};

