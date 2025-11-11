import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Vehiculo, CreateVehiculoRequest, UpdateVehiculoRequest } from '@core/models/vehiculos/vehiculo.model';
import { Turno } from '@core/models/turnos/turno.model';
import { PagedResponse } from '@core/models/common/api-response.model';
import { Evaluacion } from '@core/models/evaluaciones/evaluacion.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiUrl}/${environment.apiVersion}/vehiculos`;

  public create(request: CreateVehiculoRequest): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.baseUrl, request);
  }

  public getByMatricula(matricula: string): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.baseUrl}/${matricula}`);
  }

  public update(matricula: string, request: UpdateVehiculoRequest): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.baseUrl}/${matricula}`, request);
  }

  public exists(matricula: string): Observable<void> {
    return this.http.head<void>(`${this.baseUrl}/${matricula}`);
  }

  public getEvaluaciones(matricula: string, page: number = 1, pageSize: number = 20): Observable<PagedResponse<Evaluacion>> {
    const params: HttpParams = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PagedResponse<Evaluacion>>(`${this.baseUrl}/${matricula}/evaluaciones`, { params });
  }

  public getTurnos(matricula: string): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.baseUrl}/${matricula}/turnos`);
  }
}
