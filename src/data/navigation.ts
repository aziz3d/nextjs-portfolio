export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  order: number;
  isActive: boolean;
}

export interface SiteConfig {
  id: string;
  logoText: string;
  logoImage?: string;
  logoSize?: number;
  useTextLogo?: boolean;
}

// Default navigation items
export const defaultNavItems: NavigationItem[] = [
  { id: 'nav-home', name: 'Home', href: '/', order: 1, isActive: true },
  { id: 'nav-projects', name: 'Projects', href: '/projects', order: 2, isActive: true },
  { id: 'nav-services', name: 'Services', href: '/services', order: 3, isActive: true },
  { id: 'nav-skills', name: 'Skills', href: '/skills', order: 4, isActive: true },
  { id: 'nav-blog', name: 'Blog', href: '/blog', order: 5, isActive: true },
  { id: 'nav-timeline', name: 'Timeline', href: '/timeline', order: 6, isActive: true },
  { id: 'nav-contact', name: 'Contact', href: '/contact', order: 7, isActive: true },
];

// Default site configuration
export const defaultSiteConfig: SiteConfig = {
  id: 'site-config',
  logoText: 'Portfolio',
  logoSize: 120,
  useTextLogo: false
};
