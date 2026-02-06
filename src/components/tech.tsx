import { BallCanvas } from "./canvas";
import { TECHNOLOGIES } from "../constants";
import { SectionWrapper } from "../hoc";
import LucideIcon from "./LucideIcon";

// Technologies
export const Tech = () => {
  return (
    <SectionWrapper>
      <div className="flex flex-row flex-wrap justify-center gap-10">
        {/* Iterate over each technology */}
        {TECHNOLOGIES.map((technology) => {
          const isPath = technology.icon && (technology.icon.startsWith("/") || technology.icon.startsWith("http") || technology.icon.includes("."));
          const iconUrl = technology.icon && technology.icon.startsWith("/uploads/") ? `http://localhost:5000${technology.icon}` : technology.icon;

          return (
            <div className="w-28 h-28 flex items-center justify-center p-2 rounded-full bg-white/5 border border-white/5 hover:border-secondary transition-all" key={technology.name}>
              {isPath ? (
                <BallCanvas icon={iconUrl} />
              ) : (
                <LucideIcon name={technology.icon || "Cpu"} className="w-16 h-16 text-secondary" />
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};
