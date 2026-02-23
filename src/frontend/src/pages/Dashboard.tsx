import { useState } from 'react';
import { RestaurantRole } from '../backend';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import Header from '../components/Header';
import OrdersPage from './OrdersPage';
import TablesPage from './TablesPage';
import MenuPage from './MenuPage';
import InventoryPage from './InventoryPage';
import ReportsPage from './ReportsPage';
import KitchenDisplayPage from './KitchenDisplayPage';
import StaffManagementPage from './StaffManagementPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Table2, UtensilsCrossed, Package, BarChart3, ChefHat, Users } from 'lucide-react';

export default function Dashboard() {
  const { data: userProfile } = useGetCallerUserProfile();
  const [activeTab, setActiveTab] = useState('orders');

  const restaurantRole = userProfile?.restaurantRole;
  const isManager = restaurantRole === RestaurantRole.manager;
  const isWaiter = restaurantRole === RestaurantRole.waiter;
  const isCook = restaurantRole === RestaurantRole.cook;

  // Determine which sections are visible based on role
  const canViewOrders = isManager || isWaiter;
  const canViewKitchen = isManager || isCook;
  const canViewTables = isManager || isWaiter;
  const canViewMenu = isManager || isWaiter || isCook;
  const canViewInventory = isManager || isCook;
  const canViewReports = isManager;
  const canViewStaff = isManager;

  // Set default active tab based on role
  useState(() => {
    if (isWaiter) {
      setActiveTab('orders');
    } else if (isCook) {
      setActiveTab('kitchen');
    } else if (isManager) {
      setActiveTab('orders');
    }
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-3 gap-2 md:flex md:w-auto md:gap-1 md:mb-6">
              {canViewOrders && (
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Porositë</span>
                </TabsTrigger>
              )}
              {canViewKitchen && (
                <TabsTrigger value="kitchen" className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  <span className="hidden sm:inline">Kuzhina</span>
                </TabsTrigger>
              )}
              {canViewTables && (
                <TabsTrigger value="tables" className="flex items-center gap-2">
                  <Table2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Tavolinat</span>
                </TabsTrigger>
              )}
              {canViewMenu && (
                <TabsTrigger value="menu" className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span className="hidden sm:inline">Menyja</span>
                </TabsTrigger>
              )}
              {canViewInventory && (
                <TabsTrigger value="inventory" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Inventari</span>
                </TabsTrigger>
              )}
              {canViewReports && (
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Raportet</span>
                </TabsTrigger>
              )}
              {canViewStaff && (
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Stafi</span>
                </TabsTrigger>
              )}
            </TabsList>

            {canViewOrders && (
              <TabsContent value="orders" className="mt-0">
                <OrdersPage />
              </TabsContent>
            )}
            {canViewKitchen && (
              <TabsContent value="kitchen" className="mt-0">
                <KitchenDisplayPage />
              </TabsContent>
            )}
            {canViewTables && (
              <TabsContent value="tables" className="mt-0">
                <TablesPage />
              </TabsContent>
            )}
            {canViewMenu && (
              <TabsContent value="menu" className="mt-0">
                <MenuPage />
              </TabsContent>
            )}
            {canViewInventory && (
              <TabsContent value="inventory" className="mt-0">
                <InventoryPage />
              </TabsContent>
            )}
            {canViewReports && (
              <TabsContent value="reports" className="mt-0">
                <ReportsPage />
              </TabsContent>
            )}
            {canViewStaff && (
              <TabsContent value="staff" className="mt-0">
                <StaffManagementPage />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
