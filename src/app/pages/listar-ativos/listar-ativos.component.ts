import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { Agenda } from '../../classes/agenda';
import { AgendaService } from '../../servicos/agenda.service';
import { Situacao } from '../../classes/Situacao';

@Component({
  selector: 'app-listar-ativos',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    DatePipe,
    FooterComponent
  ],
  templateUrl: './listar-ativos.component.html',
  styleUrl: './listar-ativos.component.css'
})
export class ListarAtivosComponent implements OnInit {

  agendasPorAno: { [ano: string]: Agenda[] } = {};
  grupos: { key: string; value: Agenda[] }[] = [];
  totalRegistros: number = 0;

  constructor(private agendaService: AgendaService) {}

  ngOnInit(): void {
    this.carregarAgendas();
  }

  private carregarAgendas(): void {
    this.agendaService.listarAgenda().subscribe((agendas: Agenda[]) => {
      const ativos = this.filtrarAtivos(agendas);
      this.totalRegistros = ativos.length;

      ativos.forEach(agenda => {
        agenda.Ano = this.extrairAno(agenda);
      });

      this.agendasPorAno = this.agruparPorAno(ativos);
      this.grupos = this.converterParaGrupos(this.agendasPorAno);
    });
  }

  private filtrarAtivos(agendas: Agenda[]): Agenda[] {
    return agendas.filter(a => a.enumSituacao?.toLowerCase() === 'ativo');
  }

  private extrairAno(agenda: Agenda): string {
    const data = agenda.dataFim ?? agenda.dataInicio;
    return new Date(data).getFullYear().toString();
  }

  private agruparPorAno(agendas: Agenda[]): { [ano: string]: Agenda[] } {
    const agrupado: { [ano: string]: Agenda[] } = {};
    agendas.forEach(agenda => {
      const ano = agenda.Ano!;
      if (!agrupado[ano]) agrupado[ano] = [];
      agrupado[ano].push(agenda);
    });
    return Object.fromEntries(
      Object.entries(agrupado).sort((a, b) => +b[0] - +a[0])
    );
  }

  private converterParaGrupos(agendasPorAno: { [ano: string]: Agenda[] }): { key: string; value: Agenda[] }[] {
    return Object.entries(agendasPorAno).map(([ano, lista]) => ({
      key: ano,
      value: lista
    }));
  }

  getSituacaoLabel(valor: string): string {
    const map: { [key: string]: string } = {
      'ativo': 'Ativo',
      'pendente': 'Pendente',
      'inativo': 'Inativo'
    };
    return map[valor.toLowerCase()] ?? 'Desconhecida';
  }

  getClassePorEnum(valor: string): string {
    const map: { [key: string]: string } = {
      'ativo': 'text-success',
      'pendente': 'text-primary',
      'inativo': 'text-danger'
    };
    return map[valor.toLowerCase()] ?? '';
  }
}