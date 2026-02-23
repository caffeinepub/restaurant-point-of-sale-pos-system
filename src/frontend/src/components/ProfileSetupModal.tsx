import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { RestaurantRole } from '../backend';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<RestaurantRole | ''>('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Ju lutem shkruani emrin tuaj');
      return;
    }
    if (!role) {
      toast.error('Ju lutem zgjidhni rolin tuaj');
      return;
    }

    try {
      await saveProfile.mutateAsync({ 
        name: name.trim(),
        restaurantRole: role as RestaurantRole
      });
      toast.success('Profili u ruajt me sukses!');
    } catch (error) {
      toast.error('Gabim gjatë ruajtjes së profilit');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Mirë se vini!</DialogTitle>
          <DialogDescription>
            Ju lutem plotësoni informacionin tuaj për të vazhduar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Emri juaj</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shkruani emrin tuaj"
              disabled={saveProfile.isPending}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Roli juaj</Label>
            <Select value={role} onValueChange={(value) => setRole(value as RestaurantRole)} disabled={saveProfile.isPending}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Zgjidhni rolin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RestaurantRole.waiter}>Kamarier</SelectItem>
                <SelectItem value={RestaurantRole.cook}>Kuzhinier</SelectItem>
                <SelectItem value={RestaurantRole.manager}>Menaxher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duke ruajtur...
              </>
            ) : (
              'Ruaj'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
