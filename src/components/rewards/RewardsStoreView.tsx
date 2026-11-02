import { formatNumber } from '@/lib/formatters';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gift, ShoppingBag, SlidersHorizontal, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EmptyState } from '@/components/ui/empty-state';
import { useIsMobile } from '@/hooks/use-mobile';
import { RewardsFilters, RewardFilterState } from './RewardsFilters';
import { CoachMark } from '@/components/onboarding/CoachMark';
import { UserRole } from '@/types/calendar';
import { useSimulatedLoading } from '@/hooks/use-simulated-loading';
import { CardGridSkeleton } from '@/components/skeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { REWARD_TABS, RewardProduct, RedeemHistoryItem, MOCK_REDEEM_HISTORY, getAllProductsForRole, getRewardPopularity } from '@/data/rewardsData';
import { ProductGrid } from './ProductGrid';
import { BrandsList } from './BrandsList';
import { RedeemModal } from './RedeemModal';
import { RewardsHistory } from './RewardsHistory';
import { AllProductsList } from './AllProductsList';
import { useTranslation } from 'react-i18next';
import { usePointsData, usePointsRefresh } from '@/data/pointsSource';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRedemptions, isRedeemFailure, redeemReward, rewardKeyFor } from '@/data/rewardsWrites';

const TAB_LABEL_KEYS: Record<string, string> = {
  consultas: 'store.tabConsultas',
  higiene: 'store.tabHigiene',
  marcas: 'store.tabMarcas',
  subscricao: 'store.tabSubscricao',
  equipamento: 'store.tabEquipamento',
  formacao: 'store.tabFormacao',
  software: 'store.tabSoftware',
};

interface RewardsStoreViewProps {
  userRole: UserRole;
}

function generateDemoCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * 26)]).join('');
  const seg3 = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `SC-${seg2}-${seg3}`;
}

