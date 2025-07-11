export interface Empresa {
  id: string;
  ruc: string;
  nombre: string;
  razonSocial: string;
  direccion: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Sede {
  id: string;
  empresaId: string;
  nombre: string;
  direccion: string;
  isPrincipal: boolean;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateEmpresaRequest {
  ruc: string;
  nombre: string;
  razonSocial: string;
  direccion: string;
  telefono?: string;
  email?: string;
}

export interface UpdateEmpresaRequest {
  nombre?: string;
  razonSocial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export interface CreateSedeRequest {
  empresaId: string;
  nombre: string;
  direccion: string;
  isPrincipal?: boolean;
}

export interface UpdateSedeRequest {
  nombre?: string;
  direccion?: string;
  isPrincipal?: boolean;
  activo?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ListResponse<T> {
  items: T[];
  count: number;
  lastEvaluatedKey?: Record<string, any>;
}