import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import {
  Truck, DollarSign, Fuel, TrendingUp, Wrench, MapPin,
  Plus, AlertTriangle, CheckCircle, Clock, Users,
  ArrowUpRight, ArrowDownRight, Activity, Search, Eye,
  Calendar, BarChart3, Route, X, Edit3, Trash2, Save, ChevronDown
} from "lucide-react";

// ─── PERSISTENT STORAGE ──────────────────────────────────────────────────────

const STORAGE_KEYS = { caminhoes: "tf_caminhoes", viagens: "tf_viagens" };

function loadData(key, fallback = []) {
  try {
    const raw = window.localStorage?.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveData(key, data) {
  try { window.localStorage?.setItem(key, JSON.stringify(data)); } catch {}
}

// ─── DEFAULT DATA ────────────────────────────────────────────────────────────

const DEFAULT_CAMINHOES = [
  { id: "c1", placa: "QRN-4A21", modelo: "Scania R450", ano: 2021, motorista: "Zé Carlos" },
  { id: "c2", placa: "RJK-8B35", modelo: "Volvo FH 540", ano: 2022, motorista: "Toninho" },
  { id: "c3", placa: "MXP-2C47", modelo: "Mercedes Actros", ano: 2020, motorista: "Gilberto" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
const fmtK = (v) => Number(v) >= 1000 ? `R$ ${(Number(v) / 1000).toFixed(1)}k` : fmt(v);
const genId = () => Math.random().toString(36).substr(2, 9);
const today = () => new Date().toISOString().split("T")[0];

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function KPI({ icon: Icon, label, value, sub, trend, up, accent }) {
  return (
    <div style={{ background: "var(--card)", borderRadius: 14, padding: "18px 20px", border: "1px solid var(--bdr)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -15, right: -15, width: 60, height: 60, borderRadius: "50%", background: accent || "rgba(245,158,11,0.06)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accent || "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color="#f59e0b" />
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: -1 }}>{value}</div>
      {sub && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
          {trend && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: up ? "#22c55e" : "#ef4444" }}>
              {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{trend}
            </span>
          )}
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{sub}</span>
        </div>
      )}
    </div>
  );
}

function Section({ children, icon: Icon, title, action }) {
  return (
    <div style={{ background: "var(--card)", borderRadius: 16, padding: 22, border: "1px solid var(--bdr)", marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Icon && <Icon size={18} color="#f59e0b" />}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    concluida: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Concluída" },
    em_andamento: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", label: "Em Andamento" },
    agendada: { bg: "rgba(168,162,158,0.12)", color: "#a8a29e", label: "Agendada" },
    cancelada: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", label: "Cancelada" },
    Recebido: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Recebido" },
    Pendente: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "Pendente" },
    Faturado: { bg: "rgba(129,140,248,0.12)", color: "#818cf8", label: "Faturado" },
    Atrasado: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", label: "Atrasado" },
  };
  const s = map[status] || { bg: "rgba(148,163,184,0.12)", color: "#94a3b8", label: status };
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>;
}

function Btn({ children, onClick, variant = "primary", icon: Icon, disabled, style: extra }) {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", cursor: disabled ? "default" : "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s", opacity: disabled ? 0.5 : 1, ...extra };
  const styles = {
    primary: { ...base, background: "#f59e0b", color: "#0a0d11" },
    danger: { ...base, background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" },
    ghost: { ...base, background: "transparent", color: "var(--muted)", border: "1px solid var(--bdr)" },
  };
  return <button onClick={disabled ? undefined : onClick} style={styles[variant]}>{Icon && <Icon size={14} />}{children}</button>;
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--bdr)",
  background: "var(--bg)", color: "var(--text)", fontSize: 13, boxSizing: "border-box", outline: "none",
};

const selectStyle = { ...inputStyle, cursor: "pointer" };

// ─── MODAL ───────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderRadius: 20, padding: 28, width: "92%", maxWidth: wide ? 640 : 480, border: "1px solid var(--bdr)", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── CAMINHÕES TAB ───────────────────────────────────────────────────────────

function CaminhoesTab({ caminhoes, setCaminhoes }) {
  const [modal, setModal] = useState(null); // null | "novo" | caminhao obj
  const [form, setForm] = useState({ placa: "", modelo: "", ano: "", motorista: "" });

  const openNovo = () => { setForm({ placa: "", modelo: "", ano: new Date().getFullYear(), motorista: "" }); setModal("novo"); };
  const openEdit = (c) => { setForm({ ...c }); setModal(c); };

  const salvar = () => {
    if (!form.placa || !form.motorista) return;
    if (modal === "novo") {
      const novo = { ...form, id: genId(), ano: Number(form.ano) };
      const next = [...caminhoes, novo];
      setCaminhoes(next); saveData(STORAGE_KEYS.caminhoes, next);
    } else {
      const next = caminhoes.map(c => c.id === form.id ? { ...form, ano: Number(form.ano) } : c);
      setCaminhoes(next); saveData(STORAGE_KEYS.caminhoes, next);
    }
    setModal(null);
  };

  const excluir = (id) => {
    if (!confirm("Tem certeza que quer excluir este caminhão?")) return;
    const next = caminhoes.filter(c => c.id !== id);
    setCaminhoes(next); saveData(STORAGE_KEYS.caminhoes, next);
    setModal(null);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>{caminhoes.length} caminhão(ões) cadastrado(s)</div>
        <Btn onClick={openNovo} icon={Plus}>Novo Caminhão</Btn>
      </div>

      {caminhoes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
          <Truck size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Nenhum caminhão cadastrado</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Comece cadastrando os caminhões da frota</div>
          <Btn onClick={openNovo} icon={Plus}>Cadastrar Primeiro Caminhão</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {caminhoes.map(c => (
            <div key={c.id} style={{ background: "var(--card)", borderRadius: 14, padding: 18, border: "1px solid var(--bdr)", cursor: "pointer" }} onClick={() => openEdit(c)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: "monospace" }}>{c.placa}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{c.modelo} · {c.ano}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>Motorista: <b style={{ color: "var(--text)" }}>{c.motorista}</b></div>
                </div>
                <Truck size={20} color="#f59e0b" />
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === "novo" ? "Novo Caminhão" : "Editar Caminhão"} onClose={() => setModal(null)}>
          <Field label="Placa *">
            <input style={inputStyle} value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })} placeholder="ABC-1D23" maxLength={8} />
          </Field>
          <Field label="Modelo">
            <input style={inputStyle} value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} placeholder="Scania R450" />
          </Field>
          <Field label="Ano">
            <input style={inputStyle} type="number" value={form.ano} onChange={e => setForm({ ...form, ano: e.target.value })} />
          </Field>
          <Field label="Motorista *">
            <input style={inputStyle} value={form.motorista} onChange={e => setForm({ ...form, motorista: e.target.value })} placeholder="Nome do motorista" />
          </Field>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {modal !== "novo" && <Btn variant="danger" onClick={() => excluir(form.id)} icon={Trash2}>Excluir</Btn>}
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={salvar} icon={Save} disabled={!form.placa || !form.motorista}>Salvar</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── VIAGENS TAB ─────────────────────────────────────────────────────────────

const EMPTY_VIAGEM = {
  data: "", caminhaoId: "", cliente: "", origem: "", destino: "", distKm: "",
  tipoCarga: "Chapas de Granito", pesoTon: "", tipoFrete: "Próprio",
  valorFrete: "", custoDiesel: "", custoPedagio: "", custoManutencao: "", custoMotorista: "", custoOutros: "",
  statusViagem: "agendada", statusPgto: "Pendente", obs: "",
};

function ViagemForm({ form, setForm, caminhoes }) {
  const custoTotal = [form.custoDiesel, form.custoPedagio, form.custoManutencao, form.custoMotorista, form.custoOutros]
    .reduce((s, v) => s + (Number(v) || 0), 0);
  const lucro = (Number(form.valorFrete) || 0) - custoTotal;
  const margem = Number(form.valorFrete) > 0 ? ((lucro / Number(form.valorFrete)) * 100).toFixed(1) : "0.0";

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Data *">
          <input style={inputStyle} type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
        </Field>
        <Field label="Caminhão *">
          <select style={selectStyle} value={form.caminhaoId} onChange={e => setForm({ ...form, caminhaoId: e.target.value })}>
            <option value="">Selecionar...</option>
            {caminhoes.map(c => <option key={c.id} value={c.id}>{c.placa} — {c.motorista}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Cliente">
        <input style={inputStyle} value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} placeholder="Nome do cliente" />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Origem">
          <input style={inputStyle} value={form.origem} onChange={e => setForm({ ...form, origem: e.target.value })} placeholder="Cachoeiro/ES" />
        </Field>
        <Field label="Destino">
          <input style={inputStyle} value={form.destino} onChange={e => setForm({ ...form, destino: e.target.value })} placeholder="São Paulo/SP" />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Distância (km)">
          <input style={inputStyle} type="number" value={form.distKm} onChange={e => setForm({ ...form, distKm: e.target.value })} placeholder="830" />
        </Field>
        <Field label="Tipo de Carga">
          <select style={selectStyle} value={form.tipoCarga} onChange={e => setForm({ ...form, tipoCarga: e.target.value })}>
            {["Chapas de Granito", "Blocos de Granito", "Granito Beneficiado", "Carga Geral"].map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Peso (toneladas)">
          <input style={inputStyle} type="number" value={form.pesoTon} onChange={e => setForm({ ...form, pesoTon: e.target.value })} placeholder="25" />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Tipo de Frete">
          <select style={selectStyle} value={form.tipoFrete} onChange={e => setForm({ ...form, tipoFrete: e.target.value })}>
            <option>Próprio</option><option>Agregado</option>
          </select>
        </Field>
        <Field label="Valor do Frete (R$) *">
          <input style={{ ...inputStyle, fontWeight: 700, fontSize: 16, color: "#f59e0b" }} type="number" value={form.valorFrete} onChange={e => setForm({ ...form, valorFrete: e.target.value })} placeholder="5000" />
        </Field>
      </div>

      {/* Custos */}
      <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, marginTop: 8, marginBottom: 8, border: "1px solid var(--bdr)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Custos da Viagem</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Field label="Diesel (R$)">
            <input style={inputStyle} type="number" value={form.custoDiesel} onChange={e => setForm({ ...form, custoDiesel: e.target.value })} placeholder="2500" />
          </Field>
          <Field label="Pedágio (R$)">
            <input style={inputStyle} type="number" value={form.custoPedagio} onChange={e => setForm({ ...form, custoPedagio: e.target.value })} placeholder="350" />
          </Field>
          <Field label="Manutenção (R$)">
            <input style={inputStyle} type="number" value={form.custoManutencao} onChange={e => setForm({ ...form, custoManutencao: e.target.value })} placeholder="200" />
          </Field>
          <Field label="Motorista (R$)">
            <input style={inputStyle} type="number" value={form.custoMotorista} onChange={e => setForm({ ...form, custoMotorista: e.target.value })} placeholder="400" />
          </Field>
          <Field label="Outros (R$)">
            <input style={inputStyle} type="number" value={form.custoOutros} onChange={e => setForm({ ...form, custoOutros: e.target.value })} placeholder="0" />
          </Field>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "var(--card)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Custos</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{fmt(custoTotal)}</div>
          </div>
        </div>
      </div>

      {/* Lucro Preview */}
      <div style={{ display: "flex", gap: 12, marginTop: 4, marginBottom: 8 }}>
        <div style={{ flex: 1, background: lucro >= 0 ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${lucro >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Lucro Líquido</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: lucro >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(lucro)}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Margem: {margem}%</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Status da Viagem">
          <select style={selectStyle} value={form.statusViagem} onChange={e => setForm({ ...form, statusViagem: e.target.value })}>
            <option value="agendada">Agendada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </Field>
        <Field label="Status Pagamento">
          <select style={selectStyle} value={form.statusPgto} onChange={e => setForm({ ...form, statusPgto: e.target.value })}>
            <option>Pendente</option><option>Faturado</option><option>Recebido</option><option>Atrasado</option>
          </select>
        </Field>
      </div>

      <Field label="Observações">
        <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.obs} onChange={e => setForm({ ...form, obs: e.target.value })} placeholder="Anotações opcionais..." />
      </Field>
    </>
  );
}

function ViagensTab({ viagens, setViagens, caminhoes }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_VIAGEM);
  const [search, setSearch] = useState("");
  const [detalhe, setDetalhe] = useState(null);

  const openNovo = () => { setForm({ ...EMPTY_VIAGEM, data: today() }); setModal("novo"); };
  const openEdit = (v) => { setForm({ ...v }); setModal("edit"); };

  const salvar = () => {
    if (!form.data || !form.caminhaoId || !form.valorFrete) return;
    const custoTotal = [form.custoDiesel, form.custoPedagio, form.custoManutencao, form.custoMotorista, form.custoOutros]
      .reduce((s, v) => s + (Number(v) || 0), 0);
    const lucro = (Number(form.valorFrete) || 0) - custoTotal;
    const entry = { ...form, custoTotal, lucro, margemPct: Number(form.valorFrete) > 0 ? ((lucro / Number(form.valorFrete)) * 100).toFixed(1) : "0.0" };

    let next;
    if (modal === "novo") {
      next = [{ ...entry, id: genId() }, ...viagens];
    } else {
      next = viagens.map(v => v.id === form.id ? entry : v);
    }
    setViagens(next); saveData(STORAGE_KEYS.viagens, next);
    setModal(null);
  };

  const excluir = (id) => {
    if (!confirm("Excluir esta viagem?")) return;
    const next = viagens.filter(v => v.id !== id);
    setViagens(next); saveData(STORAGE_KEYS.viagens, next);
    setModal(null); setDetalhe(null);
  };

  const getCam = (id) => caminhoes.find(c => c.id === id) || { placa: "—", motorista: "—" };

  const filtrado = viagens.filter(v => {
    if (!search) return true;
    const cam = getCam(v.caminhaoId);
    const s = search.toLowerCase();
    return cam.placa.toLowerCase().includes(s) || cam.motorista.toLowerCase().includes(s) || (v.cliente || "").toLowerCase().includes(s) || (v.origem || "").toLowerCase().includes(s) || (v.destino || "").toLowerCase().includes(s);
  });

  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "var(--card)", borderRadius: 10, padding: "8px 14px", border: "1px solid var(--bdr)" }}>
          <Search size={15} color="var(--muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar placa, cliente, motorista, cidade..." style={{ background: "none", border: "none", color: "var(--text)", fontSize: 13, flex: 1, outline: "none" }} />
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{filtrado.length} viagem(ns)</span>
        <Btn onClick={openNovo} icon={Plus}>Nova Viagem</Btn>
      </div>

      {viagens.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
          <Route size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Nenhuma viagem registrada</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Registre a primeira viagem pra começar a acompanhar tudo</div>
          <Btn onClick={openNovo} icon={Plus}>Registrar Primeira Viagem</Btn>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--bdr)" }}>
                {["Data", "Placa", "Motorista", "Rota", "Cliente", "Frete", "Valor", "Custos", "Lucro", "Margem", "Status", "Pgto", ""].map(h =>
                  <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtrado.map(v => {
                const cam = getCam(v.caminhaoId);
                const lucro = Number(v.lucro) || ((Number(v.valorFrete) || 0) - (Number(v.custoTotal) || 0));
                return (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--bdr)", cursor: "pointer" }} onClick={() => openEdit(v)}>
                    <td style={{ padding: "10px 8px", color: "var(--muted)", whiteSpace: "nowrap" }}>{v.data ? v.data.split("-").reverse().join("/") : "—"}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>{cam.placa}</td>
                    <td style={{ padding: "10px 8px", color: "var(--text)" }}>{cam.motorista}</td>
                    <td style={{ padding: "10px 8px", color: "var(--muted)", fontSize: 11 }}>{v.origem || "—"}<br />→ {v.destino || "—"}</td>
                    <td style={{ padding: "10px 8px", color: "var(--text)" }}>{v.cliente || "—"}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: v.tipoFrete === "Próprio" ? "rgba(245,158,11,0.1)" : "rgba(129,140,248,0.1)", color: v.tipoFrete === "Próprio" ? "#f59e0b" : "#818cf8" }}>{v.tipoFrete}</span>
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--text)" }}>{fmtK(v.valorFrete)}</td>
                    <td style={{ padding: "10px 8px", color: "#ef4444", fontWeight: 600 }}>{fmtK(v.custoTotal)}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 800, color: lucro >= 0 ? "#22c55e" : "#ef4444" }}>{fmtK(lucro)}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: parseFloat(v.margemPct) >= 30 ? "#22c55e" : parseFloat(v.margemPct) >= 15 ? "#fbbf24" : "#ef4444" }}>{v.margemPct || 0}%</td>
                    <td style={{ padding: "10px 8px" }}><StatusBadge status={v.statusViagem} /></td>
                    <td style={{ padding: "10px 8px" }}><StatusBadge status={v.statusPgto} /></td>
                    <td style={{ padding: "10px 8px" }}><Edit3 size={14} color="var(--muted)" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal === "novo" ? "Nova Viagem" : "Editar Viagem"} onClose={() => setModal(null)} wide>
          <ViagemForm form={form} setForm={setForm} caminhoes={caminhoes} />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {modal !== "novo" && <Btn variant="danger" onClick={() => excluir(form.id)} icon={Trash2}>Excluir</Btn>}
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={salvar} icon={Save} disabled={!form.data || !form.caminhaoId || !form.valorFrete}>Salvar Viagem</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── DASHBOARD TAB ───────────────────────────────────────────────────────────

