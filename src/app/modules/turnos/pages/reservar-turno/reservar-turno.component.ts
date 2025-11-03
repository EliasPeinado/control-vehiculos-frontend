import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TurnoService } from '../../services/turno.service';
import { CentroService } from '@app/modules/centros/services/centro.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { Centro } from '@core/models/centros/centro.model';
import { Slot, CreateTurnoRequest } from '@core/models/turnos/turno.model';
import { DropdownSelectComponent, DropdownOption } from '@shared/dinamicos/dropdown-select/dropdown-select.component';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reservar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownSelectComponent, AlertComponent, LoadingSpinnerComponent],
  templateUrl: './reservar-turno.component.html'
})
export class ReservarTurnoComponent implements OnInit {
  private readonly turnoService: TurnoService = inject(TurnoService);
  private readonly centroService: CentroService = inject(CentroService);
  private readonly errorHandler: ErrorHandlerService = inject(ErrorHandlerService);
  private readonly router: Router = inject(Router);

  protected readonly centros = signal<Centro[]>([]);
  protected readonly slots = signal<Slot[]>([]);
  protected readonly selectedCentroId = signal<string | null>(null);
  protected readonly selectedSlot = signal<Slot | null>(null);
  protected selectedFecha: string = '';
  protected matricula: string = '';

  protected readonly loadingCentros = signal<boolean>(false);
  protected readonly loadingSlots = signal<boolean>(false);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly centroOptions = computed<DropdownOption<string>[]>(() => {
    return this.centros().map(centro => ({
      value: centro.id,
      label: `${centro.nombre} - ${centro.direccion}`
    }));
  });

  protected readonly minDate = computed<string>(() => {
    const tomorrow: Date = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  ngOnInit(): void {
    this.loadCentros();
  }

  private loadCentros(): void {
    this.loadingCentros.set(true);
    this.errorMessage.set(null);
    
    this.centroService.getAll(1, 50).subscribe({
      next: (response) => {
        this.centros.set(response.items);
        this.loadingCentros.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'cargar los centros de inspección');
        this.errorMessage.set(message);
        this.loadingCentros.set(false);
        this.errorHandler.logError(error, 'Load Centros');
      }
    });
  }

  protected onCentroChange(centroId: string | null): void {
    this.selectedCentroId.set(centroId);
    this.selectedFecha = '';
    this.slots.set([]);
    this.selectedSlot.set(null);
  }

  protected onFechaChange(): void {
    if (!this.selectedCentroId() || !this.selectedFecha) {
      return;
    }

    this.loadingSlots.set(true);
    this.selectedSlot.set(null);
    this.errorMessage.set(null);

    this.turnoService.getSlots({
      centroId: this.selectedCentroId()!,
      fecha: this.selectedFecha
    }).subscribe({
      next: (slots) => {
        this.slots.set(slots);
        this.loadingSlots.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'cargar los horarios disponibles');
        this.errorMessage.set(message);
        this.loadingSlots.set(false);
        this.errorHandler.logError(error, 'Load Slots');
      }
    });
  }

  protected selectSlot(slot: Slot): void {
    if (slot.disponible) {
      this.selectedSlot.set(slot);
    }
  }

  protected formatTime(dateString: string): string {
    const date: Date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  protected isFormValid(): boolean {
    return !!(
      this.selectedCentroId() &&
      this.selectedFecha &&
      this.selectedSlot() &&
      this.matricula.trim().length >= 5 &&
      this.matricula.trim().length <= 12
    );
  }

  protected onSubmit(): void {
    if (!this.isFormValid() || this.submitting()) {
      return;
    }

    const request: CreateTurnoRequest = {
      matricula: this.matricula.trim().toUpperCase(),
      centroId: this.selectedCentroId()!,
      fechaHora: this.selectedSlot()!.inicio
    };

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.turnoService.create(request).subscribe({
      next: (turno) => {
        this.submitting.set(false);
        this.successMessage.set('¡Turno reservado exitosamente!');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'reservar el turno');
        this.errorMessage.set(message);
        this.errorHandler.logError(error, 'Create Turno');
      }
    });
  }
}
