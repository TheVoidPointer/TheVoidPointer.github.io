// Cache buster - adds timestamp to prevent caching
const CACHE_BUSTER = `?v=${Date.now()}`;

// Markdown Parser
class MarkdownParser {
    static parseConfig(markdown) {
        const lines = markdown.split('\n');
        const config = {};
        let currentSection = null;
        
        lines.forEach(line => {
            line = line.trim();
            
            // Skip empty lines and comments
            if (!line || line.startsWith('#') && !line.includes(':')) return;
            
            // Check for section headers
            if (line.endsWith(':') && !line.includes(':')) {
                currentSection = line.slice(0, -1).trim().toLowerCase().replace(/\s+/g, '_');
                config[currentSection] = {};
            } 
            // Check for key-value pairs
            else if (line.includes(':')) {
                // Remove inline comments
                const cleanLine = line.split('#')[0].trim();
                if (!cleanLine) return;
                
                const [key, ...valueParts] = cleanLine.split(':');
                const value = valueParts.join(':').trim();
                
                if (currentSection) {
                    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
                    config[currentSection][cleanKey] = value;
                } else {
                    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
                    config[cleanKey] = value;
                }
            }
        });
        
        return config;
    }

    static parseProjects(markdown) {
        const projects = [];
        const sections = markdown.split('## ');
        
        sections.forEach(section => {
            if (!section.trim() || section.startsWith('#') && !section.includes(':')) return;
            
            const lines = section.split('\n');
            const title = lines[0].trim();
            
            if (!title || title === 'Projects') return;
            
            const project = { title };
            
            lines.forEach(line => {
                line = line.trim();
                // Remove inline comments
                const cleanLine = line.split('#')[0].trim();
                if (!cleanLine) return;
                
                if (cleanLine.startsWith('description:')) {
                    project.description = cleanLine.replace('description:', '').trim();
                } else if (cleanLine.startsWith('technologies:')) {
                    const techString = cleanLine.replace('technologies:', '').trim();
                    // Handle both [tech1, tech2] and tech1, tech2 formats
                    let techArray = [];
                    if (techString.startsWith('[') && techString.endsWith(']')) {
                        techArray = techString.slice(1, -1).split(',').map(t => t.trim());
                    } else {
                        techArray = techString.split(',').map(t => t.trim());
                    }
                    project.technologies = techArray.filter(t => t);
                } else if (cleanLine.startsWith('image:')) {
                    project.image = cleanLine.replace('image:', '').trim();
                } else if (cleanLine.startsWith('link:')) {
                    project.link = cleanLine.replace('link:', '').trim();
                } else if (cleanLine.startsWith('github:')) {
                    project.github = cleanLine.replace('github:', '').trim();
                } else if (cleanLine.startsWith('live_demo:')) {
                    project.live_demo = cleanLine.replace('live_demo:', '').trim();
                } else if (cleanLine.startsWith('video:')) {
                    project.video = cleanLine.replace('video:', '').trim();
                }
            });
            
            if (Object.keys(project).length > 1) { // More than just title
                projects.push(project);
            }
        });
        
        return projects;
    }

    static parseSkills(markdown) {
        const skills = {};
        const sections = markdown.split('## ');
        
        sections.forEach(section => {
            if (!section.trim() || section.startsWith('#') && !section.includes(':')) return;
            
            const lines = section.split('\n');
            const category = lines[0].trim();
            
            if (!category || category === 'Skills') return;
            
            skills[category] = [];
            
            lines.forEach(line => {
                line = line.trim();
                // Remove inline comments
                const cleanLine = line.split('#')[0].trim();
                if (!cleanLine) return;
                
                if (cleanLine.startsWith('-')) {
                    const skill = cleanLine.slice(1).trim();
                    if (skill) skills[category].push(skill);
                }
            });
        });
        
        return skills;
    }
}

