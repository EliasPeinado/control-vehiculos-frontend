import { BadgeColor } from '../components/badge/badge.component';

export function getEstadoVehiculoColor(codigo: string): BadgeColor {
  const colors: Record<string, BadgeColor> = {
    'PENDIENTE': 'yellow',
    'SEGURO': 'green',
    'RECHEQUEO': 'red',
    'CONDICIONAL': 'orange'
  };
  return colors[codigo] || 'gray';
}

export function getEstadoTurnoColor(codigo: string): BadgeColor {
  const colors: Record<string, BadgeColor> = {
    'RESERVADO': 'blue',
    'CONFIRMADO': 'green',
    'COMPLETADO': 'gray',
    'CANCELADO': 'red'
  };
  return colors[codigo] || 'gray';
}

export function getResultadoEvaluacionColor(codigo: string): BadgeColor {
  const colors: Record<string, BadgeColor> = {
    'SEGURO': 'green',
    'CONDICIONAL': 'yellow',
    'RECHEQUEO': 'red'
  };
  return colors[codigo] || 'gray';
}
