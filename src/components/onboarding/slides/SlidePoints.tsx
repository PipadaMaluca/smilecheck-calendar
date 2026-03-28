import { UserRole } from '@/types/calendar';
import { useTranslation } from 'react-i18next';

interface SlidePointsProps { isActive: boolean; userRole: UserRole; }

const PATIENT_KEYS = ['rating5', 'rating4', 'confirm24h', 'confirm1h', 'attended', 'onTime', 'collaborated', 'hygiene', 'followedRecs'];
const PATIENT_ICONS = ['⭐', '⭐', '✅', '✅', '🏃', '⏰', '🤝', '🪥', '📋'];
const PATIENT_PTS = ['+5 pts', '+3 pts', '+1 pt', '+1 pt', '+5 pts', '+2 pts', '+2 pts', '+2 pts', '+2 pts'];

const DENTIST_KEYS = ['consultCompleted', 'teleconsultDone', 'reply24h', 'prescription', 'referralLetter', 'rating5FromPatient', 'streak7days'];
const DENTIST_ICONS = ['📋', '📱', '💬', '📝', '📄', '⭐', '🔥'];
const DENTIST_PTS = ['+8 pts', '+10 pts', '+2 pts', '+1 pt', '+2 pts', '+5 pts', '+10 pts'];

const CLINIC_KEYS = ['clinicConsultCompleted', 'clinicTeleconsult', 'clinicRating5', 'newDentistActive', 'confirmRate90', 'dentistTop100'];
const CLINIC_ICONS = ['📋', '📱', '⭐', '👨‍⚕️', '📊', '🏆'];
const CLINIC_PTS = ['+3 pts', '+5 pts', '+5 pts', '+15 pts', '+10 pts/sem', '+20 pts'];

export const SlidePoints = ({ isActive, userRole }: SlidePointsProps) => {
  const { t } = useTranslation();
  const roleKey = userRole === 'patient' ? 'patient' : userRole === 'dentist' ? 'dentist' : 'clinic';
  
  const keys = userRole === 'patient' ? PATIENT_KEYS : userRole === 'dentist' ? DENTIST_KEYS : CLINIC_KEYS;
  const icons = userRole === 'patient' ? PATIENT_ICONS : userRole === 'dentist' ? DENTIST_ICONS : CLINIC_ICONS;
  const pts = userRole === 'patient' ? PATIENT_PTS : userRole === 'dentist' ? DENTIST_PTS : CLINIC_PTS;

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 overflow-y-auto py-8">
      <h2 className="font-gaming text-2xl md:text-3xl text-gaming-gold mb-6 flex items-center gap-2">
        {t(`onboarding.${roleKey}.pointsTitle`)}
      </h2>
      <div className="glass-card p-4 w-full max-w-sm space-y-2">
        {keys.map((key, index) => (
          <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="text-xl">{icons[index]}</span>
              <span className="text-foreground font-medium text-sm">{t(`onboarding.pointsLabels.${key}`)}</span>
            </div>
            <span className="font-bold text-sm text-gaming-green">{pts[index]}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-muted-foreground text-center max-w-xs text-sm">{t(`onboarding.${roleKey}.pointsBottom`)}</p>
      <p className="text-[10px] text-muted-foreground text-center max-w-xs mt-2">{t('onboarding.xpNote')}</p>
    </div>
  );
};