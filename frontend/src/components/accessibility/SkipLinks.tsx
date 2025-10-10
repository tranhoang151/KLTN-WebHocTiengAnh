import React from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import './SkipLinks.css';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
];

const SkipLinks: React.FC<SkipLinksProps> = ({ links = defaultLinks }) => {
  const { announceToScreenReader } = useAccessibility();

  const handleSkipLinkClick = (href: string, label: string) => {
    const target = document.querySelector(href);
    if (target) {
      // Focus the target element
      const focusableTarget = target as HTMLElement;
      focusableTarget.focus();

      // If the target isn't naturally focusable, make it focusable temporarily
      if (!focusableTarget.hasAttribute('tabindex')) {
        focusableTarget.setAttribute('tabindex', '-1');
        focusableTarget.addEventListener(
          'blur',
          () => {
            focusableTarget.removeAttribute('tabindex');
          },
          { once: true }
        );
      }

      // Announce the skip action
      announceToScreenReader(`Skipped to ${label.toLowerCase()}`, 'polite');
    }
  };

  return (
    <nav className="skip-links" aria-label="Skip navigation links">
      <ul className="skip-links-list">
        {links.map((link, index) => (
          <li key={index} className="skip-links-item">
            <a
              href={link.href}
              className="skip-link"
              onClick={(e) => {
                e.preventDefault();
                handleSkipLinkClick(link.href, link.label);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSkipLinkClick(link.href, link.label);
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SkipLinks;
