// Merkezi Menü Yönetimi - Tüm sidebar menü öğeleri buradan yönetilir
export interface NavigationItem {
  id: string;
  icon: string;
  route: string;
  order: number;
  enabled: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    icon: 'dashboard',
    route: '/',
    order: 1,
    enabled: true,
  },
  {
    id: 'stock',
    icon: 'inventory',
    route: '/stok',
    order: 2,
    enabled: true,
  },
  {
    id: 'customer',
    icon: 'people',
    route: '/cari',
    order: 3,
    enabled: false, // İleride aktif edilecek
  },
  {
    id: 'recipe',
    icon: 'science',
    route: '/recete',
    order: 4,
    enabled: false,
  },
  {
    id: 'order',
    icon: 'shopping_cart',
    route: '/siparis',
    order: 5,
    enabled: false,
  },
  {
    id: 'settings',
    icon: 'settings',
    route: '/ayarlar',
    order: 99,
    enabled: false,
  },
];

