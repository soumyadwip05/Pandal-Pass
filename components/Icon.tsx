import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BusFront,
  CakeSlice,
  CalendarDays,
  Camera,
  Car,
  CarFront,
  Check,
  ChevronRight,
  Church,
  CircleDot,
  Clock,
  Coffee,
  Compass,
  CookingPot,
  Copy,
  Crown,
  Fish,
  Flame,
  Flower2,
  Footprints,
  IceCreamCone,
  Landmark,
  Leaf,
  LocateFixed,
  LogIn,
  MapPin,
  MapPinned,
  Menu,
  Navigation,
  Palette,
  Printer,
  RotateCcw,
  Route,
  Sandwich,
  Search,
  Share,
  Share2,
  Soup,
  Sparkles,
  Star,
  Ticket,
  Timer,
  TrainFront,
  UserCheck,
  Users,
  Utensils,
  Wallet,
  X,
  Zap,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  auto: CarFront,
  bus: BusFront,
  cab: Car,
  calendar: CalendarDays,
  camera: Camera,
  cakeSlice: CakeSlice,
  car: Car,
  check: Check,
  chevronRight: ChevronRight,
  church: Church,
  circleDot: CircleDot,
  clock: Clock,
  coffee: Coffee,
  compass: Compass,
  cookingPot: CookingPot,
  copy: Copy,
  crown: Crown,
  fish: Fish,
  flame: Flame,
  flower: Flower2,
  footprints: Footprints,
  iceCream: IceCreamCone,
  landmark: Landmark,
  leaf: Leaf,
  locate: LocateFixed,
  logIn: LogIn,
  map: MapPinned,
  mapPin: MapPin,
  menu: Menu,
  metro: TrainFront,
  navigation: Navigation,
  palette: Palette,
  printer: Printer,
  reset: RotateCcw,
  route: Route,
  sandwich: Sandwich,
  search: Search,
  share: Share,
  share2: Share2,
  soup: Soup,
  sparkles: Sparkles,
  star: Star,
  ticket: Ticket,
  timer: Timer,
  train: TrainFront,
  userCheck: UserCheck,
  users: Users,
  utensils: Utensils,
  wallet: Wallet,
  x: X,
  zap: Zap,
};

interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export default function Icon({ name, size = 18, strokeWidth = 2, className, label }: IconProps) {
  const Component = icons[name] ?? Sparkles;
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    />
  );
}
