import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorInfo {
  message: string;
  code?: string;
  traceId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  /**
   * Extrae información útil de un HttpErrorResponse
   */
  public extractErrorInfo(error: HttpErrorResponse): ErrorInfo {
    // Error del backend con estructura conocida
    if (error.error && typeof error.error === 'object') {
      return {
        message: error.error.message || this.getDefaultMessage(error.status),
        code: error.error.code,
        traceId: error.error.traceId
      };
    }

    // Error de red o del navegador
    if (error.error instanceof ErrorEvent) {
      return {
        message: 'Error de conexión. Verifique su conexión a internet.',
        code: 'NETWORK_ERROR'
      };
    }

    // Error HTTP sin estructura conocida
    return {
      message: this.getDefaultMessage(error.status),
      code: `HTTP_${error.status}`
    };
  }

  /**
   * Obtiene un mensaje de error por defecto según el código HTTP
   */
  private getDefaultMessage(status: number): string {
    const messages: Record<number, string> = {
      0: 'No se pudo conectar con el servidor. Verifique su conexión.',
      400: 'Los datos enviados no son válidos.',
      401: 'No autorizado. Por favor, inicie sesión nuevamente.',
      403: 'No tiene permisos para realizar esta acción.',
      404: 'El recurso solicitado no fue encontrado.',
      409: 'Ya existe un registro con estos datos.',
      422: 'Los datos proporcionados no son válidos.',
      500: 'Error interno del servidor. Intente nuevamente más tarde.',
      502: 'El servidor no está disponible temporalmente.',
      503: 'Servicio no disponible. Intente nuevamente más tarde.',
      504: 'Tiempo de espera agotado. Intente nuevamente.'
    };

    return messages[status] || `Error desconocido (${status}). Intente nuevamente.`;
  }

  /**
   * Registra el error en consola para debugging
   */
  public logError(error: HttpErrorResponse | Error, context?: string): void {
    const timestamp: string = new Date().toISOString();
    
    if (error instanceof HttpErrorResponse) {
      console.error(`[${timestamp}] HTTP Error ${context ? `in ${context}` : ''}:`, {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });
    } else {
      console.error(`[${timestamp}] Error ${context ? `in ${context}` : ''}:`, error);
    }
  }

  /**
   * Verifica si un error es recuperable
   */
  public isRecoverable(error: HttpErrorResponse): boolean {
    // Errores 5xx del servidor suelen ser temporales
    // Errores de red también pueden ser temporales
    return error.status >= 500 || error.status === 0;
  }

  /**
   * Obtiene un mensaje amigable para el usuario
   */
  public getUserFriendlyMessage(error: HttpErrorResponse, action?: string): string {
    const errorInfo: ErrorInfo = this.extractErrorInfo(error);
    
    if (action) {
      return `Error al ${action}: ${errorInfo.message}`;
    }
    
    return errorInfo.message;
  }
}
