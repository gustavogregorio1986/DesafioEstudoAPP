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
  agendaSelecionada: Agenda | null = null;

  dataInicioFiltro: string | null = null;
  dataFimFiltro: string | null = null;
  totalRegistros: number = 0;

  titulo = '';
  dataInicio!: string; // formato yyyy-MM-dd
  horaInicio: string = ''; // exemplo: '14:30'
  horaFim: string = '';    // exemplo: '16:00'
  dataFim!: string;        // formato yyyy-MM-dd
  descricao = '';
  enumSituacao: Situacao | null = null;
  agendasPorMes: { [mes: string]: any[] } = {};
  termoBusca: string = '';


  mesAtual: Date = new Date(); // Começa com o mês atual

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

  modoAgrupamento: 'ano' | 'mes' = 'ano'; // você pode mudar isso com um select no HTML

  atualizarAgrupamento(): void {
    if (this.modoAgrupamento === 'mes') {
      this.agruparPorMes();
    } else {
      this.agruparPorAno();
    }
  }

  filtrarPorTexto(): void {
    const termo = this.termoBusca?.toLowerCase() || '';
    this.agendasFiltradas = this.agendasOriginais.filter(agenda =>
      agenda.titulo?.toLowerCase().includes(termo) ||
      agenda.descricao?.toLowerCase().includes(termo)
    );
    this.atualizarAgrupamento(); // mantém agrupamento funcionando
  }

  voltarMes(): void {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() - 1, 1);
    this.filtrarPorMes(); // Atualiza os dados do mês
  }

  avancarMes(): void {
    this.mesAtual = new Date(this.mesAtual.getFullYear(), this.mesAtual.getMonth() + 1, 1);
    this.filtrarPorMes(); // Atualiza os dados do mês
  }

  filtrarPorMes(): void {
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();

    this.agendasFiltradas = this.agendasOriginais.filter(agenda => {
      const data = new Date(agenda.dataInicio);
      return data.getFullYear() === ano && data.getMonth() === mes;
    });

    this.agruparPorMes(); // Atualiza os grupos
    this.totalRegistros = this.agendasFiltradas.length;
  }

  selecionarAgenda(agenda: Agenda): void {
    this.agendaSelecionada = { ...agenda }; // cria uma cópia para edição
  }

  scrollParaTopo(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  agruparPorMes(): void {
    this.agendasPorMes = {};

    this.agendasFiltradas.forEach(agenda => {
      const data = new Date(agenda.dataInicio);
      const mes = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`; // Ex: "2025-10"

      if (!this.agendasPorMes[mes]) {
        this.agendasPorMes[mes] = [];
      }

      this.agendasPorMes[mes].push(agenda);
    });

    this.grupos = Object.entries(this.agendasPorMes).map(([mes, lista]) => ({
      key: mes,
      value: lista
    }));
  }

  gerarRelatorioGeral(): void {
    this.agendaService.gerarRelatorioGeral().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio-geral.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erro ao gerar relatório:', err);
        alert('Erro ao gerar relatório.');
      }
    });
  }

  editarAgendaSelecionada(): void {
    if (!this.agendaSelecionada || !this.agendaSelecionada.id) return;

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

  situacoes: { label: string; value: Situacao }[] = [
    { label: 'Ativo', value: Situacao.Ativo },
    { label: 'Inativo', value: Situacao.Inativo },
    { label: 'Pendente', value: Situacao.Pendente }
  ];

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

  exportarExcel(): void {
    this.agendaService.exportarExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agenda.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erro ao exportar Excel:', err);
        alert('Erro ao exportar Excel.');
      }
    });
  }

  getLinhasPorAno(ano: string): number {
    return this.agendasPorAno[ano]?.length ?? 0;
  }
}