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
    id: 'stock',
    icon: 'warehouse',
    route: '/stok',
    order: 1,
    enabled: true,
  },
  {
    id: 'recipe',
    icon: 'receipt_long',
    route: '/recete',
    order: 2,
    enabled: false,
  },
  {
    id: 'production',
    icon: 'factory',
    route: '/uretim',
    order: 3,
    enabled: false,
  },
  {
    id: 'movements',
    icon: 'local_shipping',
    route: '/hareketler',
    order: 4,
    enabled: false,
  },
  {
    id: 'reports',
    icon: 'leaderboard',
    route: '/raporlar',
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

