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
  dataInicio !: Date;
  horaInicio: string = ''; // exemplo: '14:30'
  horaFim: string = '';    // exemplo: '16:00'
  dataFim !: Date;
  descricao = '';
  enumSituacao: Situacao | null = null;

  sucesso = false;
  erro = false;

  situacoes: { label: string; value: Situacao }[] = [
    { label: 'Ativo', value: Situacao.Ativo },
    { label: 'Inativo', value: Situacao.Inativo },
    { label: 'Pendente', value: Situacao.Pendente }
  ];

  constructor(private agendaService: AgendaService) { }

  salvar(form: NgForm) {
    if (!this.titulo || !this.dataInicio || !this.dataFim || !this.descricao || !this.enumSituacao) {
      this.erro = true;
      this.sucesso = false;
      return;
    }

    // Cria Date com hora embutida
    const dataInicioStr = `${this.dataInicio}T${this.horaInicio}:00`;
    const dataFimStr = `${this.dataFim}T${this.horaFim}:00`;

    const inicio = new Date(dataInicioStr);
    const fim = new Date(dataFimStr);

    // ✅ Subtrai 3 horas para compensar o UTC
    inicio.setHours(inicio.getHours() - 3);
    fim.setHours(fim.getHours() - 3);

    // Validação: fim deve ser maior que início
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
    this.dataInicio = undefined!;
    this.dataFim = undefined!;
    this.descricao = '';
    this.enumSituacao = null;
  }
}
