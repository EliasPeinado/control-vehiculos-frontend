import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { VehiculoService } from '../../services/vehiculo.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { Vehiculo } from '@core/models/vehiculos/vehiculo.model';
import { Evaluacion } from '@core/models/evaluaciones/evaluacion.model';
import { Turno } from '@core/models/turnos/turno.model';
import { PagedResponse } from '@core/models/common/api-response.model';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent, BadgeColor } from '@shared/components/badge/badge.component';
import { getEstadoVehiculoColor, getResultadoEvaluacionColor } from '@shared/utils/estado-color.util';

@Component({
  selector: 'app-buscar-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, LoadingSpinnerComponent, BadgeComponent],
  templateUrl: './buscar-vehiculo.component.html'
})
export class BuscarVehiculoComponent {
  private readonly vehiculoService: VehiculoService = inject(VehiculoService);
  private readonly errorHandler: ErrorHandlerService = inject(ErrorHandlerService);

  protected matriculaSearch: string = '';
  protected readonly vehiculo = signal<Vehiculo | null>(null);
  protected readonly evaluaciones = signal<Evaluacion[]>([]);
  protected readonly turnos = signal<Turno[]>([]);
  protected readonly paginationMeta = signal<PagedResponse<Evaluacion>['meta'] | null>(null);
  protected readonly currentPage = signal<number>(1);
  protected readonly detallesExpandidos = signal<Set<string>>(new Set());
  protected readonly activeTab = signal<'evaluaciones' | 'turnos'>('evaluaciones');

  protected readonly searching = signal<boolean>(false);
  protected readonly loadingEvaluaciones = signal<boolean>(false);
  protected readonly loadingTurnos = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected buscarVehiculo(): void {
    const matricula: string = this.matriculaSearch.trim().toUpperCase();
    if (!matricula || this.searching()) {
      return;
    }

    this.searching.set(true);
    this.errorMessage.set(null);
    this.vehiculo.set(null);
    this.evaluaciones.set([]);
    this.currentPage.set(1);

    this.vehiculoService.getByMatricula(matricula).subscribe({
      next: (vehiculo) => {
        this.vehiculo.set(vehiculo);
        this.loadEvaluaciones(matricula, 1);
        this.loadTurnos(matricula);
      },
      error: (error: HttpErrorResponse) => {
        this.searching.set(false);
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'buscar el vehículo');
        this.errorMessage.set(message);
        this.errorHandler.logError(error, 'Search Vehicle');
      }
    });
  }

  private loadEvaluaciones(matricula: string, page: number): void {
    this.loadingEvaluaciones.set(true);

    this.vehiculoService.getEvaluaciones(matricula, page, 10).subscribe({
      next: (response) => {
        this.evaluaciones.set(response.items);
        this.paginationMeta.set(response.meta);
        this.currentPage.set(page);
        this.searching.set(false);
        this.loadingEvaluaciones.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.searching.set(false);
        this.loadingEvaluaciones.set(false);
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'cargar el historial de evaluaciones');
        this.errorMessage.set(message);
        this.errorHandler.logError(error, 'Load Evaluaciones');
      }
    });
  }

  private loadTurnos(matricula: string): void {
    this.loadingTurnos.set(true);

    this.vehiculoService.getTurnos(matricula).subscribe({
      next: (turnos: Turno[]) => {
        this.turnos.set(turnos);
        this.loadingTurnos.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loadingTurnos.set(false);
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'cargar el historial de turnos');
        this.errorMessage.set(message);
        this.errorHandler.logError(error, 'Load Turnos');
      }
    });
  }

  protected setActiveTab(tab: 'evaluaciones' | 'turnos'): void {
    this.activeTab.set(tab);
  }

  protected formatTurnoDate(fechaHora: string): string {
    const date: Date = new Date(fechaHora);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getEstadoTurnoColor(codigo: string): BadgeColor {
    const colorMap: Record<string, BadgeColor> = {
      'RESERVADO': 'blue',
      'CONFIRMADO': 'green',
      'CANCELADO': 'red',
      'COMPLETADO': 'gray'
    };
    return colorMap[codigo] || 'gray';
  }

  protected previousPage(): void {
    const currentPage: number = this.currentPage();
    if (currentPage > 1 && this.vehiculo()) {
      this.loadEvaluaciones(this.vehiculo()!.matricula, currentPage - 1);
    }
  }

  protected nextPage(): void {
    const meta = this.paginationMeta();
    if (meta && meta.hasNext && this.vehiculo()) {
      this.loadEvaluaciones(this.vehiculo()!.matricula, this.currentPage() + 1);
    }
  }

  protected toggleDetalles(evaluacionId: string): void {
    const expanded: Set<string> = new Set(this.detallesExpandidos());
    if (expanded.has(evaluacionId)) {
      expanded.delete(evaluacionId);
    } else {
      expanded.add(evaluacionId);
    }
    this.detallesExpandidos.set(expanded);
  }

  protected formatDate(dateString: string): string {
    const date: Date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getEstadoColor(codigo: string): BadgeColor {
    return getEstadoVehiculoColor(codigo);
  }

  protected getResultadoColor(codigo: string): BadgeColor {
    return getResultadoEvaluacionColor(codigo);
  }
}
