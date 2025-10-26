import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Toplu stok ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stocks } = body;

    if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli stok listesi gereklidir' },
        { status: 400 }
      );
    }

    // Stokları hazırla
    const stocksToInsert = stocks.map((stock: any) => ({
      name: stock.name,
      category: stock.category || 'hammadde',
      unit: stock.unit || 'kg',
      quantity: stock.quantity || 0,
      min_quantity: stock.min_quantity || 0,
      price: stock.price || 0,
      currency: stock.currency || 'TRY',
      supplier_id: stock.supplier_id || null,
      notes: stock.notes || null,
    }));

    const { data, error } = await supabase
      .from('stocks')
      .insert(stocksToInsert)
      .select();

    if (error) {
      console.error('[API Error - POST /api/stocks/bulk-create]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `${data.length} stok başarıyla eklendi`,
      count: data.length 
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API Error - POST /api/stocks/bulk-create]', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

