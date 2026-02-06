// ========================================
// MOBILE MENU TOGGLE
// ========================================
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const nav = document.getElementById('nav');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        // Animate hamburger
        mobileMenuToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// ========================================
// ULTRA DRAMATIC SCROLL ANIMATIONS
// ========================================
const observerOptions = {
    root: null,
    rootMargin: '-100px',
    threshold: 0.1
};

const dramaticObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Calculate delay based on element's position in viewport
            const delay = Math.random() * 300; // Random delay for more dynamic feel

            setTimeout(() => {
                entry.target.classList.add('visible');

                // Add dramatic bounce effect
                entry.target.style.animation = 'dramaticEntrance 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }, delay);

            // Stop observing once visible
            dramaticObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animated elements
const animatedElements = document.querySelectorAll('.animate-on-scroll');
animatedElements.forEach((el, index) => {
    dramaticObserver.observe(el);
});

// ========================================
// PARALLAX EFFECT - EXAGGERATED
// ========================================
const blobs = document.querySelectorAll('.blob');
const heroSection = document.getElementById('hero');
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroHeight = heroSection ? heroSection.offsetHeight : 1000;

    // Ultra dramatic parallax for blobs
    blobs.forEach((blob, index) => {
        const speed = 0.3 + (index * 0.15); // Much faster parallax
        const rotation = scrolled * 0.05;
        const yPos = -(scrolled * speed);
        const scale = 1 + (scrolled / heroHeight) * 0.3;

        blob.style.transform = `translateY(${yPos}px) rotate(${rotation}deg) scale(${scale})`;
        blob.style.opacity = 0.3 - (scrolled / heroHeight) * 0.2;
    });

    // Parallax for hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const heroOffset = scrolled * 0.5;
        heroContent.style.transform = `translateY(${heroOffset}px) scale(${1 - scrolled / heroHeight * 0.1})`;
        heroContent.style.opacity = 1 - (scrolled / heroHeight) * 0.8;
    }

    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// ========================================
// DRAMATIC HEADER - HIDE/SHOW
// ========================================
let lastScroll = 0;
const header = document.getElementById('header');
let scrollTimeout;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Dramatic shadow and background changes
    if (currentScroll > 0) {
        header.style.boxShadow = `0 4px 30px rgba(0, 0, 0, ${Math.min(currentScroll / 100, 0.8)})`;
        header.style.background = `rgba(13, 13, 13, ${Math.min(0.8 + currentScroll / 500, 0.98)})`;
    } else {
        header.style.boxShadow = 'none';
        header.style.background = 'rgba(13, 13, 13, 0.8)';
    }

    // Hide/show with dramatic effect
    clearTimeout(scrollTimeout);

    if (currentScroll > lastScroll && currentScroll > 150) {
        // Scrolling down - hide
        header.style.transform = 'translateY(-120%)';
        header.style.opacity = '0';
    } else {
        // Scrolling up - show with bounce
        header.style.transform = 'translateY(0)';
        header.style.opacity = '1';
    }

    scrollTimeout = setTimeout(() => {
        if (currentScroll > 150) {
            header.style.transform = 'translateY(0)';
            header.style.opacity = '1';
        }
    }, 3000);

    lastScroll = currentScroll;
});

// ========================================
// SMOOTH SCROLL WITH EASING
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href === '#') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Flash effect on target
            target.style.animation = 'flashHighlight 0.8s ease';
            setTimeout(() => {
                target.style.animation = '';
            }, 800);
        }
    });
});

// ========================================
// CLIPS DRAG SCROLL - ENHANCED
// ========================================
const clipsScroll = document.getElementById('clips-scroll');
const clipsNavLeft = document.getElementById('clips-nav-left');
const clipsNavRight = document.getElementById('clips-nav-right');