// Content Loader with cache busting
class ContentLoader {
    static async loadConfig() {
        try {
            const response = await fetch(`config.md${CACHE_BUSTER}`);
            if (!response.ok) throw new Error(`Failed to load config: ${response.status}`);
            const markdown = await response.text();
            return MarkdownParser.parseConfig(markdown);
        } catch (error) {
            console.error('Error loading config:', error);
            // Return default config if file not found
            return this.getDefaultConfig();
        }
    }

    static async loadProjects() {
        try {
            const response = await fetch(`projects.md${CACHE_BUSTER}`);
            if (!response.ok) throw new Error(`Failed to load projects: ${response.status}`);
            const markdown = await response.text();
            return MarkdownParser.parseProjects(markdown);
        } catch (error) {
            console.error('Error loading projects:', error);
            return this.getDefaultProjects();
        }
    }

    static async loadSkills() {
        try {
            const response = await fetch(`skills.md${CACHE_BUSTER}`);
            if (!response.ok) throw new Error(`Failed to load skills: ${response.status}`);
            const markdown = await response.text();
            return MarkdownParser.parseSkills(markdown);
        } catch (error) {
            console.error('Error loading skills:', error);
            return this.getDefaultSkills();
        }
    }
  
}

// DOM Updater
class DOMUpdater {
    static updateSiteInfo(config) {
        if (!config.site_info) return;
        
        const siteInfo = config.site_info;
        
        // Update page title
        if (siteInfo.site_title) {
            document.title = siteInfo.site_title;
            document.getElementById('page-title').textContent = siteInfo.site_title;
        }
        
        // Update name in multiple places
        if (siteInfo.name) {
            ['site-name', 'footer-name', 'detail-name'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = siteInfo.name;
            });
        }
        
        // Update other info
        if (siteInfo.tagline) {
            const taglineEl = document.getElementById('footer-tagline');
            if (taglineEl) taglineEl.textContent = siteInfo.tagline;
        }
        
        if (siteInfo.email) {
            ['detail-email', 'contact-email'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = siteInfo.email;
            });
        }
        
        if (siteInfo.phone) {
            const phoneEl = document.getElementById('contact-phone');
            if (phoneEl) phoneEl.textContent = siteInfo.phone;
        }
        
        if (siteInfo.location) {
            ['detail-location', 'contact-location'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = siteInfo.location;
            });
        }
        
        if (siteInfo.availability) {
            const availabilityEl = document.getElementById('detail-availability');
            if (availabilityEl) availabilityEl.textContent = siteInfo.availability;
        }
    }
    
