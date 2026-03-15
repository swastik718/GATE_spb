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
import { Plus, Trash2, Award, Loader2 } from "lucide-react";
import { PageTransition } from "../../components/PageTransition";

export default function Achievements() {
  const { userData } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: ""
  });

  const fetchAchievements = async () => {
    if (!userData?.uid) return;
    try {
      const q = query(
        collection(db, "achievements"),
        where("uid", "==", userData.uid)
      );
      const snapshot = await getDocs(q);
      const achievementsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      achievementsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setAchievements(achievementsData);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.uid]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast.error("Title and date are required");
      return;
    }

    setAdding(true);
    try {
      const newAchievement = {
        uid: userData.uid,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "achievements"), newAchievement);
      
      setAchievements([{ id: docRef.id, ...newAchievement, createdAt: { toMillis: () => Date.now() } }, ...achievements]);
      
      setFormData({ title: "", description: "", date: "" });
      toast.success("Achievement added!");
    } catch (error) {
      console.error("Error adding achievement:", error);
      toast.error("Failed to add achievement.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this achievement?")) return;
    try {
      await deleteDoc(doc(db, "achievements", id));
      setAchievements(achievements.filter(a => a.id !== id));
      toast.success("Achievement deleted.");
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement.");
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
    <PageTransition className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements & Certifications</h1>
        <p className="text-muted-foreground mt-1">Highlight your awards, hackathons, and certifications.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        {/* Form (Left) */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl sticky top-24">
          <h3 className="font-semibold text-lg border-b border-border pb-3 mb-5 flex items-center gap-2">
            <Plus size={18} /> Add New
          </h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title*</label>
              <input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. AWS Certified Cloud Practitioner"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Date / Month*</label>
              <input 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Aug 2024"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Briefly describe what this is..."
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {adding ? <Loader2 className="animate-spin h-5 w-5" /> : "Save Achievement"}
            </button>
          </form>
        </div>

        {/* List (Right) */}
        <div className="md:col-span-3 space-y-4">
          <h3 className="font-semibold px-1 text-muted-foreground uppercase text-xs tracking-wider">
            Your Timeline ({achievements.length})
          </h3>
          
          {achievements.length === 0 ? (
            <div className="glass p-10 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed border-muted-foreground/30 text-muted-foreground">
              <Award size={40} className="mb-4 opacity-50" />
              <p>No achievements added yet.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Award size={18} />
                  </div>

                  {/* Card */}
                  <div className="glass-card w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl relative shadow-md transition-all hover:shadow-lg group-hover:-translate-y-1">
                    
                    <button 
                      onClick={() => handleDelete(achievement.id)}
                      className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>

                    <span className="text-xs font-bold text-primary mb-1 block">{achievement.date}</span>
                    <h4 className="font-bold text-lg leading-tight mb-2 pr-6">{achievement.title}</h4>
                    {achievement.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {achievement.description}
                      </p>
                    )}
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
