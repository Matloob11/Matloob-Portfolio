import { Tilt } from "react-tilt";
import { motion } from "framer-motion";

import { SERVICES, PERSONAL_INFO } from "../constants";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { fadeIn, textVariant } from "../utils/motion";
import LucideIcon from "./LucideIcon";

type ServiceCardProps = {
  index: number;
  title: string;
  icon: string;
};

// Service Card
const ServiceCard = ({ index, title, icon }: ServiceCardProps) => {
  const isPath = icon && (icon.startsWith("/") || icon.startsWith("http") || icon.includes("."));
  const iconUrl = icon && icon.startsWith("/uploads/") ? `http://localhost:5000${icon}` : icon;

  return (
    <Tilt
      options={{
        max: 45,
        scale: 1,
        speed: 450,
      }}
      className="xs:w-[250px] w-full"
    >
      <motion.div
        variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
        className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
      >
        <div className="bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col">
          {isPath ? (
            <img src={iconUrl} alt={title} className="w-16 h-16 object-contain" />
          ) : (
            <LucideIcon name={icon || "Zap"} className="w-16 h-16 text-secondary" />
          )}
          <h3 className="text-white text-[20px] font-bold text-center">
            {title}
          </h3>
        </div>
      </motion.div>
    </Tilt>
  );
};

// About
export const About = () => {
  return (
    <SectionWrapper idName="about">
      <>
        {/* Title */}
        <motion.div variants={textVariant()}>
          <p className={styles.sectionSubText}>Introduction</p>
          <h2 className={styles.sectionHeadText}>Overview.</h2>
        </motion.div>

        {/* Body */}
        <motion.p
          variants={fadeIn(undefined, undefined, 0.1, 1)}
          className="empty-4 text-secondary text-[17px] max-w-3xl leading-[30px]"
        >
          Hi, I’m {PERSONAL_INFO.fullName}. I am a passionate developer with expertise in Artificial Intelligence,
          Machine Learning, and Web Development. I specialize in building smart, efficient solutions and
          creating advanced AI agents. With a strong foundation in Mathematics and Computer Science,
          I am always eager to learn and tackle challenging projects. Let's work together to bring your ideas to life!
        </motion.p>

        {/* Service Card */}
        <div className="mt-20 flex flex-wrap gap-10">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} index={i} {...service} />
          ))}
        </div>
      </>
    </SectionWrapper>
  );
};
