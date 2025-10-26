import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT: Stok güncelle
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('stocks')
      .update({
        name: body.name,
        category: body.category,
        unit: body.unit,
        quantity: body.quantity,
        min_quantity: body.min_quantity,
        price: body.price,
        currency: body.currency,
        supplier_id: body.supplier_id,
        notes: body.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API Error - PUT /api/stocks/[id]]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Error - PUT /api/stocks/[id]]', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

// DELETE: Soft delete
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('stocks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[API Error - DELETE /api/stocks/[id]]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Error - DELETE /api/stocks/[id]]', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

