import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";

import styles from "./RewardsScreen.module.css";

const balances = [
  { label: "Cash credits", value: "18,500", detail: "Withdrawable", tone: "green" },
  { label: "Bonus credits", value: "6,250", detail: "Platform use", tone: "cyan" },
  { label: "VS Points", value: "2,285", detail: "Competitive score", tone: "gold" },
] as const;

const pools = [
  {
    title: "EA FC Weekly Pool",
    value: "₦250,000",
    status: "Funded",
    closes: "02D : 14H",
    tone: "green",
  },
  {
    title: "Crew War Pool",
    value: "₦500,000",
    status: "War week",
    closes: "04D : 08H",
    tone: "pink",
  },
  {
    title: "Clash Ladder Pool",
    value: "₦120,000",
    status: "Open",
    closes: "12H : 40M",
    tone: "cyan",
  },
] as const;

const activity = [
  { label: "Rookie Cup placement", amount: "+2,500", type: "Cash", time: "Today" },
  { label: "Weekly login mission", amount: "+300", type: "Bonus", time: "Yesterday" },
  { label: "Crew War contribution", amount: "+420", type: "VS Points", time: "Sat" },
] as const;

export function RewardsScreen() {
  return (
    <main className={styles.page} data-stage-4-screen="rewards">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>08.0 // REWARD VAULT</p>
          <h1>Rewards</h1>
          <p>
            VS Credits are rewards. Cash credits can be withdrawn; bonus credits are for platform
            use. VS Points remain competitive ranking scores.
          </p>
        </div>
        <Badge tone="positive" variant="outline">
          Wallet verified
        </Badge>
      </header>

      <section aria-labelledby="balance-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>08.1 // BALANCES</p>
            <h2 id="balance-title">Your vault</h2>
          </div>
          <Button leadingIcon="credit-card" variant="primary">
            Withdraw cash credits
          </Button>
        </div>

        <dl className={styles.balanceGrid}>
          {balances.map((balance) => (
            <div data-tone={balance.tone} key={balance.label}>
              <dt>{balance.label}</dt>
              <dd>{balance.value}</dd>
              <span>{balance.detail}</span>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="pool-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>08.2 // FUNDED POOLS</p>
            <h2 id="pool-title">Weekly VS Pools</h2>
          </div>
          <Badge tone="warning" variant="outline">
            3 active pools
          </Badge>
        </div>

        <div className={styles.poolGrid}>
          {pools.map((pool) => (
            <article data-tone={pool.tone} key={pool.title}>
              <header>
                <span className={styles.poolIcon}>
                  <Icon decorative name="trophy" size="md" />
                </span>
                <Badge
                  tone={
                    pool.tone === "pink"
                      ? "special"
                      : pool.tone === "green"
                        ? "positive"
                        : "information"
                  }
                  variant="outline"
                >
                  {pool.status}
                </Badge>
              </header>
              <div>
                <h3>{pool.title}</h3>
                <strong>{pool.value}</strong>
              </div>
              <footer>
                <span>Locks in</span>
                <strong>{pool.closes}</strong>
              </footer>
              <Button fullWidth variant="secondary">
                View pool details
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="activity-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>08.3 // CREDIT ACTIVITY</p>
            <h2 id="activity-title">Recent rewards</h2>
          </div>
        </div>

        <ul className={styles.activityList}>
          {activity.map((item) => (
            <li key={`${item.label}-${item.time}`}>
              <span className={styles.activityIcon}>
                <Icon decorative name="gift" size="sm" />
              </span>
              <div>
                <strong>{item.label}</strong>
                <span>
                  {item.type} · {item.time}
                </span>
              </div>
              <strong className={styles.amount}>{item.amount}</strong>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
