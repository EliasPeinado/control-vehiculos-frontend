import { Vehiculo } from '../vehiculos/vehiculo.model';
import { Centro } from '../centros/centro.model';
import { EstadoTurno } from '../catalogos/catalogo.model';

export interface Turno {
  id: string;
  vehiculoId: string;
  centroId: string;
  fechaHora: string;
  estadoTurnoId: string;
  estadoTurno: EstadoTurno;
  vehiculo: Vehiculo;
  centro: Centro;
}

export interface CreateTurnoRequest {
  matricula: string;
  centroId: string;
  fechaHora: string;
}

export interface CancelarTurnoRequest {
  motivo: string;
}

export interface Slot {
  inicio: string;
  fin: string;
  disponible: boolean;
}

export interface SlotQueryParams {
  centroId: string;
  fecha: string;
}
