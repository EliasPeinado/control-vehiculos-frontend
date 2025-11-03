import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { EstadoTurno, EstadoVehiculo, ResultadoEvaluacion } from '@core/models/catalogos/catalogo.model';
import { Chequeo } from '@core/models/catalogos/chequeo.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiUrl}/${environment.apiVersion}`;

  public getChequeos(): Observable<Chequeo[]> {
    return this.http.get<Chequeo[]>(`${this.baseUrl}/chequeos`);
  }

  public getEstadosTurno(): Observable<EstadoTurno[]> {
    return this.http.get<EstadoTurno[]>(`${this.baseUrl}/catalogos/estados-turno`);
  }

  public getEstadosVehiculo(): Observable<EstadoVehiculo[]> {
    return this.http.get<EstadoVehiculo[]>(`${this.baseUrl}/catalogos/estados-vehiculo`);
  }

  public getResultadosEvaluacion(): Observable<ResultadoEvaluacion[]> {
    return this.http.get<ResultadoEvaluacion[]>(`${this.baseUrl}/catalogos/resultados-evaluacion`);
  }
}