if (clipsScroll) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;

    clipsScroll.addEventListener('mousedown', (e) => {
        isDown = true;
        clipsScroll.style.cursor = 'grabbing';
        clipsScroll.style.userSelect = 'none';
        startX = e.pageX - clipsScroll.offsetLeft;
        scrollLeft = clipsScroll.scrollLeft;
        velocity = 0;
    });

    clipsScroll.addEventListener('mouseleave', () => {
        isDown = false;
        clipsScroll.style.cursor = 'grab';
    });

    clipsScroll.addEventListener('mouseup', () => {
        isDown = false;
        clipsScroll.style.cursor = 'grab';
    });

    clipsScroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - clipsScroll.offsetLeft;
        const walk = (x - startX) * 3; // More sensitive
        velocity = walk;
        clipsScroll.scrollLeft = scrollLeft - walk;
    });

    clipsScroll.style.cursor = 'grab';

    // Navigation buttons with infinite scroll
    if (clipsNavLeft) {
        clipsNavLeft.addEventListener('click', () => {
            const cardWidth = 344; // 320px card + 24px gap
            const currentScroll = clipsScroll.scrollLeft;

            // If at the beginning, jump to the end
            if (currentScroll <= 0) {
                clipsScroll.scrollLeft = clipsScroll.scrollWidth - clipsScroll.clientWidth;
            } else {
                clipsScroll.scrollBy({
                    left: -cardWidth,
                    behavior: 'smooth'
                });
            }
        });
    }

    if (clipsNavRight) {
        clipsNavRight.addEventListener('click', () => {
            const cardWidth = 344; // 320px card + 24px gap
            const currentScroll = clipsScroll.scrollLeft;
            const maxScroll = clipsScroll.scrollWidth - clipsScroll.clientWidth;

            // If at the end, jump to the beginning
            if (currentScroll >= maxScroll - 10) { // -10 for tolerance
                clipsScroll.scrollLeft = 0;
            } else {
                clipsScroll.scrollBy({
                    left: cardWidth,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// ========================================
// 3D TILT EFFECT FOR CARDS - REFINED
// ========================================
const rewardCards = document.querySelectorAll('.reward-card');

rewardCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Subtle rotation - reduced intensity
        const rotateX = (y - centerY) / 15; // More subtle
        const rotateY = (centerX - x) / 15; // More subtle

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02) translateZ(10px)`;
        card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 30px rgba(0, 255, 133, 0.3)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
        card.style.boxShadow = '';
        card.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    });

    card.addEventListener('mouseenter', () => {
        card.style.transition = 'box-shadow 0.1s ease';
    });
});

// ========================================
// FLOATING PARTICLES EFFECT
// ========================================
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    document.body.appendChild(particlesContainer);

    // Create 30 particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(0, 255, 133, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 10 + 10}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
            box-shadow: 0 0 10px rgba(0, 255, 133, 0.5);
        `;
        particlesContainer.appendChild(particle);
    }
}

// Add particle keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        50% {
            transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * -200}px) scale(1.5);
        }
    }
    
    @keyframes dramaticEntrance {
        0% {
            opacity: 0;
            transform: translateY(100px) scale(0.8) rotateX(-20deg);
        }
        60% {
            transform: translateY(-10px) scale(1.05) rotateX(5deg);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0);
        }
    }
    
    @keyframes flashHighlight {
        0%, 100% {
            box-shadow: none;
        }
        50% {
            box-shadow: 0 0 40px rgba(0, 255, 133, 0.8);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// LOGO PULSE ON HOVER
// ========================================
const logo = document.querySelector('.logo img');
if (logo) {
    logo.addEventListener('mouseenter', () => {
        logo.style.animation = 'pulse 0.6s ease-in-out';
    });

    logo.addEventListener('animationend', () => {
        logo.style.animation = '';
    });
}

// ========================================
// BUTTON RIPPLE EFFECT
// ========================================
const buttons = document.querySelectorAll('.btn, .claim-button, .cta-button');

buttons.forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            left: ${x}px;
            top: ${y}px;
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ========================================
// INITIALIZE ALL EFFECTS
// ========================================
console.log('✅ GambitStyll - ULTRA DRAMATIC MODE ACTIVATED! 🎨');
console.log('📦 Pure HTML/CSS/JS with MAXIMUM effects!');
console.log('🎭 Featuring: Dramatic animations, parallax, particles, 3D tilts, and more!');

// Create particles on load
createParticles();

// Trigger initial hero animations
window.addEventListener('load', () => {
    setTimeout(() => {
        const heroElements = document.querySelectorAll('#hero .animate-on-scroll');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
                el.style.animation = 'dramaticEntrance 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }, index * 200);
        });
    }, 200);
});

// ========================================
// RANDOM LEADERBOARD REDIRECT
// ========================================
// Add click handler to any element with class "random-leaderboard"
document.addEventListener('DOMContentLoaded', () => {
    const randomLeaderboardButtons = document.querySelectorAll('.random-leaderboard');

    randomLeaderboardButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            // Random selection between Gamdom and Fortune Box
            const leaderboards = [
                'leaderboard-gamdom.html',
                'leaderboard-fortunebox.html'
            ];

            const randomIndex = Math.floor(Math.random() * leaderboards.length);
            const selectedLeaderboard = leaderboards[randomIndex];

            // Redirect to the selected leaderboard
            window.location.href = selectedLeaderboard;
        });
    });
});
