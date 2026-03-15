import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Palette, Layout, Moon, Sun, Monitor, Loader2, Save, Check } from "lucide-react";
import { PageTransition } from "../../components/PageTransition";

const THEME_COLORS = [
  { id: "blue", name: "Ocean Blue", class: "bg-blue-500" },
  { id: "purple", name: "Royal Purple", class: "bg-purple-500" },
  { id: "rose", name: "Rose Pink", class: "bg-rose-500" },
  { id: "emerald", name: "Emerald Green", class: "bg-emerald-500" },
  { id: "amber", name: "Warm Amber", class: "bg-amber-500" },
  { id: "slate", name: "Minimal Slate", class: "bg-slate-700" },
];

const LAYOUTS = [
  { id: "modern", name: "Modern Glass", description: "Floating glassmorphic cards and gradients" },
  { id: "minimal", name: "Clean Minimal", description: "Lots of whitespace and subtle borders" },
  { id: "classic", name: "Professional", description: "Traditional structured resume look" },
];

export default function Customize() {
  const { userData, updateUserData } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    themeColor: "blue",
    style: "modern",
    isDark: false
  });

  useEffect(() => {
    if (userData?.customization) {
      setSettings(userData.customization);
    }
  }, [userData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserData({ customization: settings });
      toast.success("Portfolio settings saved!");
    } catch (error) {
      console.error("Error saving customization:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <PageTransition className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Customization</h1>
          <p className="text-muted-foreground mt-1">Make your public portfolio uniquely yours.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 w-full sm:w-auto"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Appearance Settings */}
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-2xl space-y-6">
            <h3 className="font-semibold text-lg border-b border-border pb-2 flex items-center gap-2">
              <Palette size={20} /> Primary Color Theme
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {THEME_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => updateSetting("themeColor", color.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    settings.themeColor === color.id 
                      ? "border-primary bg-primary/5 dark:bg-primary/10" 
                      : "border-border hover:border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${color.class} shadow-inner drop-shadow-sm flex items-center justify-center`}>
                    {settings.themeColor === color.id && <Check size={16} className="text-white" />}
                  </div>
                  <span className="text-xs font-medium text-center">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-2xl space-y-6">
            <h3 className="font-semibold text-lg border-b border-border pb-2 flex items-center gap-2">
              <Sun size={20} /> Color Mode
            </h3>
            
            <div className="flex border border-border rounded-xl p-1 bg-background/50">
              <button
                onClick={() => updateSetting("isDark", false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !settings.isDark 
                    ? "bg-white dark:bg-slate-800 shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun size={18} /> Light Mode
              </button>
              <button
                onClick={() => updateSetting("isDark", true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  settings.isDark 
                    ? "bg-slate-800 shadow-sm text-white" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon size={18} /> Dark Mode
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This forces your public portfolio to always display in the selected mode.
            </p>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="glass-card p-6 md:p-8 rounded-2xl h-fit space-y-6">
          <h3 className="font-semibold text-lg border-b border-border pb-2 flex items-center gap-2">
            <Layout size={20} /> Portfolio Layout
          </h3>
          
          <div className="space-y-4">
            {LAYOUTS.map(layout => (
              <button
                key={layout.id}
                onClick={() => updateSetting("style", layout.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                  settings.style === layout.id 
                    ? "border-primary bg-primary/5 dark:bg-primary/10" 
                    : "border-border hover:border-border/80 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  settings.style === layout.id ? "border-primary" : "border-muted-foreground/30"
                }`}>
                  {settings.style === layout.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                
                <div>
                  <h4 className="font-semibold">{layout.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1 tracking-tight">{layout.description}</p>
                </div>
                
                <Monitor className={`ml-auto mt-1 shrink-0 ${settings.style === layout.id ? "text-primary" : "text-muted-foreground/30"}`} size={24} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
