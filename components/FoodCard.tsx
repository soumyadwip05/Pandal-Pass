import Icon from "@/components/Icon";
import { fmtRupees } from "@/lib/format";
import type { Food } from "@/lib/types";

export default function FoodCard({ food }: { food: Food }) {
  return (
    <article className="fcard">
      <div className="fcard__icon" aria-hidden="true">
        <Icon name={food.icon} size={30} strokeWidth={2.1} />
      </div>
      <div>
        <div className="fcard__name">{food.name}</div>
        <div className="fcard__meta">
          {food.kind} · {food.area}
        </div>
        <div className="fcard__price">approx. {fmtRupees(food.price)} / person</div>
      </div>
    </article>
  );
}
