import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE: Tüm stokları sil (soft delete)
export async function DELETE() {
  try {
    const { error } = await supabase
      .from('stocks')
      .update({ deleted_at: new Date().toISOString() })
      .is('deleted_at', null);

    if (error) {
      console.error('[API Error - DELETE /api/stocks/bulk-delete]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Tüm stoklar silindi' });
  } catch (error: any) {
    console.error('[API Error - DELETE /api/stocks/bulk-delete]', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

