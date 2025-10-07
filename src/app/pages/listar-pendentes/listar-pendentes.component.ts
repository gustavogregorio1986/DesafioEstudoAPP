import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { Agenda } from '../../classes/agenda';
import { Situacao } from '../../classes/Situacao';
import { AgendaService } from '../../servicos/agenda.service';

@Component({
  selector: 'app-listar-pendentes',
  imports: [CommonModule,
    NgFor,
    DatePipe,
    FooterComponent],
  templateUrl: './listar-pendentes.component.html',
  styleUrl: './listar-pendentes.component.css'
})
export class ListarPendentesComponent {

  agendasPorAno: { [ano: string]: Agenda[] } = {};
  grupos: { key: string; value: Agenda[] }[] = [];
  linhasVisiveis: number = 0;
  totalRegistros: number = 0;

  Situacao = Situacao;

  constructor(private agendaService: AgendaService) { }

  ngOnInit(): void {
    this.carregarAgendas();
  }

  carregarAgendas(): void {
    this.agendaService.listarAgenda().subscribe((agendas: Agenda[]) => {
      const ativos = agendas.filter(a => a.enumSituacao === this.Situacao.Pendente);

      ativos.forEach(agenda => {
        agenda.Ano = new Date(agenda.dataFim).getFullYear().toString();
      });

      const agrupado: { [ano: string]: Agenda[] } = {};
      ativos.forEach(agenda => {
        const ano = agenda.Ano!;
        if (!agrupado[ano]) agrupado[ano] = [];
        agrupado[ano].push(agenda);
      });

      this.agendasPorAno = Object.fromEntries(
        Object.entries(agrupado).sort((a, b) => +b[0] - +a[0])
      );

      this.grupos = Object.entries(this.agendasPorAno).map(([ano, lista]) => ({
        key: ano,
        value: lista
      }));

      this.linhasVisiveis = ativos.length;
      this.totalRegistros = ativos.length;
    });
  }

  getSituacaoLabel(valor: string): string {
    const map: { [key: string]: string } = {
      'ativo': 'Ativo',
      'Pendente': 'Pendente',
      'Inativo': 'Inativo'
    };
    return map[valor] ?? 'Desconhecida';
  }

  getClassePorEnum(valor: string): string {
    const map: { [key: string]: string } = {
      'ativo': 'text-success',
      'Pendente': 'text-primary',
      'Inativo': 'text-danger'
    };
    return map[valor] ?? '';
  }
}
