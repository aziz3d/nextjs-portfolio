export interface FooterConfig {
  id: string;
  description: string;
  copyrightText: string;
  socialLinks: SocialLink[];
  quickLinks: QuickLink[];
  contactInfo: ContactInfo;
  legalLinks: LegalLink[];
  legalTitle: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string; // SVG string or path to local SVG file
  ariaLabel: string;
  order: number;
  isActive: boolean;
  useLocalSvg?: boolean; // Flag to indicate if using a local SVG file
  localSvgPath?: string; // Path to the local SVG file
}

export interface QuickLink {
  id: string;
  name: string;
  href: string;
  order: number;
  isActive: boolean;
}

export interface ContactInfo {
  email: string;
  location: string;
}

export interface LegalLink {
  id: string;
  name: string;
  href: string;
  order: number;
  isActive: boolean;
}

// Default footer configuration
export const defaultFooterConfig: FooterConfig = {
  id: 'footer-config',
  description: 'Creative developer and designer specializing in immersive digital experiences, 3D web development, and AI-powered applications.',
  copyrightText: '© {year} Portfolio. All rights reserved.',
  legalTitle: 'Legal',
  socialLinks: [
    {
      id: 'social-linkedin',
      platform: 'LinkedIn',
      url: '#',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>',
      ariaLabel: 'LinkedIn',
      order: 1,
      isActive: true
    },
    {
      id: 'social-github',
      platform: 'GitHub',
      url: '#',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
      ariaLabel: 'GitHub',
      order: 2,
      isActive: true
    },
    {
      id: 'social-twitter',
      platform: 'Twitter',
      url: '#',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/></svg>',
      ariaLabel: 'Twitter',
      order: 3,
      isActive: true
    },
    {
      id: 'social-dribbble',
      platform: 'Dribbble',
      url: '#',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 0C3.584 0 0 3.584 0 8s3.584 8 8 8c4.408 0 8-3.584 8-8s-3.592-8-8-8zm5.284 3.688a6.802 6.802 0 0 1 1.545 4.251c-.226-.043-2.482-.503-4.755-.217-.052-.112-.096-.224-.148-.338-.148-.33-.296-.668-.451-.99 2.516-1.023 3.662-2.498 3.81-2.706zM8 1.18c1.735 0 3.323.65 4.53 1.718-.122.174-1.155 1.553-3.584 2.464-1.12-2.056-2.36-3.74-2.551-4A6.95 6.95 0 0 1 8 1.18zm-2.907.642A43.123 43.123 0 0 1 7.627 5.77c-3.193.85-6.013.833-6.317.833a6.865 6.865 0 0 1 3.783-4.78zM1.163 8.01V7.8c.295.01 3.61.053 7.02-.971.199.381.381.772.555 1.162l-.27.078c-3.522 1.137-5.396 4.243-5.553 4.504a6.817 6.817 0 0 1-1.762-4.564zM8 14.837a6.785 6.785 0 0 1-4.19-1.44c.12-.252 1.509-2.924 5.361-4.269.018-.009.026-.009.044-.017a28.246 28.246 0 0 1 1.457 5.18A6.722 6.722 0 0 1 8 14.837zm3.81-1.171c-.07-.417-.435-2.412-1.328-4.868 2.143-.338 4.017.217 4.251.295a6.774 6.774 0 0 1-2.924 4.573z"/></svg>',
      ariaLabel: 'Dribbble',
      order: 4,
      isActive: true
    }
  ],
  quickLinks: [
    { id: 'quick-home', name: 'Home', href: '/', order: 1, isActive: true },
    { id: 'quick-projects', name: 'Projects', href: '/projects', order: 2, isActive: true },
    { id: 'quick-skills', name: 'Skills', href: '/skills', order: 3, isActive: true },
    { id: 'quick-timeline', name: 'Timeline', href: '/timeline', order: 4, isActive: true },
    { id: 'quick-contact', name: 'Contact', href: '/contact', order: 5, isActive: true }
  ],
  contactInfo: {
    email: 'contact@example.com',
    location: 'San Francisco, California'
  },
  legalLinks: [
    { id: 'legal-privacy', name: 'Privacy Policy', href: '/privacy-policy', order: 1, isActive: true },
    { id: 'legal-terms', name: 'Terms of Service', href: '/terms-of-service', order: 2, isActive: true }
  ]
};
