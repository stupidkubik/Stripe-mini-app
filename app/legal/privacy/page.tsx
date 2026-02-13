import type { Metadata } from "next";

import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Privacy | Mini Shop",
  description: "Privacy notice for the Verdant Lane demo shop.",
};

export default function PrivacyPage() {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Privacy Notice</h1>
      <p className={styles.lead}>
        This page explains what data is used in this demo application.
      </p>

      <div className={styles.content}>
        <h2>Checkout data</h2>
        <p>
          Email and cart data are sent to Stripe to create test Checkout
          sessions. Stripe handles payment form data on its hosted page.
        </p>

        <h2>Local storage</h2>
        <p>
          Cart items and promo input are stored in browser localStorage to keep
          your session between refreshes.
        </p>

        <h2>Server logs</h2>
        <p>
          The app logs technical errors for debugging. Do not enter real
          personal or card data outside Stripe test mode.
        </p>
      </div>
    </section>
  );
}
