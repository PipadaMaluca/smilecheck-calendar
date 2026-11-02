import { getAchievementCategories } from '@/components/achievements/AchievementsView';
for (const r of ['patient','dentist','clinic'] as const) console.log(r, getAchievementCategories(r as any).reduce((n,c)=>n+c.achievements.length,0));
