export default function ExpertBlock() {
    const stats = [
        { value: "+12",    label: "ANOS DE\nATUAÇÃO" },
        { value: "+3.400", label: "CASOS\nRESOLVIDOS" },
        { value: "100%",   label: "FRAUDE\nDIGITAL" },
    ];

    return (
        <div className="rp-fade-in w-full max-w-2xl mx-auto mt-6">
            <div
                className="rounded-2xl overflow-hidden relative"
                style={{ backgroundColor: "#0d1a10", border: "1px solid #1e3a26" }}
            >
                {/* Photo fills the card */}
                <img
                    src="/expert.png"
                    alt="Dr. Ricardo Alves"
                    className="w-full object-cover object-top"
                    style={{ height: "380px", display: "block" }}
                    loading="lazy"
                />

                {/* Gradient overlay — bottom half fades to card bg */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "linear-gradient(to top, #0d1a10 38%, rgba(13,26,16,0.55) 62%, transparent 85%)",
                    }}
                />

                {/* Text content — absolute, sits over the gradient */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                    {/* Badge row */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-px bg-[#00FF66]" />
                        <span className="text-[10px] font-bold tracking-[0.18em] text-[#00FF66] uppercase">
                            Especialista em Direito Digital
                        </span>
                    </div>

                    <h3 className="font-display text-white text-2xl font-bold leading-tight mb-0.5">
                        Dr. Ricardo Alves
                    </h3>
                    <p className="text-zinc-400 text-xs mb-4">
                        OAB/SP 312.847 · Membro da Comissão de Direito Digital
                    </p>

                    <blockquote className="text-zinc-300 text-sm leading-relaxed border-l-2 border-[#00FF66]/40 pl-3 mb-5 italic">
                        "Após anos atuando em casos de fraude online, criamos o RecuperaPix para que qualquer brasileiro possa acessar seus direitos de reembolso de forma simples, rápida e sem burocracia. Seu dinheiro tem dono — e ele é você."
                    </blockquote>

                    {/* Stats */}
                    <div className="flex items-center justify-around pt-4 border-t border-zinc-800/60">
                        {stats.map(({ value, label }, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <span className="text-[#00FF66] font-display font-bold text-2xl leading-none mb-1">
                                    {value}
                                </span>
                                <span
                                    className="text-zinc-500 text-[9px] font-semibold tracking-wider uppercase leading-tight text-center"
                                    style={{ whiteSpace: "pre-line" }}
                                >
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
