import { Component, OnInit } from '@angular/core';
import { Agenda } from '../../classes/agenda';
import { AgendaService } from '../../servicos/agenda.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-semanal',
  imports: [
    CommonModule // <- Adicione isso aqui
  ],
  templateUrl: './semanal.component.html',
  styleUrls: ['./semanal.component.css']
})
export class SemanalComponent implements OnInit {

  agendas: Agenda[] = [];
  gruposSemanais: { key: string; value: Agenda[] }[] = [];
  turno?: string;

  constructor(private agendaService: AgendaService) {
    this.turno = '';
  }

  ngOnInit(): void {
    this.agendaService.listarAgenda().subscribe((agendas: Agenda[]) => {
      this.agendas = agendas;
      this.agruparPorSemana();
    });
  }

  private agruparPorSemana(): void {
    const agrupado: { [semana: string]: Agenda[] } = {};

    this.agendas.forEach(agenda => {
      const data = new Date(agenda.dataInicio);
      if (isNaN(data.getTime())) return;

      const ano = data.getFullYear();
      const semana = this.getNumeroSemana(data);
      const chave = `Semana ${semana} - ${ano}`;

      agrupado[chave] ||= [];
      agrupado[chave].push(agenda);
    });

    this.gruposSemanais = Object.entries(agrupado).map(([key, value]) => ({ key, value }));
  }

  private getNumeroSemana(data: Date): number {
    const primeira = new Date(data.getFullYear(), 0, 1);
    const dias = Math.floor((data.getTime() - primeira.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((dias + primeira.getDay() + 1) / 7);
  }

  getSituacaoLabel(valor: string | undefined | null): string {
    if (typeof valor !== 'string') {
      return 'Desconhecida';
    }

    const chave = valor.toLowerCase();
    const map: { [key: string]: string } = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'pendente': 'Pendente'
    };

    return map[chave] ?? 'Desconhecida';
  }

  getClassePorEnum(valor: string | undefined | null): string {
    if (typeof valor !== 'string') {
      return 'bg-light text-dark';
    }

    const chave = valor.toLowerCase();
    const map: { [key: string]: string } = {
      'ativo': 'bg-success text-white',
      'inativo': 'bg-danger text-white',
      'pendente': 'bg-primary text-white'
    };

    return map[chave] ?? 'bg-light text-dark';
  }

  getTurnoLabel(valor: string | undefined | null): string {
    if (typeof valor !== 'string') {
      return '❔ Indefinido';
    }

    const chave = valor.toLowerCase();
    const map: { [key: string]: string } = {
      'manha': '🌅 Manhã',
      'tarde': '🌇 Tarde',
      'noite': '🌙 Noite'
    };

    return map[chave] ?? '❔ Indefinido';
  }

  getClassesPorTurno(valor: string | undefined | null): string {
    if (typeof valor !== 'string') {
      return 'bg-light text-dark';
    }

    const chave = valor.toLowerCase();
    const map: { [key: string]: string } = {
      'manha': 'bg-warning text-dark',
      'tarde': 'bg-primary text-white',
      'noite': 'bg-dark text-white'
    };

    return map[chave] ?? 'bg-light text-dark';
  }
}