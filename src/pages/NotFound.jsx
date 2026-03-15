import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800">404</h1>
      <h2 className="text-3xl font-bold mt-4 mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The portfolio or page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/"
        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-blue-600 transition-all flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Back to Home
      </Link>
    </div>
  );
}