export function RewardsStoreView({ userRole }: RewardsStoreViewProps) {
  const { t } = useTranslation();
  const isLoading = useSimulatedLoading(1200, 'rewards');
  const { user } = useAuth();
  const points = usePointsData(userRole);
  const refreshPoints = usePointsRefresh();
  const isDemo = points.isDemo || !user;

  // Demo mode keeps a purely local balance seeded from the same spendable
  // reward points shown on Dashboard/Pontuações (never XP); real users read `user_levels`.
  const [demoPoints, setDemoPoints] = useState(points.rewardPoints);
  const userPoints = isDemo ? demoPoints : points.rewardPoints;

  const [redeemProduct, setRedeemProduct] = useState<RewardProduct | null>(null);
  const [history, setHistory] = useState<RedeemHistoryItem[]>(MOCK_REDEEM_HISTORY);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (isDemo || !user) return;
    setHistoryLoading(true);
    try {
      setHistory(await fetchRedemptions(user.id));
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [isDemo, user]);

  useEffect(() => {
    if (isDemo) {
      setHistory(MOCK_REDEEM_HISTORY);
      return;
    }
    void loadHistory();
  }, [isDemo, loadHistory]);

  const tabs = REWARD_TABS[userRole] || REWARD_TABS.patient;
  const allProducts = useMemo(() => getAllProductsForRole(userRole), [userRole]);
  const isMobile = useIsMobile();

  // ── Filters (range over the current catalogue, sort, affordable only) ──
  const catalogMax = useMemo(() => allProducts.reduce((m, p) => Math.max(m, p.points), 0), [allProducts]);
  const defaultFilters = useMemo<RewardFilterState>(() => ({ range: [0, catalogMax], sort: 'popular', affordableOnly: false }), [catalogMax]);
  const [filters, setFilters] = useState<RewardFilterState>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => { setFilters(defaultFilters); }, [defaultFilters]);
  const [activeCategory, setActiveCategory] = useState('todos');

  const isDirty = filters.sort !== 'popular' || filters.affordableOnly || filters.range[0] > 0 || filters.range[1] < catalogMax;
  const clearFilters = () => setFilters(defaultFilters);

  const applyFilters = useCallback((products: RewardProduct[]) => {
    const [min, max] = filters.range;
    const out = products.filter(p => p.points >= min && p.points <= max && (!filters.affordableOnly || userPoints >= p.points));
    if (filters.sort === 'popular') out.sort((a, b) => getRewardPopularity(b.id) - getRewardPopularity(a.id));
    else if (filters.sort === 'pointsAsc') out.sort((a, b) => a.points - b.points);
    else out.sort((a, b) => b.points - a.points);
    return out;
  }, [filters, userPoints]);

  const filteredAll = useMemo(() => applyFilters(allProducts), [applyFilters, allProducts]);
  const filteredTabs = useMemo(() => tabs.map(tab => ({
    ...tab,
    products: tab.products ? applyFilters(tab.products) : undefined,
    brands: tab.brands
      ? tab.brands.map(b => ({ ...b, products: applyFilters(b.products) })).filter(b => b.products.length > 0)
      : undefined,
  })), [tabs, applyFilters]);

  const resultCount = activeCategory === 'todos'
    ? filteredAll.length
    : (() => {
        const tab = filteredTabs.find(tb => tb.key === activeCategory);
        if (!tab) return 0;
        return (tab.products?.length ?? 0) + (tab.brands?.reduce((n, b) => n + b.products.length, 0) ?? 0);
      })();

  const emptyResults = (
    <EmptyState
      icon={SearchX}
      title={t('store.noResultsTitle')}
      description={t('store.noResultsDesc')}
      action={isDirty ? { label: t('store.clearFilters'), onClick: clearFilters, variant: 'outline' } : undefined}
    />
  );

  const filterPanel = (
    <RewardsFilters value={filters} max={catalogMax} onChange={setFilters} onClear={clearFilters} isDirty={isDirty} />
  );

  const handleRedeem = (product: RewardProduct) => { setRedeemProduct(product); };

  const handleConfirmRedeem = async (): Promise<{ code: string } | { error: string }> => {
    if (!redeemProduct) return { error: t('store.redeemFailed') };

    if (isDemo || !user) {
      setDemoPoints(prev => Math.max(prev - redeemProduct.points, 0));
      return { code: generateDemoCode() };
    }

    const result = await redeemReward(user.id, rewardKeyFor(userRole, redeemProduct.id));
    if (isRedeemFailure(result)) {
      return {
        error: result.reason === 'insufficient_points'
          ? t('store.insufficientPoints')
          : t('store.redeemFailed'),
      };
    }
    refreshPoints();
    void loadHistory();
    return { code: result.redemption_code };
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto pb-28">
        <CardGridSkeleton cards={8} columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-28">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{t('store.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('store.pointsEquiv')}</p>
        </div>
        <div id="coachmark-store-balance" className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 sm:px-4 py-2 self-start sm:self-auto">
          <Gift className="w-4 h-4 text-warning flex-shrink-0" />
          <span className="font-bold text-warning">{formatNumber(userPoints)}</span>
          <span className="text-xs text-warning/70 hidden sm:inline">{t('store.available')}</span>
          <span className="text-xs text-warning/70 sm:hidden">pts</span>
        </div>
      </div>

      {userPoints === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-base font-bold text-foreground mb-1">{t('emptyStates.storeTitle')}</h3>
          <p className="text-sm text-muted-foreground max-w-xs">{t('emptyStates.storeDesc')}</p>
        </div>
      )}

      <Tabs defaultValue="loja" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="loja">{t('store.shop')}</TabsTrigger>
          <TabsTrigger value="historico">{t('store.redeemHistory')}</TabsTrigger>
        </TabsList>

        <TabsContent value="loja" className="mt-4">
          <div className="flex gap-6 items-start">
            {!isMobile && (
              <aside className="w-64 shrink-0 sticky top-4 rounded-xl border border-border bg-card p-4" aria-label={t('store.filters')}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">{t('store.filters')}</h3>
                {filterPanel}
              </aside>
            )}
            <div className="flex-1 min-w-0">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
              <TabsList className="w-max sm:w-full sm:grid h-auto" style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}>
                <TabsTrigger value="todos" className="text-xs sm:text-sm py-2 px-3 sm:px-4 whitespace-nowrap">{t('store.all')}</TabsTrigger>
                {tabs.map(tab => (
                  <TabsTrigger key={tab.key} value={tab.key} className="text-xs sm:text-sm py-2 px-3 sm:px-4 whitespace-nowrap">
                    {t(TAB_LABEL_KEYS[tab.key] || tab.key)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex items-center justify-between gap-3 mt-4">
              <p className="text-sm text-muted-foreground" aria-live="polite">{t('store.resultsCount', { count: resultCount })}</p>
              <div className="flex items-center gap-2">
                {isDirty && !isMobile && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>{t('store.clearFilters')}</Button>
                )}
                {isMobile && (
                  <Button type="button" variant="outline" className="gap-2 min-h-11" onClick={() => setFiltersOpen(true)}>
                    <SlidersHorizontal className="w-4 h-4" />
                    {t('store.filters')}
                    {isDirty && <span className="w-2 h-2 rounded-full bg-primary" aria-hidden />}
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="todos" className="mt-4">
              {filteredAll.length === 0 ? emptyResults : (
                <AllProductsList products={filteredAll} userPoints={userPoints} onRedeem={handleRedeem} showTierSeparators={filters.sort !== 'popular'} />
              )}
            </TabsContent>

            {filteredTabs.map(tab => (
              <TabsContent key={tab.key} value={tab.key} className="mt-4">
                {tab.type === 'brands' && tab.brands ? (
                  tab.brands.length === 0 ? emptyResults : <BrandsList brands={tab.brands} userPoints={userPoints} onRedeem={handleRedeem} />
                ) : tab.products ? (
                  tab.products.length === 0 ? emptyResults : <ProductGrid products={tab.products} userPoints={userPoints} onRedeem={handleRedeem} groupBySubcategory={tab.products.length > 10} />
                ) : null}
              </TabsContent>
            ))}
          </Tabs>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <RewardsHistory items={history} loading={historyLoading} />
        </TabsContent>
      </Tabs>

      {isMobile && (
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>{t('store.filters')}</SheetTitle>
            </SheetHeader>
            {filterPanel}
            <Button type="button" className="w-full min-h-11 mt-3" onClick={() => setFiltersOpen(false)}>
              {t('store.showResults', { count: resultCount })}
            </Button>
          </SheetContent>
        </Sheet>
      )}

      <RedeemModal product={redeemProduct} userPoints={userPoints} onClose={() => setRedeemProduct(null)} onConfirm={handleConfirmRedeem} />
      <CoachMark
        id={`store-${userRole}`}
        targetId="coachmark-store-balance"
        title={t('coachmarks.storeTitle')}
        description={t('coachmarks.storeDesc')}
        enabled={!isLoading}
      />
    </div>
  );
}
