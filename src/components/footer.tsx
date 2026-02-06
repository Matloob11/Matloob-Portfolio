import { Link } from "react-router-dom";

import { SOCIALS } from "../constants";
import { styles } from "../styles";
import { cn } from "../utils/lib";

// Footer
const Footer = () => {
  return (
    <nav
      className={cn(
        styles.paddingX,
        "w-full flex items-center py-8 bg-primary border-t border-t-secondary/5"
      )}
    >
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="text-white text-md font-bold flex">
            &copy; Matloob {new Date().getFullYear()}. All rights reserved.
          </p>
          <Link
            to="/admin"
            className="text-secondary text-[12px] font-bold uppercase tracking-widest hover:text-white transition opacity-40 hover:opacity-100"
          >
            Admin Portal
          </Link>
        </div>

        {/* Nav Links (Desktop) */}
        <ul className="list-none hidden flex-row sm:flex gap-10">
          {SOCIALS.map((social) => (
            <li
              key={social.name}
              className="text-secondary font-poppins font-medium cursor-pointer text-[16px] opacity-80 hover:opacity-100 transition"
            >
              <Link to={social.link} target="_blank" rel="noreferrer noopener">
                <img src={social.icon} alt={social.name} className="h-6 w-6" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Footer;
