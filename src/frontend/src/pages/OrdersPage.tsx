import { useState } from 'react';
import { useGetAllOrders, useGetAllTables, useGetAllMenuItems, useCreateOrder, useUpdateOrderStatus, useRecordTransaction } from '../hooks/useQueries';
import { OrderStatus } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (amount: number | bigint): string => {
  const value = Number(amount) / 100;
  return `€${value.toFixed(2)}`;
};

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useGetAllOrders();
  const { data: tables = [] } = useGetAllTables();
  const { data: menuItems = [] } = useGetAllMenuItems();
  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();
  const recordTransaction = useRecordTransaction();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [selectedItems, setSelectedItems] = useState<Map<bigint, number>>(new Map());

  const availableTables = tables.filter((t) => t.status === 'available');

  const handleAddItem = (menuItemId: bigint) => {
    const current = selectedItems.get(menuItemId) || 0;
    setSelectedItems(new Map(selectedItems.set(menuItemId, current + 1)));
  };

  const handleRemoveItem = (menuItemId: bigint) => {
    const current = selectedItems.get(menuItemId) || 0;
    if (current > 1) {
      setSelectedItems(new Map(selectedItems.set(menuItemId, current - 1)));
    } else {
      const newMap = new Map(selectedItems);
      newMap.delete(menuItemId);
      setSelectedItems(newMap);
    }
  };

  const calculateTotal = () => {
    let total = 0n;
    selectedItems.forEach((quantity, menuItemId) => {
      const item = menuItems.find((m) => m.id === menuItemId);
      if (item) {
        total += item.price * BigInt(quantity);
      }
    });
    return total;
  };

  const handleCreateOrder = async () => {
    if (selectedItems.size === 0) {
      toast.error('Ju lutem zgjidhni të paktën një artikull');
      return;
    }

    if (orderType === 'dine-in' && !selectedTable) {
      toast.error('Ju lutem zgjidhni një tavolinë');
      return;
    }

    try {
      const items = Array.from(selectedItems.entries()).map(([menuItemId, quantity]) => {
        const item = menuItems.find((m) => m.id === menuItemId);
        return {
          menuItemId,
          quantity: BigInt(quantity),
          price: item?.price || 0n,
        };
      });

      const tableNumber = orderType === 'dine-in' ? BigInt(selectedTable) : null;
      await createOrder.mutateAsync({ tableNumber, items });
      
      toast.success('Porosia u krijua me sukses!');
      setIsCreateDialogOpen(false);
      setSelectedTable('');
      setSelectedItems(new Map());
    } catch (error) {
      toast.error('Gabim gjatë krijimit të porosisë');
    }
  };

  const handleStatusUpdate = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success('Statusi u përditësua me sukses!');
    } catch (error) {
      toast.error('Gabim gjatë përditësimit të statusit');
    }
  };

  const handleCompleteOrder = async (order: any) => {
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: OrderStatus.completed });
      await recordTransaction.mutateAsync({
        amount: order.total,
        paymentMethod: 'Cash',
        orderId: order.id,
      });
      toast.success('Porosia u mbyll me sukses!');
    } catch (error) {
      toast.error('Gabim gjatë mbylljes së porosisë');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, { variant: any; label: string; icon: any }> = {
      [OrderStatus.pending]: { variant: 'secondary', label: 'Në pritje', icon: Clock },
      [OrderStatus.preparing]: { variant: 'default', label: 'Duke u përgatitur', icon: Clock },
      [OrderStatus.ready]: { variant: 'outline', label: 'Gati', icon: CheckCircle2 },
      [OrderStatus.served]: { variant: 'outline', label: 'Shërbyer', icon: CheckCircle2 },
      [OrderStatus.completed]: { variant: 'outline', label: 'Përfunduar', icon: CheckCircle2 },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== OrderStatus.completed);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Porositë</h2>
          <p className="text-sm text-muted-foreground mt-1">Menaxho porositë e restorantit</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Plus className="h-5 w-5" />
              Porosi e Re
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Krijo Porosi të Re</DialogTitle>
              <DialogDescription>Zgjidh artikujt dhe detajet e porosisë</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Lloji i Porosisë</Label>
                  <Select value={orderType} onValueChange={(v: any) => setOrderType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">Në Restorant</SelectItem>
                      <SelectItem value="takeaway">Me Marrje</SelectItem>
                      <SelectItem value="delivery">Dërgim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {orderType === 'dine-in' && (
                  <div className="space-y-2">
                    <Label>Tavolina</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh tavolinën" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTables.map((table) => (
                          <SelectItem key={table.number.toString()} value={table.number.toString()}>
                            Tavolina {table.number.toString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Artikujt e Menysë</Label>
                <ScrollArea className="h-64 rounded-md border p-4">
                  <div className="grid gap-2">
                    {menuItems
                      .filter((item) => item.available)
                      .map((item) => {
                        const quantity = selectedItems.get(item.id) || 0;
                        return (
                          <div key={item.id.toString()} className="flex items-center justify-between rounded-lg border p-3 gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(item.price)} • {item.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {quantity > 0 && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleRemoveItem(item.id)}>
                                    -
                                  </Button>
                                  <span className="w-8 text-center font-medium">{quantity}</span>
                                </>
                              )}
                              <Button size="sm" onClick={() => handleAddItem(item.id)}>
                                +
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <span className="text-lg font-semibold">Totali:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(calculateTotal())}</span>
              </div>

              <Button onClick={handleCreateOrder} disabled={createOrder.isPending} className="w-full" size="lg">
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Duke krijuar...
                  </>
                ) : (
                  'Krijo Porosinë'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeOrders.map((order) => (
          <Card key={order.id.toString()}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="truncate">Porosia #{order.id.toString()}</CardTitle>
                  <CardDescription className="truncate">
                    {order.tableNumber ? `Tavolina ${order.tableNumber.toString()}` : 'Me Marrje/Dërgim'}
                  </CardDescription>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {order.items.map((item, idx) => {
                  const menuItem = menuItems.find((m) => m.id === item.menuItemId);
                  return (
                    <div key={idx} className="flex justify-between text-sm gap-2">
                      <span className="truncate">
                        {menuItem?.name} x{item.quantity.toString()}
                      </span>
                      <span className="font-medium shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Totali:</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex flex-col gap-2">
                {order.status === OrderStatus.pending && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.preparing)}
                  >
                    Fillo Përgatitjen
                  </Button>
                )}
                {order.status === OrderStatus.preparing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.ready)}
                  >
                    Shëno Gati
                  </Button>
                )}
                {order.status === OrderStatus.ready && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.served)}
                  >
                    Shërbyer
                  </Button>
                )}
                {order.status === OrderStatus.served && (
                  <Button size="sm" className="w-full" onClick={() => handleCompleteOrder(order)}>
                    Mbyll Porosinë
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Nuk ka porosi aktive</p>
            <p className="text-sm text-muted-foreground">Krijo një porosi të re për të filluar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
