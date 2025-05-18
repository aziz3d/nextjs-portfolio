import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { pageName, pageUrl, pageTemplate } = await request.json();
    
    if (!pageName || !pageUrl) {
      return NextResponse.json({ error: 'Page name and URL are required' }, { status: 400 });
    }

    // Sanitize the URL (remove leading slash if present)
    const sanitizedUrl = pageUrl.startsWith('/') ? pageUrl.substring(1) : pageUrl;
    
    // Create the directory path for the page
    const pageDirPath = path.join(process.cwd(), 'src', 'app', sanitizedUrl);
    
    // Check if the page already exists
    if (existsSync(pageDirPath)) {
      return NextResponse.json({ error: 'Page already exists', pageUrl }, { status: 409 });
    }

    // Create the directory for the page
    await mkdir(pageDirPath, { recursive: true });

    // Generate page content based on template or use default template
    let pageContent = '';
    
    if (pageTemplate === 'basic') {
      pageContent = `export default function ${pageName.replace(/\s+/g, '')}Page() {
  return (
    <div className="container-custom py-16 min-h-[70vh]">
      <h1 className="heading-lg mb-8">${pageName}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p>This is the ${pageName.toLowerCase()} page. Edit this content to add your own.</p>
      </div>
    </div>
  );
}`;
    } else if (pageTemplate === 'withHero') {
      pageContent = `import Image from 'next/image';

export default function ${pageName.replace(/\s+/g, '')}Page() {
  return (
    <>
      <div className="bg-gradient-to-b from-primary/5 to-background dark:from-background dark:to-primary/5 py-16">
        <div className="container-custom">
          <h1 className="heading-lg mb-4">${pageName}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            This is the ${pageName.toLowerCase()} page. Add a description here.
          </p>
        </div>
      </div>
      <div className="container-custom py-16">
        <div className="prose dark:prose-invert max-w-none">
          <p>Edit this content to add your own.</p>
        </div>
      </div>
    </>
  );
}`;
    } else {
      // Default template
      pageContent = `export default function ${pageName.replace(/\s+/g, '')}Page() {
  return (
    <div className="container-custom py-16 min-h-[70vh]">
      <h1 className="heading-lg mb-8">${pageName}</h1>
      <p>This is the ${pageName.toLowerCase()} page.</p>
    </div>
  );
}`;
    }

    // Write the page.tsx file
    const pageFilePath = path.join(pageDirPath, 'page.tsx');
    await writeFile(pageFilePath, pageContent);

    return NextResponse.json({ 
      success: true, 
      message: `Page '${pageName}' created successfully at ${pageUrl}`,
      pageUrl
    });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Page creation API is working' });
}
