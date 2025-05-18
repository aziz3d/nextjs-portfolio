export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl?: string;
  rating?: number;
  featured: boolean;
}

export const defaultTestimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Sarah Johnson',
    role: 'CTO',
    company: 'TechSolutions Inc.',
    content: 'Working with this developer was an absolute pleasure. They delivered our project on time and exceeded our expectations with their attention to detail and creative solutions.',
    avatarUrl: '/images/testimonials/avatar1.jpg',
    rating: 5,
    featured: true
  },
  {
    id: 'testimonial-2',
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'InnovateCorp',
    content: 'I was impressed by the level of expertise and professionalism. Our web application not only looks beautiful but performs exceptionally well. Would definitely work with them again!',
    avatarUrl: '/images/testimonials/avatar2.jpg',
    rating: 5,
    featured: true
  },
  {
    id: 'testimonial-3',
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    company: 'CreativeAgency',
    content: 'The attention to UX details and responsive design implementation was outstanding. Our conversion rates have increased significantly since launching the new site.',
    avatarUrl: '/images/testimonials/avatar3.jpg',
    rating: 4,
    featured: false
  }
];
