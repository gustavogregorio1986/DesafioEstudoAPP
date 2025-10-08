import { Situacao } from "./Situacao";

export class Agenda {
  id?: number;
  titulo: string;
  dataInicio: Date;
  dataFim: Date;
  descricao: string;
  enumSituacao: Situacao;
  Ano?: string;
  turno: string;

  constructor(
    titulo: string,
    dataInicio: Date,
    dataFim: Date,
    descricao: string,
     turno: string,
    enumSituacao: Situacao,
    id?: number
  ) {
    this.titulo = titulo;
    this.dataInicio = dataInicio;
    this.dataFim = dataFim;
    this.descricao = descricao;
    this.enumSituacao = enumSituacao;
    this.turno = turno;
    if (id !== undefined) {
      this.id = id;
    }
  }
}