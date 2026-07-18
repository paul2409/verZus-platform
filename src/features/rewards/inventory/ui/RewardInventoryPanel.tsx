"use client";

// VERZUS M10.2 REWARD INVENTORY AND COMPLETE STATE PRESENTATIONS
// VERZUS M10.4 CLAIMABLE INVENTORY ACTIONS

import Image from "next/image";
import { useMemo, useState } from "react";

import { Badge } from "@/components/primitives/badge";

import { RewardClaimAction } from "../../claims";
import { rewardInventoryMock } from "../mocks/reward-inventory.mock";
import {
  buildRewardInventoryCounts,
  filterRewardInventory,
  rewardInventoryFilterLabels,
  rewardStatePresentations,
} from "../model/reward-inventory.view-model";
import {
  rewardInventoryFilters,
  type RewardInventoryFilter,
  type RewardInventoryItem,
} from "../model/reward-inventory.types";
import styles from "./RewardInventoryPanel.module.css";

function RewardInventoryCard({ item }: { item: RewardInventoryItem }) {
  const presentation = rewardStatePresentations[item.state];

  return (
    <li className={styles.rewardCard} data-reward-state={item.state}>
      <Image
        alt={item.artworkAlt}
        className={styles.artwork}
        height={72}
        src={item.artworkSrc}
        width={72}
      />

      <div className={styles.cardCopy}>
        <div className={styles.cardTitleRow}>
          <h3>{item.title}</h3>
          <Badge size="sm" tone={presentation.tone} variant="soft">
            {presentation.label}
          </Badge>
        </div>
        <p>{item.description}</p>
        <dl className={styles.summaryList}>
          <div>
            <dt>Reward</dt>
            <dd>{item.amountLabel}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{item.availabilityLabel}</dd>
          </div>
        </dl>
      </div>

      {item.state === "claimable" ? (
        <div className={styles.claimAction}>
          <RewardClaimAction compact rewardId={item.id} state={item.state} />
        </div>
      ) : null}

      <details className={styles.details}>
        <summary>View details</summary>
        <div className={styles.detailBody}>
          <p>{presentation.helper}</p>
          <dl>
            <div>
              <dt>Source</dt>
              <dd>{item.sourceLabel}</dd>
            </div>
            <div>
              <dt>Requirement</dt>
              <dd>{item.requirementLabel}</dd>
            </div>
            <div>
              <dt>State detail</dt>
              <dd>{item.stateDetail}</dd>
            </div>
            {item.claimReference ? (
              <div>
                <dt>Reference</dt>
                <dd>{item.claimReference}</dd>
              </div>
            ) : null}
            {item.claimedAtLabel ? (
              <div>
                <dt>Claimed</dt>
                <dd>{item.claimedAtLabel}</dd>
              </div>
            ) : null}
            {item.expiresAtLabel ? (
              <div>
                <dt>Window</dt>
                <dd>{item.expiresAtLabel}</dd>
              </div>
            ) : null}
            {item.revokedReason ? (
              <div>
                <dt>Revocation reason</dt>
                <dd>{item.revokedReason}</dd>
              </div>
            ) : null}
          </dl>
          {item.state === "claimable" ? (
            <p className={styles.claimNotice}>
              The server rechecks eligibility and inventory version before granting this reward.
              Retrying the same interrupted request cannot grant a duplicate.
            </p>
          ) : null}
        </div>
      </details>
    </li>
  );
}

export function RewardInventoryPanel({
  items = rewardInventoryMock,
}: {
  items?: RewardInventoryItem[];
} = {}) {
  const [activeFilter, setActiveFilter] = useState<RewardInventoryFilter>("all");
  const counts = useMemo(() => buildRewardInventoryCounts(items), [items]);
  const visibleRewards = useMemo(
    () => filterRewardInventory(items, activeFilter),
    [activeFilter, items],
  );

  return (
    <section
      aria-labelledby="reward-inventory-title"
      className={styles.panel}
      id="reward-inventory"
    >
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Inventory</p>
          <h2 id="reward-inventory-title">All rewards</h2>
        </div>
        <Badge tone="special" variant="outline">
          {counts.all} total
        </Badge>
      </header>

      <div aria-label="Filter reward inventory" className={styles.filters} role="group">
        {rewardInventoryFilters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={styles.filterButton}
            data-active={activeFilter === filter ? "true" : "false"}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            <span>{rewardInventoryFilterLabels[filter]}</span>
            <strong>{counts[filter]}</strong>
          </button>
        ))}
      </div>

      <div aria-live="polite" className={styles.resultSummary}>
        Showing {visibleRewards.length} {visibleRewards.length === 1 ? "reward" : "rewards"}
      </div>

      {visibleRewards.length > 0 ? (
        <ul className={styles.rewardList}>
          {visibleRewards.map((item) => (
            <RewardInventoryCard item={item} key={item.id} />
          ))}
        </ul>
      ) : (
        <div className={styles.emptyState} role="status">
          <strong>No rewards in this state</strong>
          <p>Choose another filter to inspect the rest of the inventory.</p>
        </div>
      )}

      <p className={styles.inventoryNote}>
        Claim actions use server eligibility, inventory versions and idempotency keys. The browser
        never grants or duplicates a reward.
      </p>
    </section>
  );
}