static updateImages(config) {
    if (!config.images) return;
    
    const images = config.images;
    
    const updateImageWithFallback = (elementId, imageUrl) => {
        const element = document.getElementById(elementId);
        if (element) {
            const img = new Image();
            img.onload = () => {
                element.src = imageUrl + CACHE_BUSTER;
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${imageUrl}`);
            };
            img.src = imageUrl + CACHE_BUSTER;
        }
    };
    
    if (images.logo) updateImageWithFallback('header-logo', images.logo);
    if (images.logo_dark) updateImageWithFallback('footer-logo', images.logo_dark);
    if (images.hero_image) updateImageWithFallback('hero-illustration', images.hero_image);
    if (images.profile_image) updateImageWithFallback('profile-image', images.profile_image);
}
    
    static updateHeroSection(config) {
        if (!config.hero_section) return;
        
        const hero = config.hero_section;
        
        if (hero.hero_title) {
            const titleEl = document.getElementById('hero-title');
            if (titleEl) titleEl.innerHTML = hero.hero_title;
        }
        
        if (hero.hero_description) {
            const descEl = document.getElementById('hero-description');
            if (descEl) descEl.textContent = hero.hero_description;
        }
    }
    
    static updateFeatures(config) {
        if (!config.features) return;
        
        const featuresContainer = document.getElementById('features-container');
        if (!featuresContainer) return;
        
        const features = Object.values(config.features);
        if (!features.length) return;
        
        featuresContainer.innerHTML = features.map(feature => {
            if (typeof feature !== 'string') return '';
            
            try {
                const featureData = {};
                const pairs = feature.replace(/[{}]/g, '').split(',');
                
                pairs.forEach(pair => {
                    const [key, value] = pair.split(':');
                    if (key && value) {
                        featureData[key.trim()] = value.trim();
                    }
                });
                
                return `
                    <div class="feature-card">
                        <i data-lucide="${featureData.icon || 'code'}"></i>
                        <h3>${featureData.title || 'Feature'}</h3>
                    </div>
                `;
            } catch (error) {
                console.error('Error parsing feature:', error);
                return '';
            }
        }).join('');
    }
    
    static updateAboutSection(config) {
        if (!config.about_section) return;
        
        const about = config.about_section;
        
        if (about.about_title) {
            const titleEl = document.getElementById('about-title');
            if (titleEl) titleEl.textContent = about.about_title;
        }
        
        if (about.about_subtitle) {
            const subtitleEl = document.getElementById('about-subtitle');
            if (subtitleEl) subtitleEl.textContent = about.about_subtitle;
        }
        
        if (about.about_content) {
            const contentEl = document.getElementById('about-content');
            if (contentEl) contentEl.innerHTML = about.about_content;
        }
    }
    
// Replace the entire updateSocialLinks method with this:
static updateSocialLinks(config) {
    if (!config.social_links) return;
    
    const socialLinks = config.social_links;
    
    // Parse social links more reliably
    const platforms = [];
    const processed = new Set();
    
    // Collect all unique platform names
    Object.keys(socialLinks).forEach(key => {
        // Match platform name (e.g., "github", "telegram" from keys like "github", "github_icon")
        const baseMatch = key.match(/^([a-zA-Z0-9]+)(?:_icon|_label)?$/);
        if (baseMatch) {
            const platform = baseMatch[1];
            
            // If we haven't processed this platform and have all required data
            if (!processed.has(platform) && 
                socialLinks[platform] && 
                socialLinks[`${platform}_icon`] && 
                socialLinks[`${platform}_label`]) {
                
                platforms.push({
                    name: platform,
                    url: socialLinks[platform],
                    icon: socialLinks[`${platform}_icon`],
                    label: socialLinks[`${platform}_label`]
                });
                
                processed.add(platform);
            }
        }
    });
    
    if (platforms.length === 0) {
        console.warn('No valid social links found in config');
        return;
    }
    
    // Generate HTML for social links
    const socialHTML = platforms.map(platform => `
        <a href="${platform.url}" 
           target="_blank" 
           rel="noopener noreferrer" 
           aria-label="${platform.label}"
           class="social-link">
            <i data-lucide="${platform.icon}"></i>
        </a>
    `).join('');
    
    // Update main social links (About section)
    const socialContainer = document.getElementById('social-links');
    if (socialContainer) {
        socialContainer.innerHTML = socialHTML;
    }
    
    // Update footer social links
    const footerSocialContainer = document.getElementById('footer-social-links');
    if (footerSocialContainer) {
        footerSocialContainer.innerHTML = socialHTML;
    }
    
    // Recreate icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        setTimeout(() => lucide.createIcons(), 100);
    }
}
    static updateSectionTitles(config) {
        const sections = {
            'projects_section': {
                'projects_title': 'projects-title',
                'projects_subtitle': 'projects-subtitle'
            },
            'skills_section': {
                'skills_title': 'skills-title',
                'skills_subtitle': 'skills-subtitle'
            },
            'contact_section': {
                'contact_title': 'contact-title',
                'contact_subtitle': 'contact-subtitle'
            }
        };
        
        Object.entries(sections).forEach(([sectionKey, elements]) => {
            const section = config[sectionKey];
            if (!section) return;
            
            Object.entries(elements).forEach(([configKey, elementId]) => {
                if (section[configKey]) {
                    const element = document.getElementById(elementId);
                    if (element) element.textContent = section[configKey];
                }
            });
        });
    }
    
    static updateFooter(config) {
        if (config.footer?.copyright) {
            const copyrightEl = document.getElementById('copyright');
            if (copyrightEl) {
                // Replace year with current year
                const currentYear = new Date().getFullYear();
                let copyrightText = config.footer.copyright;
                copyrightText = copyrightText.replace(/\d{4}/, currentYear);
                copyrightEl.textContent = copyrightText;
            }
        }
    }
    
    static updateProjects(projects) {
        const projectsContainer = document.getElementById('projects-container');
        if (!projectsContainer) return;
        
        if (!projects || !projects.length) {
            projectsContainer.innerHTML = `
                <div class="no-projects">
                    <p>No projects found. Please check your projects.md file.</p>
                </div>
            `;
            return;
        }
        
        projectsContainer.innerHTML = projects.map((project, index) => `
            <div class="project-card" data-project-index="${index}">
                <div class="project-image">
                    <img src="${project.image || 'assets/images/project-placeholder.jpg'}${CACHE_BUSTER}" 
                         alt="${project.title}" 
                         loading="lazy"
                         onerror="this.onerror=null; this.src='assets/images/project-placeholder.jpg'">
                </div>
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description || 'No description available.'}</p>
                    <div class="project-tech">
                        ${(project.technologies || []).map(tech => `<span>${tech}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        ${project.link ? `<a href="${project.link}" class="project-link" target="_blank" rel="noopener noreferrer">
                            <i data-lucide="external-link"></i> Live Demo
                        </a>` : ''}
                        ${project.github ? `<a href="${project.github}" class="project-link" target="_blank" rel="noopener noreferrer">
                            <i data-lucide="github"></i> GitHub
                        </a>` : ''}
                        ${project.live_demo ? `<a href="${project.live_demo}" class="project-link" target="_blank" rel="noopener noreferrer">
                            <i data-lucide="play-circle"></i> Live Demo
                        </a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    static updateSkills(skills) {
        const skillsContainer = document.getElementById('skills-container');
        if (!skillsContainer) return;
        
        if (!skills || !Object.keys(skills).length) {
            skillsContainer.innerHTML = `
                <div class="no-skills">
                    <p>No skills found. Please check your skills.md file.</p>
                </div>
            `;
            return;
        }
        
        const categoryIcons = {
            'Frontend': 'code',
            'Backend': 'server',
            'Design & Tools': 'palette',
            'DevOps': 'cloud',
            'Databases': 'database',
            'Testing': 'check-circle',
            'Languages': 'cpu',
            'Frameworks': 'layers',
            'Tools': 'wrench'
        };
        
        skillsContainer.innerHTML = Object.entries(skills).map(([category, items]) => `
            <div class="skill-category">
                <h3><i data-lucide="${categoryIcons[category] || 'code'}"></i> ${category}</h3>
                <div class="skill-items">
                    ${items.map(skill => `<span>${skill}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }
}

// Main Content Loader Function
async function loadAndUpdateContent() {
    console.log('Loading content from markdown files...');
    
    // Show loading state
    document.body.classList.add('loading');
    
    try {
        // Load all content in parallel
        const [config, projects, skills] = await Promise.all([
            ContentLoader.loadConfig(),
            ContentLoader.loadProjects(),
            ContentLoader.loadSkills()
        ]);
        
        console.log('Content loaded:', { config, projects, skills });
        
        // Update DOM with loaded content
        if (config) {
            DOMUpdater.updateSiteInfo(config);
            DOMUpdater.updateImages(config);
            DOMUpdater.updateHeroSection(config);
            DOMUpdater.updateFeatures(config);
            DOMUpdater.updateAboutSection(config);
            DOMUpdater.updateSocialLinks(config);
            DOMUpdater.updateSectionTitles(config);
            DOMUpdater.updateFooter(config);
        }
        
        DOMUpdater.updateProjects(projects);
        DOMUpdater.updateSkills(skills);
        
        // Recreate icons
        lucide.createIcons();
        
        // Re-initialize event listeners
        initProjectCards();
        initSkillAnimations();
        
        console.log('Content update complete!');
        
    } catch (error) {
        console.error('Error updating content:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'content-error';
        errorDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #fee; border-radius: 8px; margin: 2rem;">
                <h3>⚠️ Content Loading Error</h3>
                <p>There was an error loading content from markdown files.</p>
                <p>Please check your markdown files in the  folder.</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
        
        const firstSection = document.querySelector('section');
        if (firstSection) {
            firstSection.parentNode.insertBefore(errorDiv, firstSection);
        }
        
    } finally {
        // Remove loading state
        document.body.classList.remove('loading');
    }
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-theme');
    }
    
    updateThemeIcon();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            
            const theme = body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            
            updateThemeIcon();
        });
    }
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        if (document.body.classList.contains('dark-theme')) {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
        // Force icon recreation
        lucide.createIcons();
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// Header scroll effect
function initHeaderScrollEffect() {
    const header = document.querySelector('.portfolio-header');
    if (!header) return;
    
    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > 100) {
                    if (currentScroll > lastScroll && currentScroll > 100) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }
                } else {
                    header.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
                ticking = false;
            });
            
            ticking = true;
        }
    });
}



