export type TipoAtendimento =
  | "Lobuloplastia"
  | "Perfuração adulto"
  | "Perfuração infantil"
  | "Remoção de sinais";

export interface Atendimento {
  _id?: string;
  tipo: TipoAtendimento;
  dataProcedimento: string;
  dataRecebimento: string;
  quantidadePerfuroes?: number;
  joias: number[];
  valorProcedimento: number;
  valorJoias?: number;
  custoTotal: number;
  observacoes?: string;
}