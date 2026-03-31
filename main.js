// Scroll Reveal logic using IntersectionObserver
const revealOnScroll = () => {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, we can stop observing this specific element
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15 // Trigger when 15% of the element is visible
  });

  revealElements.forEach(el => observer.observe(el));
};

document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
  
  // Ripple Effect Logic
  const createRipple = (e) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple-span");

    const ripple = button.getElementsByClassName("ripple-span")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  const rippleButtons = document.querySelectorAll(".ripple");
  rippleButtons.forEach(btn => btn.addEventListener("click", createRipple));
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

