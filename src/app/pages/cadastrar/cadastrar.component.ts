import { Component, OnInit } from '@angular/core';
import { AgendaService } from '../../servicos/agenda.service';
import { Agenda } from '../../classes/agenda';
import { Situacao } from '../../classes/Situacao';
import { FormsModule, NgForm } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-cadastrar',
  standalone: true,
  imports: [FormsModule, CommonModule, FooterComponent],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent implements OnInit{

  titulo = '';
  dataInicio!: string; // formato yyyy-MM-dd
  horaInicio: string = ''; // exemplo: '14:30'
  horaFim: string = '';    // exemplo: '16:00'
  dataFim!: string;        // formato yyyy-MM-dd
  descricao = '';
  enumSituacao: Situacao | null = null;
  mesAtual: Date = new Date();
  agendasFiltradas: any[] = [];



  diaInteiroSelecionado: boolean = false;

  sucesso = false;
  erro = false;

  situacoes: { label: string; value: Situacao }[] = [
    { label: 'Ativo', value: Situacao.Ativo },
    { label: 'Inativo', value: Situacao.Inativo },
    { label: 'Pendente', value: Situacao.Pendente }
  ];

  constructor(private agendaService: AgendaService) { }

  ngOnInit() {
     this.gerarAgendasPeriodo(8, 17); // Horário fixo das 08:00 às 17:00
  }

  salvar(form: NgForm) {
    if (!this.titulo || !this.dataInicio || !this.descricao || !this.enumSituacao) {
      this.erro = true;
      this.sucesso = false;
      return;
    }

    let inicio: Date;
    let fim: Date;

    if (this.diaInteiroSelecionado || !this.dataFim) {
      // Assume dia inteiro com base na data de início
      inicio = new Date(`${this.dataInicio}T00:00:00`);
      fim = new Date(`${this.dataInicio}T23:59:59`);
    } else {
      // Usa os campos manuais
      const dataInicioStr = `${this.dataInicio}T${this.horaInicio || '00:00'}:00`;
      const dataFimStr = `${this.dataFim}T${this.horaFim || '23:59'}:00`;

      inicio = new Date(dataInicioStr);
      fim = new Date(dataFimStr);
    }

    // Ajuste UTC -3
    inicio.setHours(inicio.getHours() - 3);
    fim.setHours(fim.getHours() - 3);

    if (fim <= inicio) {
      this.erro = true;
      this.sucesso = false;
      alert('A data/hora de fim deve ser maior que a de início.');
      return;
    }

    const novaAgenda = new Agenda(
      this.titulo,
      inicio,
      fim,
      this.descricao,
      this.enumSituacao
    );

    this.agendaService.adicionarAgenda(novaAgenda).subscribe({
      next: res => {
        this.sucesso = true;
        this.erro = false;
        this.limparFormulario();
        form.resetForm();
      },
      error: err => {
        console.error('Erro ao cadastrar:', err);
        this.erro = true;
        this.sucesso = false;
      }
    });
  }

  gerarAgendasPeriodo(horaInicio: number, horaFim: number) {
  const inicio = new Date(2025, 9, 7); // Outubro (mês 9)
  const fim = new Date(2025, 10, 7);   // Novembro (mês 10)

  const novasAgendas = [];

  for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
    const dataInicio = new Date(data.getFullYear(), data.getMonth(), data.getDate(), horaInicio, 0);
    const dataFim = new Date(data.getFullYear(), data.getMonth(), data.getDate(), horaFim, 0);

    novasAgendas.push({
      id: `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`,
      titulo: `Agenda ${data.toLocaleDateString('pt-BR')}`,
      descricao: `Horário fixo das ${horaInicio}:00 às ${horaFim}:00`,
      dataInicio: dataInicio,
      dataFim: dataFim,
      enumSituacao: 'ativo'
    });
  }

  this.agendasFiltradas = novasAgendas;
}

  limparFormulario() {
    this.titulo = '';
    this.dataInicio = '';
    this.dataFim = '';
    this.horaInicio = '';
    this.horaFim = '';
    this.descricao = '';
    this.enumSituacao = null;
    this.diaInteiroSelecionado = false;
  }
}