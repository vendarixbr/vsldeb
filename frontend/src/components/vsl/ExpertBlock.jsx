export default function ExpertBlock() {
    const stats = [
        { value: "+12", label: "Anos de atuação" },
        { value: "+3.400", label: "Casos resolvidos" },
        { value: "100%", label: "Fraude Digital" },
    ];

    return (
        <div className="rp-fade-in w-full max-w-2xl mx-auto mt-6">
            <div
                className="rounded-2xl overflow-hidden flex flex-col sm:flex-row items-center sm:items-stretch gap-0"
                style={{ backgroundColor: "#0d1a10", border: "1px solid #1e3a26" }}
            >
                {/* Photo */}
                <div className="flex-shrink-0 flex items-end justify-center w-full sm:w-44 pt-6 sm:pt-0 px-6 sm:px-0">
                    <img
                        src="/expert.png"
                        alt="Dr. Ricardo Alves"
                        className="w-40 sm:w-44 object-contain object-bottom"
                        style={{ maxHeight: "260px" }}
                        loading="lazy"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-[#00FF66] border border-[#00FF66]/30 bg-[#00FF66]/5 mb-3 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                        Especialista em Direito Digital
                    </span>

                    <h3 className="font-display text-white text-xl font-bold leading-tight mb-0.5">
                        Dr. Ricardo Alves
                    </h3>
                    <p className="text-zinc-500 text-xs mb-4">
                        OAB/SP 312.847 · Membro da Comissão de Direito Digital
                    </p>

                    <blockquote className="text-zinc-300 text-sm leading-relaxed border-l-2 border-[#00FF66]/40 pl-3 mb-5 italic">
                        "Após anos atuando em casos de fraude online, criamos o RecuperaPix para que qualquer brasileiro possa acessar seus direitos de reembolso de forma simples, rápida e sem burocracia. Seu dinheiro tem dono — e ele é você."
                    </blockquote>

                    {/* Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                        {stats.map(({ value, label }) => (
                            <div key={label} className="flex flex-col">
                                <span className="text-[#00FF66] font-display font-bold text-lg leading-tight">
                                    {value}
                                </span>
                                <span className="text-zinc-500 text-[10px] leading-tight">
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
