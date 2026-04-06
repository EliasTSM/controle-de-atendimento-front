import { useEffect, useState, type SetStateAction } from "react";
import { api } from "../services/api";
import type { TipoAtendimento, Atendimento } from "../types/Atendimento";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale";

registerLocale("pt-BR", ptBR);

type Props = {
  atendimentoEditando?: Atendimento;
  onAtualizado?: () => void;
};

export default function Form({ atendimentoEditando, onAtualizado }: Props) {
  const [tipo, setTipo] = useState<TipoAtendimento>("Lobuloplastia");
  const [dataProcedimento, setDataProcedimento] = useState<Date | null>(null);
  const [quantidade, setQuantidade] = useState(1);

  const [joias, setJoias] = useState<(number | "")[]>([]);
  const [valorProcedimento, setValorProcedimento] = useState<number | "">(160);
  const [observacoes, setObservacoes] = useState("");

  const [loading, setLoading] = useState(false);

  const valoresBase: Record<TipoAtendimento, number> = {
    "Lobuloplastia": 160,
    "Perfuração adulto": 100,
    "Perfuração infantil": 120,
    "Remoção de sinais": 120,
  };

  useEffect(() => {
    if (atendimentoEditando) {
      setTipo(atendimentoEditando.tipo);
      setValorProcedimento(atendimentoEditando.valorProcedimento);
      setQuantidade(atendimentoEditando.quantidadePerfuroes || 1);
      setJoias(atendimentoEditando.joias || []);
      setObservacoes(atendimentoEditando.observacoes || "");

      if (atendimentoEditando.dataProcedimento) {
        setDataProcedimento(new Date(atendimentoEditando.dataProcedimento));
      }
    }
  }, [atendimentoEditando]);

  const handleTipoChange = (novoTipo: TipoAtendimento) => {
    setTipo(novoTipo);
    setValorProcedimento(valoresBase[novoTipo]);
  };

  const addJoia = () => setJoias([...joias, ""]);

  const removeJoia = (index: number) => {
    setJoias(joias.filter((_, i) => i !== index));
  };

  const updateJoia = (index: number, value: string) => {
    const nova = [...joias];
    nova[index] = value === "" ? "" : Number(value);
    setJoias(nova);
  };

  const calcularJoias = () => {
    return joias.reduce<number>(
      (acc, j) => acc + (typeof j === "number" ? j : 0),
      0
    );
  };

  const calcularTotal = () => {
    const valorBase =
      typeof valorProcedimento === "number" ? valorProcedimento : 0;

    const totalProcedimento = valorBase;

    return totalProcedimento + calcularJoias();
  };

  const formatarParaAPI = (data: Date | null) => {
    if (!data) return "";
    return data.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      tipo,
      dataProcedimento: formatarParaAPI(dataProcedimento),
      quantidadePerfuroes: quantidade,
      joias: joias.filter((j) => j !== "").map((j) => Number(j)),
      valorProcedimento:
        valorProcedimento === "" ? 0 : valorProcedimento,
      valorJoias: calcularJoias(),
      custoTotal: calcularTotal(),
      observacoes,
    };

    try {
      setLoading(true);

      if (atendimentoEditando) {
        await api.put(`/atendimento/${atendimentoEditando._id}`, data);
        alert("Atualizado com sucesso!");
      } else {
        await api.post("/atendimento", data);
        alert("Salvo com sucesso!");
      }

      onAtualizado && onAtualizado();

      setTipo("Lobuloplastia");
      setValorProcedimento(160);
      setDataProcedimento(null);
      setQuantidade(1);
      setJoias([]);
      setObservacoes("");
    } catch {
      alert("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{atendimentoEditando ? "Editar Atendimento" : "Novo Atendimento"}</h2>

      <label>Tipo</label>
      <select value={tipo} onChange={(e) => handleTipoChange(e.target.value as TipoAtendimento)}>
        <option>Lobuloplastia</option>
        <option>Perfuração adulto</option>
        <option>Perfuração infantil</option>
        <option>Remoção de sinais</option>
      </select>

      <label>Valor</label>
      <input
        type="number"
        value={valorProcedimento}
        onChange={(e) =>
          setValorProcedimento(e.target.value === "" ? "" : Number(e.target.value))
        }
      />

      <label>Data</label>
      <DatePicker
        selected={dataProcedimento}
        onChange={(date: SetStateAction<Date | null>) => setDataProcedimento(date)}
        locale="pt-BR"
        dateFormat="dd/MM/yyyy"
        className="input"
      />

      {tipo === "Perfuração adulto" && (
        <>
          <label>Quantidade</label>
          <input type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
        </>
      )}

      <label>Joias</label>
      {joias.map((j, i) => (
        <div key={i} className="joia-item">
          <input
            type="number"
            value={j}
            onChange={(e) => updateJoia(i, e.target.value)}
          />
          <button type="button" onClick={() => removeJoia(i)}>✕</button>
        </div>
      ))}

      <button type="button" onClick={addJoia}>+ Joia</button>

      <label>Observações</label>
      <textarea  placeholder="Ex: cliente pediu desconto, retorno, etc..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />

      <h3>Total: R$ {calcularTotal()}</h3>

      <button type="submit">
        {loading ? "Salvando..." : atendimentoEditando ? "Atualizar" : "Salvar"}
      </button>

      {atendimentoEditando && (
        <button type="button" onClick={onAtualizado}>
          Cancelar
        </button>
      )}
    </form>
  );
}