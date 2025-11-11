import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { EvaluacionService } from '../../services/evaluacion.service';
import { CatalogoService } from '@app/modules/catalogos/services/catalogo.service';
import { CentroService } from '@app/modules/centros/services/centro.service';
import { TurnoService } from '@app/modules/turnos/services/turno.service';
import { AuthService } from '@core/services/auth.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { Chequeo } from '@core/models/catalogos/chequeo.model';
import { Centro } from '@core/models/centros/centro.model';
import { Turno } from '@core/models/turnos/turno.model';
import { CreateEvaluacionRequest, CreateEvaluacionDetalleRequest } from '@core/models/evaluaciones/evaluacion.model';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { DropdownSelectComponent, DropdownOption } from '@shared/dinamicos/dropdown-select/dropdown-select.component';

interface ChequeoFormData {
  chequeoId: string;
  nombre: string;
  descripcion: string;
  puntaje: number;
  observacion: string;
}

@Component({
  selector: 'app-nueva-evaluacion',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, LoadingSpinnerComponent, BadgeComponent, DropdownSelectComponent],
  templateUrl: './nueva-evaluacion.component.html'
})
export class NuevaEvaluacionComponent implements OnInit, OnDestroy {
  protected readonly evaluacionService: EvaluacionService = inject(EvaluacionService);
  private readonly catalogoService: CatalogoService = inject(CatalogoService);
  private readonly centroService: CentroService = inject(CentroService);
  private readonly turnoService: TurnoService = inject(TurnoService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly errorHandler: ErrorHandlerService = inject(ErrorHandlerService);
  protected readonly router: Router = inject(Router);

  // Momento 1: Selección de Turno
  protected readonly centros = signal<Centro[]>([]);
  protected readonly turnos = signal<Turno[]>([]);
  protected readonly selectedCentroId = signal<string | null>(null);
  protected matriculaFilter: string = '';
  private readonly filterSubject = new Subject<void>();
  private filterSubscription?: Subscription;
  protected readonly viewMode = signal<'list' | 'cards'>('cards');
  
  // Momento 2: Evaluación
  protected readonly selectedTurno = signal<Turno | null>(null);
  protected readonly chequeosData = signal<ChequeoFormData[]>([]);
  protected readonly evaluationStarted = signal<boolean>(false);

  protected readonly loadingCentros = signal<boolean>(false);
  protected readonly loadingTurnos = signal<boolean>(false);
  protected readonly loadingChequeos = signal<boolean>(false);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly canEvaluate = signal<boolean>(false);

  protected readonly puntajeTotal = computed<number>(() => {
    return this.chequeosData().reduce((sum, c) => sum + c.puntaje, 0);
  });

  protected readonly resultadoEstimado = computed<string>(() => {
    const total: number = this.puntajeTotal();
    const chequeos: ChequeoFormData[] = this.chequeosData();
    const tieneReprobado: boolean = chequeos.some(c => c.puntaje < 5);

    if (total > 80 && !tieneReprobado) {
      return 'SEGURO';
    } else if (tieneReprobado || total < 40) {
      return 'RECHEQUEO';
    } else {
      return 'CONDICIONAL';
    }
  });

  protected readonly resultadoEstimadoNombre = computed<string>(() => {
    const resultado: string = this.resultadoEstimado();
    const nombres: Record<string, string> = {
      'SEGURO': '🟢 Seguro para Circular',
      'CONDICIONAL': '🟡 Aprobado Condicional',
      'RECHEQUEO': '🔴 Requiere Re-chequeo'
    };
    return nombres[resultado];
  });

  protected readonly centroOptions = computed<DropdownOption<string>[]>(() => {
    return this.centros().map(centro => ({
      value: centro.id,
      label: `${centro.nombre} - ${centro.direccion}`
    }));
  });

  ngOnInit(): void {
    this.checkPermissions();
    if (this.canEvaluate()) {
      this.loadCentros();
      this.loadTurnos();
      this.setupFilters();
    }
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
  }

  private setupFilters(): void {
    this.filterSubscription = this.filterSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadTurnos();
    });
  }

  private checkPermissions(): void {
    const hasPermission: boolean = this.authService.hasRole(['INSPECTOR', 'ADMIN']);
    this.canEvaluate.set(hasPermission);
    
    if (!hasPermission) {
      this.errorMessage.set('No tiene permisos para realizar evaluaciones. Solo usuarios con rol INSPECTOR o ADMIN pueden acceder.');
    }
  }

  private loadCentros(): void {
    this.loadingCentros.set(true);
    this.centroService.getAll(1, 50).subscribe({
      next: (response) => {
        this.centros.set(response.items);
        this.loadingCentros.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'cargar los centros');
        this.errorMessage.set(message);
        this.loadingCentros.set(false);
      }
    });
  }

  private loadTurnos(): void {
    this.loadingTurnos.set(true);
    this.errorMessage.set(null);

    const centroId: string | undefined = this.selectedCentroId() || undefined;
    const matricula: string | undefined = this.matriculaFilter.trim().toUpperCase() || undefined;

    this.turnoService.getAll(centroId, matricula).subscribe({
      next: (turnos: Turno[]) => {
        // Filtrar solo turnos CONFIRMADO o RESERVADO
        const turnosPendientes = turnos.filter(t => 
          t.estadoTurno.codigo === 'CONFIRMADO' || t.estadoTurno.codigo === 'RESERVADO'
        );
        this.turnos.set(turnosPendientes);
        this.loadingTurnos.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'cargar los turnos pendientes');
        this.errorMessage.set(message);
        this.loadingTurnos.set(false);
        this.errorHandler.logError(error, 'Load Turnos');
      }
    });
  }

  protected onCentroFilterChange(centroId: string | null): void {
    this.selectedCentroId.set(centroId);
    this.filterSubject.next();
  }

  protected onMatriculaFilterChange(): void {
    this.filterSubject.next();
  }

  protected clearFilters(): void {
    this.selectedCentroId.set(null);
    this.matriculaFilter = '';
    this.loadTurnos();
  }

  protected toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'list' ? 'cards' : 'list');
  }

  protected startEvaluation(turno: Turno): void {
    this.selectedTurno.set(turno);
    this.evaluationStarted.set(true);
    this.loadChequeos();
  }

  protected backToTurnoSelection(): void {
    this.evaluationStarted.set(false);
    this.selectedTurno.set(null);
    this.chequeosData.set([]);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private loadChequeos(): void {
    this.loadingChequeos.set(true);
    this.catalogoService.getChequeos().subscribe({
      next: (chequeos: Chequeo[]) => {
        const formData: ChequeoFormData[] = chequeos
          .sort((a, b) => a.orden - b.orden)
          .map(c => ({
            chequeoId: c.id,
            nombre: c.nombre,
            descripcion: c.descripcion,
            puntaje: 5,
            observacion: ''
          }));
        this.chequeosData.set(formData);
        this.loadingChequeos.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'cargar los chequeos');
        this.errorMessage.set(message);
        this.loadingChequeos.set(false);
      }
    });
  }

  protected onPuntajeChange(): void {
    // Trigger computed signals update
    this.chequeosData.set([...this.chequeosData()]);
  }

  protected isFormValid(): boolean {
    return this.selectedTurno() !== null && 
           this.chequeosData().length > 0 &&
           this.canEvaluate();
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

  protected onSubmit(): void {
    if (!this.isFormValid() || this.submitting()) {
      return;
    }

    const turno: Turno = this.selectedTurno()!;
    const detalles: CreateEvaluacionDetalleRequest[] = this.chequeosData().map(c => ({
      chequeoId: c.chequeoId,
      puntaje: c.puntaje,
      observacion: c.observacion || undefined
    }));

    const request: CreateEvaluacionRequest = {
      turnoId: turno.id,
      detalles
    };

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.evaluacionService.register(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('¡Evaluación registrada exitosamente!');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'registrar la evaluación');
        this.errorMessage.set(message);
        this.errorHandler.logError(error, 'Create Evaluacion');
      }
    });
  }
}
