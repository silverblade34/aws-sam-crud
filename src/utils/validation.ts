import { CreateEmpresaRequest, UpdateEmpresaRequest, CreateSedeRequest, UpdateSedeRequest } from '../types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRUC = (ruc: string): boolean => {
  return /^\d{11}$/.test(ruc);
};

export const validateCreateEmpresa = (data: CreateEmpresaRequest): string[] => {
  const errors: string[] = [];

  if (!data.ruc || !validateRUC(data.ruc)) {
    errors.push('RUC es requerido y debe tener 11 dígitos');
  }

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push('Nombre es requerido y debe tener al menos 2 caracteres');
  }

  if (!data.razonSocial || data.razonSocial.trim().length < 2) {
    errors.push('Razón social es requerida y debe tener al menos 2 caracteres');
  }

  if (!data.direccion || data.direccion.trim().length < 5) {
    errors.push('Dirección es requerida y debe tener al menos 5 caracteres');
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('Email debe tener un formato válido');
  }

  return errors;
};

export const validateUpdateEmpresa = (data: UpdateEmpresaRequest): string[] => {
  const errors: string[] = [];

  if (data.nombre !== undefined && data.nombre.trim().length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres');
  }

  if (data.razonSocial !== undefined && data.razonSocial.trim().length < 2) {
    errors.push('Razón social debe tener al menos 2 caracteres');
  }

  if (data.direccion !== undefined && data.direccion.trim().length < 5) {
    errors.push('Dirección debe tener al menos 5 caracteres');
  }

  if (data.email !== undefined && data.email !== '' && !validateEmail(data.email)) {
    errors.push('Email debe tener un formato válido');
  }

  return errors;
};

export const validateCreateSede = (data: CreateSedeRequest): string[] => {
  const errors: string[] = [];

  if (!data.empresaId || data.empresaId.trim().length === 0) {
    errors.push('ID de empresa es requerido');
  }

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push('Nombre es requerido y debe tener al menos 2 caracteres');
  }

  if (!data.direccion || data.direccion.trim().length < 5) {
    errors.push('Dirección es requerida y debe tener al menos 5 caracteres');
  }

  return errors;
};

export const validateUpdateSede = (data: UpdateSedeRequest): string[] => {
  const errors: string[] = [];

  if (data.nombre !== undefined && data.nombre.trim().length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres');
  }

  if (data.direccion !== undefined && data.direccion.trim().length < 5) {
    errors.push('Dirección debe tener al menos 5 caracteres');
  }
  
  return errors;
};