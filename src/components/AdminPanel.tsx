import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tilt } from "react-tilt";
import {
    LayoutDashboard,
    Zap,
    Settings,
    Briefcase,
    Rocket,
    Star,
    Share2,
    Save,
    Plus,
    Trash2,
    Upload,
    LogOut,
    Globe,
    Github,
    Linkedin,
    Instagram,
    Cpu,
    Search,
    Key
} from "lucide-react";
import { assetsMap } from "../assets";
import LucideIcon from "./LucideIcon";

// Helper to map icon keys to actual assets or return the path
const getIconPreview = (key: string) => {
    if (!key) return null;
    if (key.startsWith("http") || key.startsWith("/") || key.startsWith("data:")) return key;
    return assetsMap[key] || key; // Return the key itself if not in assetsMap (could be Lucide)
};

const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) return `http://localhost:5000${url}`;
    return url;
};

const AdminPanel = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("nav");

    // GitHub Integration State
    const [githubToken, setGithubToken] = useState(localStorage.getItem("gh_pat") || "");
    const [isSaving, setIsSaving] = useState(false);
    const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

    useEffect(() => {
        const session = localStorage.getItem("admin_session");
        if (session) {
            const { expiry } = JSON.parse(session);
            if (new Date().getTime() < expiry) {
                setIsLoggedIn(true);
            } else {
                localStorage.removeItem("admin_session");
            }
        }
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        setError(null);

        // In production, we fetch directly from the local JSON file (read-only)
        // In local dev, we try to fetch from the admin server
        const fetchUrl = isProduction ? "/src/constants/portfolio-data.json" : "http://localhost:5000/api/data";

        fetch(fetchUrl)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load data");
                return res.json();
            })
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                if (isProduction) {
                    setError("Failed to load portfolio data from production source.");
                } else {
                    setError("Admin server is not running or unreachable. If you are on Vercel, please note that the Admin Panel only works when running the project locally with 'npm run admin' unless GitHub API is configured.");
                }
                setLoading(false);
            });
    };

    const handleSave = async () => {
        if (isProduction) {
            await handleProductionSave();
        } else {
            handleLocalSave();
        }
    };

    const handleLocalSave = () => {
        fetch("http://localhost:5000/api/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((res) => alert("Bhai, Data Successfully Save Ho Gaya! 🚀"))
            .catch((err) => alert("Error saving data locally. Ensure 'npm run admin' is running."));
    };

    const handleProductionSave = async () => {
        if (!githubToken) {
            alert("Bhai, Vercel par save karne ke liye 'GitHub Personal Access Token' chahiye. Brand & Info tab mein set karein.");
            setActiveTab("brand");
            return;
        }

        setIsSaving(true);
        try {
            // Configuration for GitHub API
            const owner = "Matloob11"; // User repository owner
            const repo = "Matloob-Portfolio"; // Repository name
            const path = "src/constants/portfolio-data.json";
            const branch = "main";

            // 1. Get the current file SHA
            const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
                headers: { "Authorization": `token ${githubToken}` }
            });

            if (!getRes.ok) throw new Error("Bhai, SHA fetch karne mein masla hua. Token check karein.");
            const fileData = await getRes.json();
            const sha = fileData.sha;

            // 2. Commit the new data
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
            const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${githubToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Admin: Update portfolio data via Vercel Portal",
                    content,
                    sha,
                    branch
                })
            });

            if (!putRes.ok) throw new Error("Commit failed. Check your token permissions.");

            alert("Bhai, Changes GitHub par save ho gaye hain! 🚀 Vercel ab redeploy shuru kar dega. 2-3 minutes mein website update ho jayegi.");
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
        if (isProduction) {
            alert("Bhai, Production mein image upload currently supported nahi hai. Aap image URL use karein ya local admin panel se upload karein.");
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("http://localhost:5000/api/upload", {
                method: "POST",
                body: formData,
            });
            const result = await res.json();
            if (result.url) {
                callback(result.url);
            }
        } catch (err) {
            alert("Upload failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_session");
        setIsLoggedIn(false);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "admin123") {
            const expiry = new Date().getTime() + 10 * 60 * 1000;
            localStorage.setItem("admin_session", JSON.stringify({ expiry }));
            setIsLoggedIn(true);
        } else {
            alert("Wrong password!");
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center h-screen animated-bg text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-black/40 z-0"></div>
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="glass-morphism p-10 rounded-[2rem] shadow-2xl z-10 w-full max-w-md border-t border-l border-white/20"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 mx-auto mb-4 border-2 border-secondary border-dashed rounded-full flex items-center justify-center p-2"
                        >
                            <LayoutDashboard className="w-10 h-10 text-secondary" />
                        </motion.div>
                        <h2 className="text-4xl font-extrabold tracking-tight mb-2">Admin Panel</h2>
                        <p className="text-secondary text-sm font-medium">Secured Portal Access</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-secondary">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="bg-black/30 backdrop-blur-md p-4 rounded-2xl w-full border border-white/10 outline-none focus:border-secondary transition-all text-center text-xl tracking-widest"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="premium-gradient p-4 rounded-2xl w-full font-black uppercase tracking-[0.2em] shadow-lg shadow-secondary/20"
                        >
                            Authenticate
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        );
    }

    if (loading) return (
        <div className="h-screen bg-primary flex flex-col items-center justify-center text-white space-y-4">
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full"
            />
            <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Syncing Systems...</p>
        </div>
    );

    const tabs = [
        { id: "nav", label: "Navigation", icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: "brand", label: "Repo & Brand", icon: <Settings className="w-5 h-5" /> },
        { id: "services", label: "Services", icon: <Zap className="w-5 h-5" /> },
        { id: "tech", label: "Technologies", icon: <Cpu className="w-5 h-5" /> },
        { id: "exp", label: "Experience", icon: <Briefcase className="w-5 h-5" /> },
        { id: "projects", label: "Projects", icon: <Rocket className="w-5 h-5" /> },
        { id: "test", label: "Testimonials", icon: <Star className="w-5 h-5" /> },
        { id: "social", label: "Social", icon: <Share2 className="w-5 h-5" /> }
    ];

    return (
        <div className="animated-bg min-h-screen text-white font-poppins selection:bg-secondary selection:text-primary pb-10">
            <div className="max-w-[1400px] mx-auto p-4 md:p-8">

                {/* HEADER */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-12 glass-morphism p-6 rounded-[2rem] gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20">
                            <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter">Control Center</h1>
                            <p className="text-secondary text-[10px] font-bold uppercase">{isProduction ? "Production Mode (via GitHub)" : "Local Development Mode"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 206, 168, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`premium-gradient px-8 py-3 rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} /> {isSaving ? "Saving..." : "Save All"}
                        </motion.button>
                        <button onClick={handleLogout} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/20">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* SIDEBAR TABS */}
                    <motion.aside
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide"
                    >
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 text-left relative group min-w-[160px] lg:min-w-0 ${activeTab === tab.id
                                    ? 'glass-morphism border-secondary bg-white/5 font-bold translate-x-2'
                                    : 'hover:bg-white/5 opacity-60 hover:opacity-100 hover:translate-x-1'
                                    }`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute inset-0 bg-secondary/10 rounded-2xl blur-md -z-10"
                                    />
                                )}
                                <span className={activeTab === tab.id ? "text-secondary" : ""}>{tab.icon}</span>
                                <span className="uppercase text-[11px] tracking-widest">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_rgba(0,206,168,1)]"></div>
                                )}
                            </button>
                        ))}
                    </motion.aside>

                    {/* CONTENT AREA */}
                    <main className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.98, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="glass-morphism p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-inner"
                            >

                                {/* BRAND & REPO TAB */}
                                {activeTab === "brand" && (
                                    <div className="space-y-8">
                                        <SectionTitle title="Identity & Config" subtitle="Production saving settings and site branding" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="bg-secondary/10 p-8 rounded-[2rem] border border-secondary/20 space-y-6 shadow-lg shadow-secondary/5">
                                                    <h3 className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <Key className="w-3 h-3" /> GitHub Save Config
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                                            To save changes on Vercel, paste your "Personal Access Token" below. Create one at GitHub Settings &gt; Developer &gt; Personal Access Tokens (Classic) with "repo" scope.
                                                        </p>
                                                        <InputGroup
                                                            label="GitHub Personal Access Token"
                                                            value={githubToken}
                                                            type="password"
                                                            placeholder="ghp_xxxxxxxxxxxx"
                                                            onChange={(v: string) => {
                                                                setGithubToken(v);
                                                                localStorage.setItem("gh_pat", v);
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="bg-black/20 p-8 rounded-[2rem] border border-white/5 space-y-6">
                                                    <h3 className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">Core Identity</h3>
                                                    <InputGroup label="Brand Short Name" value={data.personalInfo.name} onChange={(v: string) => {
                                                        setData({ ...data, personalInfo: { ...data.personalInfo, name: v } });
                                                    }} />
                                                    <InputGroup label="Full Representative Name" value={data.personalInfo.fullName} onChange={(v: string) => {
                                                        setData({ ...data, personalInfo: { ...data.personalInfo, fullName: v } });
                                                    }} />
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="bg-black/20 p-8 rounded-[2rem] border border-white/5 space-y-6">
                                                    <h3 className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2">Hero Section Content</h3>
                                                    <InputGroup label="Hero Heading Text" value={data.personalInfo.heroTitle} onChange={(v: string) => {
                                                        setData({ ...data, personalInfo: { ...data.personalInfo, heroTitle: v } });
                                                    }} />
                                                    <textarea
                                                        className="bg-black/40 p-5 rounded-3xl w-full h-32 text-sm text-gray-400 outline-none border border-white/5 focus:border-secondary transition-all resize-none"
                                                        value={data.personalInfo.heroSubtitle}
                                                        onChange={(e) => {
                                                            setData({ ...data, personalInfo: { ...data.personalInfo, heroSubtitle: e.target.value } });
                                                        }}
                                                        placeholder="Hero Subtitle"
                                                    />
                                                </div>

                                                <div className="bg-black/20 p-8 rounded-[2rem] border border-white/5 space-y-6 flex flex-col items-center">
                                                    <h3 className="text-secondary text-[10px] font-black uppercase tracking-widest mb-2 w-full">Brand Signature (Logo)</h3>
                                                    <div className="w-32 h-32 bg-white/5 rounded-3xl flex items-center justify-center p-6 border border-white/5 shadow-inner">
                                                        {getIconPreview(data.personalInfo.logo) && (typeof getIconPreview(data.personalInfo.logo) === 'string' && (getIconPreview(data.personalInfo.logo) as string).includes('/')) ? (
                                                            <img src={getImageUrl(getIconPreview(data.personalInfo.logo) as string)} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <LucideIcon name={data.personalInfo.logo || "Settings"} className="w-16 h-16 text-secondary" />
                                                        )}
                                                    </div>
                                                    <div className="w-full">
                                                        <InputGroup label="Logo Asset Key or Lucide Name" value={data.personalInfo.logo} onChange={(v: string) => {
                                                            setData({ ...data, personalInfo: { ...data.personalInfo, logo: v } });
                                                        }} mini />
                                                    </div>
                                                    {!isProduction && (
                                                        <FileUploader label="Upload New Brand Logo" current={data.personalInfo.logo} onUpload={(url: string) => {
                                                            setData({ ...data, personalInfo: { ...data.personalInfo, logo: url } });
                                                        }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* NAVIGATION TAB */}
                                {activeTab === "nav" && (
                                    <div className="space-y-8">
                                        <SectionTitle title="Navigation Architecture" subtitle="Manage site identifiers and anchor routing" />
                                        <div className="space-y-4">
                                            {data.navLinks.map((link: any, i: number) => (
                                                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-500">
                                                    <InputGroup label="Display Label" value={link.title} onChange={(v: string) => {
                                                        const d = [...data.navLinks]; d[i].title = v; setData({ ...data, navLinks: d });
                                                    }} />
                                                    <InputGroup label="Target ID / Link" value={link.link || ""} placeholder="#example or https://" onChange={(v: string) => {
                                                        const d = [...data.navLinks]; d[i].link = v || null; setData({ ...data, navLinks: d });
                                                    }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SERVICES TAB */}
                                {activeTab === "services" && (
                                    <div className="space-y-8">
                                        <SectionTitle title="Our Expertise" subtitle="Professional service blocks with live icon mapping" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {data.services.map((s: any, i: number) => (
                                                <Tilt options={{ max: 15, scale: 1.02 }} key={i}>
                                                    <div className="bg-black/30 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 hover:border-secondary/30 transition-all duration-500 flex flex-col items-center group">
                                                        <motion.div
                                                            whileHover={{ rotateY: 180 }}
                                                            className="w-20 h-20 mb-6 bg-secondary/10 rounded-3xl flex items-center justify-center p-4 border border-secondary/20 group-hover:bg-secondary/20 transition-all overflow-hidden"
                                                        >
                                                            {getIconPreview(s.icon) && (typeof getIconPreview(s.icon) === 'string' && (getIconPreview(s.icon) as string).includes('/')) ? (
                                                                <img src={getImageUrl(getIconPreview(s.icon) as string)} className="w-full h-full object-contain filter invert opacity-80 group-hover:opacity-100 transition-opacity" />
                                                            ) : (
                                                                <LucideIcon name={s.icon || "Zap"} className="w-10 h-10 text-secondary" />
                                                            )}
                                                        </motion.div>
                                                        <InputGroup label="Service Title" value={s.title} onChange={(v: string) => {
                                                            const d = [...data.services]; d[i].title = v; setData({ ...data, services: d });
                                                        }} mini />
                                                        <div className="mt-4 w-full">
                                                            <InputGroup label="Icon Name or URL" value={s.icon} onChange={(v: string) => {
                                                                const d = [...data.services]; d[i].icon = v; setData({ ...data, services: d });
                                                            }} mini placeholder="Lucide name (e.g. Code) or link" />
                                                        </div>
                                                        {!isProduction && (
                                                            <div className="mt-auto w-full">
                                                                <FileUploader current={s.icon} onUpload={(url: string) => {
                                                                    const d = [...data.services]; d[i].icon = url; setData({ ...data, services: d });
                                                                }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </Tilt>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TECHNOLOGIES TAB */}
                                {activeTab === "tech" && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <SectionTitle title="Technical Weapons" subtitle="Managing core skills and framework icons" />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const n = { name: "New Skill", icon: "html" };
                                                    setData({ ...data, technologies: [...data.technologies, n] });
                                                }}
                                                className="bg-secondary p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/10"
                                            >
                                                <Plus className="w-5 h-5 text-primary" />
                                            </motion.button>
                                        </div>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {data.technologies.map((t: any, i: number) => (
                                                <div key={i} className="bg-black/20 p-4 rounded-3xl border border-white/5 relative group hover:bg-white/5 transition-all text-center">
                                                    <button onClick={() => {
                                                        const d = data.technologies.filter((_: any, idx: number) => idx !== i);
                                                        setData({ ...data, technologies: d });
                                                    }} className="absolute -top-1 -right-1 bg-red-600 w-5 h-5 rounded-full text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 transition-opacity"><Trash2 className="w-3 h-3 text-white" /></button>

                                                    <div className="w-12 h-12 mx-auto mb-3 bg-white/5 rounded-2xl p-2 flex items-center justify-center border border-white/5 group-hover:border-secondary/30 transition-all overflow-hidden">
                                                        {getIconPreview(t.icon) && (typeof getIconPreview(t.icon) === 'string' && (getIconPreview(t.icon) as string).includes('/')) ? (
                                                            <img src={getImageUrl(getIconPreview(t.icon) as string)} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <LucideIcon name={t.icon || "Cpu"} className="w-6 h-6 text-secondary" />
                                                        )}
                                                    </div>
                                                    <input
                                                        className="bg-transparent text-[10px] font-black w-full text-center outline-none border-b border-transparent focus:border-secondary transition-all"
                                                        value={t.name}
                                                        onChange={e => {
                                                            const d = [...data.technologies]; d[i].name = e.target.value; setData({ ...data, technologies: d });
                                                        }}
                                                    />
                                                    <input
                                                        className="bg-transparent text-[8px] opacity-40 w-full text-center outline-none mt-1"
                                                        value={t.icon}
                                                        placeholder="Icon Name"
                                                        onChange={e => {
                                                            const d = [...data.technologies]; d[i].icon = e.target.value; setData({ ...data, technologies: d });
                                                        }}
                                                    />
                                                    {!isProduction && (
                                                        <div className="mt-2">
                                                            <input type="file" id={`skill-${i}`} className="hidden" onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                const fd = new FormData(); fd.append("image", file);
                                                                const res = await fetch("http://localhost:5000/api/upload", { method: "POST", body: fd });
                                                                const resJson = await res.json();
                                                                if (resJson.url) {
                                                                    const d = [...data.technologies]; d[i].icon = resJson.url; setData({ ...data, technologies: d });
                                                                }
                                                            }} />
                                                            <label htmlFor={`skill-${i}`} className="text-[8px] uppercase tracking-tighter text-secondary cursor-pointer hover:text-white transition-colors">Change Icon</label>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* PROJECTS TAB */}
                                {activeTab === "projects" && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <SectionTitle title="Visual Gallery" subtitle="Showcasing live applications and code repositories" />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const n = { name: "New Project", description: "...", tags: [{ name: "react", color: "blue-text-gradient" }], image: "project1", source_code_link: "", live_site_link: "" };
                                                    setData({ ...data, projects: [...data.projects, n] });
                                                }}
                                                className="bg-secondary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Add Project
                                            </motion.button>
                                        </div>
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                            {data.projects.map((p: any, i: number) => (
                                                <div key={i} className="bg-black/30 rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col group hover:border-secondary/20 transition-all duration-500">
                                                    <div className="relative h-48 bg-black/50 border-b border-white/5">
                                                        {getIconPreview(p.image) ? (
                                                            <img src={getImageUrl(getIconPreview(p.image) as string)} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                        ) : <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold">MISSING_TEXTURE</div>}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                        <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                                                            <input
                                                                className="bg-transparent text-2xl font-black outline-none border-b border-transparent focus:border-secondary w-full text-white"
                                                                value={p.name}
                                                                onChange={e => {
                                                                    const d = [...data.projects]; d[i].name = e.target.value; setData({ ...data, projects: d });
                                                                }}
                                                            />
                                                            <button onClick={() => {
                                                                const d = data.projects.filter((_: any, idx: number) => idx !== i);
                                                                setData({ ...data, projects: d });
                                                            }} className="p-2 bg-red-600/30 text-red-500 rounded-xl hover:bg-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                    <div className="p-8 space-y-6">
                                                        <textarea
                                                            className="bg-black/40 p-5 rounded-2xl w-full h-32 text-sm text-gray-400 outline-none border border-white/5 focus:border-secondary/30 resize-none transition-all scrollbar-hide"
                                                            value={p.description}
                                                            onChange={e => {
                                                                const d = [...data.projects]; d[i].description = e.target.value; setData({ ...data, projects: d });
                                                            }}
                                                        />
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                                <div className="w-16 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                                                                    {getIconPreview(p.image) ? (
                                                                        <img src={getImageUrl(getIconPreview(p.image) as string)} className="w-full h-full object-cover" />
                                                                    ) : <Search className="w-5 h-5 text-gray-700" />}
                                                                </div>
                                                                <InputGroup label="Display Preview Asset (Name or URL)" value={p.image} onChange={(v: string) => {
                                                                    const d = [...data.projects]; d[i].image = v; setData({ ...data, projects: d });
                                                                }} mini className="flex-1" />
                                                            </div>
                                                            {!isProduction && (
                                                                <FileUploader label="Upload New Asset" current={p.image} onUpload={(url: string) => {
                                                                    const d = [...data.projects]; d[i].image = url; setData({ ...data, projects: d });
                                                                }} />
                                                            )}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <InputGroup label="Source Gateway" value={p.source_code_link} onChange={(v: string) => {
                                                                    const d = [...data.projects]; d[i].source_code_link = v; setData({ ...data, projects: d });
                                                                }} mini />
                                                                <InputGroup label="Deployment Live" value={p.live_site_link || ""} onChange={(v: string) => {
                                                                    const d = [...data.projects]; d[i].live_site_link = v; setData({ ...data, projects: d });
                                                                }} mini />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* EXPERIENCE TAB */}
                                {activeTab === "exp" && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <SectionTitle title="Legacy Records" subtitle="Tracking professional evolution and history" />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const n = { title: "New Role", company_name: "Org", icon: "tesla", iconBg: "#E6DEDD", date: "Present", points: ["New record..."] };
                                                    setData({ ...data, experiences: [...data.experiences, n] });
                                                }}
                                                className="bg-secondary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg"
                                            >
                                                Initialize New Entry
                                            </motion.button>
                                        </div>
                                        <div className="space-y-8">
                                            {data.experiences.map((exp: any, i: number) => (
                                                <div key={i} className="bg-black/20 p-8 rounded-[2rem] border border-white/5 relative group border-l-4 border-l-secondary/20">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                                        <div className="space-y-4">
                                                            <InputGroup label="Unit Designation" value={exp.title} onChange={(v: string) => {
                                                                const d = [...data.experiences]; d[i].title = v; setData({ ...data, experiences: d });
                                                            }} />
                                                            <InputGroup label="Corporation" value={exp.company_name} onChange={(v: string) => {
                                                                const d = [...data.experiences]; d[i].company_name = v; setData({ ...data, experiences: d });
                                                            }} />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <InputGroup label="Time Segment" value={exp.date} onChange={(v: string) => {
                                                                const d = [...data.experiences]; d[i].date = v; setData({ ...data, experiences: d });
                                                            }} />
                                                            <InputGroup label="Visual Signature (Hex)" value={exp.iconBg} onChange={(v: string) => {
                                                                const d = [...data.experiences]; d[i].iconBg = v; setData({ ...data, experiences: d });
                                                            }} />
                                                        </div>
                                                    </div>
                                                    <div className="mb-8 p-6 bg-black/40 rounded-3xl border border-white/5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary block mb-4">Functional Log</label>
                                                        <div className="space-y-3">
                                                            {exp.points.map((p: string, pi: number) => (
                                                                <div key={pi} className="flex gap-4 items-start group/point">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shadow-[0_0_5px_rgba(0,206,168,1)]"></div>
                                                                    <textarea
                                                                        rows={1}
                                                                        className="bg-transparent flex-1 text-sm text-gray-400 outline-none border-b border-transparent focus:border-secondary/30 transition-all py-1 resize-none overflow-hidden"
                                                                        value={p}
                                                                        onChange={e => {
                                                                            const d = [...data.experiences]; d[i].points[pi] = e.target.value; setData({ ...data, experiences: d });
                                                                        }}
                                                                    />
                                                                    <button onClick={() => {
                                                                        const d = [...data.experiences]; d[i].points = d[i].points.filter((_: any, idx: number) => idx !== pi); setData({ ...data, experiences: d });
                                                                    }} className="opacity-0 group-hover/point:opacity-100 text-red-500 font-bold p-1">×</button>
                                                                </div>
                                                            ))}
                                                            <button onClick={() => {
                                                                const d = [...data.experiences]; d[i].points.push("Add log entry..."); setData({ ...data, experiences: d });
                                                            }} className="text-[9px] font-black border border-white/10 px-4 py-2 rounded-xl text-secondary hover:bg-white/5 transition-all uppercase tracking-widest mt-2">New Functional Log</button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center p-3 border border-white/5">
                                                            {getIconPreview(exp.icon) ? (
                                                                <img src={getImageUrl(getIconPreview(exp.icon) as string)} className="w-full h-full object-contain filter invert" />
                                                            ) : <Briefcase className="w-10 h-10 text-gray-700" />}
                                                        </div>
                                                        {!isProduction && (
                                                            <FileUploader current={exp.icon} label="Organization Signature" onUpload={(url: string) => {
                                                                const d = [...data.experiences]; d[i].icon = url; setData({ ...data, experiences: d });
                                                            }} />
                                                        )}
                                                    </div>
                                                    <button onClick={() => {
                                                        const d = data.experiences.filter((_: any, idx: number) => idx !== i);
                                                        setData({ ...data, experiences: d });
                                                    }} className="absolute top-8 right-8 text-red-500/20 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TESTIMONIAL TAB */}
                                {activeTab === "test" && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <SectionTitle title="Client Feedbacks" subtitle="Verified validation records from collaborative units" />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const n = { testimonial: "Record pending...", name: "Agent Name", designation: "Exec", company: "Org", image: "user1" };
                                                    setData({ ...data, testimonials: [...data.testimonials, n] });
                                                }}
                                                className="bg-secondary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Add Testimonial
                                            </motion.button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {data.testimonials.map((t: any, i: number) => (
                                                <div key={i} className="bg-black/20 p-8 rounded-[2.5rem] border border-white/5 relative group flex flex-col h-full hover:border-secondary/20 transition-all">
                                                    <button onClick={() => {
                                                        const d = data.testimonials.filter((_: any, idx: number) => idx !== i);
                                                        setData({ ...data, testimonials: d });
                                                    }} className="absolute top-4 right-4 text-red-500/20 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>

                                                    <div className="text-4xl font-black text-secondary leading-none mb-2">"</div>
                                                    <textarea
                                                        className="bg-transparent flex-1 w-full h-32 p-0 text-sm text-gray-400 outline-none border-none resize-none scrollbar-hide mb-6"
                                                        value={t.testimonial}
                                                        onChange={e => {
                                                            const d = [...data.testimonials]; d[i].testimonial = e.target.value; setData({ ...data, testimonials: d });
                                                        }}
                                                    />

                                                    <div className="border-t border-white/5 pt-6 space-y-4 shadow-inner">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <InputGroup label="Source Name" value={t.name} onChange={(v: string) => {
                                                                const d = [...data.testimonials]; d[i].name = v; setData({ ...data, testimonials: d });
                                                            }} mini />
                                                            <InputGroup label="Unit Status" value={t.designation} onChange={(v: string) => {
                                                                const d = [...data.testimonials]; d[i].designation = v; setData({ ...data, testimonials: d });
                                                            }} mini />
                                                        </div>
                                                        <InputGroup label="Origin Corporation" value={t.company} onChange={(v: string) => {
                                                            const d = [...data.testimonials]; d[i].company = v; setData({ ...data, testimonials: d });
                                                        }} mini />

                                                        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10">
                                                                {getIconPreview(t.image) ? (
                                                                    <img src={getImageUrl(getIconPreview(t.image) as string)} className="w-full h-full object-cover" />
                                                                ) : <Star className="w-10 h-10 p-2 text-gray-700" />}
                                                            </div>
                                                            <InputGroup label="Image Name or URL" value={t.image} onChange={(v: string) => {
                                                                const d = [...data.testimonials]; d[i].image = v; setData({ ...data, testimonials: d });
                                                            }} mini className="mb-2" />
                                                            {!isProduction && (
                                                                <>
                                                                    <input type="file" id={`test-img-${i}`} className="hidden" onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (!file) return;
                                                                        const fd = new FormData(); fd.append("image", file);
                                                                        const res = await fetch("http://localhost:5000/api/upload", { method: "POST", body: fd });
                                                                        const resJson = await res.json();
                                                                        if (resJson.url) {
                                                                            const d = [...data.testimonials]; d[i].image = resJson.url; setData({ ...data, testimonials: d });
                                                                        }
                                                                    }} />
                                                                    <label htmlFor={`test-img-${i}`} className="text-[10px] uppercase font-black tracking-widest text-secondary cursor-pointer hover:text-white transition-all flex items-center gap-2">
                                                                        <Upload className="w-3 h-3" /> Sync Source Image
                                                                    </label>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SOCIAL TAB */}
                                {activeTab === "social" && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <SectionTitle title="Public Links" subtitle="External frequency endpoints for identity verification" />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    const n = { name: "Platform", icon: "web", link: "https://" };
                                                    setData({ ...data, socials: [...data.socials, n] });
                                                }}
                                                className="bg-secondary px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" /> Add Protocol
                                            </motion.button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {data.socials.map((s: any, i: number) => (
                                                <div key={i} className="bg-black/30 p-8 rounded-[2rem] border border-white/5 relative group flex flex-col items-center text-center hover:border-secondary/20 transition-all">
                                                    <button onClick={() => {
                                                        const d = data.socials.filter((_: any, idx: number) => idx !== i);
                                                        setData({ ...data, socials: d });
                                                    }} className="absolute top-4 right-4 text-red-500/10 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>

                                                    <div className="w-16 h-16 mb-4 bg-white/5 rounded-3xl flex items-center justify-center p-4 border border-white/10 group-hover:border-secondary/40 transition-all group-hover:bg-secondary/10">
                                                        {s.name.toLowerCase().includes("github") ? <Github className="w-8 h-8 text-secondary" /> :
                                                            s.name.toLowerCase().includes("linkedin") ? <Linkedin className="w-8 h-8 text-secondary" /> :
                                                                s.name.toLowerCase().includes("instagram") ? <Instagram className="w-8 h-8 text-secondary" /> :
                                                                    <Globe className="w-8 h-8 text-secondary" />}
                                                    </div>

                                                    <input
                                                        className="bg-transparent text-xl font-black w-full text-center outline-none border-b border-transparent focus:border-secondary mb-4 tracking-tighter"
                                                        value={s.name}
                                                        onChange={e => {
                                                            const d = [...data.socials]; d[i].name = e.target.value; setData({ ...data, socials: d });
                                                        }}
                                                    />

                                                    <div className="w-full space-y-4 mb-2">
                                                        <InputGroup label="Network Endpoint" value={s.link} onChange={(v: string) => {
                                                            const d = [...data.socials]; d[i].link = v; setData({ ...data, socials: d });
                                                        }} mini />
                                                        {!isProduction && (
                                                            <div className="flex items-center gap-4 bg-black/20 p-3 rounded-2xl border border-white/5">
                                                                <div className="w-8 h-8 rounded-lg animate-pulse bg-white/5 border border-white/5">
                                                                    {getIconPreview(s.icon) ? (
                                                                        <img src={getImageUrl(getIconPreview(s.icon) as string)} className="w-full h-full object-contain p-1 filter invert" />
                                                                    ) : null}
                                                                </div>
                                                                <input type="file" id={`soc-img-${i}`} className="hidden" onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    const fd = new FormData(); fd.append("image", file);
                                                                    const res = await fetch("http://localhost:5000/api/upload", { method: "POST", body: fd });
                                                                    const resJson = await res.json();
                                                                    if (resJson.url) {
                                                                        const d = [...data.socials]; d[i].icon = resJson.url; setData({ ...data, socials: d });
                                                                    }
                                                                }} />
                                                                <label htmlFor={`soc-img-${i}`} className="text-[10px] font-black uppercase tracking-widest text-secondary cursor-pointer flex-1 text-left hover:text-white transition-all">Upload Asset Icon</label>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                <footer className="mt-16 text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.5em] opacity-30">
                    Digital Sovereign Systemized Hub &copy; 2026 Admin Core Engine
                </footer>
            </div>
        </div>
    );
};

// UI COMPONENTS

const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">{title}</h1>
        <p className="text-secondary text-[11px] font-black uppercase tracking-[0.2em] opacity-90">{subtitle}</p>
        <div className="w-24 h-1.5 premium-gradient rounded-full mt-6 shadow-[0_0_10px_rgba(0,206,168,0.5)]"></div>
    </div>
);

const InputGroup = ({ label, value, onChange, placeholder, mini, type = "text" }: any) => (
    <div className="space-y-2">
        <label className={`block font-black uppercase tracking-widest text-gray-600 ${mini ? 'text-[8px]' : 'text-[10px]'}`}>{label}</label>
        <input
            type={type}
            className={`bg-black/40 backdrop-blur-3xl p-4 rounded-3xl w-full border border-white/5 outline-none focus:border-secondary transition-all text-sm shadow-inner ${mini ? 'py-3 rounded-2xl' : ''}`}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const FileUploader = ({ current, label, onUpload, mini }: any) => {
    const [up, setUp] = useState(false);
    return (
        <div className={`flex flex-col gap-2 ${mini ? '' : 'bg-black/40 p-5 rounded-3xl border border-white/5 shadow-inner'}`}>
            {label && <label className="text-[10px] font-black uppercase tracking-widest text-gray-600">{label}</label>}
            <div className="flex items-center gap-4">
                <label className={`cursor-pointer group flex flex-1 items-center justify-center border border-dashed border-white/10 rounded-2xl hover:border-secondary transition-all duration-300 ${mini ? 'p-3' : 'p-4'}`}>
                    <input type="file" className="hidden" onChange={async (e) => {
                        setUp(true);
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData(); fd.append("image", file);
                        const res = await fetch("http://localhost:5000/api/upload", { method: "POST", body: fd });
                        const resJson = await res.json();
                        if (resJson.url) onUpload(resJson.url);
                        setUp(false);
                    }} />
                    <div className="flex items-center gap-2">
                        <Upload className={`w-4 h-4 text-secondary ${up ? 'animate-bounce' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-secondary transition-colors">{up ? 'Uploading...' : 'Upload Asset'}</span>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default AdminPanel;
