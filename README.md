# Bioplant CRM

Gübre fabrikası için geliştirilmiş modern CRM ve stok yönetim sistemi.

## 🚀 Özellikler

### ✅ Aktif Modüller
- **Dashboard**: Özet istatistikler ve hızlı erişim
- **Stok Yönetimi**: Hammadde ve ambalaj takibi (CRUD işlemleri)
- **Çoklu Dil**: Türkçe, İngilizce, Rusça

### 🔜 Yakında
- Cari Hesap Yönetimi
- Reçete Sistemi
- Sipariş & Teklif Yönetimi
- Ayarlar Modülü

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **UI Components**: Custom components + Lucide Icons
- **Forms**: React Hook Form
- **Notifications**: Sonner (toast)

## 📁 Proje Yapısı

```
frontend/
├── app/
│   ├── api/stocks/       # Stok API routes
│   ├── stok/             # Stok yönetimi sayfası
│   ├── layout.tsx        # Ana layout (sidebar)
│   ├── page.tsx          # Dashboard
│   └── globals.css       # Global stiller
├── components/
│   ├── Sidebar.tsx       # Sol menü
│   └── ui/               # UI bileşenleri
├── config/
│   ├── theme.ts          # Tema renkleri
│   ├── navigation.ts     # Menü yapısı
│   └── app.ts            # Uygulama ayarları
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── i18n.tsx          # Çoklu dil sistemi
└── locales/              # Çeviri dosyaları (tr, en, ru)
```

## 🔧 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Environment Variables
`.env.local` dosyası oluştur:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Veritabanı
`supabase-migration.sql` dosyasını Supabase SQL Editor'de çalıştır.

### 4. Development Server
```bash
npm run dev
```

http://localhost:3000 adresinde açılacak.

## 📦 Deployment (Vercel)

1. GitHub repo'nuzu Vercel'e bağlayın
2. Environment variables'ları ekleyin
3. Deploy butonuna tıklayın

Otomatik deploy: Her `git push` sonrası otomatik deploy olur.

## 🎨 Tasarım Sistemi

### Renkler
- Background: `#0F0F0F`
- Card Background: `#1A1A1A`
- Primary Green: `#10B981`
- Accent Green: `#34D399`
- Border: `#2A2A2A`

### Font
- Inter (Primary)
- Noto Sans (Fallback)
- Material Symbols Outlined (İkonlar)

## 🌐 Çoklu Dil

Dil değiştirmek için sidebar'daki dil seçiciyi kullanın. Seçilen dil LocalStorage'da saklanır.

Desteklenen diller:
- 🇹🇷 Türkçe
- 🇬🇧 English
- 🇷🇺 Русский

## 📝 Yeni Modül Ekleme

1. `config/navigation.ts` dosyasına yeni menü ekle
2. `locales/*.json` dosyalarına çevirileri ekle
3. `app/[moduladi]/page.tsx` dosyasını oluştur
4. API route'larını `app/api/[moduladi]/` klasörüne ekle

## 📄 Lisans

Bu proje Bioplant için özel olarak geliştirilmiştir.

## 👨‍💻 Geliştirici

Bioplant CRM v1.0.0
