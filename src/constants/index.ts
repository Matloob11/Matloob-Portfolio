import { assetsMap } from "../assets";
import portfolioData from "./portfolio-data.json";

// Map strings in JSON to imported assets
const mapIcon = (key: string) => {
  if (!key) return assetsMap["logo"];
  if (key.startsWith("http") || key.startsWith("/") || key.startsWith("data:")) return key;
  // If it's a known asset key, return the imported asset
  if (assetsMap[key]) return assetsMap[key];
  // Otherwise, return the key itself (could be a Lucide icon name)
  return key;
};

export const PERSONAL_INFO = {
  ...portfolioData.personalInfo,
  logo: mapIcon(portfolioData.personalInfo.logo),
};

export const NAV_LINKS = portfolioData.navLinks;

export const SERVICES = portfolioData.services.map((s) => ({
  ...s,
  icon: mapIcon(s.icon),
}));

export const TECHNOLOGIES = portfolioData.technologies.map((t) => ({
  ...t,
  icon: mapIcon(t.icon),
}));

export const EXPERIENCES = portfolioData.experiences.map((e) => ({
  ...e,
  icon: mapIcon(e.icon),
}));

export const TESTIMONIALS = portfolioData.testimonials.map((t) => ({
  ...t,
  image: mapIcon(t.image),
}));

export const PROJECTS = portfolioData.projects.map((p) => ({
  ...p,
  image: mapIcon(p.image),
}));

export const SOCIALS = portfolioData.socials.map((s) => ({
  ...s,
  icon: mapIcon(s.icon),
}));