function DashboardTab({ viagens, caminhoes }) {
  const ativas = useMemo(() => viagens.filter(v => v.statusViagem !== "cancelada"), [viagens]);

  const totais = useMemo(() => {
    const fat = ativas.reduce((s, v) => s + (Number(v.valorFrete) || 0), 0);
    const custo = ativas.reduce((s, v) => s + (Number(v.custoTotal) || 0), 0);
    const lucro = fat - custo;
    const diesel = ativas.reduce((s, v) => s + (Number(v.custoDiesel) || 0), 0);
    const pedagio = ativas.reduce((s, v) => s + (Number(v.custoPedagio) || 0), 0);
    const manut = ativas.reduce((s, v) => s + (Number(v.custoManutencao) || 0), 0);
    const motorista = ativas.reduce((s, v) => s + (Number(v.custoMotorista) || 0), 0);
    const atrasado = viagens.filter(v => v.statusPgto === "Atrasado").reduce((s, v) => s + (Number(v.valorFrete) || 0), 0);
    const pendente = viagens.filter(v => v.statusPgto === "Pendente").reduce((s, v) => s + (Number(v.valorFrete) || 0), 0);
    const margem = fat > 0 ? ((lucro / fat) * 100).toFixed(1) : "0";
    return { fat, custo, lucro, diesel, pedagio, manut, motorista, atrasado, pendente, margem, total: ativas.length };
  }, [ativas, viagens]);

  const porCliente = useMemo(() => {
    const map = {};
    ativas.forEach(v => { const c = v.cliente || "Sem cliente"; if (!map[c]) map[c] = { name: c, value: 0 }; map[c].value += Number(v.valorFrete) || 0; });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [ativas]);

  const custoPie = useMemo(() => [
    { name: "Diesel", value: totais.diesel },
    { name: "Pedágio", value: totais.pedagio },
    { name: "Manutenção", value: totais.manut },
    { name: "Motorista", value: totais.motorista },
  ].filter(c => c.value > 0), [totais]);

  const CORES_PIE = ["#f59e0b", "#3b82f6", "#ef4444", "#22c55e"];
  const CORES_CLIENTE = ["#f59e0b", "#fb923c", "#fbbf24", "#22c55e", "#3b82f6", "#818cf8", "#ec4899", "#8b5cf6"];

  const fluxoDiario = useMemo(() => {
    const map = {};
    ativas.forEach(v => {
      if (!v.data) return;
      const d = parseInt(v.data.split("-")[2]);
      if (!map[d]) map[d] = { dia: d, receita: 0, custo: 0 };
      map[d].receita += Number(v.valorFrete) || 0;
      map[d].custo += Number(v.custoTotal) || 0;
    });
    const max = Math.max(...Object.keys(map).map(Number), 28);
    return Array.from({ length: max }, (_, i) => map[i + 1] || { dia: i + 1, receita: 0, custo: 0 });
  }, [ativas]);

  if (viagens.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
        <BarChart3 size={56} style={{ marginBottom: 16, opacity: 0.3 }} />
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>Dashboard vazio</div>
        <div style={{ fontSize: 14 }}>Cadastre caminhões e registre viagens para ver os dados aqui.</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: 14, marginBottom: 22 }}>
        <KPI icon={DollarSign} label="Faturamento" value={fmt(totais.fat)} sub={`${totais.total} viagens`} />
        <KPI icon={TrendingUp} label="Lucro Líquido" value={fmt(totais.lucro)} sub={`Margem ${totais.margem}%`} accent="rgba(34,197,94,0.1)" />
        <KPI icon={Fuel} label="Gastos Totais" value={fmt(totais.custo)} sub={`Diesel: ${fmt(totais.diesel)}`} />
        <KPI icon={AlertTriangle} label="A Receber" value={fmt(totais.atrasado + totais.pendente)} sub={`${fmt(totais.atrasado)} atrasado`} accent="rgba(239,68,68,0.08)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
        <Section icon={Activity} title="Fluxo Diário">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={fluxoDiario}>
              <defs>
                <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="receita" stroke="#f59e0b" strokeWidth={2} fill="url(#gR2)" name="Receita" />
              <Area type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={2} fill="rgba(239,68,68,0.06)" name="Custos" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        {custoPie.length > 0 && (
          <Section icon={Fuel} title="Composição de Custos">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={custoPie} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {custoPie.map((_, i) => <Cell key={i} fill={CORES_PIE[i]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Section>
        )}
      </div>

      {porCliente.length > 0 && (
        <Section icon={Users} title="Faturamento por Cliente">
          <ResponsiveContainer width="100%" height={Math.max(160, porCliente.length * 40)}>
            <BarChart data={porCliente} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text)" }} width={150} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Faturamento">
                {porCliente.map((_, i) => <Cell key={i} fill={CORES_CLIENTE[i % CORES_CLIENTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* Resumo por Caminhão */}
      <Section icon={Truck} title="Resumo por Caminhão">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--bdr)" }}>
                {["Placa", "Motorista", "Viagens", "Faturamento", "Custos", "Lucro", "Margem"].map(h =>
                  <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {caminhoes.map(c => {
                const cv = ativas.filter(v => v.caminhaoId === c.id);
                const fat = cv.reduce((s, v) => s + (Number(v.valorFrete) || 0), 0);
                const cust = cv.reduce((s, v) => s + (Number(v.custoTotal) || 0), 0);
                const luc = fat - cust;
                const mg = fat > 0 ? ((luc / fat) * 100).toFixed(1) : "0";
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--bdr)" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>{c.placa}</td>
                    <td style={{ padding: "10px 8px", color: "var(--text)" }}>{c.motorista}</td>
                    <td style={{ padding: "10px 8px", color: "var(--muted)" }}>{cv.length}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--text)" }}>{fmt(fat)}</td>
                    <td style={{ padding: "10px 8px", color: "#ef4444", fontWeight: 600 }}>{fmt(cust)}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 800, color: luc >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(luc)}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: parseFloat(mg) >= 30 ? "#22c55e" : "#fbbf24" }}>{mg}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

// ─── FINANCEIRO TAB ──────────────────────────────────────────────────────────

function FinanceiroTab({ viagens }) {
  const ativas = viagens.filter(v => v.statusViagem !== "cancelada");
  const totais = useMemo(() => ({
    recebido: ativas.filter(v => v.statusPgto === "Recebido").reduce((s, v) => s + (Number(v.valorFrete) || 0), 0),
    faturado: ativas.filter(v => v.statusPgto === "Faturado").reduce((s, v) => s + (Number(v.valorFrete) || 0), 0),
    pendente: ativas.filter(v => v.statusPgto === "Pendente").reduce((s, v) => s + (Number(v.valorFrete) || 0), 0),
    atrasado: ativas.filter(v => v.statusPgto === "Atrasado").reduce((s, v) => s + (Number(v.valorFrete) || 0), 0),
  }), [ativas]);

  const atrasados = ativas.filter(v => v.statusPgto === "Atrasado");

  if (viagens.length === 0) {
    return <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}><div style={{ fontSize: 16, fontWeight: 600 }}>Registre viagens para ver o financeiro</div></div>;
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: 14, marginBottom: 22 }}>
        <KPI icon={CheckCircle} label="Recebido" value={fmt(totais.recebido)} accent="rgba(34,197,94,0.1)" />
        <KPI icon={Calendar} label="Faturado" value={fmt(totais.faturado)} accent="rgba(129,140,248,0.1)" />
        <KPI icon={Clock} label="Pendente" value={fmt(totais.pendente)} />
        <KPI icon={AlertTriangle} label="Atrasado" value={fmt(totais.atrasado)} sub={`${atrasados.length} viagens`} accent="rgba(239,68,68,0.08)" />
      </div>

      {atrasados.length > 0 && (
        <Section icon={AlertTriangle} title="Cobranças Atrasadas">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {atrasados.map(v => (
              <div key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{v.cliente || "Sem cliente"}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{v.data ? v.data.split("-").reverse().join("/") : ""} · {v.origem || ""} → {v.destino || ""}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{fmt(v.valorFrete)}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Próprio vs Agregado */}
      <Section icon={TrendingUp} title="Próprio vs Agregado">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {["Próprio", "Agregado"].map(tipo => {
            const tv = ativas.filter(v => v.tipoFrete === tipo);
            const fat = tv.reduce((s, v) => s + (Number(v.valorFrete) || 0), 0);
            const cust = tv.reduce((s, v) => s + (Number(v.custoTotal) || 0), 0);
            const luc = fat - cust;
            return (
              <div key={tipo} style={{ background: "var(--bg)", borderRadius: 14, padding: 18, border: `1px solid ${tipo === "Próprio" ? "rgba(245,158,11,0.2)" : "rgba(129,140,248,0.2)"}` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: tipo === "Próprio" ? "#f59e0b" : "#818cf8", marginBottom: 12 }}>Frete {tipo}</div>
                {[
                  { l: "Viagens", v: tv.length },
                  { l: "Faturamento", v: fmt(fat) },
                  { l: "Custos", v: fmt(cust) },
                  { l: "Lucro", v: fmt(luc), c: luc >= 0 ? "#22c55e" : "#ef4444", bold: true },
                  { l: "Margem", v: fat > 0 ? `${((luc / fat) * 100).toFixed(1)}%` : "0%", c: (luc / fat) >= 0.3 ? "#22c55e" : "#fbbf24" },
                ].map(r => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--bdr)" }}>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{r.l}</span>
                    <span style={{ fontSize: 13, fontWeight: r.bold ? 800 : 600, color: r.c || "var(--text)" }}>{r.v}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [caminhoes, setCaminhoes] = useState(() => loadData(STORAGE_KEYS.caminhoes, DEFAULT_CAMINHOES));
  const [viagens, setViagens] = useState(() => loadData(STORAGE_KEYS.viagens, []));

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "viagens", label: "Viagens", icon: Route },
    { key: "caminhoes", label: "Caminhões", icon: Truck },
    { key: "financeiro", label: "Financeiro", icon: DollarSign },
  ];

  return (
    <div style={{
      "--bg": "#0a0d11", "--card": "#11151c", "--bdr": "#1a1f2b", "--text": "#e8e4df", "--muted": "#6b7280",
      fontFamily: "'Outfit', 'Segoe UI', sans-serif", background: "var(--bg)", minHeight: "100vh", color: "var(--text)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a1f2b; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: #4b5563; }
      `}</style>

      <div style={{
        padding: "14px 24px", borderBottom: "1px solid var(--bdr)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        background: "linear-gradient(180deg, rgba(245,158,11,0.03) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(245,158,11,0.25)" }}>
            <Truck size={19} color="#0a0d11" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "var(--text)", letterSpacing: -0.5 }}>TransportaFlow</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Gestão de Frota & Frete — Granitos</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 3, background: "var(--card)", borderRadius: 10, padding: 3, border: "1px solid var(--bdr)" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 7,
              border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s", whiteSpace: "nowrap",
              background: tab === t.key ? "#f59e0b" : "transparent",
              color: tab === t.key ? "#0a0d11" : "var(--muted)",
            }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
        {tab === "dashboard" && <DashboardTab viagens={viagens} caminhoes={caminhoes} />}
        {tab === "viagens" && <ViagensTab viagens={viagens} setViagens={setViagens} caminhoes={caminhoes} />}
        {tab === "caminhoes" && <CaminhoesTab caminhoes={caminhoes} setCaminhoes={setCaminhoes} />}
        {tab === "financeiro" && <FinanceiroTab viagens={viagens} />}
      </div>
    </div>
  );
}
