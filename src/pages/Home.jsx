import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, BookOpen, Code, Trophy, Layout } from "lucide-react";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-4xl text-center space-y-8 z-10 glass-card p-12 rounded-3xl">
        <div className="inline-block p-2 px-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium text-sm mb-4 border border-blue-200 dark:border-blue-800">
          Gandhi Academy of Technology and Engineering
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Build Your <span className="text-gradient">Professional</span> Portfolio
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Create a stunning, interactive portfolio showcasing your skills, projects, and achievements. Share your unique link with recruiters and stand out.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          {currentUser ? (
            <Link 
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/30 w-full sm:w-auto justify-center"
            >
              Go to Dashboard <ArrowRight size={20} />
            </Link>
          ) : (
            <>
              <Link 
                to="/signup"
                className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/30 w-full sm:w-auto justify-center"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link 
                to="/login"
                className="px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all w-full sm:w-auto justify-center flex"
              >
                Log In
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-border mt-12">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                {feature.icon}
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const features = [
  { icon: <Layout />, title: "Beautiful Templates" },
  { icon: <Code />, title: "Project Showcase" },
  { icon: <Trophy />, title: "Achievements" },
  { icon: <BookOpen />, title: "Resume Hosting" },
];
