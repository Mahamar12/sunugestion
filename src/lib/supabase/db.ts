import { supabase, isSupabaseConfigured } from './client';
import {
  Property,
  Unit,
  Owner,
  Tenant,
  Lease,
  RentSchedule,
  Payment,
  Arrear,
  Expense,
  Vendor,
  AppDocument,
  Organization,
  PaymentMethod
} from '@/types/sunugestion';

const DEFAULT_ORG_ID = '11111111-1111-1111-1111-111111111111';

const isUUID = (str?: string): boolean =>
  typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * Service de persistance de données Fullstack Supabase pour SunuGestion
 */
export const SupabaseDbService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  // ==========================================
  // ORGANISATIONS
  // ==========================================
  async getOrganization(): Promise<Organization | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        logo: data.logo_url || undefined,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city || 'Dakar',
        country: data.country || 'Sénégal',
        ninea: data.ninea || undefined,
        rccm: data.rccm || undefined,
        subscriptionPlan: data.subscription_plan || 'PRO',
        subscriptionStatus: data.subscription_status || 'ACTIVE',
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Supabase getOrganization error:', err);
      return null;
    }
  },

  async updateOrganization(orgData: Partial<Organization>): Promise<boolean> {
    if (!supabase) return false;
    try {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (orgData.name) payload.name = orgData.name;
      if (orgData.email) payload.email = orgData.email;
      if (orgData.phone) payload.phone = orgData.phone;
      if (orgData.address) payload.address = orgData.address;
      if (orgData.city) payload.city = orgData.city;
      if (orgData.ninea) payload.ninea = orgData.ninea;
      if (orgData.rccm) payload.rccm = orgData.rccm;
      if (orgData.subscriptionPlan) payload.subscription_plan = orgData.subscriptionPlan;

      const { error } = await supabase
        .from('organizations')
        .update(payload)
        .eq('id', DEFAULT_ORG_ID);

      return !error;
    } catch (err) {
      console.warn('Supabase updateOrganization error:', err);
      return false;
    }
  },

  // ==========================================
  // OWNERS (BAILLEURS)
  // ==========================================
  async getOwners(): Promise<Owner[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*, properties(id)')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        agencyId: row.organization_id || DEFAULT_ORG_ID,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        whatsapp: row.phone,
        email: row.email || '',
        address: row.address || 'Dakar',
        identityDocNumber: row.cni_number || '',
        bankAccount: row.bank_rib || '',
        notes: row.notes || '',
        propertiesCount: Array.isArray(row.properties) ? row.properties.length : 0,
        totalMonthlyRevenueFCFA: 0,
        commissionRatePercent: Number(row.commission_rate) || 8,
        createdAt: row.created_at ? row.created_at.split('T')[0] : '2026-01-15',
      }));
    } catch (err) {
      console.warn('Supabase getOwners error:', err);
      return [];
    }
  },

  async insertOwner(owner: Omit<Owner, 'id' | 'createdAt'>, customId?: string): Promise<string | null> {
    if (!supabase) return null;
    try {
      const payload: any = {
        organization_id: DEFAULT_ORG_ID,
        first_name: owner.firstName,
        last_name: owner.lastName,
        phone: owner.phone,
        email: owner.email || null,
        address: owner.address || null,
        cni_number: owner.identityDocNumber || null,
        bank_rib: owner.bankAccount || null,
        commission_rate: owner.commissionRatePercent || 8,
        notes: owner.notes || null,
      };
      if (customId && isUUID(customId)) {
        payload.id = customId;
      }

      const { data, error } = await supabase
        .from('owners')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insertOwner error:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.warn('Supabase insertOwner error:', err);
      return null;
    }
  },

  async deleteOwner(ownerId: string, ownerName?: string, ownerPhone?: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      let targetId = ownerId;

      // If ownerId is not a UUID, search by phone or name
      if (!isUUID(targetId)) {
        if (ownerPhone) {
          const cleanPhone = ownerPhone.replace(/\s+/g, '');
          const { data: byPhone } = await supabase
            .from('owners')
            .select('id')
            .or(`phone.eq.${ownerPhone},phone.eq.${cleanPhone}`)
            .limit(1)
            .single();
          if (byPhone?.id) targetId = byPhone.id;
        }

        if (!isUUID(targetId) && ownerName) {
          const parts = ownerName.trim().split(' ');
          const lastName = parts[parts.length - 1];
          const firstName = parts[0];
          const { data: byName } = await supabase
            .from('owners')
            .select('id')
            .or(`last_name.ilike.%${lastName}%,first_name.ilike.%${firstName}%`)
            .limit(1)
            .single();
          if (byName?.id) targetId = byName.id;
        }
      }

      if (isUUID(targetId)) {
        // Disassociate any properties or units first to prevent FK constraint violations
        await supabase.from('units').update({ owner_id: null }).eq('owner_id', targetId);
        await supabase.from('properties').update({ owner_id: null }).eq('owner_id', targetId);

        const { error } = await supabase.from('owners').delete().eq('id', targetId);
        if (error) {
          console.error('Supabase deleteOwner error:', error.message);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Supabase deleteOwner error:', err);
      return false;
    }
  },

  async updateOwner(ownerId: string, updates: Partial<Owner>): Promise<boolean> {
    if (!supabase) return false;
    try {
      let targetId = ownerId;
      if (!isUUID(targetId) && updates.phone) {
        const cleanPhone = updates.phone.replace(/\s+/g, '');
        const { data: byPhone } = await supabase
          .from('owners')
          .select('id')
          .or(`phone.eq.${updates.phone},phone.eq.${cleanPhone}`)
          .limit(1)
          .single();
        if (byPhone?.id) targetId = byPhone.id;
      }

      if (isUUID(targetId)) {
        const payload: any = {};
        if (updates.firstName !== undefined) payload.first_name = updates.firstName;
        if (updates.lastName !== undefined) payload.last_name = updates.lastName;
        if (updates.phone !== undefined) payload.phone = updates.phone;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.address !== undefined) payload.address = updates.address;
        if (updates.identityDocNumber !== undefined) payload.cni_number = updates.identityDocNumber;
        if (updates.bankAccount !== undefined) payload.bank_rib = updates.bankAccount;
        if (updates.commissionRatePercent !== undefined) payload.commission_rate = updates.commissionRatePercent;
        if (updates.notes !== undefined) payload.notes = updates.notes;

        const { error } = await supabase.from('owners').update(payload).eq('id', targetId);
        if (error) {
          console.error('Supabase updateOwner error:', error.message);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Supabase updateOwner error:', err);
      return false;
    }
  },

  // ==========================================
  // PROPERTIES (BIENS IMMOBILIERS)
  // ==========================================
  async getProperties(): Promise<Property[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, owners(first_name, last_name), units(id, status)')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => {
        const unitsList = Array.isArray(row.units) ? row.units : [];
        const totalUnitsCount = unitsList.length > 0 ? unitsList.length : (row.total_units || 0);
        const occupiedUnitsCount = unitsList.length > 0
          ? unitsList.filter((u: any) => u.status === 'OCCUPE').length
          : (row.occupied_units || 0);

        return {
          id: row.id,
          agencyId: row.organization_id || DEFAULT_ORG_ID,
          ownerId: row.owner_id || '',
          ownerName: row.owners ? `${row.owners.first_name} ${row.owners.last_name}` : '',
          name: row.name,
          type: row.type || 'IMMEUBLE',
          address: row.address || '',
          neighborhood: row.neighborhood || '',
          city: row.city || 'Dakar',
          region: 'Dakar',
          status: occupiedUnitsCount >= totalUnitsCount && totalUnitsCount > 0 ? 'OCCUPE' : 'DISPONIBLE',
          valuationFCFA: row.valuation_fcfa || 280000000,
          totalUnits: totalUnitsCount,
          occupiedUnits: occupiedUnitsCount,
          image: row.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
          description: row.description || '',
          createdAt: row.created_at ? row.created_at.split('T')[0] : '2026-01-15',
        };
      });
    } catch (err) {
      console.warn('Supabase getProperties error:', err);
      return [];
    }
  },

  async insertProperty(prop: Omit<Property, 'id' | 'createdAt'>, customId?: string): Promise<string | null> {
    if (!supabase) return null;
    try {
      const allowedTypes = ['IMMEUBLE', 'APPARTEMENT', 'VILLA', 'COMMERCIAL', 'TERRAIN'];
      const mappedType = allowedTypes.includes(prop.type) ? prop.type : 'IMMEUBLE';

      const payload: any = {
        organization_id: DEFAULT_ORG_ID,
        owner_id: isUUID(prop.ownerId) ? prop.ownerId : null,
        name: prop.name,
        type: mappedType,
        address: prop.address,
        neighborhood: prop.neighborhood,
        city: prop.city || 'Dakar',
        country: 'Sénégal',
        total_units: prop.totalUnits || 0,
        occupied_units: prop.occupiedUnits || 0,
        image_url: prop.image || null,
        description: prop.description || null,
      };
      if (customId && isUUID(customId)) {
        payload.id = customId;
      }

      const { data, error } = await supabase
        .from('properties')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insertProperty error:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.warn('Supabase insertProperty error:', err);
      return null;
    }
  },

  async deleteProperty(propertyId: string): Promise<boolean> {
    if (!supabase) return false;
    if (!isUUID(propertyId)) return true;
    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);
      if (error) console.error('Supabase deleteProperty error:', error.message);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteProperty error:', err);
      return false;
    }
  },

  async updateProperty(propertyId: string, updates: Partial<Property>): Promise<boolean> {
    if (!supabase) return false;
    if (!isUUID(propertyId)) return true;
    try {
      const payload: any = {};
      if (updates.ownerId !== undefined) {
        payload.owner_id = isUUID(updates.ownerId) ? updates.ownerId : null;
      }
      if (updates.name) payload.name = updates.name;
      if (updates.type) payload.type = updates.type;
      if (updates.totalUnits !== undefined) payload.total_units = updates.totalUnits;
      if (updates.occupiedUnits !== undefined) payload.occupied_units = updates.occupiedUnits;

      const { error } = await supabase.from('properties').update(payload).eq('id', propertyId);
      if (error) console.error('Supabase updateProperty error:', error.message);
      return !error;
    } catch (err) {
      console.warn('Supabase updateProperty error:', err);
      return false;
    }
  },

  // ==========================================
  // UNITS (LOGEMENTS)
  // ==========================================
  async getUnits(): Promise<Unit[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*, properties(name), owners(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        propertyId: row.property_id,
        propertyName: row.properties?.name || 'Bien Dakar',
        unitNumber: row.unit_number,
        type: row.type || 'APPARTEMENT',
        floor: `${row.floor ?? 1}er étage`,
        surfaceM2: Number(row.surface_sqm) || 90,
        roomsCount: row.rooms || 3,
        rentFCFA: row.monthly_rent_fcfa || 350000,
        chargesFCFA: row.charges_fcfa || 25000,
        status: row.status || 'DISPONIBLE',
        ownerId: row.owner_id || '',
        ownerName: row.owners ? `${row.owners.first_name} ${row.owners.last_name}` : 'M. Ousmane Ndiaye',
      }));
    } catch (err) {
      console.warn('Supabase getUnits error:', err);
      return [];
    }
  },

  async insertUnit(unit: Omit<Unit, 'id'>, customId?: string): Promise<string | null> {
    if (!supabase) return null;
    try {
      const allowedUnitTypes = ['APPARTEMENT', 'STUDIO', 'MAGASIN', 'BUREAU', 'CHAMBRE', 'VILLA'];
      const mappedType = allowedUnitTypes.includes(unit.type) ? unit.type : 'APPARTEMENT';

      const payload: any = {
        property_id: isUUID(unit.propertyId) ? unit.propertyId : null,
        owner_id: isUUID(unit.ownerId) ? unit.ownerId : null,
        unit_number: unit.unitNumber,
        type: mappedType,
        floor: parseInt(unit.floor) || 1,
        surface_sqm: unit.surfaceM2 || 90,
        rooms: unit.roomsCount || 3,
        monthly_rent_fcfa: unit.rentFCFA,
        charges_fcfa: unit.chargesFCFA || 0,
        deposit_fcfa: unit.rentFCFA * 2,
        status: unit.status || 'DISPONIBLE',
      };
      if (customId && isUUID(customId)) {
        payload.id = customId;
      }

      const { data, error } = await supabase
        .from('units')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insertUnit error:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.warn('Supabase insertUnit error:', err);
      return null;
    }
  },

  async updateUnitStatus(unitId: string, status: string): Promise<boolean> {
    if (!supabase) return false;
    if (!isUUID(unitId)) return true;
    try {
      const { error } = await supabase
        .from('units')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', unitId);
      return !error;
    } catch (err) {
      console.warn('Supabase updateUnitStatus error:', err);
      return false;
    }
  },

  async deleteUnit(unitId: string): Promise<boolean> {
    if (!supabase) return false;
    if (!isUUID(unitId)) return true;
    try {
      const { error } = await supabase.from('units').delete().eq('id', unitId);
      if (error) console.error('Supabase deleteUnit error:', error.message);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteUnit error:', err);
      return false;
    }
  },

  // ==========================================
  // TENANTS (LOCATAIRES)
  // ==========================================
  async getTenants(): Promise<Tenant[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          leases (
            id,
            property_id,
            unit_id,
            start_date,
            rent_amount_fcfa,
            charges_amount_fcfa,
            properties (name),
            units (unit_number)
          )
        `)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => {
        const lease = Array.isArray(row.leases) && row.leases.length > 0 ? row.leases[0] : null;

        return {
          id: row.id,
          agencyId: row.organization_id || DEFAULT_ORG_ID,
          firstName: row.first_name,
          lastName: row.last_name,
          phone: row.phone,
          whatsapp: row.phone,
          email: row.email || '',
          address: 'Dakar',
          profession: row.profession || 'Cadre',
          identityDocType: 'CNI',
          identityDocNumber: row.cni_number || '',
          emergencyContact: row.emergency_contact_name || '',
          emergencyPhone: row.emergency_contact_phone || '',
          unitId: lease?.unit_id || '',
          unitNumber: lease?.units?.unit_number || 'En attente d’attribution',
          propertyName: lease?.properties?.name || 'Patrimoine Dakar',
          propertyId: lease?.property_id || '',
          rentFCFA: lease?.rent_amount_fcfa || 350000,
          entryDate: lease?.start_date || '2026-01-01',
          currentLeaseId: lease?.id || '',
          totalPaidFCFA: 1200000,
          arrearsFCFA: 0,
          status: 'ACTIF',
          createdAt: row.created_at ? row.created_at.split('T')[0] : '2026-01-15',
        };
      });
    } catch (err) {
      console.warn('Supabase getTenants error:', err);
      return [];
    }
  },

  async insertTenant(
    tenant: Omit<Tenant, 'id' | 'createdAt' | 'totalPaidFCFA' | 'arrearsFCFA'>,
    customId?: string
  ): Promise<string | null> {
    if (!supabase) return null;
    try {
      const payload: any = {
        organization_id: DEFAULT_ORG_ID,
        first_name: tenant.firstName,
        last_name: tenant.lastName,
        email: tenant.email || null,
        phone: tenant.phone,
        cni_number: tenant.identityDocNumber || null,
        profession: tenant.profession || null,
        employer: tenant.profession || null,
        emergency_contact_name: tenant.emergencyContact || null,
        emergency_contact_phone: tenant.emergencyPhone || null,
      };
      if (customId && isUUID(customId)) {
        payload.id = customId;
      }

      const { data, error } = await supabase
        .from('tenants')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insertTenant error:', error.message);
        return null;
      }

      const tenantId = data?.id || customId;

      // Ensure lease and unit are linked in Supabase so properties and rent persist on refresh
      if (tenantId && isUUID(tenantId)) {
        try {
          // 1. Determine valid property_id
          let targetPropertyId = tenant.propertyId;
          if (!isUUID(targetPropertyId)) {
            const { data: propRow } = await supabase.from('properties').select('id').limit(1).single();
            targetPropertyId = propRow?.id || 'd95c65a7-d3c6-47d2-83b1-2355f15acc7e';
          }

          // 2. Determine or create valid unit_id
          let targetUnitId = tenant.unitId;
          if (!isUUID(targetUnitId)) {
            // Check if unit with this number already exists for this property
            const { data: existingUnit } = await supabase
              .from('units')
              .select('id')
              .eq('property_id', targetPropertyId)
              .eq('unit_number', tenant.unitNumber || 'Logement')
              .limit(1)
              .single();

            if (existingUnit?.id) {
              targetUnitId = existingUnit.id;
            } else {
              // Create a unit in Supabase
              const { data: createdUnit } = await supabase
                .from('units')
                .insert({
                  property_id: targetPropertyId,
                  unit_number: tenant.unitNumber || 'Appartement',
                  monthly_rent_fcfa: tenant.rentFCFA || 350000,
                  charges_fcfa: 25000,
                  deposit_fcfa: (tenant.rentFCFA || 350000) * 2,
                  status: 'OCCUPE',
                  type: 'APPARTEMENT',
                  floor: 1,
                  rooms: 3,
                  surface_sqm: 80,
                })
                .select('id')
                .single();
              if (createdUnit?.id) {
                targetUnitId = createdUnit.id;
              }
            }
          }

          // 3. Insert active lease linking tenant, property and unit
          if (targetPropertyId && isUUID(targetPropertyId) && targetUnitId && isUUID(targetUnitId)) {
            await supabase.from('leases').insert({
              organization_id: DEFAULT_ORG_ID,
              property_id: targetPropertyId,
              unit_id: targetUnitId,
              tenant_id: tenantId,
              start_date: tenant.entryDate || new Date().toISOString().split('T')[0],
              rent_amount_fcfa: tenant.rentFCFA || 350000,
              charges_amount_fcfa: 25000,
              deposit_amount_fcfa: (tenant.rentFCFA || 350000) * 2,
              payment_day: 5,
              status: 'ACTIF',
            });

            await supabase.from('units').update({ status: 'OCCUPE' }).eq('id', targetUnitId);
          }
        } catch (leaseErr) {
          console.warn('Supabase lease creation warning:', leaseErr);
        }
      }

      return tenantId || null;
    } catch (err) {
      console.warn('Supabase insertTenant error:', err);
      return null;
    }
  },

  async deleteTenant(tenantId: string, tenantName?: string, tenantPhone?: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      let targetId = tenantId;

      // If tenantId is not a UUID, search by phone or name
      if (!isUUID(targetId)) {
        if (tenantPhone) {
          const cleanPhone = tenantPhone.replace(/\s+/g, '');
          const { data: byPhone } = await supabase
            .from('tenants')
            .select('id')
            .or(`phone.eq.${tenantPhone},phone.eq.${cleanPhone}`)
            .limit(1)
            .single();
          if (byPhone?.id) targetId = byPhone.id;
        }

        if (!isUUID(targetId) && tenantName) {
          const parts = tenantName.trim().split(' ');
          const lastName = parts[parts.length - 1];
          const firstName = parts[0];
          const { data: byName } = await supabase
            .from('tenants')
            .select('id')
            .or(`last_name.ilike.%${lastName}%,first_name.ilike.%${firstName}%`)
            .limit(1)
            .single();
          if (byName?.id) targetId = byName.id;
        }
      }

      if (isUUID(targetId)) {
        // Free associated units
        const { data: leases } = await supabase
          .from('leases')
          .select('unit_id')
          .eq('tenant_id', targetId);

        if (leases && leases.length > 0) {
          for (const l of leases) {
            if (l.unit_id && isUUID(l.unit_id)) {
              await supabase.from('units').update({ status: 'DISPONIBLE' }).eq('id', l.unit_id);
            }
          }
        }

        // Delete from tenants table (cascade deletes leases, arrears, schedules)
        const { error } = await supabase.from('tenants').delete().eq('id', targetId);
        if (error) {
          console.error('Supabase deleteTenant error:', error.message);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn('Supabase deleteTenant error:', err);
      return false;
    }
  },

  // ==========================================
  // LEASES (CONTRATS DE BAIL)
  // ==========================================
  async getLeases(): Promise<Lease[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('leases')
        .select('*, properties(name), units(unit_number), tenants(first_name, last_name)')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        agencyId: row.organization_id || DEFAULT_ORG_ID,
        propertyId: row.property_id,
        propertyName: row.properties?.name || 'Propriété Dakar',
        unitId: row.unit_id,
        unitNumber: row.units?.unit_number || 'N/A',
        tenantId: row.tenant_id,
        tenantName: row.tenants ? `${row.tenants.first_name} ${row.tenants.last_name}` : 'Locataire',
        ownerId: '',
        ownerName: '',
        startDate: row.start_date,
        endDate: row.end_date || '',
        rentAmountFCFA: row.rent_amount_fcfa,
        chargesAmountFCFA: row.charges_amount_fcfa || 0,
        depositAmountFCFA: row.deposit_amount_fcfa || 0,
        paymentFrequency: 'MENSUEL',
        dueDayOfMonth: row.payment_day || 5,
        status: row.status || 'ACTIF',
        createdAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      }));
    } catch (err) {
      console.warn('Supabase getLeases error:', err);
      return [];
    }
  },

  async insertLease(lease: Omit<Lease, 'id' | 'createdAt'>, customId?: string): Promise<string | null> {
    if (!supabase) return null;
    try {
      if (!isUUID(lease.propertyId) || !isUUID(lease.unitId) || !isUUID(lease.tenantId)) {
        return null;
      }
      const payload: any = {
        organization_id: DEFAULT_ORG_ID,
        property_id: lease.propertyId,
        unit_id: lease.unitId,
        tenant_id: lease.tenantId,
        start_date: lease.startDate,
        end_date: lease.endDate || null,
        rent_amount_fcfa: lease.rentAmountFCFA,
        charges_amount_fcfa: lease.chargesAmountFCFA || 0,
        deposit_amount_fcfa: lease.depositAmountFCFA || 0,
        payment_day: lease.dueDayOfMonth || 5,
        status: lease.status || 'ACTIF',
      };
      if (customId && isUUID(customId)) {
        payload.id = customId;
      }

      const { data, error } = await supabase
        .from('leases')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insertLease error:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.warn('Supabase insertLease error:', err);
      return null;
    }
  },

  async deleteLease(leaseId: string): Promise<boolean> {
    if (!supabase) return false;
    if (!isUUID(leaseId)) return true;
    try {
      const { error } = await supabase.from('leases').delete().eq('id', leaseId);
      if (error) console.error('Supabase deleteLease error:', error.message);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteLease error:', err);
      return false;
    }
  },

  // ==========================================
  // PAYMENTS (PAIEMENTS & QUITTANCES)
  // ==========================================
  async getPayments(): Promise<Payment[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, tenants(first_name, last_name, leases(units(unit_number), properties(name)))')
        .order('payment_date', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => {
        const tenantName = row.tenants ? `${row.tenants.first_name} ${row.tenants.last_name}` : 'Mamadou Lamine Diallo';
        const lease = row.tenants?.leases?.[0];
        const unitNumber = lease?.units?.unit_number || 'Appt 1A';
        const propertyName = lease?.properties?.name || 'Résidence Teranga Almadies';

        return {
          id: row.id,
          agencyId: row.organization_id || DEFAULT_ORG_ID,
          receiptNumber: row.receipt_number || `REC-${row.id.slice(0, 6)}`,
          tenantId: row.tenant_id || '',
          tenantName,
          leaseId: row.lease_id || '',
          unitNumber,
          propertyName,
          amountFCFA: row.amount_fcfa,
          date: row.payment_date || new Date().toISOString().split('T')[0],
          method: (row.method as PaymentMethod) || 'WAVE',
          referenceNumber: row.reference_number || 'PAY-WAVE-001',
          recordedBy: 'Mamadou Sy',
          notes: row.notes || undefined,
          createdAt: row.created_at,
        };
      });
    } catch (err) {
      console.warn('Supabase getPayments error:', err);
      return [];
    }
  },

  async insertPayment(
    paymentData: {
      tenantId: string;
      leaseId: string;
      amountFCFA: number;
      method: PaymentMethod;
      referenceNumber: string;
      notes?: string;
    },
    customId?: string
  ): Promise<string | null> {
    if (!supabase) return null;
    try {
      const allowedMethods = ['WAVE', 'ORANGE_MONEY', 'VIREMENT', 'ESPECES', 'CHEQUE', 'FREE_MONEY'];
      const mappedMethod = paymentData.method === 'VIREMENT_BANCAIRE' ? 'VIREMENT' : paymentData.method;
      const validMethod = allowedMethods.includes(mappedMethod) ? mappedMethod : 'WAVE';

      const payload: any = {
        organization_id: DEFAULT_ORG_ID,
        tenant_id: isUUID(paymentData.tenantId) ? paymentData.tenantId : null,
        lease_id: isUUID(paymentData.leaseId) ? paymentData.leaseId : null,
        amount_fcfa: paymentData.amountFCFA,
        method: validMethod,
        reference_number: paymentData.referenceNumber,
        notes: paymentData.notes || null,
        status: 'VALIDE',
        receipt_number: `REC-${Date.now().toString().slice(-6)}`,
        payment_date: new Date().toISOString().split('T')[0],
      };
      if (customId && isUUID(customId)) {
        payload.id = customId;
      }

      const { data, error } = await supabase
        .from('payments')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insertPayment error:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.warn('Supabase insertPayment error:', err);
      return null;
    }
  },

  async deletePayment(paymentId: string): Promise<boolean> {
    if (!supabase) return false;
    if (!isUUID(paymentId)) return true;
    try {
      const { error } = await supabase.from('payments').delete().eq('id', paymentId);
      if (error) console.error('Supabase deletePayment error:', error.message);
      return !error;
    } catch (err) {
      console.warn('Supabase deletePayment error:', err);
      return false;
    }
  },

  // ==========================================
  // EXPENSES (DÉPENSES & CHARGES)
  // ==========================================
  async getExpenses(): Promise<Expense[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, properties(name)')
        .order('expense_date', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        agencyId: row.organization_id || DEFAULT_ORG_ID,
        propertyId: row.property_id || '',
        propertyName: row.properties?.name || 'Immeuble Dakar',
        category: row.category,
        description: row.description,
        amountFCFA: row.amount_fcfa,
        date: row.expense_date,
        paidTo: row.recorded_by || 'Prestataire',
        vendorName: row.recorded_by || 'Prestataire',
        recordedBy: 'Mamadou Sy',
        status: 'PAYE',
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Supabase getExpenses error:', err);
      return [];
    }
  },

  async insertExpense(
    expense: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'>,
    customId?: string
  ): Promise<string | null> {
    if (!supabase) return null;
    try {
      const allowedCategories = ['REPARATION', 'MAINTENANCE', 'SENELEC', 'SEN_EAU', 'SECURITE', 'NETTOYAGE', 'TAXE_FONCIERE', 'GESTION', 'AUTRE'];
      let mappedCat = expense.category as string;
      if (mappedCat === 'ENTRETIEN') mappedCat = 'MAINTENANCE';
      if (mappedCat === 'ELECTRICITE') mappedCat = 'SENELEC';
      if (mappedCat === 'EAU') mappedCat = 'SEN_EAU';
      if (mappedCat === 'GARDIENNAGE') mappedCat = 'SECURITE';
      if (!allowedCategories.includes(mappedCat)) mappedCat = 'AUTRE';

      const payload: any = {
        organization_id: DEFAULT_ORG_ID,
        property_id: isUUID(expense.propertyId) ? expense.propertyId : null,
        category: mappedCat,
        description: expense.description,
        amount_fcfa: expense.amountFCFA,
        expense_date: expense.date || new Date().toISOString().split('T')[0],
        recorded_by: expense.vendorName || 'Mamadou Sy',
      };
      if (customId && isUUID(customId)) {
        payload.id = customId;
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insertExpense error:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.warn('Supabase insertExpense error:', err);
      return null;
    }
  },

  async deleteExpense(expenseId: string): Promise<boolean> {
    if (!supabase) return false;
    if (!isUUID(expenseId)) return true;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) console.error('Supabase deleteExpense error:', error.message);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteExpense error:', err);
      return false;
    }
  },

  // ==========================================
  // VENDORS (PRESTATAIRES & ARTISANS)
  // ==========================================
  async getVendors(): Promise<Vendor[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        agencyId: row.organization_id || DEFAULT_ORG_ID,
        name: row.name,
        phone: row.phone,
        whatsapp: row.phone,
        trade: row.trade || 'PLOMBIER',
        zone: row.address || 'Dakar',
        hourlyRateFCFA: 15000,
        interventionsCount: 5,
        notes: 'Disponible à Dakar',
      }));
    } catch (err) {
      console.warn('Supabase getVendors error:', err);
      return [];
    }
  },

  async insertVendor(vendor: { name: string; trade: any; phone: string; zone?: string; address?: string }, customId?: string): Promise<string | null> {
    if (!supabase) return null;
    try {
      const payload: any = {
        organization_id: DEFAULT_ORG_ID,
        name: vendor.name,
        trade: vendor.trade,
        phone: vendor.phone,
        address: vendor.zone,
        status: 'DISPONIBLE',
      };
      if (customId && isUUID(customId)) {
        payload.id = customId;
      }

      const { data, error } = await supabase
        .from('vendors')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insertVendor error:', error.message);
        return null;
      }
      return data?.id || null;
    } catch (err) {
      console.warn('Supabase insertVendor error:', err);
      return null;
    }
  },

  async deleteVendor(vendorId: string): Promise<boolean> {
    if (!supabase) return false;
    if (!isUUID(vendorId)) return true;
    try {
      const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
      if (error) console.error('Supabase deleteVendor error:', error.message);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteVendor error:', err);
      return false;
    }
  },

  // ==========================================
  // STORAGE UPLOAD (Bucket: sunugestion)
  // ==========================================
  async uploadFile(file: File, path: string): Promise<string | null> {
    if (!supabase) return null;
    try {
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
    } catch (err) {
      console.warn('Supabase upload error:', err);
      return null;
    }
  }
};
