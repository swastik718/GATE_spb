import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { 
  Github, Linkedin, Twitter, Globe, FileText, 
  MapPin, Calendar, Mail, ExternalLink, Loader2, Award 
} from "lucide-react";

export default function PublicPortfolio() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    user: null,
    projects: [],
    skills: {},
    achievements: []
  });

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        // 1. Get User by Username
        const userQ = query(collection(db, "users"), where("username", "==", username));
        const userSnapshot = await getDocs(userQ);
        
        if (userSnapshot.empty) {
          navigate("/404");
          return;
        }

        const userData = { id: userSnapshot.docs[0].id, ...userSnapshot.docs[0].data() };
        const uid = userData.uid;

        // 2. Get Collections in parallel
        const [projectsSnap, skillsSnap, achievementsSnap] = await Promise.all([
          getDocs(query(collection(db, "projects"), where("uid", "==", uid))),
          getDocs(query(collection(db, "skills"), where("uid", "==", uid))),
          getDocs(query(collection(db, "achievements"), where("uid", "==", uid)))
        ]);

        // Process data
        let projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        projects.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());

        let achievementsTran = achievementsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        achievementsTran.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());

        const skillsRaw = skillsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const skillsGrouped = skillsRaw.reduce((acc, skill) => {
          if (!acc[skill.category]) acc[skill.category] = [];
          acc[skill.category].push(skill);
          return acc;
        }, {});

        setData({
          user: userData,
          projects,
          skills: skillsGrouped,
          achievements: achievementsTran
        });

      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [username, navigate]);

  // Apply customizations
  useEffect(() => {
    if (data.user?.customization) {
      const { isDark, themeColor } = data.user.customization;
      const root = document.documentElement;
      
      // Handle dark mode force
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // We could use CSS variables for theme injection, but for simple Tailwind
      // we'll apply a data-theme attribute and map colors, or since we used Tailwind classes,
      // we can inject a class to a wrapper div. For this simplified version, 
      // we'll rely on the default primary colors and dynamically adjust below.
    }
    
    // Cleanup on unmount
    return () => document.documentElement.classList.remove('dark');
  }, [data.user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  const { user, projects, skills, achievements } = data;
  const custom = user.customization || { themeColor: 'blue', style: 'modern' };

  // Theme color mapping for Tailwind bg/text classes
  const themeColors = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-100/50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', lightBg: 'bg-purple-100/50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    rose: { bg: 'bg-rose-600', text: 'text-rose-600', lightBg: 'bg-rose-100/50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800' },
    emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', lightBg: 'bg-emerald-100/50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-600', lightBg: 'bg-amber-100/50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
    slate: { bg: 'bg-slate-700', text: 'text-slate-700', lightBg: 'bg-slate-200/50 dark:bg-slate-800/50', border: 'border-slate-300 dark:border-slate-700' },
  };
  
  const theme = themeColors[custom.themeColor] || themeColors.blue;
  const isMinimal = custom.style === 'minimal';
  const isClassic = custom.style === 'classic';

  return (
    <div className={`min-h-screen bg-background text-foreground selection:${theme.bg} selection:text-white`}>
      {/* Dynamic Background */}
      {!isMinimal && !isClassic && (
        <>
          <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${theme.bg} opacity-[0.05] rounded-full blur-[100px] pointer-events-none`} />
          <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] ${theme.bg} opacity-[0.05] rounded-full blur-[100px] pointer-events-none`} />
        </>
      )}

      {/* Header / Hero */}
      <header className={`max-w-5xl mx-auto pt-20 pb-12 px-6 ${isClassic ? 'border-b border-border/50' : ''}`}>
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          {/* Avatar */}
          <div className="shrink-0 mb-4 md:mb-0">
            {user.profilePhotoUrl ? (
              <img 
                src={user.profilePhotoUrl} 
                alt={user.fullName} 
                className={`w-40 h-40 object-cover ${
                  isMinimal ? 'rounded-2xl grayscale hover:grayscale-0 transition-all' : 
                  isClassic ? 'rounded-full border-4 border-background shadow-md' : 
                  `rounded-full border-4 border-background shadow-xl ring-4 ring-offset-4 ring-offset-background ${theme.text.replace('text', 'ring').replace('-600', '-500/30')}`
                }`}
              />
            ) : (
              <div className={`w-40 h-40 rounded-full flex items-center justify-center text-4xl font-bold bg-slate-200 text-slate-500 dark:bg-slate-800 ${theme.border}`}>
                {user.fullName.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${!isMinimal && !isClassic ? 'bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60' : ''}`}>
                {user.fullName}
              </h1>
              
              {(user.branch || user.graduationYear) && (
                <div className={`flex flex-wrap items-center gap-3 mt-3 justify-center md:justify-start ${isClassic ? 'text-muted-foreground' : theme.text}`}>
                  {user.branch && <span className="font-medium">{user.branch}</span>}
                  {user.branch && user.graduationYear && <span>•</span>}
                  {user.graduationYear && <span>Class of {user.graduationYear}</span>}
                </div>
              )}
            </div>

            {user.bio && (
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Links & Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2 justify-center md:justify-start">
              {user.resumeUrl && (
                <a 
                  href={user.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all shadow-sm hover:-translate-y-0.5 ${
                    isMinimal ? 'border-2 border-foreground text-foreground hover:bg-foreground hover:text-background' :
                    `${theme.bg} text-white hover:opacity-90 shadow-md`
                  }`}
                >
                  <FileText size={18} /> View Resume
                </a>
              )}
              
              <div className="flex items-center gap-3 ml-2">
                {user.socialLinks?.github && <SocialLink href={user.socialLinks.github} icon={<Github />} theme={theme} isMinimal={isMinimal} />}
                {user.socialLinks?.linkedin && <SocialLink href={user.socialLinks.linkedin} icon={<Linkedin />} theme={theme} isMinimal={isMinimal} />}
                {user.socialLinks?.twitter && <SocialLink href={user.socialLinks.twitter} icon={<Twitter />} theme={theme} isMinimal={isMinimal} />}
                {user.socialLinks?.portfolio && <SocialLink href={user.socialLinks.portfolio} icon={<Globe />} theme={theme} isMinimal={isMinimal} />}
                {user.email && <SocialLink href={`mailto:${user.email}`} icon={<Mail />} theme={theme} isMinimal={isMinimal} />}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-20 relative z-10">
        
        {/* Skills Section */}
        {Object.keys(skills).length > 0 && (
          <section>
            <SectionHeading title="Technical Skills" theme={theme} isMinimal={isMinimal} />
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-semibold mb-3 text-muted-foreground uppercase text-xs tracking-wider">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map(skill => (
                      <span 
                        key={skill.id} 
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          isMinimal ? 'bg-background border-2 border-border/80 text-foreground' : 
                          isClassic ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' :
                          `${theme.lightBg} ${theme.text} ${theme.border} border`
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <section>
            <SectionHeading title="Featured Projects" theme={theme} isMinimal={isMinimal} />
            <div className={`grid gap-6 ${isClassic ? '' : 'sm:grid-cols-2'}`}>
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className={`group relative flex flex-col p-6 transition-all ${
                    isMinimal ? 'border-b border-border py-8 px-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50' : 
                    isClassic ? 'border border-border/50 bg-white dark:bg-slate-900 shadow-sm' :
                    `glass-card rounded-2xl hover:shadow-xl hover:-translate-y-1 ${theme.border} border border-opacity-30`
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <div className="flex gap-2.5">
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <Github size={20} />
                        </a>
                      )}
                      {project.liveLink && (
                        <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className={`${theme.text} hover:opacity-70`}>
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed flex-1 mb-5">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.technologies?.map((tech, i) => (
                      <span key={i} className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-border">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <section>
            <SectionHeading title="Achievements & Certifications" theme={theme} isMinimal={isMinimal} />
            <div className={`space-y-6 ${!isMinimal && !isClassic ? 'relative before:absolute before:inset-0 before:ml-6 before:h-full before:w-px before:bg-border' : ''}`}>
              {achievements.map((item, idx) => (
                <div key={item.id} className={`flex gap-6 relative ${isClassic ? 'border-b border-border pb-6 last:border-0' : ''}`}>
                  {!isMinimal && !isClassic && (
                    <div className={`w-12 h-12 rounded-full border-4 border-background flex items-center justify-center shrink-0 z-10 ${theme.bg} text-white shadow-md`}>
                      <Award size={20} />
                    </div>
                  )}
                  <div className={`flex-1 ${!isMinimal && !isClassic ? 'pt-2' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1 gap-2">
                      <h4 className="text-lg font-bold">{item.title}</h4>
                      <span className={`text-sm font-semibold shrink-0 ${theme.text}`}>{item.date}</span>
                    </div>
                    {item.description && (
                      <p className="text-muted-foreground leading-relaxed mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8 text-center text-sm text-muted-foreground">
        <p>Built with Student Portfolio Builder © {new Date().getFullYear()}</p>
        <p className="mt-1">GATE Platform</p>
      </footer>
    </div>
  );
}

// Subcomponents
function SocialLink({ href, icon, theme, isMinimal }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
        isMinimal ? 'bg-transparent text-foreground hover:bg-slate-100 dark:hover:bg-slate-800' : 
        `bg-slate-100 dark:bg-slate-800/80 text-foreground hover:-translate-y-1 hover:shadow-md ${theme.text}`
      }`}
    >
      {React.cloneElement(icon, { size: 20 })}
    </a>
  );
}

function SectionHeading({ title, theme, isMinimal }) {
  return (
    <h2 className={`text-3xl font-bold mb-8 flex items-center gap-4 ${isMinimal ? '' : ''}`}>
      {title}
      {!isMinimal && <div className={`h-px flex-1 bg-gradient-to-r from-border to-transparent`} />}
    </h2>
  );
}
