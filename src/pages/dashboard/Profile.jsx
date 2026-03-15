import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/config";
import { 
  Camera, 
  Upload, 
  FileText, 
  Github, 
  Linkedin, 
  Twitter, 
  Globe, 
  Loader2,
  Save,
  User
} from "lucide-react";
import { PageTransition } from "../../components/PageTransition";

export default function Profile() {
  const { userData, updateUserData } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: userData?.fullName || "",
      bio: userData?.bio || "",
      branch: userData?.branch || "",
      graduationYear: userData?.graduationYear || "",
      github: userData?.socialLinks?.github || "",
      linkedin: userData?.socialLinks?.linkedin || "",
      twitter: userData?.socialLinks?.twitter || "",
      portfolio: userData?.socialLinks?.portfolio || "",
    }
  });

  const uploadFile = async (file, path, setUploadState, onSuccess) => {
    if (!file) return;
    
    // Size check (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadState(true);
    try {
      const storageRef = ref(storage, `${path}/${userData.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await onSuccess(downloadURL);
      toast.success("Uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file. Check permissions.");
    } finally {
      setUploadState(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      uploadFile(file, 'profile_photos', setUploadingPhoto, async (url) => {
        await updateUserData({ profilePhotoUrl: url });
      });
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Please upload a PDF file");
        return;
      }
      uploadFile(file, 'resumes', setUploadingResume, async (url) => {
        await updateUserData({ resumeUrl: url });
      });
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const updatedData = {
        fullName: data.fullName,
        bio: data.bio,
        branch: data.branch,
        graduationYear: data.graduationYear,
        socialLinks: {
          github: data.github,
          linkedin: data.linkedin,
          twitter: data.twitter,
          portfolio: data.portfolio,
        }
      };
      await updateUserData(updatedData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information, photo, and resume.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Media Uploads */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
            <h3 className="font-semibold text-lg w-full mb-2 border-b border-border pb-2">Profile Photo</h3>
            
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-slate-100 dark:bg-slate-800 shadow-xl">
              {userData?.profilePhotoUrl ? (
                <img 
                  src={userData.profilePhotoUrl} 
                  alt={userData.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-200 dark:bg-slate-700">
                  <User size={48} />
                </div>
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity justify-center items-center flex text-white backdrop-blur-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {uploadingPhoto ? <Loader2 className="animate-spin" /> : <Camera />}
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden" 
            />
            <p className="text-xs text-muted-foreground">Recommended: Square image, max 5MB</p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-2">Resume Upload</h3>
            <div className="space-y-3">
              {userData?.resumeUrl && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <FileText size={16} className="shrink-0" />
                    Resume active
                  </span>
                  <a href={userData.resumeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">View</a>
                </div>
              )}
              
              <button 
                onClick={() => resumeInputRef.current?.click()}
                disabled={uploadingResume}
                className="w-full py-3 px-4 border-2 border-dashed border-border hover:border-primary rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {uploadingResume ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                {uploadingResume ? "Uploading..." : "Upload PDF Resume"}
              </button>
              <input 
                type="file" 
                ref={resumeInputRef}
                onChange={handleResumeUpload}
                accept="application/pdf"
                className="hidden" 
              />
              <p className="text-xs text-muted-foreground text-center">Max size: 5MB</p>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="md:col-span-2 glass-card p-6 md:p-8 rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="font-semibold text-xl border-b border-border pb-4 mb-6">Personal Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  {...register("fullName", { required: "Name is required" })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Branch / Department</label>
                <input
                  {...register("branch")}
                  placeholder="Computer Science"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Graduation Year</label>
                <input
                  {...register("graduationYear")}
                  placeholder="2025"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Bio (About Me)</label>
                <textarea
                  {...register("bio")}
                  rows="4"
                  placeholder="Tell recruiters about yourself..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                ></textarea>
              </div>
            </div>

            <h3 className="font-semibold text-xl border-b border-border pb-4 pt-4 mt-8 mb-6">Social Links</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Github size={16} /> GitHub URL
                </label>
                <input
                  {...register("github")}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Linkedin size={16} /> LinkedIn URL
                </label>
                <input
                  {...register("linkedin")}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Twitter size={16} /> Twitter / X URL
                </label>
                <input
                  {...register("twitter")}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe size={16} /> Personal Website
                </label>
                <input
                  {...register("portfolio")}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={saving || uploadingPhoto || uploadingResume}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
