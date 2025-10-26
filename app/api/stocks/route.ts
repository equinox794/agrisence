import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Tüm stokları listele
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('stocks')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Kategori filtresi
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Arama filtresi
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API Error - GET /api/stocks]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Error - GET /api/stocks]', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// POST: Yeni stok ekle
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasyon
    if (!body.name || !body.category || !body.unit || !body.price) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('stocks')
      .insert([
        {
          name: body.name,
          category: body.category,
          unit: body.unit,
          quantity: body.quantity || 0,
          min_quantity: body.min_quantity || 0,
          price: body.price,
          currency: body.currency || 'TRY',
          supplier_id: body.supplier_id || null,
          notes: body.notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[API Error - POST /api/stocks]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('[API Error - POST /api/stocks]', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

