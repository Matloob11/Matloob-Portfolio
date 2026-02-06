import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface LucideIconProps extends LucideProps {
    name: string;
    className?: string;
    fallback?: React.ReactNode;
}

const LucideIcon: React.FC<LucideIconProps> = ({ name, className, fallback, ...props }) => {
    // Robust icon name formatting and lookup
    const getIconComponent = (iconName: string) => {
        if (!iconName) return null;

        // 1. Try exact match (for PascalCase names already correct in data)
        if ((LucideIcons as any)[iconName]) return (LucideIcons as any)[iconName];

        // 2. Try adding "Icon" suffix (some versions of lucide-react use this)
        const withIcon = `${iconName}Icon`;
        if ((LucideIcons as any)[withIcon]) return (LucideIcons as any)[withIcon];

        // 3. Try formatting from kebab/snake/space to PascalCase
        const formatted = iconName
            .replace(/[-_]/g, ' ')
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .split(' ')
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Don't lowercase rest, preserves PascalCase
            .join('');

        if ((LucideIcons as any)[formatted]) return (LucideIcons as any)[formatted];

        const formattedWithIcon = `${formatted}Icon`;
        if ((LucideIcons as any)[formattedWithIcon]) return (LucideIcons as any)[formattedWithIcon];

        return null;
    };

    try {
        const IconComponent = getIconComponent(name);

        if (IconComponent) {
            return <IconComponent className={className} {...props} />;
        }

        // If not found, log a warning for developers (only in dev mode if possible)
        const isDev = (import.meta as any).env?.MODE !== 'production';
        if (isDev && name && !name.includes('/')) {
            console.warn(`LucideIcon: Icon "${name}" not found.`);
        }
    } catch (error) {
        console.error(`LucideIcon: Error rendering icon "${name}":`, error);
    }

    // If name is a path or doesn't match a Lucide icon, return fallback
    if (fallback) {
        return <>{fallback}</>;
    }

    // Final fallback: Use a very stable icon name
    const FallbackIcon = LucideIcons.CircleHelp || LucideIcons.HelpCircle || LucideIcons.Search;

    if (FallbackIcon) {
        return <FallbackIcon className={className} {...props} />;
    }

    return null;
};

export default LucideIcon;
