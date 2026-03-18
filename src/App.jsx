import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import {
  Truck, DollarSign, Fuel, TrendingUp, TrendingDown, Wrench, MapPin,
  Plus, ChevronRight, AlertTriangle, CheckCircle, Clock, Package,
  Users, ArrowUpRight, ArrowDownRight, Activity, Eye, Search, Filter,
  Calendar, FileText, Settings, BarChart3, Route, Weight, X
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const CAMINHOES = [
  { id: 1, placa: "QRN-4A21", modelo: "Scania R450", ano: 2021, motorista: "Zé Carlos", status: "em_viagem", km: 312400 },
  { id: 2, placa: "RJK-8B35", modelo: "Volvo FH 540", ano: 2022, motorista: "Toninho", status: "em_viagem", km: 198700 },
  { id: 3, placa: "MXP-2C47", modelo: "Mercedes Actros", ano: 2020, motorista: "Gilberto", status: "disponivel", km: 445200 },
  { id: 4, placa: "PLK-6D53", modelo: "Scania R500", ano: 2019, motorista: "Reginaldo", status: "manutencao", km: 520800 },
  { id: 5, placa: "NVH-3E69", modelo: "DAF XF", ano: 2023, motorista: "Marcos", status: "em_viagem", km: 87600 },
  { id: 6, placa: "SKT-1F72", modelo: "Volvo FH 460", ano: 2020, motorista: "Adriano", status: "disponivel", km: 398100 },
  { id: 7, placa: "BXR-9G88", modelo: "Scania R450", ano: 2021, motorista: "Wellington", status: "em_viagem", km: 278300 },
  { id: 8, placa: "JDM-5H94", modelo: "Mercedes Actros", ano: 2022, motorista: "Paulo", status: "disponivel", km: 156400 },
  { id: 9, placa: "WFN-7I06", modelo: "Volvo FH 540", ano: 2018, motorista: "Roberto", status: "em_viagem", km: 612500 },
  { id: 10, placa: "HCL-4J18", modelo: "Scania R500", ano: 2023, motorista: "Fernando", status: "em_viagem", km: 64200 },
  { id: 11, placa: "TQA-8K24", modelo: "DAF XF", ano: 2021, motorista: "Sérgio", status: "disponivel", km: 345600 },
  { id: 12, placa: "GRP-2L30", modelo: "Scania R450", ano: 2020, motorista: "Luciano", status: "em_viagem", km: 478900 },
];

const CLIENTES = [
  "Granitos Caxias", "Marmoraria Vitória", "Pedras Brasil Export", "Graniforth ES",
  "Stone Group", "Mineração Atlântica", "Granitos Capixaba", "Brasigran",
];

const ROTAS_COMUNS = [
  { origem: "Cachoeiro de Itapemirim/ES", destino: "Vitória/ES", distKm: 136 },
  { origem: "Cachoeiro de Itapemirim/ES", destino: "São Paulo/SP", distKm: 830 },
  { origem: "Nova Venécia/ES", destino: "Santos/SP", distKm: 920 },
  { origem: "Cachoeiro de Itapemirim/ES", destino: "Rio de Janeiro/RJ", distKm: 480 },
  { origem: "Barra de São Francisco/ES", destino: "Belo Horizonte/MG", distKm: 560 },
  { origem: "Colatina/ES", destino: "Vitória/ES", distKm: 135 },
  { origem: "Cachoeiro de Itapemirim/ES", destino: "Curitiba/PR", distKm: 1180 },
  { origem: "Nova Venécia/ES", destino: "Vitória/ES", distKm: 260 },
];

const TIPO_FRETE = ["Próprio", "Agregado"];
const TIPO_CARGA = ["Chapas de Granito", "Blocos de Granito", "Granito Beneficiado", "Carga Geral"];

function rng(seed, i) { return ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280; }

function gerarViagens(mes) {
  const seed = mes * 31 + 77;
  const viagens = [];
  const qtd = 60 + Math.floor(rng(seed, 0) * 40);
  for (let i = 0; i < qtd; i++) {
    const cam = CAMINHOES[Math.floor(rng(seed, i * 3) * CAMINHOES.length)];
    const rota = ROTAS_COMUNS[Math.floor(rng(seed, i * 5) * ROTAS_COMUNS.length)];
    const cliente = CLIENTES[Math.floor(rng(seed, i * 7) * CLIENTES.length)];
    const tipoFrete = rng(seed, i * 9) < 0.6 ? "Próprio" : "Agregado";
    const tipoCarga = TIPO_CARGA[Math.floor(rng(seed, i * 11) * TIPO_CARGA.length)];
    const pesoTon = tipoCarga.includes("Bloco") ? 20 + Math.floor(rng(seed, i * 13) * 10) : 18 + Math.floor(rng(seed, i * 13) * 8);
    const valorFrete = Math.round(rota.distKm * (3.8 + rng(seed, i * 15) * 2.5) * (pesoTon / 25));
    const custoDiesel = Math.round(rota.distKm * 2 * (6.29 / (2.2 + rng(seed, i * 17) * 0.6)));
    const custoPedagio = Math.round(rota.distKm * 0.18 * (1 + rng(seed, i * 19) * 0.4));
    const custoManutencao = Math.round(rota.distKm * 2 * 0.35 * (0.8 + rng(seed, i * 21) * 0.4));
    const custoMotorista = tipoFrete === "Próprio" ? Math.round(valorFrete * (0.08 + rng(seed, i * 23) * 0.04)) : 0;
    const custoTotal = custoDiesel + custoPedagio + custoManutencao + custoMotorista;
    const lucro = valorFrete - custoTotal;
    const dia = 1 + Math.floor(rng(seed, i * 25) * 28);
    const statusViagem = rng(seed, i * 27) < 0.7 ? "concluida" : rng(seed, i * 27) < 0.85 ? "em_andamento" : rng(seed, i * 27) < 0.95 ? "agendada" : "cancelada";
    const statusPgto = rng(seed, i * 29) < 0.55 ? "Recebido" : rng(seed, i * 29) < 0.80 ? "Pendente" : rng(seed, i * 29) < 0.93 ? "Faturado" : "Atrasado";

    viagens.push({
      id: i + 1,
      data: `2025-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      caminhao: cam,
      rota,
      cliente,
      tipoFrete,
      tipoCarga,
      pesoTon,
      valorFrete,
      custoDiesel,
      custoPedagio,
      custoManutencao,
      custoMotorista,
      custoTotal,
      lucro,
      margemPct: ((lucro / valorFrete) * 100).toFixed(1),
      statusViagem,
      statusPgto,
    });
  }
  return viagens;
}

function gerarGastosCaminhao() {
  return CAMINHOES.map((c, idx) => {
    const s = idx * 41 + 13;
    return {
      ...c,
      gastosDieselMes: Math.round(8000 + rng(s, 1) * 12000),
      gastosPneuMes: Math.round(rng(s, 3) < 0.3 ? 2400 + rng(s, 5) * 3600 : 0),
      gastosManutMes: Math.round(rng(s, 7) < 0.4 ? 1500 + rng(s, 9) * 5000 : 300 + rng(s, 11) * 800),
      gastosOutros: Math.round(200 + rng(s, 13) * 1200),
      viagensMes: Math.round(4 + rng(s, 15) * 8),
      faturamentoMes: Math.round(15000 + rng(s, 17) * 35000),
    };
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (v) => `R$ ${v.toLocaleString("pt-BR")}`;
const fmtK = (v) => v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : fmt(v);

function StatusBadge({ status }) {
  const map = {
    em_viagem: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", label: "Em Viagem" },
    disponivel: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", label: "Disponível" },
    manutencao: { bg: "rgba(251,146,60,0.12)", color: "#fb923c", label: "Manutenção" },
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
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
              background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: up ? "#22c55e" : "#ef4444",
            }}>{up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{trend}</span>
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

// ─── TABS ────────────────────────────────────────────────────────────────────

function PainelGeral({ viagens }) {
  const totais = useMemo(() => {
    const c = viagens.filter(v => v.statusViagem === "concluida" || v.statusViagem === "em_andamento");
    return {
      faturamento: c.reduce((s, v) => s + v.valorFrete, 0),
      custos: c.reduce((s, v) => s + v.custoTotal, 0),
      lucro: c.reduce((s, v) => s + v.lucro, 0),
      diesel: c.reduce((s, v) => s + v.custoDiesel, 0),
      pedagio: c.reduce((s, v) => s + v.custoPedagio, 0),
      manut: c.reduce((s, v) => s + v.custoManutencao, 0),
      viagens: c.length,
      ticketMedio: c.length > 0 ? Math.round(c.reduce((s, v) => s + v.valorFrete, 0) / c.length) : 0,
      margemMedia: c.length > 0 ? (c.reduce((s, v) => s + parseFloat(v.margemPct), 0) / c.length).toFixed(1) : 0,
      atrasados: viagens.filter(v => v.statusPgto === "Atrasado").reduce((s, v) => s + v.valorFrete, 0),
      pendentes: viagens.filter(v => v.statusPgto === "Pendente").reduce((s, v) => s + v.valorFrete, 0),
    };
  }, [viagens]);

  const fluxoDiario = useMemo(() => {
    const map = {};
    viagens.filter(v => v.statusViagem !== "cancelada").forEach(v => {
      const d = parseInt(v.data.split("-")[2]);
      if (!map[d]) map[d] = { dia: d, receita: 0, custo: 0, lucro: 0 };
      map[d].receita += v.valorFrete;
      map[d].custo += v.custoTotal;
      map[d].lucro += v.lucro;
    });
    return Array.from({ length: 28 }, (_, i) => map[i + 1] || { dia: i + 1, receita: 0, custo: 0, lucro: 0 });
  }, [viagens]);

  const porCliente = useMemo(() => {
    const map = {};
    viagens.filter(v => v.statusViagem !== "cancelada").forEach(v => {
      if (!map[v.cliente]) map[v.cliente] = { name: v.cliente, value: 0 };
      map[v.cliente].value += v.valorFrete;
    });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [viagens]);

  const custoPie = useMemo(() => [
    { name: "Diesel", value: totais.diesel },
    { name: "Pedágio", value: totais.pedagio },
    { name: "Manutenção", value: totais.manut },
    { name: "Motorista", value: viagens.reduce((s, v) => s + v.custoMotorista, 0) },
  ], [totais, viagens]);

  const CORES_PIE = ["#f59e0b", "#3b82f6", "#ef4444", "#22c55e"];
  const CORES_CLIENTE = ["#f59e0b", "#fb923c", "#fbbf24", "#22c55e", "#3b82f6", "#818cf8"];

  const frota = useMemo(() => ({
    emViagem: CAMINHOES.filter(c => c.status === "em_viagem").length,
    disponivel: CAMINHOES.filter(c => c.status === "disponivel").length,
    manutencao: CAMINHOES.filter(c => c.status === "manutencao").length,
  }), []);

  return (
    <>
      {/* Frota Resumo */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Em Viagem", val: frota.emViagem, color: "#3b82f6", icon: Truck },
          { label: "Disponível", val: frota.disponivel, color: "#22c55e", icon: CheckCircle },
          { label: "Manutenção", val: frota.manutencao, color: "#fb923c", icon: Wrench },
        ].map(f => (
          <div key={f.label} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
            background: "var(--card)", borderRadius: 10, border: "1px solid var(--bdr)",
          }}>
            <f.icon size={14} color={f.color} />
            <span style={{ fontSize: 22, fontWeight: 800, color: f.color }}>{f.val}</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{f.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--card)", borderRadius: 10, border: "1px solid var(--bdr)" }}>
          <Truck size={14} color="var(--muted)" />
          <span style={{ fontSize: 13, color: "var(--muted)" }}><b style={{ color: "var(--text)" }}>{CAMINHOES.length}</b> caminhões na frota</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: 14, marginBottom: 22 }}>
        <KPI icon={DollarSign} label="Faturamento" value={fmt(totais.faturamento)} sub="vs mês anterior" trend="+14%" up />
        <KPI icon={TrendingUp} label="Lucro Líquido" value={fmt(totais.lucro)} sub={`Margem ${totais.margemMedia}%`} trend="+9%" up accent="rgba(34,197,94,0.1)" />
        <KPI icon={Fuel} label="Gastos Totais" value={fmt(totais.custos)} sub={`${totais.viagens} viagens`} />
        <KPI icon={AlertTriangle} label="A Receber (Atrasado)" value={fmt(totais.atrasados)} sub={`+ ${fmt(totais.pendentes)} pendente`} trend={`${((totais.atrasados / totais.faturamento) * 100).toFixed(1)}%`} up={false} accent="rgba(239,68,68,0.08)" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>
        <Section icon={Activity} title="Fluxo Diário (Receita vs Custo)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={fluxoDiario}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="receita" stroke="#f59e0b" strokeWidth={2} fill="url(#gR)" name="Receita" />
              <Area type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={2} fill="url(#gC)" name="Custos" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        <Section icon={Fuel} title="Composição de Custos">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={custoPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {custoPie.map((_, i) => <Cell key={i} fill={CORES_PIE[i]} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Receita por Cliente */}
      <Section icon={Users} title="Faturamento por Cliente">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={porCliente} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text)" }} width={150} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Faturamento">
              {porCliente.map((_, i) => <Cell key={i} fill={CORES_CLIENTE[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>
    </>
  );
}

function ViagensTab({ viagens }) {
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroFrete, setFiltroFrete] = useState("Todos");
  const [detalhe, setDetalhe] = useState(null);

  const filtrado = useMemo(() => viagens.filter(v => {
    if (filtroStatus !== "Todos" && v.statusViagem !== filtroStatus) return false;
    if (filtroFrete !== "Todos" && v.tipoFrete !== filtroFrete) return false;
    if (search && !v.caminhao.placa.toLowerCase().includes(search.toLowerCase()) &&
      !v.cliente.toLowerCase().includes(search.toLowerCase()) &&
      !v.caminhao.motorista.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [viagens, filtroStatus, filtroFrete, search]);

  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "var(--card)", borderRadius: 10, padding: "8px 14px", border: "1px solid var(--bdr)" }}>
          <Search size={15} color="var(--muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar placa, cliente ou motorista..." style={{ background: "none", border: "none", color: "var(--text)", fontSize: 13, flex: 1, outline: "none" }} />
        </div>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--bdr)", background: "var(--card)", color: "var(--text)", fontSize: 12, cursor: "pointer" }}>
          <option value="Todos">Todos Status</option>
          <option value="concluida">Concluída</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="agendada">Agendada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <select value={filtroFrete} onChange={e => setFiltroFrete(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--bdr)", background: "var(--card)", color: "var(--text)", fontSize: 12, cursor: "pointer" }}>
          <option value="Todos">Todos Fretes</option>
          <option value="Próprio">Próprio</option>
          <option value="Agregado">Agregado</option>
        </select>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{filtrado.length} viagens</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--bdr)" }}>
              {["Data", "Placa", "Motorista", "Rota", "Carga", "Frete", "Valor", "Custos", "Lucro", "Margem", "Status", "Pgto", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrado.slice(0, 25).map(v => (
              <tr key={v.id} style={{ borderBottom: "1px solid var(--bdr)", cursor: "pointer" }} onClick={() => setDetalhe(v)}>
                <td style={{ padding: "10px 8px", color: "var(--muted)", whiteSpace: "nowrap" }}>{v.data.split("-").reverse().join("/")}</td>
                <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>{v.caminhao.placa}</td>
                <td style={{ padding: "10px 8px", color: "var(--text)" }}>{v.caminhao.motorista}</td>
                <td style={{ padding: "10px 8px", color: "var(--muted)", maxWidth: 180 }}>
                  <div style={{ fontSize: 11 }}>{v.rota.origem.split("/")[0]}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>→ {v.rota.destino}</div>
                </td>
                <td style={{ padding: "10px 8px", color: "var(--muted)", fontSize: 11 }}>{v.tipoCarga.split(" ")[0]}<br />{v.pesoTon}t</td>
                <td style={{ padding: "10px 8px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                    background: v.tipoFrete === "Próprio" ? "rgba(245,158,11,0.1)" : "rgba(129,140,248,0.1)",
                    color: v.tipoFrete === "Próprio" ? "#f59e0b" : "#818cf8",
                  }}>{v.tipoFrete}</span>
                </td>
                <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--text)" }}>{fmtK(v.valorFrete)}</td>
                <td style={{ padding: "10px 8px", color: "#ef4444", fontWeight: 600 }}>{fmtK(v.custoTotal)}</td>
                <td style={{ padding: "10px 8px", fontWeight: 800, color: v.lucro >= 0 ? "#22c55e" : "#ef4444" }}>{fmtK(v.lucro)}</td>
                <td style={{ padding: "10px 8px", fontWeight: 600, color: parseFloat(v.margemPct) >= 30 ? "#22c55e" : parseFloat(v.margemPct) >= 15 ? "#fbbf24" : "#ef4444" }}>{v.margemPct}%</td>
                <td style={{ padding: "10px 8px" }}><StatusBadge status={v.statusViagem} /></td>
                <td style={{ padding: "10px 8px" }}><StatusBadge status={v.statusPgto} /></td>
                <td style={{ padding: "10px 8px" }}><Eye size={14} color="var(--muted)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detalhe */}
      {detalhe && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }} onClick={() => setDetalhe(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderRadius: 20, padding: 28, width: "92%", maxWidth: 520, border: "1px solid var(--bdr)", maxHeight: "85vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Viagem #{detalhe.id}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{detalhe.data.split("-").reverse().join("/")} · {detalhe.caminhao.placa} · {detalhe.caminhao.motorista}</div>
              </div>
              <button onClick={() => setDetalhe(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}><X size={20} /></button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "var(--bg)", borderRadius: 12, marginBottom: 16 }}>
              <MapPin size={16} color="#f59e0b" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{detalhe.rota.origem}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>→ {detalhe.rota.destino} ({detalhe.rota.distKm} km)</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { l: "Cliente", v: detalhe.cliente },
                { l: "Tipo Frete", v: detalhe.tipoFrete },
                { l: "Carga", v: detalhe.tipoCarga },
                { l: "Peso", v: `${detalhe.pesoTon} toneladas` },
              ].map(r => (
                <div key={r.l} style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{r.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{r.v}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Financeiro da Viagem</div>
            <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              {[
                { l: "Valor do Frete", v: fmt(detalhe.valorFrete), c: "var(--text)", bold: true },
                { l: "Diesel (ida+volta)", v: `- ${fmt(detalhe.custoDiesel)}`, c: "#ef4444" },
                { l: "Pedágio", v: `- ${fmt(detalhe.custoPedagio)}`, c: "#ef4444" },
                { l: "Manutenção (rateio)", v: `- ${fmt(detalhe.custoManutencao)}`, c: "#ef4444" },
                { l: "Comissão Motorista", v: `- ${fmt(detalhe.custoMotorista)}`, c: "#ef4444" },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--bdr)" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{r.l}</span>
                  <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 600, color: r.c }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>LUCRO LÍQUIDO</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: detalhe.lucro >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(detalhe.lucro)}</span>
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: parseFloat(detalhe.margemPct) >= 30 ? "#22c55e" : "#fbbf24", fontWeight: 600, marginTop: 2 }}>Margem: {detalhe.margemPct}%</div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <StatusBadge status={detalhe.statusViagem} />
              <StatusBadge status={detalhe.statusPgto} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FrotaTab() {
  const gastos = useMemo(() => gerarGastosCaminhao(), []);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {gastos.map(c => {
          const totalGasto = c.gastosDieselMes + c.gastosPneuMes + c.gastosManutMes + c.gastosOutros;
          const lucro = c.faturamentoMes - totalGasto;
          const margem = c.faturamentoMes > 0 ? ((lucro / c.faturamentoMes) * 100).toFixed(1) : 0;
          const statusColor = c.status === "em_viagem" ? "#3b82f6" : c.status === "disponivel" ? "#22c55e" : "#fb923c";
          return (
            <div key={c.id} style={{ background: "var(--card)", borderRadius: 16, padding: 20, border: "1px solid var(--bdr)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: statusColor, borderRadius: "4px 0 0 4px" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", fontFamily: "monospace" }}>{c.placa}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{c.modelo} · {c.ano}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Motorista: <b style={{ color: "var(--text)" }}>{c.motorista}</b> · {(c.km / 1000).toFixed(0)}k km</div>
                </div>
                <Truck size={20} color={statusColor} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Faturou</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{fmtK(c.faturamentoMes)}</div>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Lucro</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: lucro >= 0 ? "#22c55e" : "#ef4444" }}>{fmtK(lucro)}</div>
                  <div style={{ fontSize: 10, color: parseFloat(margem) >= 30 ? "#22c55e" : "#fbbf24", fontWeight: 600 }}>Margem {margem}%</div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {[
                  { l: "Diesel", v: c.gastosDieselMes, pct: ((c.gastosDieselMes / totalGasto) * 100).toFixed(0) },
                  { l: "Pneus", v: c.gastosPneuMes },
                  { l: "Manutenção", v: c.gastosManutMes },
                  { l: "Outros", v: c.gastosOutros },
                ].filter(g => g.v > 0).map(g => (
                  <div key={g.l} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                    <span>{g.l}</span>
                    <span style={{ fontWeight: 600, color: "#ef4444" }}>{fmtK(g.v)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0 0", marginTop: 4, borderTop: "1px solid var(--bdr)", fontWeight: 700, color: "var(--text)" }}>
                  <span>Total Gastos</span><span style={{ color: "#ef4444" }}>{fmtK(totalGasto)}</span>
                </div>
              </div>

              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>{c.viagensMes} viagens no mês</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function FinanceiroTab({ viagens }) {
  const totais = useMemo(() => {
    const c = viagens.filter(v => v.statusViagem !== "cancelada");
    return {
      recebido: c.filter(v => v.statusPgto === "Recebido").reduce((s, v) => s + v.valorFrete, 0),
      pendente: c.filter(v => v.statusPgto === "Pendente").reduce((s, v) => s + v.valorFrete, 0),
      faturado: c.filter(v => v.statusPgto === "Faturado").reduce((s, v) => s + v.valorFrete, 0),
      atrasado: c.filter(v => v.statusPgto === "Atrasado").reduce((s, v) => s + v.valorFrete, 0),
    };
  }, [viagens]);

  const atrasados = viagens.filter(v => v.statusPgto === "Atrasado");

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: 14, marginBottom: 22 }}>
        <KPI icon={CheckCircle} label="Recebido" value={fmt(totais.recebido)} accent="rgba(34,197,94,0.1)" />
        <KPI icon={Clock} label="Faturado (NF emitida)" value={fmt(totais.faturado)} accent="rgba(129,140,248,0.1)" />
        <KPI icon={Calendar} label="Pendente" value={fmt(totais.pendente)} />
        <KPI icon={AlertTriangle} label="Atrasado" value={fmt(totais.atrasado)} sub={`${atrasados.length} viagens`} accent="rgba(239,68,68,0.08)" />
      </div>

      {/* Fluxo recebido vs pendente por semana */}
      <Section icon={DollarSign} title="Fluxo de Recebíveis">
        {(() => {
          const semanas = [
            { name: "Sem 1", recebido: 0, pendente: 0, atrasado: 0 },
            { name: "Sem 2", recebido: 0, pendente: 0, atrasado: 0 },
            { name: "Sem 3", recebido: 0, pendente: 0, atrasado: 0 },
            { name: "Sem 4", recebido: 0, pendente: 0, atrasado: 0 },
          ];
          viagens.filter(v => v.statusViagem !== "cancelada").forEach(v => {
            const d = parseInt(v.data.split("-")[2]);
            const si = Math.min(Math.floor((d - 1) / 7), 3);
            if (v.statusPgto === "Recebido") semanas[si].recebido += v.valorFrete;
            else if (v.statusPgto === "Atrasado") semanas[si].atrasado += v.valorFrete;
            else semanas[si].pendente += v.valorFrete;
          });
          return (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={semanas}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bdr)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "var(--card)", border: "1px solid var(--bdr)", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="recebido" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name="Recebido" />
                <Bar dataKey="pendente" stackId="a" fill="#fbbf24" name="Pendente" />
                <Bar dataKey="atrasado" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Atrasado" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          );
        })()}
      </Section>

      {/* Cobranças atrasadas */}
      {atrasados.length > 0 && (
        <Section icon={AlertTriangle} title="Cobranças Atrasadas — Ação Necessária">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {atrasados.map(v => (
              <div key={v.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{v.cliente}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Viagem #{v.id} · {v.data.split("-").reverse().join("/")} · {v.rota.origem.split("/")[0]} → {v.rota.destino.split("/")[0]}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{fmt(v.valorFrete)}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{v.caminhao.placa}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Lucratividade por tipo de frete */}
      <Section icon={TrendingUp} title="Lucratividade: Próprio vs Agregado">
        {(() => {
          const tipos = {};
          viagens.filter(v => v.statusViagem !== "cancelada").forEach(v => {
            if (!tipos[v.tipoFrete]) tipos[v.tipoFrete] = { faturamento: 0, custos: 0, lucro: 0, viagens: 0 };
            tipos[v.tipoFrete].faturamento += v.valorFrete;
            tipos[v.tipoFrete].custos += v.custoTotal;
            tipos[v.tipoFrete].lucro += v.lucro;
            tipos[v.tipoFrete].viagens += 1;
          });
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {Object.entries(tipos).map(([tipo, d]) => (
                <div key={tipo} style={{ background: "var(--bg)", borderRadius: 14, padding: 18, border: `1px solid ${tipo === "Próprio" ? "rgba(245,158,11,0.2)" : "rgba(129,140,248,0.2)"}` }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: tipo === "Próprio" ? "#f59e0b" : "#818cf8", marginBottom: 12 }}>Frete {tipo}</div>
                  {[
                    { l: "Viagens", v: d.viagens },
                    { l: "Faturamento", v: fmt(d.faturamento) },
                    { l: "Custos", v: fmt(d.custos) },
                    { l: "Lucro", v: fmt(d.lucro), c: d.lucro >= 0 ? "#22c55e" : "#ef4444", bold: true },
                    { l: "Margem", v: `${((d.lucro / d.faturamento) * 100).toFixed(1)}%`, c: (d.lucro / d.faturamento) >= 0.3 ? "#22c55e" : "#fbbf24" },
                    { l: "Ticket Médio", v: fmt(Math.round(d.faturamento / d.viagens)) },
                  ].map(r => (
                    <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--bdr)" }}>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>{r.l}</span>
                      <span style={{ fontSize: 13, fontWeight: r.bold ? 800 : 600, color: r.c || "var(--text)" }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })()}
      </Section>
    </>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("painel");
  const [mes, setMes] = useState(3);
  const viagens = useMemo(() => gerarViagens(mes), [mes]);
  const meses = ["Jan", "Fev", "Mar"];

  const tabs = [
    { key: "painel", label: "Painel Geral", icon: BarChart3 },
    { key: "viagens", label: "Viagens", icon: Route },
    { key: "frota", label: "Frota", icon: Truck },
    { key: "financeiro", label: "Financeiro", icon: DollarSign },
  ];

  return (
    <div style={{
      "--bg": "#0a0d11",
      "--card": "#11151c",
      "--bdr": "#1a1f2b",
      "--text": "#e8e4df",
      "--muted": "#6b7280",
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      background: "var(--bg)", minHeight: "100vh", color: "var(--text)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a1f2b; border-radius: 3px; }
        input::placeholder { color: #4b5563; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid var(--bdr)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(180deg, rgba(245,158,11,0.03) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(245,158,11,0.25)",
          }}>
            <Truck size={20} color="#0a0d11" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", letterSpacing: -0.5 }}>TransportaFlow</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Gestão de Frota & Frete — Granitos</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 3, background: "var(--card)", borderRadius: 10, padding: 3, border: "1px solid var(--bdr)" }}>
            {meses.map((m, i) => (
              <button key={i} onClick={() => setMes(i + 1)} style={{
                padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, background: mes === i + 1 ? "#f59e0b" : "transparent",
                color: mes === i + 1 ? "#0a0d11" : "var(--muted)", transition: "all 0.2s",
              }}>{m}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 3, background: "var(--card)", borderRadius: 10, padding: 3, border: "1px solid var(--bdr)" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 7,
                border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s",
                background: tab === t.key ? "#f59e0b" : "transparent",
                color: tab === t.key ? "#0a0d11" : "var(--muted)", whiteSpace: "nowrap",
              }}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
        {tab === "painel" && <PainelGeral viagens={viagens} />}
        {tab === "viagens" && <ViagensTab viagens={viagens} />}
        {tab === "frota" && <FrotaTab />}
        {tab === "financeiro" && <FinanceiroTab viagens={viagens} />}
      </div>
    </div>
  );
}
