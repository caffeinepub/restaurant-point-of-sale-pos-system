import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  UserProfile, 
  UserRole, 
  Order, 
  OrderItem, 
  OrderStatus, 
  Table, 
  TableStatus, 
  MenuItem, 
  InventoryItem, 
  Supplier, 
  FinancialTransaction,
  RestaurantRole
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// Staff Management Queries
export function useGetAllStaffMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, UserProfile][]>({
    queryKey: ['staffMembers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStaffMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStaffMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, role, principal }: { name: string; role: RestaurantRole; principal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addStaffMember(name, role, principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
    },
  });
}

export function useUpdateStaffMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, name, role }: { principal: Principal; name: string; role: RestaurantRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaffMember(principal, name, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMembers'] });
    },
  });
}

// Order Queries
export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableNumber, items }: { tableNumber: bigint | null; items: OrderItem[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(tableNumber, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Table Queries
export function useGetAllTables() {
  const { actor, isFetching } = useActor();

  return useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTables();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTable() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ number, capacity }: { number: bigint; capacity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTable(number, capacity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useUpdateTableStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableNumber, status }: { tableNumber: bigint; status: TableStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTableStatus(tableNumber, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

// Menu Queries
export function useGetAllMenuItems() {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, category, price }: { name: string; category: string; price: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(name, category, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

export function useUpdateMenuItemAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuItemId, available }: { menuItemId: bigint; available: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMenuItemAvailability(menuItemId, available);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
}

// Inventory Queries
export function useGetAllInventoryItems() {
  const { actor, isFetching } = useActor();

  return useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInventoryItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, supplierId, lowStockThreshold }: { name: string; supplierId: bigint | null; lowStockThreshold: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addInventoryItem(name, supplierId, lowStockThreshold);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateInventoryQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inventoryId, quantity }: { inventoryId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInventoryQuantity(inventoryId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// Supplier Queries
export function useGetAllSuppliers() {
  const { actor, isFetching } = useActor();

  return useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSuppliers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSupplier() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, contactInfo }: { name: string; contactInfo: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSupplier(name, contactInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

// Financial Queries
export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<FinancialTransaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, paymentMethod, orderId }: { amount: bigint; paymentMethod: string; orderId: bigint | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordTransaction(amount, paymentMethod, orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
