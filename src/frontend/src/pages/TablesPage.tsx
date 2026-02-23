import { useState } from 'react';
import { useGetAllTables, useAddTable, useUpdateTableStatus } from '../hooks/useQueries';
import { TableStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TablesPage() {
  const { data: tables = [], isLoading } = useGetAllTables();
  const addTable = useAddTable();
  const updateStatus = useUpdateTableStatus();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleAddTable = async () => {
    if (!tableNumber || !capacity) {
      toast.error('Ju lutem plotësoni të gjitha fushat');
      return;
    }

    try {
      await addTable.mutateAsync({
        number: BigInt(tableNumber),
        capacity: BigInt(capacity),
      });
      toast.success('Tavolina u shtua me sukses!');
      setIsAddDialogOpen(false);
      setTableNumber('');
      setCapacity('');
    } catch (error) {
      toast.error('Gabim gjatë shtimit të tavolinës');
    }
  };

  const handleStatusChange = async (tableNumber: bigint, status: TableStatus) => {
    try {
      await updateStatus.mutateAsync({ tableNumber, status });
      toast.success('Statusi u përditësua!');
    } catch (error) {
      toast.error('Gabim gjatë përditësimit');
    }
  };

  const getStatusBadge = (status: TableStatus) => {
    const variants: Record<TableStatus, { variant: any; label: string }> = {
      [TableStatus.available]: { variant: 'outline', label: 'E Lirë' },
      [TableStatus.occupied]: { variant: 'destructive', label: 'E Zënë' },
      [TableStatus.reserved]: { variant: 'secondary', label: 'E Rezervuar' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tavolinat</h2>
          <p className="text-sm text-muted-foreground mt-1">Menaxho tavolinat e restorantit</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Plus className="h-5 w-5" />
              Shto Tavolinë
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shto Tavolinë të Re</DialogTitle>
              <DialogDescription>Vendos numrin dhe kapacitetin e tavolinës</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Numri i Tavolinës</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="p.sh. 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Kapaciteti (Numri i Vendeve)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="p.sh. 4"
                />
              </div>
              <Button onClick={handleAddTable} disabled={addTable.isPending} className="w-full">
                {addTable.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Duke shtuar...
                  </>
                ) : (
                  'Shto Tavolinën'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tables.map((table) => (
          <Card key={table.number.toString()} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">Tavolina {table.number.toString()}</CardTitle>
                {getStatusBadge(table.status)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">{table.capacity.toString()} vende</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {table.status === TableStatus.available && (
                <>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleStatusChange(table.number, TableStatus.occupied)}
                  >
                    Shëno si të Zënë
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange(table.number, TableStatus.reserved)}
                  >
                    Rezervo
                  </Button>
                </>
              )}
              {table.status === TableStatus.occupied && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange(table.number, TableStatus.available)}
                >
                  Liro Tavolinën
                </Button>
              )}
              {table.status === TableStatus.reserved && (
                <>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleStatusChange(table.number, TableStatus.occupied)}
                  >
                    Shëno si të Zënë
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange(table.number, TableStatus.available)}
                  >
                    Anulo Rezervimin
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Nuk ka tavolina</p>
            <p className="text-sm text-muted-foreground">Shto tavolina për të filluar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
