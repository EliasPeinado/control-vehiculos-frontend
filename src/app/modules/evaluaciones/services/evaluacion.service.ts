import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Evaluacion, CreateEvaluacionRequest } from '@core/models/evaluaciones/evaluacion.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiUrl}/${environment.apiVersion}/evaluaciones`;

  public register(request: CreateEvaluacionRequest): Observable<Evaluacion> {
    return this.http.post<Evaluacion>(this.baseUrl, request);
  }

  public getById(evaluacionId: string): Observable<Evaluacion> {
    return this.http.get<Evaluacion>(`${this.baseUrl}/${evaluacionId}`);
  }
}
