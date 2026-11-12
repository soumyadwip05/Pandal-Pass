import Icon from "@/components/Icon";

export default function Marquee({ items }: { items: string[] }) {
  const groups = [0, 1];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {groups.map((group) =>
          items.map((item, index) => (
            <span className="marquee__item" key={`${group}-${item}-${index}`}>
              <span>{item}</span>
              <Icon name="sparkles" size={13} strokeWidth={2.4} />
            </span>
          )),
        )}
      </div>
    </div>
  );
}
