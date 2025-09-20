import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Agenda } from '../classes/agenda';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private apiUrl = 'https://localhost:7165/api/Agenda';

  constructor(private http: HttpClient) {}

  adicionarAgenda(agenda: Agenda): Observable<Agenda> {
    return this.http.post<Agenda>(`${this.apiUrl}/AdicionarAgenda`, agenda);
  }

  listarAgenda(): Observable<Agenda[]> {
    return this.http.get<Agenda[]>(`${this.apiUrl}/ListarAgenda`);
  }

  listarAgendasAtivas(): Observable<Agenda[]> {
    return this.http.get<Agenda[]>(`${this.apiUrl}/ListarAgendasAtivas`);
  }

  listarAgendasInativas(): Observable<Agenda[]> {
    return this.http.get<Agenda[]>(`${this.apiUrl}/ListarAgendasInativas`);
  }

  listarAgendasPendentes(): Observable<Agenda[]> {
    return this.http.get<Agenda[]>(`${this.apiUrl}/ListarAgendasPendentes`);
  }

}
