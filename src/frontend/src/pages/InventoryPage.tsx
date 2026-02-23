import { useState } from 'react';
import { useGetAllInventoryItems, useGetAllSuppliers, useAddInventoryItem, useUpdateInventoryQuantity, useAddSupplier } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Package, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { data: inventory = [], isLoading } = useGetAllInventoryItems();
  const { data: suppliers = [] } = useGetAllSuppliers();
  const addInventoryItem = useAddInventoryItem();
  const updateQuantity = useUpdateInventoryQuantity();
  const addSupplier = useAddSupplier();

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const handleAddInventoryItem = async () => {
    if (!itemName || !lowStockThreshold) {
      toast.error('Ju lutem plotësoni të gjitha fushat');
      return;
    }

    try {
      await addInventoryItem.mutateAsync({
        name: itemName,
        supplierId: supplierId ? BigInt(supplierId) : null,
        lowStockThreshold: BigInt(lowStockThreshold),
      });
      toast.success('Artikulli u shtua me sukses!');
      setIsAddItemDialogOpen(false);
      setItemName('');
      setSupplierId('');
      setLowStockThreshold('');
    } catch (error) {
      toast.error('Gabim gjatë shtimit të artikullit');
    }
  };

  const handleUpdateQuantity = async (inventoryId: bigint, newQuantity: string) => {
    try {
      await updateQuantity.mutateAsync({
        inventoryId,
        quantity: BigInt(newQuantity),
      });
      toast.success('Sasia u përditësua!');
    } catch (error) {
      toast.error('Gabim gjatë përditësimit');
    }
  };

  const handleAddSupplier = async () => {
    if (!supplierName || !contactInfo) {
      toast.error('Ju lutem plotësoni të gjitha fushat');
      return;
    }

    try {
      await addSupplier.mutateAsync({
        name: supplierName,
        contactInfo,
      });
      toast.success('Furnizuesi u shtua me sukses!');
      setIsAddSupplierDialogOpen(false);
      setSupplierName('');
      setContactInfo('');
    } catch (error) {
      toast.error('Gabim gjatë shtimit të furnizuesit');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const lowStockItems = inventory.filter((item) => item.quantity < item.lowStockThreshold);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventari</h2>
          <p className="text-sm text-muted-foreground mt-1">Menaxho stoqet dhe furnizuesit</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900 dark:text-orange-100">Paralajmërim Stoku i Ulët</CardTitle>
            </div>
            <CardDescription className="text-orange-800 dark:text-orange-200">
              {lowStockItems.length} artikuj kanë stok të ulët
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id.toString()} className="flex items-center justify-between rounded-lg bg-white dark:bg-orange-900 p-3">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="destructive">
                    {item.quantity.toString()} / {item.lowStockThreshold.toString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory">Inventari</TabsTrigger>
          <TabsTrigger value="suppliers">Furnizuesit</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Shto Artikull
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Shto Artikull Inventari</DialogTitle>
                  <DialogDescription>Vendos detajet e artikullit të inventarit</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Emri i Artikullit</Label>
                    <Input
                      id="itemName"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="p.sh. Domate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Furnizuesi (Opsionale)</Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidh furnizuesin" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id.toString()} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Pragu i Stokut të Ulët</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      placeholder="p.sh. 10"
                    />
                  </div>
                  <Button onClick={handleAddInventoryItem} disabled={addInventoryItem.isPending} className="w-full">
                    {addInventoryItem.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Duke shtuar...
                      </>
                    ) : (
                      'Shto Artikullin'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inventory.map((item) => {
              const isLowStock = item.quantity < item.lowStockThreshold;
              const supplier = item.supplierId ? suppliers.find((s) => s.id === item.supplierId) : null;

              return (
                <Card key={item.id.toString()} className={isLowStock ? 'border-orange-500' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{item.name}</CardTitle>
                      {isLowStock && <Badge variant="destructive">Stok i Ulët</Badge>}
                    </div>
                    {supplier && (
                      <CardDescription className="text-sm">Furnizuesi: {supplier.name}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sasia aktuale:</span>
                      <span className="text-2xl font-bold">{item.quantity.toString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pragu minimal:</span>
                      <span>{item.lowStockThreshold.toString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Sasia e re"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateQuantity(item.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {inventory.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Nuk ka artikuj në inventar</p>
                <p className="text-sm text-muted-foreground">Shto artikuj për të filluar</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Shto Furnizues
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Shto Furnizues të Ri</DialogTitle>
                  <DialogDescription>Vendos detajet e furnizuesit</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Emri i Furnizuesit</Label>
                    <Input
                      id="supplierName"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder="p.sh. Furnizuesi ABC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactInfo">Informacioni i Kontaktit</Label>
                    <Input
                      id="contactInfo"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Tel: +355 XX XXX XXX"
                    />
                  </div>
                  <Button onClick={handleAddSupplier} disabled={addSupplier.isPending} className="w-full">
                    {addSupplier.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Duke shtuar...
                      </>
                    ) : (
                      'Shto Furnizuesin'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <Card key={supplier.id.toString()}>
                <CardHeader>
                  <CardTitle>{supplier.name}</CardTitle>
                  <CardDescription>{supplier.contactInfo}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {suppliers.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Nuk ka furnizues</p>
                <p className="text-sm text-muted-foreground">Shto furnizues për të filluar</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
