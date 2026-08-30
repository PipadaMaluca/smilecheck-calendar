import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Auto-reveals every element on the landing page with `data-reveal` attribute.
 * Variants:
 *  - data-reveal="up"      → fade + slide up (default)
 *  - data-reveal="left"    → slide in from left
 *  - data-reveal="words"   → split text by words and stagger
 *  - data-reveal="image"   → 3D tilt + scale entrance
 *  - data-reveal="stagger" → stagger direct children
 * Optional: data-reveal-delay="200" (ms)
 */
export function useGsapReveals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Words variant — split each [data-reveal="words"] into word spans
      gsap.utils.toArray<HTMLElement>('[data-reveal="words"]').forEach((el) => {
        if (el.dataset.split === '1') return;
        // Preserve children (e.g. highlighted span) by walking child nodes
        const frag = document.createDocumentFragment();
        el.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parts = (node.textContent || '').split(/(\s+)/);
            parts.forEach((p) => {
              if (!p) return;
              if (/^\s+$/.test(p)) {
                frag.appendChild(document.createTextNode(p));
              } else {
                const span = document.createElement('span');
                span.className = 'reveal-word inline-block';
                span.style.willChange = 'transform, opacity';
                span.textContent = p;
                frag.appendChild(span);
              }
            });
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const cloned = node.cloneNode(true) as HTMLElement;
            cloned.classList.add('reveal-word', 'inline-block');
            (cloned.style as CSSStyleDeclaration).willChange = 'transform, opacity';
            frag.appendChild(cloned);
          }
        });
        el.innerHTML = '';
        el.appendChild(frag);
        el.dataset.split = '1';

        const words = el.querySelectorAll('.reveal-word');
        gsap.from(words, {
          opacity: 0,
          y: 16,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="up"]').forEach((el) => {
        const delay = parseFloat(el.dataset.revealDelay || '0') / 1000;
        gsap.from(el, {
          opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', delay,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="left"]').forEach((el) => {
        gsap.from(el, {
          opacity: 0, x: -30, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="image"]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0.4, scale: 0.95, rotateY: 6 },
          {
            opacity: 1, scale: 1, rotateY: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
        const children = Array.from(el.children) as HTMLElement[];
        gsap.from(children, {
          opacity: 0, x: -20, duration: 0.45, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="cards"]').forEach((el) => {
        const children = Array.from(el.children) as HTMLElement[];
        gsap.from(children, {
          opacity: 0, y: 40, duration: 0.6, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      // Parallax on images
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.to(el, {
          yPercent: -8, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // 3D card tilt on hover (desktop only — pointer: fine + hover: hover)
      const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (supportsHover) {
        const tiltCards = document.querySelectorAll<HTMLElement>("[data-anim='tilt-card']");
        tiltCards.forEach((card) => {
          card.style.transformStyle = 'preserve-3d';
          card.style.willChange = 'transform';
          const onMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transition = 'transform 0.1s ease';
            card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(10px)`;
          };
          const onLeave = () => {
            card.style.transition = 'transform 0.4s ease';
            card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
          };
          card.addEventListener('mousemove', onMove);
          card.addEventListener('mouseleave', onLeave);
        });
      }
    });

    // Refresh after fonts/layout settle
    const t = setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, []);
}