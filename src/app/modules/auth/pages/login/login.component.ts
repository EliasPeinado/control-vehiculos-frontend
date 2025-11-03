import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { LoginRequest } from '@core/models/auth/auth.model';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, LoadingSpinnerComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly authService: AuthService = inject(AuthService);
  private readonly errorHandler: ErrorHandlerService = inject(ErrorHandlerService);
  private readonly router: Router = inject(Router);

  protected credentials: LoginRequest = {
    email: '',
    password: ''
  };

  protected readonly loading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected isFormValid(): boolean {
    return this.credentials.email.trim() !== '' && this.credentials.password.trim() !== '';
  }

  protected onSubmit(): void {
    if (!this.isFormValid() || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message: string = this.errorHandler.getUserFriendlyMessage(error, 'iniciar sesión');
        this.errorMessage.set(message);
        this.errorHandler.logError(error, 'Login');
      }
    });
  }
}
