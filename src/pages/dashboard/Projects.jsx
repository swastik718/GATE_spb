import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { 
  Plus, 
  Trash2, 
  Github, 
  ExternalLink, 
  Layout, 
  Loader2 
} from "lucide-react";
import { PageTransition } from "../../components/PageTransition";

export default function Projects() {
  const { userData } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    githubLink: "",
    liveLink: ""
  });

  const fetchProjects = async () => {
    if (!userData?.uid) return;
    try {
      const q = query(
        collection(db, "projects"),
        where("uid", "==", userData.uid)
      );
      const snapshot = await getDocs(q);
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory since Firestore requires composite index for where+orderBy
      projectsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.uid]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      if (!formData.title || !formData.description) {
        toast.error("Title and description are required.");
        return;
      }
      
      const techArray = formData.technologies
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const newProject = {
        uid: userData.uid,
        title: formData.title,
        description: formData.description,
        technologies: techArray,
        githubLink: formData.githubLink,
        liveLink: formData.liveLink,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "projects"), newProject);
      
      // Update local state instead of refetching
      setProjects([{ id: docRef.id, ...newProject, createdAt: { toMillis: () => Date.now() } }, ...projects]);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        technologies: "",
        githubLink: "",
        liveLink: ""
      });
      toast.success("Project added successfully!");
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Project deleted.");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <PageTransition className="max-w-5xl space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects Showcase</h1>
        <p className="text-muted-foreground mt-1">Add and manage the projects you want to display on your portfolio.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Add Project Form (Left Col on Desktop) */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl sticky top-24">
          <h3 className="font-semibold text-lg border-b border-border pb-3 mb-5 flex items-center gap-2">
            <Plus size={18} /> Add New Project
          </h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Project Title*</label>
              <input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. E-Commerce App"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description*</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
                rows="3"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Briefly describe what this project does..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Technologies (comma separated)</label>
              <input 
                value={formData.technologies}
                onChange={e => setFormData({...formData, technologies: e.target.value})}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="React, Firebase, Tailwind"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">GitHub Link</label>
              <input 
                type="url"
                value={formData.githubLink}
                onChange={e => setFormData({...formData, githubLink: e.target.value})}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Live Demo Link</label>
              <input 
                type="url"
                value={formData.liveLink}
                onChange={e => setFormData({...formData, liveLink: e.target.value})}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {adding ? <Loader2 className="animate-spin h-5 w-5" /> : "Save Project"}
            </button>
          </form>
        </div>

        {/* Projects List (Right Col on Desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold px-1 text-muted-foreground uppercase text-xs tracking-wider">
            Your Projects ({projects.length})
          </h3>
          
          {projects.length === 0 ? (
            <div className="glass p-12 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed border-muted-foreground/30 text-muted-foreground">
              <Layout size={40} className="mb-4 opacity-50" />
              <p>You haven't added any projects yet.</p>
              <p className="text-sm mt-1">Use the form to create your first one.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="glass-card p-5 rounded-2xl flex flex-col group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="absolute top-3 right-3 p-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>

                  <h4 className="font-bold text-lg pr-8 truncate">{project.title}</h4>
                  
                  <div className="flex gap-2.5 mt-2 mb-3">
                    {project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:scale-110 transition-transform">
                        <Github size={18} />
                      </a>
                    )}
                    {project.liveLink && (
                      <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 hover:scale-110 transition-transform">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {project.technologies?.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-md border border-border">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
