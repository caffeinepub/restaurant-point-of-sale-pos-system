import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryItem {
    id: bigint;
    lowStockThreshold: bigint;
    name: string;
    quantity: bigint;
    supplierId?: bigint;
}
export interface MenuItem {
    id: bigint;
    name: string;
    available: boolean;
    category: string;
    price: bigint;
}
export type Time = bigint;
export interface Table {
    status: TableStatus;
    number: bigint;
    capacity: bigint;
}
export interface OrderItem {
    quantity: bigint;
    price: bigint;
    menuItemId: bigint;
}
export interface FinancialTransaction {
    id: bigint;
    paymentMethod: string;
    orderId?: bigint;
    timestamp: Time;
    amount: bigint;
}
export interface Supplier {
    id: bigint;
    contactInfo: string;
    name: string;
}
export interface UserProfile {
    name: string;
    restaurantRole?: RestaurantRole;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    total: bigint;
    tableNumber?: bigint;
    timestamp: Time;
    waiter: Principal;
    items: Array<OrderItem>;
}
export enum OrderStatus {
    preparing = "preparing",
    pending = "pending",
    completed = "completed",
    served = "served",
    ready = "ready"
}
export enum RestaurantRole {
    manager = "manager",
    cook = "cook",
    waiter = "waiter"
}
export enum TableStatus {
    occupied = "occupied",
    reserved = "reserved",
    available = "available"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInventoryItem(name: string, supplierId: bigint | null, lowStockThreshold: bigint): Promise<bigint>;
    addMenuItem(name: string, category: string, price: bigint): Promise<bigint>;
    addStaffMember(name: string, role: RestaurantRole, principal: Principal): Promise<void>;
    addSupplier(name: string, contactInfo: string): Promise<bigint>;
    addTable(number: bigint, capacity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(tableNumber: bigint | null, items: Array<OrderItem>): Promise<bigint>;
    getAllInventoryItems(): Promise<Array<InventoryItem>>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllStaffMembers(): Promise<Array<[Principal, UserProfile]>>;
    getAllSuppliers(): Promise<Array<Supplier>>;
    getAllTables(): Promise<Array<Table>>;
    getAllTransactions(): Promise<Array<FinancialTransaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInventoryItem(inventoryId: bigint): Promise<InventoryItem | null>;
    getMenuItem(menuItemId: bigint): Promise<MenuItem | null>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getSupplier(supplierId: bigint): Promise<Supplier | null>;
    getTable(tableNumber: bigint): Promise<Table | null>;
    getTransaction(transactionId: bigint): Promise<FinancialTransaction | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    recordTransaction(amount: bigint, paymentMethod: string, orderId: bigint | null): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateInventoryQuantity(inventoryId: bigint, quantity: bigint): Promise<void>;
    updateMenuItemAvailability(menuItemId: bigint, available: boolean): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateStaffMember(principal: Principal, name: string, role: RestaurantRole): Promise<void>;
    updateTableStatus(tableNumber: bigint, status: TableStatus): Promise<void>;
}