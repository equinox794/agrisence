// Ham madde stok listesi
const stockData = [
  { name: "Üre", quantity: 8550, unit: "kg" },
  { name: "Amonyum Sülfat", quantity: 3050, unit: "kg" },
  { name: "Kalsiyum Nitrat", quantity: 550, unit: "kg" },
  { name: "MKP", quantity: 1200, unit: "kg" },
  { name: "Magnezyum Nitrat", quantity: 3650, unit: "kg" },
  { name: "Magnezyum Nitrat (Hydropnice)", quantity: 875, unit: "kg" },
  { name: "Potasyum Nitrat", quantity: 2400, unit: "kg" },
  { name: "MAP", quantity: 2300, unit: "kg" },
  { name: "SBE Fosfat", quantity: 2275, unit: "kg" },
  { name: "Monopotasyum Fosfat", quantity: 1050, unit: "kg" },
  { name: "Monoadyum Glutamate", quantity: 1325, unit: "kg" },
  { name: "Potassium Lignosulphanate", quantity: 1000, unit: "kg" },
  { name: "Protina CP", quantity: 925, unit: "kg" },
  { name: "Çinko Sülfat", quantity: 900, unit: "kg" },
  { name: "Powercon", quantity: 1200, unit: "kg" },
  { name: "Exfolat-62", quantity: 1625, unit: "kg" },
  { name: "Bıtbonik Asit", quantity: 375, unit: "kg" },
  { name: "Manganese Sulphate Monohydrate", quantity: 1200, unit: "kg" }
];

async function addStocks() {
  console.log('Stoklar ekleniyor...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const stock of stockData) {
    try {
      const response = await fetch('https://agrisence-sand.vercel.app/api/stocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: stock.name,
          category: 'hammadde',
          unit: stock.unit,
          quantity: stock.quantity,
          min_quantity: Math.floor(stock.quantity * 0.1), // %10'u kritik stok
          price: 0, // Fiyat bilgisi yok, 0 olarak ekleyelim
          currency: 'TRY',
          notes: 'Ham madde listesinden eklendi'
        }),
      });

      if (response.ok) {
        successCount++;
        console.log(`✓ ${stock.name} - ${stock.quantity} ${stock.unit} eklendi`);
      } else {
        errorCount++;
        console.log(`✗ ${stock.name} eklenemedi: ${response.statusText}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`✗ ${stock.name} eklenemedi: ${error}`);
    }
  }

  console.log(`\n📊 Özet: ${successCount} başarılı, ${errorCount} hata`);
}

addStocks();

