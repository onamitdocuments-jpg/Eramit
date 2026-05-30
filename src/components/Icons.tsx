/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

export const IconMap: Record<string, React.ComponentType<any>> = {
  Sparkles: LucideIcons.Sparkles,
  Wind: LucideIcons.Wind,
  Droplets: LucideIcons.Droplets,
  Zap: LucideIcons.Zap,
  Paintbrush: LucideIcons.Paintbrush,
  Hammer: LucideIcons.Hammer,
  Wrench: LucideIcons.Wrench,
  ShieldAlert: LucideIcons.ShieldAlert,
  Home: LucideIcons.Home,
  TrendingUp: LucideIcons.TrendingUp,
  Coins: LucideIcons.Coins,
  Users: LucideIcons.Users,
  Briefcase: LucideIcons.Briefcase,
  Globe: LucideIcons.Globe,
  ShieldCheck: LucideIcons.ShieldCheck,
  Calendar: LucideIcons.Calendar,
  FileText: LucideIcons.FileText,
  CreditCard: LucideIcons.CreditCard,
  Star: LucideIcons.Star,
  Eye: LucideIcons.Eye,
  User: LucideIcons.User,
  CheckCircle: LucideIcons.CheckCircle,
  X: LucideIcons.X,
  Plus: LucideIcons.Plus,
  ArrowRight: LucideIcons.ArrowRight,
  Phone: LucideIcons.Phone,
  MapPin: LucideIcons.MapPin,
  Search: LucideIcons.Search,
};

export interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  key?: string | number;
}

export function DynamicIcon({ name, className = '', size = 24 }: DynamicIconProps) {
  const IconComponent = IconMap[name];
  if (!IconComponent) {
    // Return a fallback Icon like Wrench or HelpCircle
    const Fallback = LucideIcons.Wrench;
    return <Fallback className={className} size={size} />;;
  }
  return <IconComponent className={className} size={size} />;;
}
