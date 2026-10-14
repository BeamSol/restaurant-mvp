/** Eyebrow + H2 (+ optional lead and action). `tone="band"` for dark band sections. */
export default function SectionTitle({
  id,
  eyebrow,
  title,
  lead,
  action,
  center = false,
  tone = "default",
}: {
  id: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
  center?: boolean;
  tone?: "default" | "band";
}) {
  return (
    <div className={`mb-8 flex gap-4 lg:mb-12 ${center ? "flex-col items-center text-center" : "flex-wrap items-end justify-between"}`} data-reveal>
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className={`eyebrow mb-3 ${tone === "band" ? "!text-primary-soft" : ""}`}>{eyebrow}</p>}
        <h2 id={id} className="h2">
          {title}
        </h2>
        {lead && <p className={`lead mt-3 ${tone === "band" ? "!text-on-band/70" : ""}`}>{lead}</p>}
      </div>
      {action}
    </div>
  );
}
