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
  serverTimestamp
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { Plus, X, Loader2 } from "lucide-react";
import { PageTransition } from "../../components/PageTransition";

const CATEGORIES = [
  "Programming Languages",
  "Frameworks & Libraries",
  "Tools & Technologies",
  "Databases & Cloud"
];

export default function Skills() {
  const { userData } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [newSkill, setNewSkill] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const fetchSkills = async () => {
    if (!userData?.uid) return;
    try {
      const q = query(
        collection(db, "skills"),
        where("uid", "==", userData.uid)
      );
      const snapshot = await getDocs(q);
      setSkills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast.error("Failed to load skills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.uid]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    
    setAdding(true);
    try {
      const skillData = {
        uid: userData.uid,
        name: newSkill.trim(),
        category,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "skills"), skillData);
      setSkills([...skills, { id: docRef.id, ...skillData }]);
      setNewSkill("");
      toast.success("Skill added!");
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "skills", id));
      setSkills(skills.filter(s => s.id !== id));
      toast.success("Skill removed.");
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to remove skill.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // Group skills by category
  const groupedSkills = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat);
    return acc;
  }, {});

  return (
    <PageTransition className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills & Tech Stack</h1>
        <p className="text-muted-foreground mt-1">Showcase the tools and technologies you know.</p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full space-y-1">
          <label className="text-sm font-medium">Skill Name</label>
          <input 
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. React.js, Python, Docker..."
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddSubmit(e);
            }}
          />
        </div>

        <div className="md:w-64 w-full space-y-1">
          <label className="text-sm font-medium">Category</label>
          <select 
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAddSubmit}
          disabled={adding || !newSkill.trim()}
          className="w-full md:w-auto h-12 px-6 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {adding ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus size={20} />}
          {adding ? "Adding..." : "Add Skill"}
        </button>
      </div>

      <div className="space-y-8 pt-4">
        {CATEGORIES.map(cat => (
          <div key={cat} className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-2 text-muted-foreground flex items-center justify-between">
              {cat}
              <span className="text-sm font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {groupedSkills[cat]?.length || 0}
              </span>
            </h3>

            {groupedSkills[cat]?.length === 0 ? (
              <p className="text-sm text-muted-foreground italic opacity-70">No skills added in this category yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {groupedSkills[cat].map(skill => (
                  <div 
                    key={skill.id}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-800/50 transition-all hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <span className="font-medium whitespace-nowrap">{skill.name}</span>
                    <button 
                      onClick={() => handleDelete(skill.id)}
                      className="text-blue-400 hover:text-red-500 transition-colors bg-white/50 dark:bg-black/20 rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </PageTransition>
  );
}
