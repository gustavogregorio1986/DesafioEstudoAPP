import { Situacao } from "./Situacao";

export class Agenda {
    titulo:string;
    dataInicio:Date;
    dataFim:Date;
    descricao:string
    enumSituacao:Situacao;
    Ano?: string;       // ✅ nova propriedade opcional

    constructor(titulo: string, dataInicio: Date, dataFim:Date, descricao:string, enumSituacao:Situacao){
        this.titulo = titulo;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.descricao = descricao;
        this.enumSituacao = enumSituacao;
    }
}
