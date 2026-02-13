import type { Metadata } from "next";

import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Terms | Mini Shop",
  description: "Terms of use for the Verdant Lane demo shop.",
};

export default function TermsPage() {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Terms of Use</h1>
      <p className={styles.lead}>
        This project is a demo storefront for learning and portfolio purposes.
      </p>

      <div className={styles.content}>
        <h2>Demo scope</h2>
        <p>
          Payments run in Stripe test mode. No real orders are fulfilled through
          this demo.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Use test data and Stripe test cards only.</li>
          <li>Do not attempt to abuse checkout or webhook endpoints.</li>
          <li>Do not rely on demo data for business decisions.</li>
        </ul>

        <h2>Availability</h2>
        <p>
          The app may be changed, reset, or taken offline at any time without
          notice.
        </p>
      </div>
    </section>
  );
}
