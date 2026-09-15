/**
 * Sidebar navigation configuration — DATA, not markup. The Sidebar renders from
 * this; adding a future module's menu entry is a one-line edit here (task:
 * "menu configuration should NOT be hardcoded inside components"). Mirrors the
 * approved CMS sidebar (codex §3) and groups items into sections.
 *
 * Visibility is permission/role aware: an item with `permission` shows only when
 * the user holds it; one with `roles` shows only for those roles (an affordance —
 * the backend still enforces every action). Items with neither are always shown to
 * authenticated users. The module pages themselves are built in later phases; the
 * routes are reserved in ROUTES so entries resolve without magic strings.
 */

import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarDays,
  Newspaper,
  BookOpen,
  Wrench,
  Building2,
  FileText,
  Megaphone,
  Library,
  Gavel,
  ShoppingCart,
  Images,
  GalleryHorizontalEnd,
  Video,
  BadgeCheck,
  HelpCircle,
  AppWindow,
  Inbox,
  Database,
  FileBarChart2,
  Globe,
  Users,
  ShieldCheck,
  ScrollText,
  Settings,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { ROLE_KEYS } from '@/constants/permissions';

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Require this permission to display (module.action). */
  permission?: string;
  /** Require any of these roles to display (affordance only). */
  roles?: string[];
  /** Nested children for future submenu expansion. */
  children?: NavItem[];
}

export interface NavSection {
  key: string;
  /** Section heading (omit for the top, ungrouped section). */
  label?: string;
  items: NavItem[];
}

export const NAVIGATION: NavSection[] = [
  {
    key: 'overview',
    items: [{ key: 'dashboard', label: 'Dashboard', href: ROUTES.dashboard, icon: LayoutDashboard }],
  },
  {
    key: 'content',
    label: 'Content',
    items: [
      { key: 'events', label: 'Events & News', href: ROUTES.events, icon: CalendarDays },
      { key: 'news', label: 'News', href: ROUTES.news, icon: Newspaper },
      { key: 'programmes', label: 'Programmes & Schemes', href: ROUTES.programmes, icon: BookOpen },
      { key: 'toolkits', label: 'Toolkits', href: ROUTES.toolkits, icon: Wrench },
      { key: 'institutions', label: 'Partners & Institutions', href: ROUTES.institutions, icon: Building2 },
    ],
  },
  {
    key: 'governance',
    label: 'Governance & Transparency',
    items: [
      { key: 'documents', label: 'Documents', href: ROUTES.documents, icon: FileText },
      { key: 'knowledge-centre', label: 'Knowledge Centre', href: ROUTES.knowledgeCentre, icon: Library },
      { key: 'communications', label: 'Official Communications', href: ROUTES.communications, icon: Megaphone },
      { key: 'tenders', label: 'Tenders', href: ROUTES.tenders, icon: Gavel },
      { key: 'procurement', label: 'Procurement Updates', href: ROUTES.procurement, icon: ShoppingCart },
    ],
  },
  {
    key: 'site',
    label: 'Site Structure',
    items: [
      { key: 'faqs', label: 'FAQs', href: ROUTES.faqs, icon: HelpCircle },
      { key: 'digital-services', label: 'Digital Services', href: ROUTES.digitalServices, icon: AppWindow },
      { key: 'leadership', label: 'Leadership', href: ROUTES.leadership, icon: Users },
    ],
  },
  {
    key: 'media',
    label: 'Media',
    items: [
      { key: 'media-library', label: 'Media Library', href: ROUTES.media, icon: Images },
      { key: 'galleries', label: 'Galleries', href: ROUTES.galleries, icon: GalleryHorizontalEnd },
      { key: 'videos', label: 'Videos', href: ROUTES.videos, icon: Video },
    ],
  },
  {
    key: 'engagement',
    label: 'Engagement & Data',
    items: [
      { key: 'memberships', label: 'Institutional Membership', href: ROUTES.memberships, icon: BadgeCheck },
      { key: 'enquiries', label: 'Enquiries', href: ROUTES.enquiries, icon: Inbox },
    ],
  },
  {
    key: 'dashboard-data',
    label: 'Dashboard Data',
    items: [
      {
        key: 'dashboard-generate-reports',
        label: 'Generate Reports',
        href: ROUTES.dashboardGenerateReports,
        icon: FileBarChart2,
        permission: 'operational_reports.view',
      },
      {
        key: 'dashboard-website-metrics',
        label: 'Website Metrics',
        href: ROUTES.dashboardWebsiteMetrics,
        icon: Globe,
        permission: 'website_metrics.view',
      },
    ],
  },
  {
    key: 'administration',
    label: 'Administration',
    items: [
      { key: 'masters', label: 'Masters', href: ROUTES.masters, icon: Database },
      { key: 'users', label: 'Users', href: ROUTES.users, icon: Users, roles: [ROLE_KEYS.superAdmin] },
      { key: 'roles', label: 'Roles & Permissions', href: ROUTES.roles, icon: ShieldCheck, roles: [ROLE_KEYS.superAdmin] },
      { key: 'audit-log', label: 'Audit Log', href: ROUTES.auditLog, icon: ScrollText, roles: [ROLE_KEYS.superAdmin] },
      { key: 'settings', label: 'Settings', href: ROUTES.settings, icon: Settings, roles: [ROLE_KEYS.superAdmin] },
    ],
  },
];
