import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();

  // Initialize auth (first caller becomes admin, others become users)
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Extended user profile to include restaurant-specific roles
  public type RestaurantRole = {
    #waiter;
    #cook;
    #manager;
  };

  public type UserProfile = {
    name : Text;
    restaurantRole : ?RestaurantRole;
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can view profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  // Helper function to check restaurant role
  func hasRestaurantRole(caller : Principal, requiredRole : RestaurantRole) : Bool {
    // Admins (managers) have all permissions
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };

    // Check if user has required restaurant role
    switch (principalMap.get(userProfiles, caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.restaurantRole) {
          case (null) { false };
          case (?role) {
            switch (requiredRole, role) {
              case (#manager, #manager) { true };
              case (#waiter, #waiter) { true };
              case (#waiter, #manager) { true }; // Managers can do waiter tasks
              case (#cook, #cook) { true };
              case (#cook, #manager) { true }; // Managers can do cook tasks
              case _ { false };
            };
          };
        };
      };
    };
  };

  // Staff Management
  public shared ({ caller }) func addStaffMember(name : Text, role : RestaurantRole, principal : Principal) : async () {
    // Only managers can add staff members
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can add staff members");
    };

    let userProfile : UserProfile = {
      name;
      restaurantRole = ?role;
    };

    userProfiles := principalMap.put(userProfiles, principal, userProfile);

    // Assign appropriate user role based on restaurant role
    let userRole = switch (role) {
      case (#waiter) { #user };
      case (#cook) { #user };
      case (#manager) { #admin };
    };

    AccessControl.assignRole(accessControlState, caller, principal, userRole);
  };

  public query ({ caller }) func getAllStaffMembers() : async [(Principal, UserProfile)] {
    // Only managers can view all staff members
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can view staff members");
    };
    Iter.toArray(principalMap.entries(userProfiles));
  };

  public shared ({ caller }) func updateStaffMember(principal : Principal, name : Text, role : RestaurantRole) : async () {
    // Only managers can update staff members
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can update staff members");
    };

    switch (principalMap.get(userProfiles, principal)) {
      case (null) { Debug.trap("Staff member not found") };
      case (?_existingProfile) {
        let updatedProfile : UserProfile = {
          name;
          restaurantRole = ?role;
        };

        userProfiles := principalMap.put(userProfiles, principal, updatedProfile);

        // Update user role based on restaurant role
        let userRole = switch (role) {
          case (#waiter) { #user };
          case (#cook) { #user };
          case (#manager) { #admin };
        };

        AccessControl.assignRole(accessControlState, caller, principal, userRole);
      };
    };
  };

  // Order and Table Management Types
  public type OrderStatus = {
    #pending;
    #preparing;
    #ready;
    #served;
    #completed;
  };

  public type TableStatus = {
    #occupied;
    #available;
    #reserved;
  };

  public type OrderItem = {
    menuItemId : Nat;
    quantity : Nat;
    price : Nat;
  };

  public type Order = {
    id : Nat;
    tableNumber : ?Nat;
    items : [OrderItem];
    status : OrderStatus;
    total : Nat;
    timestamp : Time.Time;
    waiter : Principal;
  };

  public type Table = {
    number : Nat;
    capacity : Nat;
    status : TableStatus;
  };

  public type MenuItem = {
    id : Nat;
    name : Text;
    category : Text;
    price : Nat;
    available : Bool;
  };

  public type InventoryItem = {
    id : Nat;
    name : Text;
    quantity : Nat;
    supplierId : ?Nat;
    lowStockThreshold : Nat;
  };

  public type Supplier = {
    id : Nat;
    name : Text;
    contactInfo : Text;
  };

  public type FinancialTransaction = {
    id : Nat;
    amount : Nat;
    paymentMethod : Text;
    timestamp : Time.Time;
    orderId : ?Nat;
  };

  // Storage
  transient let natMap = OrderedMap.Make<Nat>(Nat.compare);

  var orders = natMap.empty<Order>();
  var tables = natMap.empty<Table>();
  var menuItems = natMap.empty<MenuItem>();
  var inventory = natMap.empty<InventoryItem>();
  var suppliers = natMap.empty<Supplier>();
  var transactions = natMap.empty<FinancialTransaction>();

  var nextOrderId = 0;
  var nextMenuItemId = 0;
  var nextInventoryId = 0;
  var nextSupplierId = 0;
  var nextTransactionId = 0;

  // Order Management
  public shared ({ caller }) func createOrder(tableNumber : ?Nat, items : [OrderItem]) : async Nat {
    // Only waiters and managers can create orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can create orders");
    };
    if (not (hasRestaurantRole(caller, #waiter))) {
      Debug.trap("Unauthorized: Only waiters can create orders");
    };

    let orderId = nextOrderId;
    let total = calculateTotal(items);

    let order : Order = {
      id = orderId;
      tableNumber;
      items;
      status = #pending;
      total;
      timestamp = Time.now();
      waiter = caller;
    };

    orders := natMap.put(orders, orderId, order);
    nextOrderId += 1;

    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    // Cooks and managers can update order status
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can update orders");
    };
    if (not (hasRestaurantRole(caller, #cook)) and not (hasRestaurantRole(caller, #waiter))) {
      Debug.trap("Unauthorized: Only cooks and waiters can update order status");
    };

    switch (natMap.get(orders, orderId)) {
      case (null) { Debug.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status };
        orders := natMap.put(orders, orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    // All authenticated users can view individual orders
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view orders");
    };
    natMap.get(orders, orderId);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    // All authenticated users can view all orders (needed for kitchen display and waiter coordination)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view orders");
    };
    Iter.toArray(natMap.vals(orders));
  };

  // Table Management
  public shared ({ caller }) func addTable(number : Nat, capacity : Nat) : async () {
    // Only managers can add tables
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can add tables");
    };

    let table : Table = {
      number;
      capacity;
      status = #available;
    };

    tables := natMap.put(tables, number, table);
  };

  public shared ({ caller }) func updateTableStatus(tableNumber : Nat, status : TableStatus) : async () {
    // Only waiters and managers can update table status
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can update tables");
    };
    if (not (hasRestaurantRole(caller, #waiter))) {
      Debug.trap("Unauthorized: Only waiters can update table status");
    };

    switch (natMap.get(tables, tableNumber)) {
      case (null) { Debug.trap("Table not found") };
      case (?table) {
        let updatedTable = { table with status };
        tables := natMap.put(tables, tableNumber, updatedTable);
      };
    };
  };

  public query ({ caller }) func getTable(tableNumber : Nat) : async ?Table {
    // All authenticated users can view tables
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view tables");
    };
    natMap.get(tables, tableNumber);
  };

  public query ({ caller }) func getAllTables() : async [Table] {
    // All authenticated users can view all tables
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view tables");
    };
    Iter.toArray(natMap.vals(tables));
  };

  // Menu Management
  public shared ({ caller }) func addMenuItem(name : Text, category : Text, price : Nat) : async Nat {
    // Only managers can add menu items
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can add menu items");
    };

    let menuItemId = nextMenuItemId;
    let menuItem : MenuItem = {
      id = menuItemId;
      name;
      category;
      price;
      available = true;
    };

    menuItems := natMap.put(menuItems, menuItemId, menuItem);
    nextMenuItemId += 1;

    menuItemId;
  };

  public shared ({ caller }) func updateMenuItemAvailability(menuItemId : Nat, available : Bool) : async () {
    // Managers and cooks can update menu item availability
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can update menu items");
    };
    if (not (hasRestaurantRole(caller, #cook)) and not (AccessControl.isAdmin(accessControlState, caller))) {
      Debug.trap("Unauthorized: Only cooks and managers can update menu item availability");
    };

    switch (natMap.get(menuItems, menuItemId)) {
      case (null) { Debug.trap("Menu item not found") };
      case (?menuItem) {
        let updatedMenuItem = { menuItem with available };
        menuItems := natMap.put(menuItems, menuItemId, updatedMenuItem);
      };
    };
  };

  public query ({ caller }) func getMenuItem(menuItemId : Nat) : async ?MenuItem {
    // All authenticated users can view menu items
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view menu items");
    };
    natMap.get(menuItems, menuItemId);
  };

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    // All authenticated users can view all menu items
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view menu items");
    };
    Iter.toArray(natMap.vals(menuItems));
  };

  // Inventory Management
  public shared ({ caller }) func addInventoryItem(name : Text, supplierId : ?Nat, lowStockThreshold : Nat) : async Nat {
    // Only managers can add inventory items
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can add inventory items");
    };

    let inventoryId = nextInventoryId;
    let inventoryItem : InventoryItem = {
      id = inventoryId;
      name;
      quantity = 0;
      supplierId;
      lowStockThreshold;
    };

    inventory := natMap.put(inventory, inventoryId, inventoryItem);
    nextInventoryId += 1;

    inventoryId;
  };

  public shared ({ caller }) func updateInventoryQuantity(inventoryId : Nat, quantity : Nat) : async () {
    // Managers and cooks can update inventory
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can update inventory");
    };
    if (not (hasRestaurantRole(caller, #cook)) and not (AccessControl.isAdmin(accessControlState, caller))) {
      Debug.trap("Unauthorized: Only cooks and managers can update inventory");
    };

    switch (natMap.get(inventory, inventoryId)) {
      case (null) { Debug.trap("Inventory item not found") };
      case (?inventoryItem) {
        let updatedInventoryItem = { inventoryItem with quantity };
        inventory := natMap.put(inventory, inventoryId, updatedInventoryItem);
      };
    };
  };

  public query ({ caller }) func getInventoryItem(inventoryId : Nat) : async ?InventoryItem {
    // Cooks and managers can view inventory
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view inventory");
    };
    if (not (hasRestaurantRole(caller, #cook)) and not (AccessControl.isAdmin(accessControlState, caller))) {
      Debug.trap("Unauthorized: Only cooks and managers can view inventory");
    };
    natMap.get(inventory, inventoryId);
  };

  public query ({ caller }) func getAllInventoryItems() : async [InventoryItem] {
    // Cooks and managers can view all inventory
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can view inventory");
    };
    if (not (hasRestaurantRole(caller, #cook)) and not (AccessControl.isAdmin(accessControlState, caller))) {
      Debug.trap("Unauthorized: Only cooks and managers can view inventory");
    };
    Iter.toArray(natMap.vals(inventory));
  };

  // Supplier Management
  public shared ({ caller }) func addSupplier(name : Text, contactInfo : Text) : async Nat {
    // Only managers can add suppliers
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can add suppliers");
    };

    let supplierId = nextSupplierId;
    let supplier : Supplier = {
      id = supplierId;
      name;
      contactInfo;
    };

    suppliers := natMap.put(suppliers, supplierId, supplier);
    nextSupplierId += 1;

    supplierId;
  };

  public query ({ caller }) func getSupplier(supplierId : Nat) : async ?Supplier {
    // Only managers can view suppliers
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can view suppliers");
    };
    natMap.get(suppliers, supplierId);
  };

  public query ({ caller }) func getAllSuppliers() : async [Supplier] {
    // Only managers can view all suppliers
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can view suppliers");
    };
    Iter.toArray(natMap.vals(suppliers));
  };

  // Financial Transactions
  public shared ({ caller }) func recordTransaction(amount : Nat, paymentMethod : Text, orderId : ?Nat) : async Nat {
    // Waiters and managers can record transactions
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only authenticated users can record transactions");
    };
    if (not (hasRestaurantRole(caller, #waiter))) {
      Debug.trap("Unauthorized: Only waiters can record transactions");
    };

    let transactionId = nextTransactionId;
    let transaction : FinancialTransaction = {
      id = transactionId;
      amount;
      paymentMethod;
      timestamp = Time.now();
      orderId;
    };

    transactions := natMap.put(transactions, transactionId, transaction);
    nextTransactionId += 1;

    transactionId;
  };

  public query ({ caller }) func getTransaction(transactionId : Nat) : async ?FinancialTransaction {
    // Only managers can view individual transactions
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can view transactions");
    };
    natMap.get(transactions, transactionId);
  };

  public query ({ caller }) func getAllTransactions() : async [FinancialTransaction] {
    // Only managers can view all transactions
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Debug.trap("Unauthorized: Only managers can view all transactions");
    };
    Iter.toArray(natMap.vals(transactions));
  };

  // Helper Functions
  func calculateTotal(items : [OrderItem]) : Nat {
    var total = 0;
    for (item in items.vals()) {
      total += item.price * item.quantity;
    };
    total;
  };
};

