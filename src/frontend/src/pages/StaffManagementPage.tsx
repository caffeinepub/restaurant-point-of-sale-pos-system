import { useState } from 'react';
import { useGetAllStaffMembers, useAddStaffMember, useUpdateStaffMember } from '../hooks/useQueries';
import { RestaurantRole } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Loader2, Edit, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffManagementPage() {
  const { data: staffMembers = [], isLoading } = useGetAllStaffMembers();
  const addStaffMutation = useAddStaffMember();
  const updateStaffMutation = useUpdateStaffMember();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<RestaurantRole>(RestaurantRole.waiter);
  const [newStaffPrincipal, setNewStaffPrincipal] = useState('');
  const [editingStaff, setEditingStaff] = useState<{ principal: Principal; name: string; role: RestaurantRole } | null>(null);
  const [copiedPrincipal, setCopiedPrincipal] = useState<string | null>(null);

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) {
      toast.error('Ju lutem shkruani emrin e stafit');
      return;
    }

    if (!newStaffPrincipal.trim()) {
      toast.error('Ju lutem shkruani Principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(newStaffPrincipal.trim());
      await addStaffMutation.mutateAsync({
        name: newStaffName.trim(),
        role: newStaffRole,
        principal,
      });

      toast.success('Stafi u shtua me sukses!');
      setIsAddDialogOpen(false);
      setNewStaffName('');
      setNewStaffPrincipal('');
      setNewStaffRole(RestaurantRole.waiter);
    } catch (error: any) {
      console.error('Error adding staff:', error);
      if (error.message?.includes('Invalid principal')) {
        toast.error('Principal ID i pavlefshëm');
      } else {
        toast.error('Gabim gjatë shtimit të stafit');
      }
    }
  };

  const handleEditStaff = async () => {
    if (!editingStaff) return;

    if (!editingStaff.name.trim()) {
      toast.error('Ju lutem shkruani emrin e stafit');
      return;
    }

    try {
      await updateStaffMutation.mutateAsync({
        principal: editingStaff.principal,
        name: editingStaff.name.trim(),
        role: editingStaff.role,
      });

      toast.success('Stafi u përditësua me sukses!');
      setIsEditDialogOpen(false);
      setEditingStaff(null);
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Gabim gjatë përditësimit të stafit');
    }
  };

  const copyToClipboard = async (text: string, principalId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrincipal(principalId);
      toast.success('Principal ID u kopjua!');
      setTimeout(() => setCopiedPrincipal(null), 2000);
    } catch (error) {
      toast.error('Gabim gjatë kopjimit');
    }
  };

  const getRoleBadgeVariant = (role?: RestaurantRole) => {
    switch (role) {
      case RestaurantRole.manager:
        return 'default';
      case RestaurantRole.cook:
        return 'secondary';
      case RestaurantRole.waiter:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role?: RestaurantRole) => {
    switch (role) {
      case RestaurantRole.manager:
        return 'Menaxher';
      case RestaurantRole.cook:
        return 'Kuzhinier';
      case RestaurantRole.waiter:
        return 'Kamarier';
      default:
        return 'Pa rol';
    }
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
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Menaxhimi i Stafit</h2>
          <p className="text-sm text-muted-foreground mt-1">Menaxhoni anëtarët e stafit dhe rolet e tyre</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <UserPlus className="h-5 w-5" />
              Shto Staf
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Shto Anëtar të Ri të Stafit</DialogTitle>
              <DialogDescription>
                Plotësoni të dhënat për të shtuar një anëtar të ri të stafit
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Emri</Label>
                <Input
                  id="name"
                  placeholder="Shkruani emrin e plotë"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="principal">Principal ID</Label>
                <Input
                  id="principal"
                  placeholder="Shkruani Principal ID"
                  value={newStaffPrincipal}
                  onChange={(e) => setNewStaffPrincipal(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Principal ID merret nga Internet Identity e përdoruesit
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Roli</Label>
                <Select
                  value={newStaffRole}
                  onValueChange={(value) => setNewStaffRole(value as RestaurantRole)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RestaurantRole.waiter}>Kamarier</SelectItem>
                    <SelectItem value={RestaurantRole.cook}>Kuzhinier</SelectItem>
                    <SelectItem value={RestaurantRole.manager}>Menaxher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Anulo
              </Button>
              <Button onClick={handleAddStaff} disabled={addStaffMutation.isPending}>
                {addStaffMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Shto Staf
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista e Stafit</CardTitle>
          <CardDescription>
            {staffMembers.length} anëtarë të stafit në total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staffMembers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Nuk ka anëtarë stafi të regjistruar</p>
              <p className="text-sm text-muted-foreground">Shtoni anëtarë të rinj duke klikuar butonin "Shto Staf"</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Emri</th>
                      <th className="text-left py-3 px-4 font-medium">Roli</th>
                      <th className="text-left py-3 px-4 font-medium">Principal ID</th>
                      <th className="text-right py-3 px-4 font-medium">Veprime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map(([principal, profile]) => (
                      <tr key={principal.toString()} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{profile.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getRoleBadgeVariant(profile.restaurantRole)}>
                            {getRoleLabel(profile.restaurantRole)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                              {principal.toString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 shrink-0"
                              onClick={() => copyToClipboard(principal.toString(), principal.toString())}
                            >
                              {copiedPrincipal === principal.toString() ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStaff({
                                principal,
                                name: profile.name,
                                role: profile.restaurantRole || RestaurantRole.waiter,
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {staffMembers.map(([principal, profile]) => (
                  <Card key={principal.toString()}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{profile.name}</CardTitle>
                          <div className="mt-2">
                            <Badge variant={getRoleBadgeVariant(profile.restaurantRole)}>
                              {getRoleLabel(profile.restaurantRole)}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingStaff({
                              principal,
                              name: profile.name,
                              role: profile.restaurantRole || RestaurantRole.waiter,
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Principal ID</Label>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground break-all flex-1">
                            {principal.toString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0"
                            onClick={() => copyToClipboard(principal.toString(), principal.toString())}
                          >
                            {copiedPrincipal === principal.toString() ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifiko Anëtarin e Stafit</DialogTitle>
            <DialogDescription>
              Përditësoni të dhënat e anëtarit të stafit
            </DialogDescription>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Emri</Label>
                <Input
                  id="edit-name"
                  placeholder="Shkruani emrin e plotë"
                  value={editingStaff.name}
                  onChange={(e) =>
                    setEditingStaff({ ...editingStaff, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Roli</Label>
                <Select
                  value={editingStaff.role}
                  onValueChange={(value) =>
                    setEditingStaff({ ...editingStaff, role: value as RestaurantRole })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RestaurantRole.waiter}>Kamarier</SelectItem>
                    <SelectItem value={RestaurantRole.cook}>Kuzhinier</SelectItem>
                    <SelectItem value={RestaurantRole.manager}>Menaxher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Principal ID</Label>
                <p className="text-xs font-mono text-muted-foreground break-all bg-muted p-3 rounded">
                  {editingStaff.principal.toString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Anulo
            </Button>
            <Button onClick={handleEditStaff} disabled={updateStaffMutation.isPending}>
              {updateStaffMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ruaj Ndryshimet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
