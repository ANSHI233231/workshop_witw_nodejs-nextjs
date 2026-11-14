-- Parks: drop the entered average safari price. The average safari price is now calculated from the park's packages
-- shown on the website (plan Q2): the lowest and highest price per person, worked out by the park module at every
-- answer and never stored. The entered min / max are no longer read or written anywhere, so the two columns go.
-- Plan: docs/planning/features/2026-11-12-safari-packages.md
--
-- master_park: avg_safari_price_min and avg_safari_price_max removed. No new code maps; no rows change.

ALTER TABLE master_park
    DROP COLUMN avg_safari_price_min,
    DROP COLUMN avg_safari_price_max;
