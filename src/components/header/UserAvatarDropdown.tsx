import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Settings, LogOut, Pencil, Trophy } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockFamilyMembers, mockClinics } from '@/data/mockData';
import { LEVEL_CONFIG } from '@/data/mockDentistSearch';
import { USER_POINTS, getLevelForXP } from '@/data/pointsData';
import { AvatarFrame } from '@/components/level/AvatarFrame';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserAvatarDropdownProps {
  userRole: UserRole;
  onNavigate: (tab: string) => void;
}

const LEVEL_ICONS: Record<string, string> = {
  ouro: '🥇',
  prata: '🥈',
  bronze: '🥉',
};

function getUserInfo(userRole: UserRole, t: (key: string) => string) {
  const lvl = getLevelForXP(USER_POINTS[userRole].xp).key;
  switch (userRole) {
    case 'patient':
      return { name: mockFamilyMembers[0].name, subtitle: t('common.patient'), level: lvl };
    case 'dentist':
      return { name: mockDentists[0].name, subtitle: t('common.dentist'), level: lvl };
    case 'clinic':
      return { name: mockClinics[0].name, subtitle: t('common.clinic'), level: lvl };
  }
}

export function UserAvatarDropdown({ userRole, onNavigate }: UserAvatarDropdownProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const userInfo = getUserInfo(userRole, t);
  const levelCfg = LEVEL_CONFIG[userInfo.level];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleItemClick = (tab: string) => {
    setIsOpen(false);
    onNavigate(tab);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{userInfo.name}</p>
          <p className="text-xs text-muted-foreground">{userInfo.subtitle}</p>
        </div>
        <AvatarFrame levelKey={userInfo.level} className="h-9 w-9">
          <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
        </AvatarFrame>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-[100] bg-[hsl(210,50%,24%)] border border-[hsl(210,40%,28%)] rounded-lg shadow-xl overflow-hidden',
            isMobile
              ? 'fixed left-0 right-0 top-14 rounded-none border-x-0 border-t-0'
              : 'right-0 top-full mt-2 w-64'
          )}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-[hsl(210,40%,28%)]">
            <p className="text-sm font-bold text-foreground">{userInfo.name}</p>
            <p className="text-xs text-muted-foreground">{userInfo.subtitle}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => handleItemClick('perfil')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/40 transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              {t('profile.viewProfile')}
            </button>
            <button
              onClick={() => handleItemClick('editar-perfil')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/40 transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
              {t('profile.editProfile')}
            </button>

            {/* Level display - not clickable */}
            <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span>{t('profile.myLevel')}:</span>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border', levelCfg.bg, levelCfg.color)}>
                {LEVEL_ICONS[userInfo.level]} {t(levelCfg.labelKey)}
              </span>
            </div>

            {/* Separator */}
            <div className="border-t border-[hsl(210,40%,28%)] my-1" />

            <button
              onClick={() => handleItemClick('config')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/40 transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              {t('nav.settings')}
            </button>
            <button
              onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('settings.logout')}
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.logout')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.logoutConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowLogoutConfirm(false); window.location.href = '/'; }}>
              {t('settings.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
