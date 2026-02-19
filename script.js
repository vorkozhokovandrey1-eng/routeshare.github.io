// Smooth scroll functions
function scrollToForm() {
    document.getElementById('contact-form').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToHowItWorks() {
    document.getElementById('how-it-works').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// FAQ Toggle
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Form handling
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

// Load saved count from localStorage
function loadInterestedCount() {
    const saved = localStorage.getItem('interestedCount');
    return saved ? parseInt(saved) : 0;
}

// Save count to localStorage
function saveInterestedCount(count) {
    localStorage.setItem('interestedCount', count.toString());
}

// Update counter display
function updateCounter() {
    const count = loadInterestedCount();
    const counterElement = document.getElementById('interestedCount');
    if (counterElement) {
        // Animate counter
        animateCounter(counterElement, 0, count, 1000);
    }
}

// Animate counter
function animateCounter(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Handle form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        city: document.getElementById('city').value,
        interest: document.getElementById('interest').value,
        timestamp: new Date().toISOString()
    };
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Пожалуйста, введите корректный email адрес');
        return;
    }
    
    try {
        // Save to localStorage (in production, this would be sent to a backend)
        const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        submissions.push(formData);
        localStorage.setItem('formSubmissions', JSON.stringify(submissions));
        
        // Update counter
        const currentCount = loadInterestedCount();
        saveInterestedCount(currentCount + 1);
        updateCounter();
        
        // Hide form and show success message
        contactForm.style.display = 'none';
        formSuccess.classList.remove('hidden');
        
        // Scroll to success message
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // In production, you would send this data to your backend:
        // await fetch('/api/submit', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formData)
        // });
        
        console.log('Form submission saved:', formData);
        console.log('All submissions:', submissions);
        
    } catch (error) {
        console.error('Error saving form data:', error);
        alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize counter
    updateCounter();
    
    // Add scroll animations to sections
    const animatedElements = document.querySelectorAll('.step, .benefit-card, .case-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
});

// Export data function (for admin use)
function exportSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    const csv = [
        ['Email', 'City', 'Interest', 'Timestamp'],
        ...submissions.map(s => [s.email, s.city || '', s.interest || '', s.timestamp])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routeshare-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Make export function available in console for admin use
window.exportSubmissions = exportSubmissions;
