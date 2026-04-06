import { useEffect, useState, type SetStateAction } from "react";
import { api } from "../services/api";
import type { Atendimento } from "../types/Atendimento";
import Form from "./Form";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale";

registerLocale("pt-BR", ptBR);

export default function List() {
  const [dados, setDados] = useState<Atendimento[]>([]);
  const [editando, setEditando] = useState<Atendimento | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<Date | null>(null);

  const load = async () => {
    const res = await api.get("/atendimento");
    setDados(res.data);
  };

  const remove = async (id: string) => {
    await api.delete(`/atendimento/${id}`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  const formatarDataBR = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const filtrados = dados.filter((d) => {
    if (!mesSelecionado) return true;

    const data = new Date(d.dataProcedimento);

    return (
      data.getMonth() === mesSelecionado.getMonth() &&
      data.getFullYear() === mesSelecionado.getFullYear()
    );
  });

  return (
    <div>
      {editando && (
        <Form
          atendimentoEditando={editando}
          onAtualizado={() => {
            setEditando(null);
            load();
          }}
        />
      )}

      {!editando && (
        <>
          <label>Filtrar por mês</label>

          <DatePicker
            selected={mesSelecionado}
            onChange={(date: SetStateAction<Date | null>) => setMesSelecionado(date)}
            showMonthYearPicker
            locale="pt-BR"
            dateFormat="MM/yyyy"
            placeholderText="Selecione o mês"
            className="input"
          />

          {mesSelecionado && (
            <p>
              📅{" "}
              {mesSelecionado.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {filtrados.length === 0 && (
            <p>Nenhum atendimento encontrado.</p>
          )}

          {filtrados.map((d) => (
            <div key={d._id} className="card">
              <h3>{d.tipo}</h3>

              <p>📅 {formatarDataBR(d.dataProcedimento)}</p>

              <p>
                💼 Serviço:{" "}
                {d.valorProcedimento?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              
              <p>
                💎 Joias:{" "}
                {(d.valorJoias || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              
              <p>
                💰 Total:{" "}
                {d.custoTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>

              {d.observacoes && <p>📝 {d.observacoes}</p>}

              <div className="actions">
                <button onClick={() => setEditando(d)}>Editar</button>
                <button onClick={() => remove(d._id!)}>Excluir</button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}