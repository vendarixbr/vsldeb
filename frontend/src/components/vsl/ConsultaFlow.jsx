import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, X } from "lucide-react";
import { CTA_REDIRECT_URL } from "@/lib/constants";

// ─── helpers ────────────────────────────────────────────────────────────────

const SCAM_TYPES = [
    "Golpe no PIX",
    "Fraude em Marketplace",
    "Compra não entregue",
    "Site falso / Phishing",
    "Golpe de Investimento",
    "Golpe no WhatsApp",
    "Aplicativo Falso",
    "Curso / Mentoria não entregue",
    "Assinatura indevida",
    "Outros",
];

const LOADING_STEPS = [
    { pct: 0,  text: "Verificando seu CPF na base de dados nacional..." },
    { pct: 18, text: "Cruzando dados com marketplaces e lojas virtuais..." },
    { pct: 34, text: "Consultando histórico de transferências PIX..." },
    { pct: 50, text: "Verificando registros de pagamentos digitais..." },
    { pct: 65, text: "Analisando histórico de compras online..." },
    { pct: 78, text: "Calculando correção monetária e juros..." },
    { pct: 90, text: "Consolidando reembolsos identificados..." },
    { pct: 100, text: "Análise concluída!" },
];

const CATEGORIES = [
    {
        icon: "🛒",
        label: "COMPRAS & VENDAS ONLINE",
        tags: ["Marketplaces", "Lojas Virtuais", "E-commerce", "Sites de Oferta", "Anúncios Online"],
    },
    {
        icon: "💎",
        label: "PRODUTOS & SERVIÇOS DIGITAIS",
        tags: ["Cursos Online", "Mentorias", "Assinaturas", "Apps Digitais", "Plataformas"],
    },
    {
        icon: "🇧🇷",
        label: "PAGAMENTOS & TRANSFERÊNCIAS",
        tags: ["Gateways", "Carteiras Digitais", "Transferências Pix", "Investimentos", "Apostas Online"],
    },
];

