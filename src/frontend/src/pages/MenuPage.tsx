import { useState } from 'react';
import { useGetAllMenuItems, useAddMenuItem, useUpdateMenuItemAvailability } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Loader2, Plus, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (amount: number | bigint): string => {
  const value = Number(amount) / 100;
  return `€${value.toFixed(2)}`;
};

export default function MenuPage() {
  const { data: menuItems = [], isLoading } = useGetAllMenuItems();
  const addMenuItem = useAddMenuItem();
  const updateAvailability = useUpdateMenuItemAvailability();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

  const handleAddMenuItem = async () => {
    if (!name || !category || !price) {
      toast.error('Ju lutem plotësoni të gjitha fushat');
      return;
    }

    try {
      const priceInCents = Math.round(parseFloat(price) * 100);
      await addMenuItem.mutateAsync({
        name,
        category,
        price: BigInt(priceInCents),
      });
      toast.success('Artikulli u shtua me sukses!');
      setIsAddDialogOpen(false);
      setName('');
      setCategory('');
      setPrice('');
    } catch (error) {
      toast.error('Gabim gjatë shtimit të artikullit');
    }
  };

  const handleToggleAvailability = async (menuItemId: bigint, available: boolean) => {
    try {
      await updateAvailability.mutateAsync({ menuItemId, available });
      toast.success('Disponueshmëria u përditësua!');
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

  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Menyja</h2>
          <p className="text-sm text-muted-foreground mt-1">Menaxho artikujt e menysë</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Plus className="h-5 w-5" />
              Shto Artikull
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shto Artikull të Ri</DialogTitle>
              <DialogDescription>Vendos detajet e artikullit të menysë</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Emri i Artikullit</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="p.sh. Pizza Margherita"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategoria</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="p.sh. Pica, Pasta, Pije"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Çmimi (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="p.sh. 8.50"
                />
              </div>
              <Button onClick={handleAddMenuItem} disabled={addMenuItem.isPending} className="w-full">
                {addMenuItem.isPending ? (
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

      {categories.map((cat) => {
        const categoryItems = menuItems.filter((item) => item.category === cat);
        
        return (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{cat}</h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Rrëshqit</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
            
            <Carousel
              opts={{
                align: 'start',
                loop: false,
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {categoryItems.map((item) => (
                  <CarouselItem key={item.id.toString()} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <CardDescription className="text-lg font-semibold text-primary">
                              {formatCurrency(item.price)}
                            </CardDescription>
                          </div>
                          <Badge variant={item.available ? 'default' : 'secondary'} className="shrink-0">
                            {item.available ? 'Në dispozicion' : 'Jo në dispozicion'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`available-${item.id}`} className="text-sm">Në dispozicion</Label>
                          <Switch
                            id={`available-${item.id}`}
                            checked={item.available}
                            onCheckedChange={(checked) => handleToggleAvailability(item.id, checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="-left-4" />
                <CarouselNext className="-right-4" />
              </div>
            </Carousel>
          </div>
        );
      })}

      {menuItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Nuk ka artikuj në meny</p>
            <p className="text-sm text-muted-foreground">Shto artikuj për të filluar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
