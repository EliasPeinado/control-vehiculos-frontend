import { EstadoVehiculo } from '../catalogos/catalogo.model';
import { Propietario } from './propietario.model';

export interface Vehiculo {
  id: string;
  matricula: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  propietarioId: string;
  estadoVehiculoId: string;
  propietario: Propietario;
  estadoVehiculo: EstadoVehiculo;
}

export interface CreateVehiculoRequest {
  matricula: string;
  marca?: string;
  modelo?: string;
  anio?: number;
}

export interface UpdateVehiculoRequest {
  marca?: string;
  modelo?: string;
  anio?: number;
}
