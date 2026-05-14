import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        q: "Isso funciona mesmo?",
        a: "Sim. A recuperação de valores via PIX é prevista pelo Banco Central por meio do Mecanismo Especial de Devolução (MED) e por outros instrumentos jurídicos. Nossa metodologia organiza essas etapas e orienta cada usuário a agir rapidamente, com base em mais de 47 mil atendimentos realizados.",
    },
    {
        q: "Quanto tempo demora?",
        a: "Os primeiros movimentos podem acontecer em até 24 horas. A devolução, quando ocorre, geralmente é concluída entre 7 e 30 dias úteis, dependendo da resposta do banco e da complexidade do caso.",
    },
    {
        q: "Posso consultar gratuitamente?",
        a: "Sim. A consulta inicial é 100% gratuita. Após avaliar o seu caso, mostramos com total transparência qual é o melhor caminho — antes de qualquer compromisso financeiro.",
    },
    {
        q: "O processo é seguro?",
        a: "Totalmente. Não pedimos sua senha do banco, nem acesso a aplicativos. Trabalhamos apenas com as informações públicas do caso e com os canais oficiais do Banco Central e da sua instituição financeira.",
    },
];

export default function FAQ() {
    return (
        <section
            data-testid="vsl-faq"
            className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20"
        >
            <div className="text-center mb-10">
                <p className="text-xs tracking-[0.3em] uppercase text-[#00FF66] font-semibold mb-3">
                    Dúvidas frequentes
                </p>
                <h2 className="font-display text-3xl sm:text-4xl text-white font-medium tracking-tight">
                    Tudo o que você precisa saber.
                </h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-3">
                {faqs.map((f, i) => (
                    <AccordionItem
                        key={i}
                        value={`item-${i}`}
                        data-testid={`vsl-faq-item-${i}`}
                        className="rp-glass rounded-xl px-5 border data-[state=open]:border-[#00FF66]/40 transition-colors"
                    >
                        <AccordionTrigger className="font-display text-base sm:text-lg text-white hover:no-underline py-5 text-left">
                            {f.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-zinc-400 text-sm sm:text-base leading-relaxed pb-5">
                            {f.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
    );
}
