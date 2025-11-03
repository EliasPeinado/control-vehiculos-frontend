import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Centro } from '@core/models/centros/centro.model';
import { PagedResponse } from '@core/models/common/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CentroService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = `${environment.apiUrl}/${environment.apiVersion}/centros`;

  public getAll(page: number = 1, pageSize: number = 20): Observable<PagedResponse<Centro>> {
    const params: HttpParams = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PagedResponse<Centro>>(this.baseUrl, { params });
  }
}
