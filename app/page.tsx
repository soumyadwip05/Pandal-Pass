import Link from "next/link";
import FoodCard from "@/components/FoodCard";
import HeroImage from "@/components/HeroImage";
import Icon from "@/components/Icon";
import Marquee from "@/components/Marquee";
import PandalCard from "@/components/PandalCard";
import { getProductData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getProductData();
  const picks = data.home.pickIds
    .map((id) => data.pandals.find((pandal) => pandal.id === id))
    .filter((pandal): pandal is NonNullable<typeof pandal> => Boolean(pandal));
  const teaserFoods = data.foods.slice(0, data.home.foodCount);

  return (
    <>
      <section className="hero-home">
        <HeroImage />
        <div className="shell hero-home__grid">
          <div className="hero-copy">
            <p className="eyebrow">Kolkata - {data.site.festival} planner</p>
            <h1>
              Your PandalPass night,
              <br />
              <em>perfectly plotted.</em>
            </h1>
            <p className="lead">
              Tell us where you&apos;re starting and how you like to roam. PandalPass stitches the pandals, food stops and travel legs into one easy night out.
            </p>
            <div className="hero-copy__actions">
              <Link className="btn btn--wine" href="/planner">Build my route</Link>
              <Link className="btn btn--ghost-light" href="/explore">Explore pandals</Link>
            </div>
            <p className="note">{data.site.planningNote}</p>
          </div>
        </div>

        <div className="shell hero-stats">
          <div className="stat">
            <span className="stat__num">{data.pandals.length}</span>
            <span className="stat__label">Pandals</span>
          </div>
          <div className="stat">
            <span className="stat__num">{data.starts.length}</span>
            <span className="stat__label">Start points</span>
          </div>
          <div className="stat">
            <span className="stat__num">{data.foods.length}</span>
            <span className="stat__label">Food stops</span>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          data.site.festival,
          `${data.pandals.length} pandals`,
          `${data.starts.length} start points`,
          `${data.foods.length} food stops`,
        ]}
      />

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>Three calm steps to a big PandalPass night.</h2>
          </div>
          <div className="steps-grid">
            <article className="step-card">
              <span className="step-card__num">01</span>
              <h3>Set your start</h3>
              <p>Pick a launch point, from Barasat to Behala, and tell us how long you have.</p>
            </article>
            <article className="step-card">
              <span className="step-card__num">02</span>
              <h3>Pick your vibe</h3>
              <p>Iconic, Instagram-ready, low-crowd, family friendly or full of energy. Mix and match.</p>
            </article>
            <article className="step-card">
              <span className="step-card__num">03</span>
              <h3>Follow the pass</h3>
              <p>Get a timed route with travel legs, wait times and a food stop in the right place.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="shell">
          <div className="section-head section-head--row">
            <div>
              <p className="eyebrow">Pandal radar</p>
              <h2>Tonight&apos;s picks</h2>
            </div>
            <Link className="link-arrow" href="/explore">
              See all {data.pandals.length} pandals <Icon name="arrowRight" size={13} />
            </Link>
          </div>
          <div className="card-grid card-grid--picks">
            {picks.map((pandal) => (
              <PandalCard
                key={pandal.id}
                pandal={pandal}
                glyph={data.pandalGlyphs[pandal.id % data.pandalGlyphs.length]}
                crowdLabel={data.crowdLabels[pandal.crowd]}
                tagLabels={data.tagLabels}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell food-teaser">
          <div>
            <p className="eyebrow">Fuel the crawl</p>
            <h2>Food stops between the lights.</h2>
            <p>
              Bhog, phuchka, rolls, mishti and late-night cha, tucked into your route so nobody gets hangry.
            </p>
            <Link className="btn btn--ghost" href="/food">Browse food stops</Link>
          </div>
          <div className="food-teaser__list">
            {teaserFoods.map((food) => (
              <FoodCard food={food} key={food.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell cta-band__inner">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2>Let&apos;s map your PandalPass night.</h2>
          </div>
          <Link className="btn btn--gold" href="/planner">Start planning</Link>
        </div>
      </section>
    </>
  );
}
