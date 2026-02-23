import { useGetAllOrders, useGetAllMenuItems, useUpdateOrderStatus } from '../hooks/useQueries';
import { OrderStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

export default function KitchenDisplayPage() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const { data: menuItems = [] } = useGetAllMenuItems();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusUpdate = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success('Statusi u përditësua!');
    } catch (error) {
      toast.error('Gabim gjatë përditësimit');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kitchenOrders = orders.filter(
    (o) => o.status === OrderStatus.pending || o.status === OrderStatus.preparing
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ekrani i Kuzhinës</h2>
          <p className="text-sm text-muted-foreground mt-1">Porositë aktive për përgatitje</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kitchenOrders.map((order) => {
          const isPending = order.status === OrderStatus.pending;
          return (
            <Card key={order.id.toString()} className={isPending ? 'border-orange-500 border-2' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">Porosia #{order.id.toString()}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {order.tableNumber ? `Tavolina ${order.tableNumber.toString()}` : 'Me Marrje/Dërgim'}
                    </p>
                  </div>
                  <Badge variant={isPending ? 'destructive' : 'default'} className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isPending ? 'E Re' : 'Në Përgatitje'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.items.map((item, idx) => {
                    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
                    return (
                      <div key={idx} className="rounded-lg bg-muted p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">{menuItem?.name}</span>
                          <Badge variant="outline" className="text-lg">
                            x{item.quantity.toString()}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isPending ? (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.preparing)}
                  >
                    Fillo Përgatitjen
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    variant="outline"
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.ready)}
                  >
                    Shëno si Gati
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {kitchenOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ChefHat className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Nuk ka porosi për përgatitje</p>
            <p className="text-sm text-muted-foreground">Porositë e reja do të shfaqen këtu</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
