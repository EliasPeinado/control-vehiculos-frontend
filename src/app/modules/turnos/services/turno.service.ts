import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Turno, CreateTurnoRequest, CancelarTurnoRequest, Slot, SlotQueryParams } from '@core/models/turnos/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiUrl}/${environment.apiVersion}/turnos`;

  public getSlots(queryParams: SlotQueryParams): Observable<Slot[]> {
    const params: HttpParams = new HttpParams()
      .set('centroId', queryParams.centroId)
      .set('fecha', queryParams.fecha);
    
    return this.http.get<Slot[]>(`${this.baseUrl}/slots`, { params });
  }

  public create(request: CreateTurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(this.baseUrl, request);
  }

  public getById(turnoId: string): Observable<Turno> {
    return this.http.get<Turno>(`${this.baseUrl}/${turnoId}`);
  }

  public confirmar(turnoId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${turnoId}/confirmar`, {});
  }

  public cancelar(turnoId: string, request: CancelarTurnoRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${turnoId}/cancelar`, request);
  }
}