function formatCPF(raw) {
    return raw
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function digitsToDisplay(digits) {
    if (!digits) return "";
    const num = parseInt(digits, 10) / 100;
    return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function generateAmounts(rawDigits) {
    const base = rawDigits ? parseInt(rawDigits, 10) / 100 : 500;
    const multiplier = 1.65 + Math.random() * 0.75;
    const total = base * multiplier;
    const split = 0.55 + Math.random() * 0.1;
    const a1 = total * split;
    const a2 = total - a1;
    const fmt = (n) =>
        n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return { a1: fmt(a1), a2: fmt(a2), total: fmt(total) };
}

// ─── shared ─────────────────────────────────────────────────────────────────

function BottomNav({ variant = "loading" }) {
    const loadingItems = [
        { label: "Painel",     icon: "⊞" },
        { label: "Transações", icon: "□" },
        { label: "Consulta",   icon: "↺", active: true },
        { label: "Solicitar",  icon: "◷" },
        { label: "Dados",      icon: "👤" },
    ];
    const resultsItems = [
        { label: "Painel",      icon: "⊞" },
        { label: "Reembolsos",  icon: "□" },
        { label: "Consulta",    icon: "↺", active: true },
        { label: "Solicitar",   icon: "◷" },
        { label: "Dados",       icon: "👤" },
    ];
    const items = variant === "results" ? resultsItems : loadingItems;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[70] border-t border-zinc-800 flex items-end justify-around px-2 py-2"
            style={{ backgroundColor: "#0a150e" }}
        >
            {items.map(({ label, icon, active }) => (
                <button
                    key={label}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
                        active ? "text-[#00FF66]" : "text-zinc-600"
                    }`}
                >
                    {active ? (
                        <div className="w-11 h-11 rounded-full bg-[#00FF66] flex items-center justify-center text-black font-bold text-lg mb-0.5">
                            {icon}
                        </div>
                    ) : (
                        <span className="text-xl">{icon}</span>
                    )}
                    <span className="text-[9px] leading-none">{label}</span>
                </button>
            ))}
        </div>
    );
}

// ─── step 1: form ────────────────────────────────────────────────────────────

function StepForm({ onSubmit, onClose }) {
    const [email, setEmail]         = useState("");
    const [cpf, setCpf]             = useState("");
    const [tipoGolpe, setTipoGolpe] = useState("");
    const [valorDigits, setValorDigits] = useState("");

    const handleValorChange = (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
        setValorDigits(digits);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, cpf, tipoGolpe, valorDigits });
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
        >
            <div
                className="relative w-full max-w-md rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Fechar"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 sm:p-8">
                    <h2 className="font-display text-white text-xl font-bold text-center mb-1">
                        Faça sua consulta gratuita
                    </h2>
                    <p className="text-zinc-400 text-sm text-center mb-6">
                        Preencha abaixo e descubra quanto você pode recuperar
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-bold tracking-[0.18em] text-zinc-400 uppercase mb-1.5">
                                E-mail usado nas compras online
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seuemail@gmail.com"
                                required
                                className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF66]/50 transition-shadow"
                                style={{ backgroundColor: "#0a1a0f", border: "1px solid #1e3a26" }}
                            />
                        </div>

                        {/* CPF */}
                        <div>
                            <label className="block text-[10px] font-bold tracking-[0.18em] text-zinc-400 uppercase mb-1.5">
                                CPF
                            </label>
                            <input
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(formatCPF(e.target.value))}
                                placeholder="000.000.000-00"
                                required
                                inputMode="numeric"
                                className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF66]/50 transition-shadow"
                                style={{ backgroundColor: "#0a1a0f", border: "1px solid #1e3a26" }}
                            />
                        </div>

                        {/* Tipo de golpe */}
                        <div>
                            <label className="block text-[10px] font-bold tracking-[0.18em] text-zinc-400 uppercase mb-1.5">
                                Tipo de golpe sofrido
                            </label>
                            <div className="relative">
                                <select
                                    value={tipoGolpe}
                                    onChange={(e) => setTipoGolpe(e.target.value)}
                                    required
                                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF66]/50 appearance-none transition-shadow"
                                    style={{
                                        backgroundColor: "#0a1a0f",
                                        border: "1px solid #1e3a26",
                                        color: tipoGolpe ? "#fff" : "#52525b",
                                    }}
                                >
                                    <option value="" disabled>
                                        Selecione...
                                    </option>
                                    {SCAM_TYPES.map((t) => (
                                        <option key={t} value={t} style={{ color: "#fff" }}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#00FF66] text-xs">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Valor */}
                        <div>
                            <label className="block text-[10px] font-bold tracking-[0.18em] text-zinc-400 uppercase mb-1.5">
                                Valor aproximado perdido (R$)
                            </label>
                            <input
                                type="text"
                                value={digitsToDisplay(valorDigits)}
                                onChange={handleValorChange}
                                placeholder="R$ 0,00"
                                required
                                inputMode="numeric"
                                className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF66]/50 transition-shadow"
                                style={{ backgroundColor: "#0a1a0f", border: "1px solid #1e3a26" }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-2 w-full py-4 rounded-xl font-bold text-black text-base tracking-tight transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                            style={{ backgroundColor: "#00FF66" }}
                        >
                            🔍 CONSULTAR MEU REEMBOLSO GRÁTIS
                        </button>
                    </form>

                    <p className="mt-4 text-center text-xs text-zinc-600">
                        🔒 Dados protegidos com SSL · Nunca compartilhados
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── step 2: loading ─────────────────────────────────────────────────────────

const TOTAL_DURATION = 8000; // ms

function StepLoading({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const startRef = useRef(Date.now());
    const rafRef   = useRef(null);

    const tick = useCallback(() => {
        const elapsed = Date.now() - startRef.current;
        const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
        setProgress(pct);
        if (pct < 100) {
            rafRef.current = requestAnimationFrame(tick);
        } else {
            setTimeout(onComplete, 500);
        }
    }, [onComplete]);

    useEffect(() => {
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [tick]);

    const currentMsg =
        [...LOADING_STEPS].reverse().find((s) => progress >= s.pct)?.text ?? LOADING_STEPS[0].text;

    // SVG circle
    const R = 70;
    const circ = 2 * Math.PI * R;
    const offset = circ - (progress / 100) * circ;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: "#0a150e" }}>
            <div className="flex-1 overflow-y-auto px-5 pt-8 pb-28">
                <h2 className="font-display text-white text-xl font-bold text-center mb-1">
                    Consulta de Reembolsos
                </h2>
                <p className="text-zinc-400 text-sm text-center mb-7">
                    Cruzando dados em múltiplos canais...
                </p>

                {CATEGORIES.map(({ icon, label, tags }) => (
                    <div key={label} className="mb-5">
                        <p className="text-[10px] font-semibold tracking-[0.15em] text-zinc-500 text-center mb-2 uppercase">
                            {icon} {label}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-full text-xs text-zinc-300 border border-zinc-700"
                                    style={{ backgroundColor: "#111d15" }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Progress circle */}
                <div className="flex flex-col items-center mt-8">
                    <div className="relative w-[180px] h-[180px]">
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 180 180"
                            style={{ transform: "rotate(-90deg)" }}
                        >
                            <circle
                                cx="90" cy="90" r={R}
                                fill="none"
                                stroke="#1a2e20"
                                strokeWidth="8"
                            />
                            <circle
                                cx="90" cy="90" r={R}
                                fill="none"
                                stroke="#00FF66"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circ}
                                strokeDashoffset={offset}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold text-white font-mono tabular-nums">
                                {Math.floor(progress)}%
                            </span>
                        </div>
                    </div>

                    <p className="mt-6 text-zinc-400 text-sm text-center px-4">
                        {currentMsg}
                    </p>
                </div>
            </div>

            <BottomNav variant="loading" />
        </div>
    );
}

// ─── step 3: results ─────────────────────────────────────────────────────────

function StepResults({ formData, onClose }) {
    const amounts = useRef(generateAmounts(formData.valorDigits)).current;

    return (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: "#0a150e" }}>
            {/* Header */}
            <div
                className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800 flex-shrink-0"
                style={{ backgroundColor: "#0a150e" }}
            >
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white transition-colors"
                    aria-label="Voltar"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="font-display text-white font-bold text-base leading-tight">
                        Reembolsos Pendentes
                    </h2>
                    <p className="text-[#00FF66] text-xs leading-tight">
                        Análise concluída com sucesso
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
                {/* Success card */}
                <div
                    className="rounded-2xl p-5 mb-4"
                    style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[#00FF66] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,255,102,0.4)]">
                            <svg
                                className="w-8 h-8 text-black"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-xl mb-1">
                            ANÁLISE FEITA COM{" "}
                            <span className="text-[#00FF66]">SUCESSO!</span>
                        </h3>
                        <p className="text-zinc-400 text-sm mb-3">
                            Foi constatado, você pode ter
                        </p>

                        <div
                            className="w-full rounded-xl py-4 px-6 mb-2"
                            style={{ backgroundColor: "#00FF66" }}
                        >
                            <span
                                className="font-bold text-2xl text-black select-none"
                                style={{ filter: "blur(8px)", userSelect: "none" }}
                            >
                                R$ {amounts.total}
                            </span>
                        </div>
                        <p className="text-[#00FF66] text-xs mb-3">🔒 Valor oculto por segurança</p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            de reembolsos pendentes referente às suas compras online.{" "}
                            <span className="text-white font-medium">
                                Receba com juros e correções monetárias.
                            </span>
                        </p>
                    </div>
                </div>

                {/* Hidden companies */}
                <div
                    className="rounded-2xl p-4 mb-4 text-center"
                    style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                >
                    <p className="text-white font-semibold text-sm mb-1">
                        🔒 Empresas ocultas por segurança
                    </p>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                        Os nomes das empresas e valores exatos são revelados após a ativação da
                        Licença RecuperaPix.
                    </p>
                </div>

                {/* Refund list header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                        Reembolsos Identificados
                    </span>
                    <span className="text-xs text-[#00FF66] font-semibold">2 pendentes</span>
                </div>

                {/* Refund items */}
                {[
                    { icon: "📦", amount: amounts.a1 },
                    { icon: "🛒", amount: amounts.a2 },
                ].map(({ icon, amount }, i) => (
                    <div
                        key={i}
                        className="rounded-2xl p-4 mb-3 flex items-center gap-3"
                        style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: "#111d15" }}
                        >
                            {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className="text-sm text-zinc-400 select-none"
                                    style={{ filter: "blur(4px)", userSelect: "none" }}
                                >
                                    Empresa {i + 1} ••••••
                                </span>
                                <span className="text-[10px] bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-700/50 flex-shrink-0 ml-2">
                                    🔒 OCULTO
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span
                                    className="font-bold text-[#00FF66] select-none"
                                    style={{ filter: "blur(5px)", userSelect: "none" }}
                                >
                                    R$ {amount}
                                </span>
                                <span className="text-xs text-red-400 font-bold flex-shrink-0 ml-2">
                                    VENCE EM 48H
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Total */}
                <div
                    className="rounded-2xl p-4 mb-5 flex items-center justify-between"
                    style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                >
                    <span className="text-white text-sm font-semibold">Total disponível</span>
                    <span
                        className="font-bold text-white select-none"
                        style={{ filter: "blur(6px)", userSelect: "none" }}
                    >
                        R$ {amounts.total}
                    </span>
                </div>

                {/* CTA */}
                <a
                    href={CTA_REDIRECT_URL}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-black text-base tracking-tight transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-[0_0_30px_rgba(0,255,102,0.35)]"
                    style={{ backgroundColor: "#00FF66" }}
                >
                    🔒 ATIVAR LICENÇA E SACAR TUDO
                </a>
                <p className="text-center text-xs text-yellow-500 mt-2">
                    ⚠ Valores expiram em 48h — Solicite agora
                </p>
            </div>

            <BottomNav variant="results" />
        </div>
    );
}

// ─── main export ─────────────────────────────────────────────────────────────

export default function ConsultaFlow({ open, onClose }) {
    const [step, setStep]         = useState("form");
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (!open) {
            // reset when closed so next open starts fresh
            const timer = setTimeout(() => setStep("form"), 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    // lock body scroll while overlay is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <>
            {step === "form" && (
                <StepForm
                    onClose={onClose}
                    onSubmit={(data) => {
                        setFormData(data);
                        setStep("loading");
                    }}
                />
            )}
            {step === "loading" && (
                <StepLoading onComplete={() => setStep("results")} />
            )}
            {step === "results" && formData && (
                <StepResults formData={formData} onClose={onClose} />
            )}
        </>
    );
}
