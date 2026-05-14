import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, X } from "lucide-react";
import { CTA_REDIRECT_URL } from "@/lib/constants";

// ─── constants ───────────────────────────────────────────────────────────────

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

const EMAIL_DOMAINS = [
    "@gmail.com",
    "@hotmail.com",
    "@outlook.com",
    "@yahoo.com",
    "@icloud.com",
    "@live.com",
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

// ─── helpers ─────────────────────────────────────────────────────────────────

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

// ─── shared layout ───────────────────────────────────────────────────────────

// Backdrop + centered card — equal size across all steps
function ModalCard({ children, onBackdropClick }) {
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
            onClick={onBackdropClick}
        >
            <div
                className="relative w-full max-w-md flex flex-col rounded-2xl overflow-hidden"
                style={{
                    backgroundColor: "#0a150e",
                    border: "1px solid #1e3a26",
                    maxHeight: "90vh",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

function BottomNav({ variant = "loading" }) {
    const items =
        variant === "results"
            ? [
                  { label: "Painel",     icon: "⊞" },
                  { label: "Reembolsos", icon: "□" },
                  { label: "Consulta",   icon: "↺", active: true },
                  { label: "Solicitar",  icon: "◷" },
                  { label: "Dados",      icon: "👤" },
              ]
            : [
                  { label: "Painel",     icon: "⊞" },
                  { label: "Transações", icon: "□" },
                  { label: "Consulta",   icon: "↺", active: true },
                  { label: "Solicitar",  icon: "◷" },
                  { label: "Dados",      icon: "👤" },
              ];

    return (
        <div
            className="flex-shrink-0 border-t border-zinc-800 flex items-end justify-around px-2 py-2"
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
                        <div className="w-10 h-10 rounded-full bg-[#00FF66] flex items-center justify-center text-black font-bold text-base mb-0.5">
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
    const [email, setEmail]             = useState("");
    const [cpf, setCpf]                 = useState("");
    const [tipoGolpe, setTipoGolpe]     = useState("");
    const [valorDigits, setValorDigits] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const emailRef = useRef(null);

    const handleEmailChange = (val) => {
        setEmail(val);
        if (!val) { setSuggestions([]); return; }
        const atIdx = val.indexOf("@");
        if (atIdx === -1) {
            setSuggestions(EMAIL_DOMAINS.map((d) => val + d));
        } else {
            const typed = val.slice(atIdx);
            const matches = EMAIL_DOMAINS
                .filter((d) => d.startsWith(typed) && d !== typed)
                .map((d) => val.slice(0, atIdx) + d);
            setSuggestions(matches);
        }
    };

    const selectSuggestion = (s) => {
        setEmail(s);
        setSuggestions([]);
    };

    const handleValorChange = (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
        setValorDigits(digits);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ email, cpf, tipoGolpe, valorDigits });
    };

    const inputStyle = {
        backgroundColor: "#0a1a0f",
        border: "1px solid #1e3a26",
    };

    return (
        <ModalCard onBackdropClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"
                aria-label="Fechar"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto p-6">
                <h2 className="font-display text-white text-xl font-bold text-center mb-1">
                    Faça sua consulta gratuita
                </h2>
                <p className="text-zinc-400 text-sm text-center mb-6">
                    Preencha abaixo e descubra quanto você pode recuperar
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Email + suggestions */}
                    <div className="relative" ref={emailRef}>
                        <label className="block text-[10px] font-bold tracking-[0.18em] text-zinc-400 uppercase mb-1.5">
                            E-mail usado nas compras online
                        </label>
                        <input
                            type="text"
                            inputMode="email"
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                            placeholder="seuemail@gmail.com"
                            required
                            className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF66]/50"
                            style={inputStyle}
                        />
                        {suggestions.length > 0 && (
                            <ul
                                className="absolute left-0 right-0 z-20 mt-1 rounded-xl overflow-hidden"
                                style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                            >
                                {suggestions.map((s) => (
                                    <li key={s}>
                                        <button
                                            type="button"
                                            onMouseDown={() => selectSuggestion(s)}
                                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-[#00FF66]/10 hover:text-white transition-colors"
                                        >
                                            {s}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
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
                            className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF66]/50"
                            style={inputStyle}
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
                                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF66]/50 appearance-none"
                                style={{
                                    ...inputStyle,
                                    color: tipoGolpe ? "#fff" : "#52525b",
                                }}
                            >
                                <option value="" disabled>Selecione...</option>
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
                            className="w-full rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-1 focus:ring-[#00FF66]/50"
                            style={inputStyle}
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
        </ModalCard>
    );
}

// ─── step 2: loading ─────────────────────────────────────────────────────────

const TOTAL_DURATION = 8000;

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

    const R = 60;
    const circ = 2 * Math.PI * R;
    const offset = circ - (progress / 100) * circ;

    return (
        <ModalCard>
            {/* Header */}
            <div className="flex-shrink-0 px-5 pt-5 pb-3 text-center">
                <h2 className="font-display text-white text-lg font-bold mb-0.5">
                    Consulta de Reembolsos
                </h2>
                <p className="text-zinc-400 text-xs">Cruzando dados em múltiplos canais...</p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-3">
                {CATEGORIES.map(({ icon, label, tags }) => (
                    <div key={label} className="mb-4">
                        <p className="text-[9px] font-semibold tracking-[0.15em] text-zinc-500 text-center mb-2 uppercase">
                            {icon} {label}
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-full text-xs text-zinc-300 border border-zinc-700"
                                    style={{ backgroundColor: "#111d15" }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Progress circle */}
                <div className="flex flex-col items-center mt-4 mb-4">
                    <div className="relative w-[150px] h-[150px]">
                        <svg
                            className="w-full h-full"
                            viewBox="0 0 150 150"
                            style={{ transform: "rotate(-90deg)" }}
                        >
                            <circle cx="75" cy="75" r={R} fill="none" stroke="#1a2e20" strokeWidth="7" />
                            <circle
                                cx="75" cy="75" r={R}
                                fill="none"
                                stroke="#00FF66"
                                strokeWidth="7"
                                strokeLinecap="round"
                                strokeDasharray={circ}
                                strokeDashoffset={offset}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white font-mono tabular-nums">
                                {Math.floor(progress)}%
                            </span>
                        </div>
                    </div>
                    <p className="mt-3 text-zinc-400 text-xs text-center px-4">{currentMsg}</p>
                </div>
            </div>

            <BottomNav variant="loading" />
        </ModalCard>
    );
}

// ─── step 3: results ─────────────────────────────────────────────────────────

function StepResults({ formData, onClose }) {
    const amounts = useRef(generateAmounts(formData.valorDigits)).current;

    return (
        <ModalCard>
            {/* Header */}
            <div
                className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-zinc-800"
            >
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white transition-colors"
                    aria-label="Voltar"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="font-display text-white font-bold text-sm leading-tight">
                        Reembolsos Pendentes
                    </h2>
                    <p className="text-[#00FF66] text-xs leading-tight">
                        Análise concluída com sucesso
                    </p>
                </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3">
                {/* Success card */}
                <div
                    className="rounded-2xl p-4 mb-3"
                    style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-[#00FF66] flex items-center justify-center mb-3 shadow-[0_0_24px_rgba(0,255,102,0.4)]">
                            <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">
                            ANÁLISE FEITA COM{" "}
                            <span className="text-[#00FF66]">SUCESSO!</span>
                        </h3>
                        <p className="text-zinc-400 text-xs mb-3">Foi constatado, você pode ter</p>

                        {/* Total — visível, blur leve */}
                        <div
                            className="w-full rounded-xl py-3 px-5 mb-2"
                            style={{ backgroundColor: "#00FF66" }}
                        >
                            <span
                                className="font-bold text-2xl text-black"
                                style={{ filter: "blur(3px)" }}
                            >
                                R$ {amounts.total}
                            </span>
                        </div>
                        <p className="text-[#00FF66] text-xs mb-2">🔒 Valor oculto por segurança</p>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                            de reembolsos pendentes referente às suas compras online.{" "}
                            <span className="text-white font-medium">
                                Receba com juros e correções monetárias.
                            </span>
                        </p>
                    </div>
                </div>

                {/* Hidden companies */}
                <div
                    className="rounded-2xl p-3 mb-3 text-center"
                    style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                >
                    <p className="text-white font-semibold text-xs mb-1">🔒 Empresas ocultas por segurança</p>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                        Os nomes das empresas e valores exatos são revelados após a ativação da Licença RecuperaPix.
                    </p>
                </div>

                {/* Refund list header */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                        Reembolsos Identificados
                    </span>
                    <span className="text-xs text-[#00FF66] font-semibold">2 pendentes</span>
                </div>

                {/* Refund items — valores legíveis */}
                {[
                    { icon: "📦", amount: amounts.a1 },
                    { icon: "🛒", amount: amounts.a2 },
                ].map(({ icon, amount }, i) => (
                    <div
                        key={i}
                        className="rounded-2xl p-3 mb-2 flex items-center gap-3"
                        style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                    >
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                            style={{ backgroundColor: "#111d15" }}
                        >
                            {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className="text-xs text-zinc-400"
                                    style={{ filter: "blur(3px)" }}
                                >
                                    Empresa {i + 1} ••••••
                                </span>
                                <span className="text-[9px] bg-yellow-900/40 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-700/50 flex-shrink-0 ml-2">
                                    🔒 OCULTO
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span
                                    className="font-bold text-sm text-[#00FF66]"
                                    style={{ filter: "blur(2.5px)" }}
                                >
                                    R$ {amount}
                                </span>
                                <span className="text-[10px] text-red-400 font-bold flex-shrink-0 ml-2">
                                    VENCE EM 48H
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Total disponível — legível */}
                <div
                    className="rounded-2xl p-3 mb-4 flex items-center justify-between"
                    style={{ backgroundColor: "#0d1f12", border: "1px solid #1e3a26" }}
                >
                    <span className="text-white text-sm font-semibold">Total disponível</span>
                    <span
                        className="font-bold text-white text-sm"
                        style={{ filter: "blur(2.5px)" }}
                    >
                        R$ {amounts.total}
                    </span>
                </div>

                {/* CTA */}
                <a
                    href={CTA_REDIRECT_URL}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-black text-sm tracking-tight transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-[0_0_24px_rgba(0,255,102,0.3)]"
                    style={{ backgroundColor: "#00FF66" }}
                >
                    🔒 ATIVAR LICENÇA E SACAR TUDO
                </a>
                <p className="text-center text-xs text-yellow-500 mt-2 mb-1">
                    ⚠ Valores expiram em 48h — Solicite agora
                </p>
            </div>

            <BottomNav variant="results" />
        </ModalCard>
    );
}

// ─── main export ─────────────────────────────────────────────────────────────

export default function ConsultaFlow({ open, onClose }) {
    const [step, setStep]         = useState("form");
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (!open) {
            const timer = setTimeout(() => setStep("form"), 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <>
            {step === "form" && (
                <StepForm
                    onClose={onClose}
                    onSubmit={(data) => { setFormData(data); setStep("loading"); }}
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