// Project card hover effect
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        // Click to show more details
        card.addEventListener('click', function(e) {
            // Only trigger if not clicking on a link
            if (!e.target.closest('a')) {
                const index = this.dataset.projectIndex;
                console.log(`Viewing project ${index}`);
                // You could implement a modal here
            }
        });
    });
}

// Skill items animation
function initSkillAnimations() {
    const skillItems = document.querySelectorAll('.skill-items span');
    
    // Initialize with hidden state
    skillItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('span');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 50);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.skill-category').forEach(category => {
        observer.observe(category);
    });
}

// Mobile menu

function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const body = document.body;

    if (!mobileBtn || !mobileNav) return;

    mobileBtn.addEventListener('click', () => {
        const isActive = mobileNav.classList.contains('active');
        
        if (isActive) {
            mobileNav.classList.remove('active');
            mobileBtn.innerHTML = '<i data-lucide="menu"></i>';
            body.style.overflow = 'auto';
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
        } else {
            mobileNav.classList.add('active');
            mobileBtn.innerHTML = '<i data-lucide="x"></i>';
            body.style.overflow = 'hidden';
            mobileBtn.setAttribute('aria-expanded', 'true');
            mobileNav.setAttribute('aria-hidden', 'false');
        }
        
        lucide.createIcons();
    });

    // Close menu when clicking links
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileBtn.innerHTML = '<i data-lucide="menu"></i>';
            body.style.overflow = 'auto';
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            lucide.createIcons();
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            mobileNav.classList.remove('active');
            mobileBtn.innerHTML = '<i data-lucide="menu"></i>';
            body.style.overflow = 'auto';
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            lucide.createIcons();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileNav.classList.contains('active') && 
            !mobileNav.contains(e.target) && 
            !mobileBtn.contains(e.target)) {
            mobileNav.classList.remove('active');
            mobileBtn.innerHTML = '<i data-lucide="menu"></i>';
            body.style.overflow = 'auto';
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            lucide.createIcons();
        }
    });
}

