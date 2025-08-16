// Update the Lucide React imports section to:
import { 
  Send, Bot, User, Sparkles, FileText, Target, BookOpen,
  Upload, Download, TrendingUp, DollarSign, MapPin, Clock,
  Loader2, Star, Building, Code, CheckCircle, PlayCircle,
  Brain, Lightbulb, Zap, FileSearch as FileSearchIcon, 
  Briefcase as BriefcaseIcon, Settings as SettingsIcon,
  Wand2 as Wand2Icon, Rocket as RocketIcon, Gem as GemIcon,
  CircleUser as CircleUserIcon, MessageSquare as MessageSquareIcon,
  Plus, X, ClipboardList as ClipboardListIcon, Aperture as ApertureIcon
} from 'lucide-react';

// Update your lucide-react.d.ts to include all the icons you're using:
declare module "lucide-react" {
  import * as React from "react";

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  // Icons used in your code
  export const Send: LucideIcon;
  export const Bot: LucideIcon;
  export const User: LucideIcon;
  export const Sparkles: LucideIcon;
  export const FileText: LucideIcon;
  export const Target: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Upload: LucideIcon;
  export const Download: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const DollarSign: LucideIcon;
  export const MapPin: LucideIcon;
  export const Clock: LucideIcon;
  export const Loader2: LucideIcon;
  export const Star: LucideIcon;
  export const Building: LucideIcon;
  export const Code: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const PlayCircle: LucideIcon;
  export const Brain: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const Zap: LucideIcon;
  export const FileSearch: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Settings: LucideIcon;
  export const Wand2: LucideIcon;
  export const Rocket: LucideIcon;
  export const Gem: LucideIcon;
  export const CircleUser: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Plus: LucideIcon;
  export const X: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const Aperture: LucideIcon;
  export const FileInput: LucideIcon;
  export const FileDown: LucideIcon;
  export const GraduationCap: LucideIcon;

  const icons: Record<string, LucideIcon>;
  export default icons;
}