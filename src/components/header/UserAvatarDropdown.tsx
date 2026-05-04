import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Settings, LogOut, Pencil, Trophy } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { mockDentists, mockFamilyMembers, mockClinics } from '@/data/mockData';
import { LEVEL_CONFIG } from '@/data/mockDentistSearch';
import { USER_POINTS, getLevelForXP } from '@/data/pointsData';
import { AvatarFrame } from '@/components/level/AvatarFrame';
import { LevelIcon } from '@/components/level/LevelIcon';
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
    <div ref={dropdownRef} className="relative" style={{ overflow: 'visible' }}>
      <button
        className="flex items-center gap-3 p-1 hover:opacity-80 transition-opacity"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{userInfo.name}</p>
          <p className="text-xs text-muted-foreground">{userInfo.subtitle}</p>
        </div>
        <AvatarFrame levelKey={userInfo.level} variant="full" size={36} className="h-9 w-9 overflow-visible">
          <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
        </AvatarFrame>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-[200] rounded-lg overflow-hidden',
            // Dark theme defaults
            'bg-[#0D2137] border border-[#1E3A5F] shadow-[0_8px_24px_rgba(0,0,0,0.3)]',
            // Light theme overrides
            '[.light_&]:bg-white [.light_&]:border-[#D6E4F0] [.light_&]:shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
            isMobile
              ? 'fixed left-0 right-0 top-14 rounded-none border-x-0 border-t-0'
              : 'right-0 top-full mt-2 w-64'
          )}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-[#1E3A5F] [.light_&]:border-[#E2E8F0]">
            <p className="text-sm font-bold text-white [.light_&]:text-[#1A202C]">{userInfo.name}</p>
            <p className="text-xs text-[#94A3B8] [.light_&]:text-[#4A5568]">{userInfo.subtitle}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => handleItemClick('perfil')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white [.light_&]:text-[#1565C0] hover:bg-secondary/40 [.light_&]:hover:bg-[#F1F5F9] transition-colors"
            >
              <User className="w-4 h-4 text-[#94A3B8] [.light_&]:text-[#1565C0]" />
              {t('profile.viewProfile')}
            </button>
            <button
              onClick={() => handleItemClick('editar-perfil')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white [.light_&]:text-[#1A202C] hover:bg-secondary/40 [.light_&]:hover:bg-[#F1F5F9] transition-colors"
            >
              <Pencil className="w-4 h-4 text-[#94A3B8] [.light_&]:text-[#4A5568]" />
              {t('profile.editProfile')}
            </button>

            {/* Level display - not clickable */}
            <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#94A3B8] [.light_&]:text-[#1A202C]">
              <Trophy className="w-4 h-4 text-[#94A3B8] [.light_&]:text-[#4A5568]" />
              <span>{t('profile.myLevel')}:</span>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded border inline-flex items-center gap-1', levelCfg.bg, levelCfg.color)}>
                <LevelIcon levelKey={userInfo.level} size={12} inheritColor /> {t(levelCfg.labelKey)}
              </span>
            </div>

            {/* Separator */}
            <div className="border-t border-[#1E3A5F] [.light_&]:border-[#E2E8F0] my-1" />

            <button
              onClick={() => handleItemClick('configuracoes')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white [.light_&]:text-[#1A202C] hover:bg-secondary/40 [.light_&]:hover:bg-[#F1F5F9] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#94A3B8] [.light_&]:text-[#4A5568]" />
              {t('nav.settings')}
            </button>
            <button
              onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 [.light_&]:hover:bg-red-50 transition-colors"
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
