import { useState } from 'react';
import { Gift } from 'lucide-react';
import { UserRole } from '@/types/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { REWARD_TABS, RewardProduct, getAllProductsForRole } from '@/data/rewardsData';
import { ProductGrid } from './ProductGrid';
import { BrandsList } from './BrandsList';
import { RedeemModal } from './RedeemModal';
import { RewardsHistory } from './RewardsHistory';
import { AllProductsList } from './AllProductsList';
import { useTranslation } from 'react-i18next';

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

export function RewardsStoreView({ userRole }: RewardsStoreViewProps) {
  const { t } = useTranslation();
  const getInitialPoints = () => {
    switch (userRole) {
      case 'patient': return 450;
      case 'dentist': return 1250;
      case 'clinic': return 3800;
    }
  };
  const [userPoints, setUserPoints] = useState(getInitialPoints());
  const [redeemProduct, setRedeemProduct] = useState<RewardProduct | null>(null);

  const tabs = REWARD_TABS[userRole] || REWARD_TABS.patient;
  const allProducts = getAllProductsForRole(userRole);

  const handleRedeem = (product: RewardProduct) => { setRedeemProduct(product); };
  const handleConfirmRedeem = () => { if (redeemProduct) setUserPoints(prev => prev - redeemProduct.points); };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-28">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{t('store.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('store.pointsEquiv')}</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 sm:px-4 py-2 self-start sm:self-auto">
          <Gift className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-bold text-amber-400">{userPoints.toLocaleString()}</span>
          <span className="text-xs text-amber-400/70 hidden sm:inline">{t('store.available')}</span>
          <span className="text-xs text-amber-400/70 sm:hidden">pts</span>
        </div>
      </div>

      <Tabs defaultValue="loja" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="loja">{t('store.shop')}</TabsTrigger>
          <TabsTrigger value="historico">{t('store.redeemHistory')}</TabsTrigger>
        </TabsList>

        <TabsContent value="loja" className="mt-4">
          <Tabs defaultValue="todos" className="w-full">
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

            <TabsContent value="todos" className="mt-4">
              <AllProductsList products={allProducts} userPoints={userPoints} onRedeem={handleRedeem} />
            </TabsContent>

            {tabs.map(tab => (
              <TabsContent key={tab.key} value={tab.key} className="mt-4">
                {tab.type === 'brands' && tab.brands ? (
                  <BrandsList brands={tab.brands} userPoints={userPoints} onRedeem={handleRedeem} />
                ) : tab.products ? (
                  <ProductGrid products={tab.products} userPoints={userPoints} onRedeem={handleRedeem} groupBySubcategory={tab.products.length > 10} />
                ) : null}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <RewardsHistory />
        </TabsContent>
      </Tabs>

      <RedeemModal product={redeemProduct} userPoints={userPoints} onClose={() => setRedeemProduct(null)} onConfirm={handleConfirmRedeem} />
    </div>
  );
}
