// About Me page component

export default function AboutMePage() {
  return (
    <>
      <div className="bg-gradient-to-b from-primary/5 to-background dark:from-background dark:to-primary/5 py-16">
        <div className="container-custom">
          <h1 className="heading-lg mb-4">About Me</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            This is the about me page. Add a description here.
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
}