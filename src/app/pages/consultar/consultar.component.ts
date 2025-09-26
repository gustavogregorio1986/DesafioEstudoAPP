import { Component, OnInit } from '@angular/core';
import { Agenda } from '../../classes/agenda';
import { AgendaService } from '../../servicos/agenda.service';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule, DatePipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Situacao } from '../../classes/Situacao';

@Component({
  selector: 'app-consultar',
  imports: [CommonModule, FooterComponent,  DatePipe,      // ✅ necessário para | date:'short'
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

   enumSituacao: Situacao = Situacao.Pendente; // exemplo de valor inicial


   constructor(private agendaService: AgendaService){

   }

   ngOnInit(): void {
     this.carregarAgendas();
     this.linhasVisiveis = Object.values(this.agendasPorAno)
    .reduce((total, lista) => total + lista.length, 0);
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
  const label = Situacao[valor];
  console.log('Valor:', valor, 'Label:', label);
  switch (label) {
    case 'Ativo':
      return 'text-success';
    case 'Inativo':
      return 'text-danger';
    case 'Pendente':
      return 'text-primary';
    default:
      return '';
   }
  }

   carregarAgendas(): void {
    this.agendaService.listarAgenda().subscribe((agendas: Agenda[]) => {
     agendas.forEach(agenda => {
       agenda.Ano = new Date(agenda.dataFim).getFullYear().toString();
    });

   const agrupado: { [ano: string]: Agenda[] } = {};

   agendas.forEach(agenda => {
     const ano = agenda.Ano!;
     if (!agrupado[ano]) agrupado[ano] = [];
      agrupado[ano].push(agenda);
   });

    this.agendasPorAno = Object.fromEntries(
      Object.entries(agrupado).sort((a, b) => +b[0] - +a[0])
    );
   });
  }
}
