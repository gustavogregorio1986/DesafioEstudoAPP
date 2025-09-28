import { Component, OnInit } from '@angular/core';
import { Agenda } from '../../classes/agenda';
import { AgendaService } from '../../servicos/agenda.service';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, DatePipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Situacao } from '../../classes/Situacao';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultar',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    FooterComponent,
    DatePipe,
    KeyValuePipe,
    NgFor,
    NgIf
  ],
  templateUrl: './consultar.component.html',
  styleUrl: './consultar.component.css'
})
export class ConsultarComponent implements OnInit {

  agendasPorAno: { [ano: string]: Agenda[] } = {};
  agendasOriginais: Agenda[] = [];
  agendasFiltradas: Agenda[] = [];
  grupos: { key: string; value: Agenda[] }[] = [];

  dataInicioFiltro: string | null = null;
  dataFimFiltro: string | null = null;
  totalRegistros: number = 0;

  constructor(private agendaService: AgendaService) { }

  ngOnInit(): void {
    this.carregarAgendas();
  }

  carregarAgendas(): void {
    this.agendaService.listarAgenda().subscribe((agendas: Agenda[]) => {
      this.agendasOriginais = agendas;

      agendas.forEach(agenda => {
        agenda.Ano = new Date(agenda.dataFim).getFullYear().toString();
      });

      this.agendasFiltradas = [...this.agendasOriginais];
      this.agruparPorAno();
      this.totalRegistros = this.agendasFiltradas.length;
    });
  }

  agruparPorAno(): void {
    this.agendasPorAno = {};

    this.agendasFiltradas.forEach(agenda => {
      const ano = new Date(agenda.dataInicio).getFullYear().toString();
      if (!this.agendasPorAno[ano]) {
        this.agendasPorAno[ano] = [];
      }
      this.agendasPorAno[ano].push(agenda);
    });

    this.grupos = Object.entries(this.agendasPorAno).map(([ano, lista]) => ({
      key: ano,
      value: lista
    }));
  }

  filtrarPorData(): void {
    const filtroInicio = this.dataInicioFiltro
      ? new Date(this.dataInicioFiltro + 'T00:00:00')
      : null;

    const filtroFim = this.dataFimFiltro
      ? new Date(this.dataFimFiltro + 'T23:59:59')
      : null;

    this.agendasFiltradas = this.agendasOriginais.filter(agenda => {
      const inicio = new Date(agenda.dataInicio);
      return (!filtroInicio || inicio >= filtroInicio) &&
        (!filtroFim || inicio <= filtroFim);
    });

    this.agruparPorAno();
    this.totalRegistros = this.agendasFiltradas.length;
  }

  limparFiltro(): void {
    this.dataInicioFiltro = null;
    this.dataFimFiltro = null;

    this.agendasFiltradas = [...this.agendasOriginais];
    this.agruparPorAno();
    this.totalRegistros = this.agendasFiltradas.length;
  }

  scrollParaAno(ano: string): void {
    const elemento = document.getElementById('ano-' + ano);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getSituacaoLabel(valor: number): string {
    return Situacao[valor] ?? 'Desconhecida';
  }

  getClassePorEnum(valor: number): string {
    const map: { [key: string]: string } = {
      Ativo: 'text-success',
      Inativo: 'text-danger',
      Pendente: 'text-primary'
    };
    return map[Situacao[valor]] ?? '';
  }

  excluirAgenda(id: number): void {
    if (confirm('Deseja realmente excluir esta agenda?')) {
      this.agendaService.deletarAgenda(id).subscribe({
        next: () => this.carregarAgendas(),
        error: (err) => console.error('Erro ao excluir agenda:', err)
      });
    }
  }


  getLinhasPorAno(ano: string): number {
    return this.agendasPorAno[ano]?.length ?? 0;
  }
}