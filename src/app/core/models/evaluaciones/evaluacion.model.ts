import { ResultadoEvaluacion } from '../catalogos/catalogo.model';
import { Chequeo } from '../catalogos/chequeo.model';

export interface Evaluacion {
  id: string;
  turnoId: string;
  inspectorId: string;
  fecha: string;
  puntajeTotal: number;
  resultadoEvaluacionId: string;
  resultado: ResultadoEvaluacion;
  detalles: EvaluacionDetalle[];
}

export interface EvaluacionDetalle {
  id: string;
  evaluacionId: string;
  chequeoId: string;
  puntaje: number;
  observacion?: string;
  chequeo: Chequeo;
}

export interface CreateEvaluacionRequest {
  turnoId: string;
  detalles: CreateEvaluacionDetalleRequest[];
}

export interface CreateEvaluacionDetalleRequest {
  chequeoId: string;
  puntaje: number;
  observacion?: string;
}
