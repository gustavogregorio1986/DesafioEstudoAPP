import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Agenda } from '../../classes/agenda';
import { Situacao } from '../../classes/Situacao';
import { AgendaService } from '../../servicos/agenda.service';
import { FooterComponent } from '../footer/footer.component';

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
  styleUrls: ['./consultar.component.css']
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

  constructor(private agendaService: AgendaService) { }

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
    this.modoAgrupamento === 'mes' ? this.agruparPorMes() : this.agruparPorAno();
  }

  private agruparPorAno(): void {
    this.agendasPorAno = {};
    this.agendasFiltradas.forEach(agenda => {
      if (!agenda.dataInicio) return;
      const data = new Date(agenda.dataInicio);
      const ano = isNaN(data.getTime()) ? 'Data inválida' : data.getFullYear().toString();
      this.agendasPorAno[ano] ||= [];
      this.agendasPorAno[ano].push(agenda);
    });
    this.grupos = this.converterParaGrupos(this.agendasPorAno);
  }

  scrollParaTopo(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollParaAno(ano: string): void {
    const elemento = document.getElementById('ano-' + ano);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn('Elemento não encontrado para ano:', ano);
    }
  }

  private agruparPorMes(): void {
    this.agendasPorMes = {};
    this.agendasFiltradas.forEach(agenda => {
      if (!agenda.dataInicio) return;
      const data = new Date(agenda.dataInicio);
      if (isNaN(data.getTime())) return;
      const mes = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      this.agendasPorMes[mes] ||= [];
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

  abrirTrocaSituacao(agenda: Agenda): void {
    this.agendaSelecionada = {
      id: agenda.id,
      dataInicio: agenda.dataInicio,
      dataFim: agenda.dataFim,
      enumSituacao: agenda.enumSituacao,
      Ano: agenda.Ano,
      titulo: agenda.titulo,
      descricao: agenda.descricao
    };
  }


  atualizarAgendaLocal(agendaAtualizada: Agenda): void {
    const index = this.agendasOriginais.findIndex(a => a.id === agendaAtualizada.id);
    if (index !== -1) {
      this.agendasOriginais[index] = { ...agendaAtualizada };
      this.agendasFiltradas = [...this.agendasOriginais];
      this.atualizarAgrupamento();
      this.totalRegistros = this.agendasFiltradas.length;
    }
  }

  atualizarSituacao(agenda: Agenda): void {
    if (!agenda?.id) {
      console.warn('Agenda inválida: ID ausente ou incorreto');
      return;
    }



    if (!agenda.enumSituacao) {
      console.error('Situação inválida ou não definida');
      return;
    }

    this.agendaService.atualizarSituacao(String(agenda.id), agenda.enumSituacao).subscribe({
      next: () => {
        console.log('Situação atualizada com sucesso');
        this.atualizarAgendaLocal(agenda);
      },
      error: err => {
        console.error('Erro ao atualizar situação:', err);
      }
    });


  }

  editarAgendaSelecionada(): void {
    if (!this.agendaSelecionada?.id) return;

    this.agendaService.editarAgenda(this.agendaSelecionada.id, this.agendaSelecionada).subscribe({
      next: () => {
        alert('Agenda atualizada com sucesso!');
        this.atualizarAgendaLocal(this.agendaSelecionada!);
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
        error: err => {
          console.error('Erro ao excluir agenda:', err);
        }
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

  getSituacaoLabel(valor: string): string {
    const situacao = valor?.toLowerCase();

    if (situacao === 'ativo') {
      return 'ativo'; // ou 'Ativo', se quiser manter
    } else if (situacao === 'pendente') {
      return 'Pendente';
    } else if (situacao === 'inativo') {
      return 'Inativo';
    } else {
      return '';
    }
  }

  getClassePorEnum(valor: string): string {
    const map: { [key: string]: string } = {
      'ativo': 'text-success',
      'Pendente': 'text-primary',
      'Inativo': 'text-danger'
    };
    return map[valor] ?? '';
  }

  getLinhasPorAno(ano: string): number {
    return this.agendasPorAno[ano]?.length ?? 0;
  }
}