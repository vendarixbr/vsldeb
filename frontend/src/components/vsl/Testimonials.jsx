import { Star, BadgeCheck } from "lucide-react";

const AVATARS = [
    "https://images.unsplash.com/photo-1764545973653-94c40d993495?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBhdmF0YXIlMjBwb3J0cmFpdCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3ODYxOTc2OHww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1762291629616-3e2c044c79a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBhdmF0YXIlMjBwb3J0cmFpdCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3ODYxOTc2OHww&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1764546373114-2d7a87221733?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhdmF0YXIlMjBwb3J0cmFpdCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3ODYxOTc2OHww&ixlib=rb-4.1.0&q=85",
];

const testimonials = [
    {
        name: "Carlos Eduardo M.",
        city: "São Paulo · SP",
        avatar: AVATARS[0],
        amount: "R$ 4.380",
        text: "Caí num golpe de PIX falso me passando por uma loja conhecida. Achei que tinha perdido tudo. Em poucos dias seguindo o passo a passo, consegui acionar o banco e recuperei o valor integral. Mudou totalmente minha visão sobre como agir nessas situações.",
        when: "há 2 semanas",
    },
    {
        name: "Juliana R. Souza",
        city: "Belo Horizonte · MG",
        avatar: AVATARS[1],
        amount: "R$ 1.920",
        text: "Transferi para a chave errada e o destinatário se recusou a devolver. Pensei que ia perder. A orientação foi rápida, clara e me ajudou a abrir o MED corretamente. Recebi de volta em 11 dias. Recomendo demais.",
        when: "há 1 mês",
    },
    {
        name: "Antônio Pereira",
        city: "Recife · PE",
        avatar: AVATARS[2],
        amount: "R$ 9.700",
        text: "Sofri um golpe sofisticado de falso boleto via PIX. Já estava conformado em perder o dinheiro. Com o suporte da equipe, entrei com a reclamação no banco e no Bacen — e o valor caiu na conta. Atendimento sério e humano.",
        when: "há 3 semanas",
    },
];

function Stars() {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className="w-3.5 h-3.5 text-[#00FF66]"
                    fill="#00FF66"
                />
            ))}
        </div>
    );
}

export default function Testimonials() {
    return (
        <section
            data-testid="vsl-testimonials"
            className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20"
        >
            <div className="text-center mb-12">
                <p className="text-xs tracking-[0.3em] uppercase text-[#00FF66] font-semibold mb-3">
                    Depoimentos verificados
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-white font-medium tracking-tight">
                    Histórias reais de quem conseguiu recuperar.
                </h2>
                <p className="mt-3 text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
                    Nota média{" "}
                    <span className="text-white font-semibold">4.9 / 5</span>{" "}
                    em mais de 12.300 avaliações públicas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {testimonials.map((t, i) => (
                    <article
                        key={i}
                        data-testid={`vsl-testimonial-${i}`}
                        className="rp-glass rounded-2xl p-6 hover:border-[#00FF66]/30 transition-colors duration-300 flex flex-col"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <img
                                src={t.avatar}
                                alt={t.name}
                                loading="lazy"
                                className="w-11 h-11 rounded-full object-cover border border-white/10"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-white text-sm font-semibold truncate">
                                        {t.name}
                                    </p>
                                    <BadgeCheck className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {t.city}
                                </p>
                            </div>
                            <Stars />
                        </div>

                        <p className="text-sm text-zinc-300 leading-relaxed flex-1">
                            "{t.text}"
                        </p>

                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs text-zinc-500">
                                {t.when}
                            </span>
                            <span className="text-xs font-mono text-[#00FF66] bg-[#00FF66]/5 border border-[#00FF66]/20 px-2 py-1 rounded-md">
                                Recuperou {t.amount}
                            </span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