function closeMobileMenu() {
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileNav && mobileNav.classList.contains('active')) {
        mobileNav.classList.remove('active');
        mobileNav.setAttribute('aria-hidden', 'true');
        
        if (mobileBtn) {
            mobileBtn.setAttribute('aria-expanded', 'false');
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        }
        
        document.body.style.overflow = '';
    }
}

// Add mobile menu CSS
// Add mobile menu CSS
function addMobileMenuCSS() {
    const mobileMenuCSS = `
    .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: var(--radius-md);
        transition: var(--transition);
        z-index: 1002;
    }
    
    .mobile-menu-btn:hover {
        background-color: var(--bg-accent);
    }
    
    .mobile-nav {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        right: -100%;
        width: 280px;
        height: 100vh;
        background-color: var(--bg-primary);
        padding: 5rem 2rem 2rem;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1001;
        box-shadow: -2px 0 20px rgba(0,0,0,0.1);
        overflow-y: auto;
    }
    
    .mobile-nav.active {
        right: 0;
    }
    
    .mobile-nav a {
        display: block;
        padding: 1rem 0;
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 500;
        border-bottom: 1px solid var(--border-color);
        transition: var(--transition);
    }
    
    .mobile-nav a:hover {
        color: var(--primary-color);
        padding-left: 0.5rem;
    }
    
    .mobile-nav a:last-child {
        border-bottom: none;
    }
    
    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .main-nav {
            display: none;
        }
        
        .header-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .theme-toggle {
            display: flex;
        }
        
        .header-actions .btn-primary {
            display: none;
        }
    }
    
    /* Loading state */
    body.loading {
        cursor: wait;
    }
    
    body.loading::after {
        content: 'Loading content...';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-secondary);
        padding: 1rem 2rem;
        border-radius: var(--radius-md);
        z-index: 9999;
        box-shadow: var(--shadow-lg);
    }
    
    /* Project links */
    .project-links {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        flex-wrap: wrap;
    }
    
    .project-links a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border: 1px solid var(--primary-color);
        border-radius: var(--radius-md);
        transition: var(--transition);
        font-size: 0.875rem;
    }
    
    .project-links a:hover {
        background-color: var(--primary-color);
        color: white;
        transform: translateY(-2px);
    }
    
    /* Error states */
    .no-projects,
    .no-skills {
        text-align: center;
        padding: 3rem;
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        grid-column: 1 / -1;
    }
    
    .content-error {
        animation: fadeIn 0.3s ease;
    }
    
    /* Cache refresh button */
    .cache-refresh {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        z-index: 100;
        display: none;
    }
    
    .cache-refresh:hover {
        background: var(--primary-hover);
        transform: scale(1.1);
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    `;
    
    const style = document.createElement('style');
    style.textContent = mobileMenuCSS;
    document.head.appendChild(style);
}

