import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluacionService } from '../../services/evaluacion.service';
import { CatalogoService } from '@app/modules/catalogos/services/catalogo.service';
import { Chequeo } from '@core/models/catalogos/chequeo.model';
import { CreateEvaluacionRequest, CreateEvaluacionDetalleRequest } from '@core/models/evaluaciones/evaluacion.model';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

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
  imports: [CommonModule, FormsModule, AlertComponent, LoadingSpinnerComponent],
  templateUrl: './nueva-evaluacion.component.html'
})
export class NuevaEvaluacionComponent implements OnInit {
  protected readonly evaluacionService: EvaluacionService = inject(EvaluacionService);
  private readonly catalogoService: CatalogoService = inject(CatalogoService);
  protected readonly router: Router = inject(Router);

  protected turnoId: string = '';
  protected inspectorId: string = '';
  protected readonly chequeosData = signal<ChequeoFormData[]>([]);

  protected readonly loadingChequeos = signal<boolean>(false);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

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

  ngOnInit(): void {
    this.loadChequeos();
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
      error: () => {
        this.errorMessage.set('Error al cargar los chequeos');
        this.loadingChequeos.set(false);
      }
    });
  }

  protected onPuntajeChange(): void {
    // Trigger computed signals update
    this.chequeosData.set([...this.chequeosData()]);
  }

  protected isFormValid(): boolean {
    return !!(
      this.turnoId.trim() &&
      this.inspectorId.trim() &&
      this.chequeosData().length === 8
    );
  }

  protected onSubmit(): void {
    if (!this.isFormValid() || this.submitting()) {
      return;
    }

    const detalles: CreateEvaluacionDetalleRequest[] = this.chequeosData().map(c => ({
      chequeoId: c.chequeoId,
      puntaje: c.puntaje,
      observacion: c.observacion.trim() || undefined
    }));

    const request: CreateEvaluacionRequest = {
      turnoId: this.turnoId.trim(),
      inspectorId: this.inspectorId.trim(),
      detalles
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.evaluacionService.register(request).subscribe({
      next: (evaluacion) => {
        this.successMessage.set('¡Evaluación registrada exitosamente!');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.submitting.set(false);
        const message: string = error.error?.message || 'Error al registrar la evaluación';
        this.errorMessage.set(message);
      }
    });
  }
}
