export class Agenda {
    Titulo:string;
    DataInicio:Date;
    DataFim:Date;
    Descricao:string
    enumSituacao:Situacao;

    constructor(titulo: string, dataInicio: Date, dataFim:Date, descricao:string, enumSituacao:Situacao){
        this.Titulo = titulo;
        this.DataInicio = dataInicio;
        this.DataFim = dataFim;
        this.Descricao = descricao;
        this.enumSituacao = enumSituacao;
    }
}