// Add cache refresh button for development
function addCacheRefreshButton() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'cache-refresh';
        refreshBtn.innerHTML = '<i data-lucide="refresh-cw"></i>';
        refreshBtn.setAttribute('title', 'Refresh content cache');
        refreshBtn.setAttribute('aria-label', 'Refresh content');
        
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });
        
        document.body.appendChild(refreshBtn);
        lucide.createIcons();
        
        // Show button after 2 seconds
        setTimeout(() => {
            refreshBtn.style.display = 'block';
        }, 2000);
    }
}

// Initialize everything
// Initialize everything
async function init() {
    console.log('Initializing portfolio...');
    
    // Add mobile menu CSS
    addMobileMenuCSS();
    
    // Load content from markdown
    await loadAndUpdateContent();
    
    // Initialize all functionality
    initThemeToggle();
    initSmoothScrolling();
    initHeaderScrollEffect();
    initProjectCards();
    initSkillAnimations();
    initMobileMenu(); // Make sure this is called
    
    // Add cache refresh button for development
    addCacheRefreshButton();
    
    // Add resize listener for mobile menu
    window.addEventListener('resize', initMobileMenu);
    
    // Add manual refresh hotkey (Ctrl+R)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            loadAndUpdateContent();
        }
    });
    
    // Trigger animations on load
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Animate hero section
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(20px)';
            heroContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 300);
        }
        
        // Ensure icons are created
        setTimeout(() => lucide.createIcons(), 500);
    });
    
    console.log('Portfolio initialized successfully!');
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}




// Export for manual refresh if needed
window.refreshContent = loadAndUpdateContent;
