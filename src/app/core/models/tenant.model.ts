export interface TenantCreate {
  name: string;
  slug: string;
}

export interface TenantUpdate {
  name?: string;
  status?: 'ACTIVO' | 'INACTIVO';
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  status: 'ACTIVO' | 'INACTIVO';
  created_at: string;
  updated_at: string;
}
