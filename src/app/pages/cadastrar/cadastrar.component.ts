import { Component } from '@angular/core';
import { AgendaService } from '../../servicos/agenda.service';
import { Agenda } from '../../classes/agenda';
import { Situacao } from '../../classes/Situacao';
import { FormsModule, NgForm } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastrar',
  standalone: true,
  imports: [FormsModule, CommonModule, FooterComponent],
  templateUrl: './cadastrar.component.html',
  styleUrl: './cadastrar.component.css'
})
export class CadastrarComponent {

  titulo = '';
  dataInicio!: string; // formato yyyy-MM-dd
  horaInicio: string = ''; // exemplo: '14:30'
  horaFim: string = '';    // exemplo: '16:00'
  dataFim!: string;        // formato yyyy-MM-dd
  descricao = '';
  enumSituacao: Situacao | null = null;

  diaInteiroSelecionado: boolean = false;

  sucesso = false;
  erro = false;

  situacoes: { label: string; value: Situacao }[] = [
    { label: 'Ativo', value: Situacao.Ativo },
    { label: 'Inativo', value: Situacao.Inativo },
    { label: 'Pendente', value: Situacao.Pendente }
  ];

  constructor(private agendaService: AgendaService) { }

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