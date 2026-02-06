import { motion } from "framer-motion";

import { TESTIMONIALS } from "../constants";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { cn } from "../utils/lib";
import { fadeIn, textVariant } from "../utils/motion";
import LucideIcon from "./LucideIcon";

type FeedbackCardProps = {
  index: number;
  testimonial: string;
  name: string;
  designation: string;
  company: string;
  image: string;
};

// Feedback Card
const FeedbackCard = ({
  index,
  testimonial,
  name,
  designation,
  company,
  image,
}: FeedbackCardProps) => (
  <motion.div
    variants={fadeIn(undefined, "spring", index * 0.5, 0.75)}
    className="bg-black-200 p-10 rounded-3xl xs:w-[320px] w-full"
  >
    {/* Quote " */}
    <p className="text-white font-black text-[48px]">"</p>

    <div className="mt-1">
      {/* Testimonial */}
      <p className="text-white tracking-wider text-[18px]">{testimonial}</p>

      <div className="mt-7 flex justify-between items-center gap-1">
        <div className="flex-1 flex flex-col">
          {/* Name */}
          <p className="text-white font-medium text-[16px]">
            <span className="blue-text-gradient">@</span> {name}
          </p>
          <p className="mt-1 text-secondary text-[12px]">
            {designation} of {company}
          </p>
        </div>

        {/* User Image or Icon */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-tertiary">
          {image && (image.startsWith("/") || image.startsWith("http") || image.includes(".")) ? (
            <img
              src={image.startsWith("/uploads/") ? `http://localhost:5000${image}` : image}
              alt={`feedback-by-${name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.classList.add('p-2');
              }}
            />
          ) : (
            <LucideIcon name={image || "User"} className="w-6 h-6 text-secondary" />
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Feedbacks
export const Feedbacks = () => {
  return (
    <SectionWrapper>
      <div className="mt-12 bg-black-100 rounded-[20px]">
        <div
          className={cn(
            styles.padding,
            "bg-tertiary rounded-2xl min-h-[300px]"
          )}
        >
          {/* Title */}
          <motion.div variants={textVariant()}>
            <p className={styles.sectionSubText}>What others say</p>
            <h2 className={styles.sectionHeadText}>Testimonials.</h2>
          </motion.div>
        </div>

        {/* Feedback Card */}
        <div
          className={cn(styles.paddingX, "-mt-20 pb-14 flex flex-wrap gap-7")}
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <FeedbackCard key={testimonial.name} index={i} {...testimonial} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
