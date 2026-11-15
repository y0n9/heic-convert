import { Plus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqList({ items, title = "Questions, answered." }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="faq-section content-width">
      <div className="section-heading centered-heading">
        <span className="section-kicker">GOOD TO KNOW</span>
        <h2>{title}</h2>
        <p>A few clear answers before you convert.</p>
      </div>
      <div className="faq-list">
        {items.map((item, index) => (
          <details key={item.question} open={index === 0}>
            <summary><span>{item.question}</span><Plus size={20} /></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
