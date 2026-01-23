import { Metadata } from "next";
import { MarkdownRenderer } from "@/components/markdown";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | IN Sintonia",
  description: "Learn how IN Sintonia collects, uses, and protects your personal data in compliance with GDPR and EU regulations.",
};

const privacyContent = `
# Privacy Policy

**Last Updated: January 23, 2026**

Welcome to IN Sintonia. We are committed to protecting your personal data and respecting your privacy in accordance with the General Data Protection Regulation (GDPR) and other applicable EU data protection laws.

---

## 1. Data Controller

The data controller responsible for your personal data is:

**IN Sintonia**  
Email: afonso.caboz@gmail.com

For any questions about this privacy policy or our data practices, please contact us at the email address above.

---

## 2. Data We Collect

When you use IN Sintonia, we collect and process the following personal data:

### 2.1 Account Information
- **Email address** — Used for account identification and communication
- **Name** — Used to personalize your experience
- **Profile image** — Provided via your Google account for account identification

### 2.2 Family & Household Data
- **Family name** — To organize your family group
- **House/household names** — To manage different households within your family

### 2.3 Recipe Data
- **Recipe names and descriptions** — Content you create
- **Ingredients and instructions** — Recipe content you add
- **Cooking time and servings** — Recipe metadata
- **Recipe images** — Photos you upload

### 2.4 Recipe Organization
- **Folders and categories** — How you organize your recipes
- **Folder colors and icons** — Your customization preferences

### 2.5 Meal Planning Data
- **Meal plans** — Dates and meal types you schedule
- **Recipe assignments** — Which recipes you plan for which meals

### 2.6 Technical Data
- **Timestamps** — When accounts and content are created/updated
- **Session data** — Authentication tokens for secure access

---

## 3. Legal Basis for Processing

We process your personal data based on the following legal grounds under GDPR Article 6:

| Data Type | Legal Basis |
|-----------|-------------|
| Account information | Contract performance — necessary to provide our service |
| Recipe & meal data | Contract performance — core functionality you requested |
| Family/household data | Contract performance — enables family sharing features |
| Technical data | Legitimate interest — security and service operation |

---

## 4. How We Use Your Data

We use your personal data to:

- **Provide the service** — Enable recipe storage, sharing, and meal planning
- **Authenticate you** — Secure login via Google OAuth
- **Enable family sharing** — Allow family members to share recipes
- **Improve our service** — Understand usage patterns (anonymized)
- **Communicate** — Send essential service-related notifications

We do **not** use your data for:
- Advertising or marketing without consent
- Selling to third parties
- Automated decision-making or profiling

---

## 5. Data Sharing

### 5.1 Within Your Family
Recipes you create are shared with members of your family group on IN Sintonia. You control who is in your family group.

### 5.2 Third-Party Services
We use the following third-party services:

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| Google OAuth | Authentication | Email, name, profile image (from Google) |
| Hosting provider | Infrastructure | All data (encrypted at rest) |

### 5.3 Legal Requirements
We may disclose data when required by law or to protect our legal rights.

---

## 6. Data Retention

We retain your data for the following periods:

| Data Type | Retention Period |
|-----------|-----------------|
| Account data | Until you delete your account |
| Recipes & meal plans | Until you delete them or your account |
| Technical logs | 90 days |

After deletion, data may persist in backups for up to 30 days before being permanently removed.

---

## 7. Your Rights Under GDPR

You have the following rights regarding your personal data:

### 7.1 Right of Access (Article 15)
Request a copy of all personal data we hold about you.

### 7.2 Right to Rectification (Article 16)
Request correction of inaccurate or incomplete data.

### 7.3 Right to Erasure (Article 17)
Request deletion of your personal data ("right to be forgotten").

### 7.4 Right to Data Portability (Article 20)
Receive your data in a structured, machine-readable format.

### 7.5 Right to Restriction (Article 18)
Request limitation of processing in certain circumstances.

### 7.6 Right to Object (Article 21)
Object to processing based on legitimate interests.

### 7.7 Right to Withdraw Consent
Where processing is based on consent, withdraw it at any time.

**To exercise any of these rights, contact us at: afonso.caboz@gmail.com**

We will respond to your request within 30 days. If we cannot comply, we will explain why.

---

## 8. Data Security

We implement appropriate technical and organizational measures to protect your data:

- **Encryption** — Data encrypted in transit (HTTPS) and at rest
- **Access controls** — Strict authentication and authorization
- **Secure infrastructure** — Hosted on reputable cloud providers
- **Regular updates** — Security patches applied promptly

---

## 9. International Transfers

Your data is processed within the European Economic Area (EEA). If data is transferred outside the EEA, we ensure appropriate safeguards such as Standard Contractual Clauses are in place.

---

## 10. Cookies

IN Sintonia uses essential cookies only:

| Cookie | Purpose | Duration |
|--------|---------|----------|
| Session cookie | Authentication | Session |

We do not use tracking or advertising cookies.

---

## 11. Children's Privacy

IN Sintonia is not intended for children under 16. We do not knowingly collect data from children under 16. If you believe we have collected such data, please contact us immediately.

---

## 12. Changes to This Policy

We may update this privacy policy from time to time. We will notify you of significant changes via email or a notice on our website. The "Last Updated" date at the top indicates when the policy was last revised.

---

## 13. Complaints

If you believe we have violated your data protection rights, you have the right to lodge a complaint with your local Data Protection Authority. In Portugal, this is the Comissão Nacional de Proteção de Dados (CNPD).

---

## 14. Contact Us

For any questions, concerns, or requests regarding your personal data:

**Email:** afonso.caboz@gmail.com

We aim to respond to all inquiries within 48 hours.
`;

export default function PrivacyPage() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-xl">
          <Shield className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-500">How we protect your data</p>
        </div>
      </div>

      <div className="prose prose-orange max-w-none">
        <MarkdownRenderer content={privacyContent} />
      </div>
    </div>
  );
}
