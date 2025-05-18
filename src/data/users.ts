// User model and types for the portfolio application

export type UserRole = 'admin' | 'moderator' | 'content_writer';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Define permissions for each role
export const rolePermissions = {
  admin: {
    canManageUsers: true,
    canManageSiteSettings: true,
    canManageNavigation: true,
    canManageFooter: true,
    canManageLegalPages: true,
    canManageLogos: true,
    canManage3DModels: true,
    canManageHero: true,
    canManageHighlights: true,
    canManageProjects: true,
    canManageSkills: true,
    canManageTimeline: true,
    canManageServices: true,
    canManageTestimonials: true,
    canManageContact: true,
    canManagePages: true,
    canManageBlog: true,
  },
  moderator: {
    canManageUsers: false,
    canManageSiteSettings: false,
    canManageNavigation: false,
    canManageFooter: false,
    canManageLegalPages: false,
    canManageLogos: false,
    canManage3DModels: false,
    canManageHero: false,
    canManageHighlights: false,
    canManageProjects: true,
    canManageSkills: false,
    canManageTimeline: false,
    canManageServices: false,
    canManageTestimonials: false,
    canManageContact: true,
    canManagePages: false,
    canManageBlog: false,
  },
  content_writer: {
    canManageUsers: false,
    canManageSiteSettings: false,
    canManageNavigation: false,
    canManageFooter: false,
    canManageLegalPages: false,
    canManageLogos: false,
    canManage3DModels: false,
    canManageHero: false,
    canManageHighlights: false,
    canManageProjects: false,
    canManageSkills: false,
    canManageTimeline: false,
    canManageServices: false,
    canManageTestimonials: false,
    canManageContact: true,
    canManagePages: true,
    canManageBlog: true,
  }
};

// Default admin user
export const defaultUsers: User[] = [
  {
    id: 'admin-user-default',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Helper function to check if a user has permission for a specific action
export function hasPermission(user: User | null | undefined, permission: keyof typeof rolePermissions.admin): boolean {
  if (!user) return false;
  return rolePermissions[user.role][permission] || false;
}

// Helper function to get all users from localStorage
export function getUsers(): User[] {
  if (typeof window === 'undefined') return defaultUsers;
  
  try {
    const storedUsers = localStorage.getItem('portfolioUsers');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    
    // If no users exist yet, initialize with default admin
    localStorage.setItem('portfolioUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch (error) {
    console.error('Error loading users:', error);
    return defaultUsers;
  }
}

// Helper function to save users to localStorage
export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('portfolioUsers', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Helper function to get a user by email
export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
}

// Helper function to get a user by ID
export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
}
