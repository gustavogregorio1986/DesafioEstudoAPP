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

  agendasOriginais: Agenda[] = [];
  agendasFiltradas: Agenda[] = [];
  grupos: { key: string; value: Agenda[] }[] = [];
  agendaSelecionada: Agenda | null = null;

  agendasPorAno: { [ano: string]: Agenda[] } = {};
  agendasPorMes: { [mes: string]: Agenda[] } = {};

  dataInicioFiltro: string | null = null;
  dataFimFiltro: string | null = null;
  termoBusca: string = '';
  totalRegistros: number = 0;

  modoAgrupamento: 'ano' | 'mes' = 'ano';
  mesAtual: Date = new Date();

  situacoes = [
    { label: 'Ativo', value: Situacao.Ativo },
    { label: 'Inativo', value: Situacao.Inativo },
    { label: 'Pendente', value: Situacao.Pendente }
  ];

  constructor(private agendaService: AgendaService) {}

  ngOnInit(): void {
    this.carregarAgendas();
  }

  private carregarAgendas(): void {
    this.agendaService.listarAgenda().subscribe((agendas: Agenda[]) => {
      this.agendasOriginais = agendas;
      this.agendasFiltradas = [...agendas];
      this.totalRegistros = agendas.length;
      this.atualizarAgrupamento();
    });
  }

  atualizarAgrupamento(): void {
    if (this.modoAgrupamento === 'mes') {
      this.agruparPorMes();
    } else {
      this.agruparPorAno();
    }
  }

  private agruparPorAno(): void {
    this.agendasPorAno = {};
    this.agendasFiltradas.forEach(agenda => {
      const ano = new Date(agenda.dataInicio).getFullYear().toString();
      if (!this.agendasPorAno[ano]) this.agendasPorAno[ano] = [];
      this.agendasPorAno[ano].push(agenda);
    });
    this.grupos = this.converterParaGrupos(this.agendasPorAno);
  }

  private agruparPorMes(): void {
    this.agendasPorMes = {};
    this.agendasFiltradas.forEach(agenda => {
      const data = new Date(agenda.dataInicio);
      const mes = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!this.agendasPorMes[mes]) this.agendasPorMes[mes] = [];
      this.agendasPorMes[mes].push(agenda);
    });
    this.grupos = this.converterParaGrupos(this.agendasPorMes);
  }

  private converterParaGrupos(obj: { [key: string]: Agenda[] }): { key: string; value: Agenda[] }[] {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  filtrarPorTexto(): void {
    const termo = this.termoBusca.toLowerCase();
    this.agendasFiltradas = this.agendasOriginais.filter(agenda =>
      agenda.titulo?.toLowerCase().includes(termo) ||
      agenda.descricao?.toLowerCase().includes(termo)
    );
    this.atualizarAgrupamento();
    this.totalRegistros = this.agendasFiltradas.length;
  }

  filtrarPorData(): void {
    const inicio = this.dataInicioFiltro ? new Date(this.dataInicioFiltro + 'T00:00:00') : null;
    const fim = this.dataFimFiltro ? new Date(this.dataFimFiltro + 'T23:59:59') : null;

    this.agendasFiltradas = this.agendasOriginais.filter(agenda => {
      const data = new Date(agenda.dataInicio);
      return (!inicio || data >= inicio) && (!fim || data <= fim);
    });

    this.atualizarAgrupamento();
    this.totalRegistros = this.agendasFiltradas.length;
  }

  limparFiltro(): void {
    this.dataInicioFiltro = null;
    this.dataFimFiltro = null;
    this.termoBusca = '';
    this.agendasFiltradas = [...this.agendasOriginais];
    this.atualizarAgrupamento();
    this.totalRegistros = this.agendasFiltradas.length;
  }

  filtrarPorMes(): void {
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();

    this.agendasFiltradas = this.agendasOriginais.filter(agenda => {
      const data = new Date(agenda.dataInicio);
      return data.getFullYear() === ano && data.getMonth() === mes;
    });

    this.agruparPorMes();
    this.totalRegistros = this.agendasFiltradas.length;
  }

  voltarMes(): void {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() - 1, 1);
    this.filtrarPorMes();
  }

  avancarMes(): void {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() + 1, 1);
    this.filtrarPorMes();
  }

  selecionarAgenda(agenda: Agenda): void {
    this.agendaSelecionada = { ...agenda };
  }

  editarAgendaSelecionada(): void {
    if (!this.agendaSelecionada?.id) return;

    this.agendaService.editarAgenda(this.agendaSelecionada.id, this.agendaSelecionada).subscribe({
      next: () => {
        alert('Agenda atualizada com sucesso!');
        this.carregarAgendas();
        this.agendaSelecionada = null;
      },
      error: err => {
        console.error('Erro ao atualizar agenda:', err);
        alert('Erro ao atualizar.');
      }
    });
  }

  excluirAgenda(id: number): void {
    if (confirm('Deseja realmente excluir esta agenda?')) {
      this.agendaService.deletarAgenda(id).subscribe({
        next: () => this.carregarAgendas(),
        error: err => console.error('Erro ao excluir agenda:', err)
      });
    }
  }

  gerarRelatorioGeral(): void {
    this.agendaService.gerarRelatorioGeral().subscribe({
      next: blob => this.baixarArquivo(blob, 'relatorio-geral.pdf'),
      error: err => {
        console.error('Erro ao gerar relatório:', err);
        alert('Erro ao gerar relatório.');
      }
    });
  }

  exportarExcel(): void {
    this.agendaService.exportarExcel().subscribe({
      next: blob => this.baixarArquivo(blob, 'agenda.xlsx'),
      error: err => {
        console.error('Erro ao exportar Excel:', err);
        alert('Erro ao exportar Excel.');
      }
    });
  }

  private baixarArquivo(blob: Blob, nomeArquivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  scrollParaAno(ano: string): void {
    const el = document.getElementById('ano-' + ano);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  scrollParaTopo(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  getLinhasPorAno(ano: string): number {
    return this.agendasPorAno[ano]?.length ?? 0;
  }
}