import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-page flex flex-col items-center justify-center text-center">
        <p className="font-mono text-sm tracking-[0.3em] text-accent-400">404</p>
        <h1 className="h-display mt-4">Page not found</h1>
        <p className="lead mt-4 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </section>
  );
}