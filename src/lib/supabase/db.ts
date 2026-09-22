import { supabase, isSupabaseConfigured } from './client';
import { Property, PaymentMethod } from '@/types/sunugestion';

/**
 * Service de persistance de données Fullstack Supabase pour SunuGestion
 */
export const SupabaseDbService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  // PROPERTIES
  async getProperties(): Promise<Property[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase getProperties error:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      agencyId: row.organization_id || 'org-1',
      ownerId: row.owner_id || 'own-1',
      ownerName: row.owner_name || 'Bailleur',
      name: row.name,
      type: row.type || 'IMMEUBLE',
      address: row.address || '',
      neighborhood: row.neighborhood || '',
      city: row.city || 'Dakar',
      region: row.region || 'Dakar',
      status: row.status || 'DISPONIBLE',
      valuationFCFA: row.valuation_fcfa || 0,
      totalUnits: row.total_units || 0,
      occupiedUnits: row.occupied_units || 0,
      image: row.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
      description: row.description || '',
      createdAt: row.created_at || new Date().toISOString(),
    }));
  },

  async insertProperty(prop: Omit<Property, 'id' | 'createdAt'>): Promise<string | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('properties').insert({
      organization_id: prop.agencyId || '11111111-1111-1111-1111-111111111111',
      owner_id: prop.ownerId || null,
      name: prop.name,
      type: prop.type,
      address: prop.address,
      neighborhood: prop.neighborhood,
      city: prop.city,
      total_units: prop.totalUnits || 0,
      occupied_units: prop.occupiedUnits || 0,
      image_url: prop.image || null,
      description: prop.description || null,
    }).select('id').single();

    if (error) {
      console.error('Supabase insertProperty error:', error.message);
      return null;
    }
    return data?.id || null;
  },

  // PAYMENTS
  async insertPayment(paymentData: {
    tenantId: string;
    leaseId: string;
    amountFCFA: number;
    method: PaymentMethod;
    referenceNumber: string;
    notes?: string;
  }): Promise<string | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('payments').insert({
      organization_id: '11111111-1111-1111-1111-111111111111',
      tenant_id: paymentData.tenantId,
      lease_id: paymentData.leaseId,
      amount_fcfa: paymentData.amountFCFA,
      method: paymentData.method,
      reference_number: paymentData.referenceNumber,
      notes: paymentData.notes || null,
      status: 'VALIDE',
      receipt_number: `REC-${Date.now().toString().slice(-6)}`,
    }).select('id').single();

    if (error) {
      console.error('Supabase insertPayment error:', error.message);
      return null;
    }
    return data?.id || null;
  },

  // STORAGE UPLOAD (Bucket: sunugestion)
  async uploadFile(file: File, path: string): Promise<string | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.storage
      .from('sunugestion')
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Supabase upload error:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('sunugestion')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }
};
