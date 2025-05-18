import { NextRequest, NextResponse } from 'next/server';
import { projects as initialProjects, Project } from '@/data/projects';

// Store projects in memory for demo purposes
// In a real app, this would be stored in a database
const projects = [...initialProjects];

export async function GET() {
  // Get projects from localStorage if available (on client-side)
  if (typeof window !== 'undefined') {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      return NextResponse.json({ projects: JSON.parse(storedProjects) });
    }
  }
  
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  try {
    const newProject = await request.json();
    
    // Validate required fields
    if (!newProject.title || !newProject.description || !newProject.technologies) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate a unique ID if not provided
    if (!newProject.id) {
      newProject.id = `project-${Date.now()}`;
    }
    
    // Add the new project to the list
    projects.push(newProject as Project);
    
    return NextResponse.json({ 
      success: true, 
      project: newProject,
      projects: projects
    });
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json(
      { error: 'Failed to add project' },
      { status: 500 }
    );
  }
}
