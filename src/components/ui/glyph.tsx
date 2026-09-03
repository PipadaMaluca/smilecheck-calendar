import {
  Accessibility, AlarmClock, AlertTriangle, Apple, Armchair, Award, Ban, BarChart3,
  Brush, Briefcase, Building2, Cake, Calendar, CalendarDays, Camera, Check, CheckCircle2,
  Circle, ClipboardList, Clock, Cloud, CloudSun, Crown, CupSoda, Diamond, Droplet, Dumbbell,
  FileText, Flag, Flame, Footprints, Frown, Gem, Gift, Globe, GraduationCap, Handshake,
  Heart, HeartCrack, HelpCircle, Home, Inbox, Landmark, Laptop, Lightbulb, Lock, Mail,
  MapPin, Medal, Meh, Megaphone, MessageCircle, Microscope, Monitor, Moon, Package, Palette,
  Pencil, Pill, Plane, Printer, RadioTower, RefreshCw, Rocket, Scale, Search, Settings,
  Shield, Skull, Smartphone, Smile, Soup, Sparkles, Speech, SprayCan, Star, Stethoscope,
  Sun, Sunrise, Target, Thermometer, TrendingUp, Trophy, User, Users, Utensils, Video,
  Wallet, Wind, Wrench, X, Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Single source of truth mapping legacy emoji glyphs to Lucide icons.
 * Emoji render inconsistently across platforms (and as tofu boxes on some
 * Windows/Linux setups), so every icon slot in the product resolves here.
 */
export const EMOJI_ICONS: Record<string, LucideIcon> = {
  '⭐': Star, '★': Star, '🌟': Sparkles, '✨': Sparkles, '🔮': Sparkles,
  '✅': CheckCircle2, '✓': Check, '✔️': Check,
  '❌': X, '✗': X, '✕': X, '🚫': Ban,
  '⚠️': AlertTriangle, '⚠': AlertTriangle,
  '🏆': Trophy, '🏅': Medal, '🥇': Medal, '🥈': Medal, '🥉': Medal, '🎖️': Award,
  '🔥': Flame, '👑': Crown, '💎': Gem, '💠': Diamond,
  '🧴': SprayCan, '🪥': Brush, '🫗': CupSoda, '🧵': Package, '🥫': Soup,
  '🍽️': Utensils, '🍎': Apple, '🪑': Armchair, '🧳': Briefcase, '📦': Package,
  '📱': Smartphone, '💻': Laptop, '🖥️': Monitor, '🖨️': Printer, '📸': Camera,
  '📹': Video, '📡': RadioTower, '🔧': Wrench, '⚙️': Settings, '🔍': Search,
  '❓': HelpCircle, '💡': Lightbulb, '🎨': Palette, '🎯': Target, '⚡': Zap, '🤯': Zap,
  '📅': Calendar, '🗓️': CalendarDays, '🕐': Clock, '⏰': AlarmClock, '🔄': RefreshCw,
  '📋': ClipboardList, '📝': FileText, '📄': FileText, '✏️': Pencil,
  '📧': Mail, '📩': Mail, '📥': Inbox, '📣': Megaphone, '🗣️': Speech, '💬': MessageCircle,
  '🦷': Smile, '👅': Smile, '💊': Pill, '⚕️': Stethoscope, '🔬': Microscope,
  '🌡️': Thermometer, '🩸': Droplet, '💧': Droplet, '♿': Accessibility,
  '🏥': Building2, '🏢': Building2, '🏛️': Landmark, '🏠': Home,
  '👥': Users, '👨‍👩‍👧': Users, '👨': User, '👨‍⚕️': Stethoscope, '👩‍⚕️': Stethoscope, '🤝': Handshake,
  '📈': TrendingUp, '📊': BarChart3, '💰': Wallet, '⚖️': Scale, '🎁': Gift,
  '🔒': Lock, '🛡️': Shield, '🚀': Rocket, '✈️': Plane, '🏳️': Flag, '🌐': Globe, '🌍': Globe,
  '☀️': Sun, '🌅': Sunrise, '🌙': Moon, '🌤️': CloudSun, '☁️': Cloud, '💨': Wind, '😮‍💨': Wind,
  '🏋️': Dumbbell, '🏃': Footprints, '🎓': GraduationCap, '🎂': Cake, '📍': MapPin,
  '❤️': Heart, '💔': HeartCrack, '💀': Skull,
  '😊': Smile, '🙂': Smile, '😐': Meh, '😕': Frown, '😖': Frown, '😣': Frown,
  '😫': Frown, '😩': Frown, '😵': Frown,
  '🔴': Circle, '🟡': Circle, '🟢': Circle,
};

export function getGlyphIcon(emoji?: string | null): LucideIcon | null {
  if (!emoji) return null;
  return EMOJI_ICONS[emoji] ?? EMOJI_ICONS[emoji.replace(/\uFE0F/g, '')] ?? null;
}

interface GlyphProps {
  emoji?: string | null;
  className?: string;
  /** Rendered when the emoji has no Lucide equivalent. */
  fallback?: LucideIcon;
  strokeWidth?: number;
}

/** Renders a Lucide icon for a legacy emoji glyph. */
export function Glyph({ emoji, className, fallback, strokeWidth }: GlyphProps) {
  const Icon = getGlyphIcon(emoji) ?? fallback ?? null;
  if (!Icon) return null;
  return <Icon className={cn('w-4 h-4', className)} strokeWidth={strokeWidth} aria-hidden="true" />;
}
