import { Component, OnInit } from '@angular/core';
import { Agenda } from '../../classes/agenda';
import { AgendaService } from '../../servicos/agenda.service';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, DatePipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Situacao } from '../../classes/Situacao';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultar',
  imports: [FormsModule, CommonModule, FooterComponent, DatePipe,      // ✅ necessário para | date:'short'
    KeyValuePipe,  // ✅ se estiver usando | keyvalue
    NgFor,         // ✅ para *ngFor
    NgIf           // ✅ se estiver usando *ngIf
  ],
  templateUrl: './consultar.component.html',
  styleUrl: './consultar.component.css'
})
export class ConsultarComponent implements OnInit {

  agendasPorAno: { [ano: string]: Agenda[] } = {};
  linhasVisiveis: number = 0;

  grupos: { key: string; value: Agenda[] }[] = [];
  totalRegistros: number = 0;
  agendasOriginais: Agenda[] = [];       // Lista completa de agendas
  agendasFiltradas: Agenda[] = [];       // Lista filtrada por data
  dataInicioFiltro: string | null = null; // Data inicial do filtro (formato yyyy-MM-dd)
  dataFimFiltro: string | null = null;    // Data final do filtro (formato yyyy-MM-dd)

  enumSituacao: Situacao = Situacao.Pendente; // exemplo de valor inicial


  constructor(private agendaService: AgendaService) {

  }

  ngOnInit(): void {
    this.carregarAgendas();

  }

  filtrarPorData() {
    this.agendasFiltradas = this.agendasOriginais.filter(agenda => {
      const inicio = new Date(agenda.dataInicio);
      const filtroInicio = this.dataInicioFiltro ? new Date(this.dataInicioFiltro) : null;
      const filtroFim = this.dataFimFiltro ? new Date(this.dataFimFiltro) : null;

      return (!filtroInicio || inicio >= filtroInicio) &&
        (!filtroFim || inicio <= filtroFim);
    });
  }

   scrollParaAno(ano: string) {
    const elemento = document.getElementById('ano-' + ano);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getAnos(): string[] {
    return Object.keys(this.agendasPorAno);
  }

  getLinhasPorAno(ano: string): number {
    return this.agendasPorAno[ano]?.length ?? 0;
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

  carregarAgendas(): void {
    this.agendaService.listarAgenda().subscribe((agendas: Agenda[]) => {
      // Adiciona o ano a cada agenda
      agendas.forEach(agenda => {
        agenda.Ano = new Date(agenda.dataFim).getFullYear().toString();
      });

      // Agrupa por ano
      const agrupado: { [ano: string]: Agenda[] } = {};
      agendas.forEach(agenda => {
        const ano = agenda.Ano!;
        if (!agrupado[ano]) agrupado[ano] = [];
        agrupado[ano].push(agenda);
      });

      // Ordena e salva
      this.agendasPorAno = Object.fromEntries(
        Object.entries(agrupado).sort((a, b) => +b[0] - +a[0])
      );

      // Agora sim: cria os grupos
      this.grupos = Object.entries(this.agendasPorAno).map(([ano, lista]) => ({
        key: ano,
        value: lista
      }));

      // Calcula os totais com os dados prontos
      this.linhasVisiveis = Object.values(this.agendasPorAno)
        .reduce((total, lista) => total + lista.length, 0);

      this.totalRegistros = this.grupos.reduce(
        (soma, grupo) => soma + grupo.value.length,
        0
      );

    });
  }
}
