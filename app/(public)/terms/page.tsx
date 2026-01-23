import { Metadata } from "next";
import { MarkdownRenderer } from "@/components/markdown";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | IN Sintonia",
  description: "Terms and conditions for using IN Sintonia - your family recipe sharing platform.",
};

const termsContent = `
# Terms of Service

**Last Updated: January 23, 2026**

Welcome to IN Sintonia. These Terms of Service ("Terms") govern your use of our recipe sharing and meal planning platform. By accessing or using IN Sintonia, you agree to be bound by these Terms.

---

## 1. Acceptance of Terms

By creating an account or using IN Sintonia, you confirm that:

- You are at least 16 years old
- You have the legal capacity to enter into these Terms
- You agree to comply with all applicable laws and regulations
- You accept our [Privacy Policy](/privacy)

If you do not agree to these Terms, please do not use our service.

---

## 2. Description of Service

IN Sintonia is a family recipe management and meal planning platform that allows you to:

- **Store recipes** — Save your favorite recipes with ingredients, instructions, and photos
- **Organize recipes** — Create folders and categories to organize your collection
- **Share with family** — Invite family members to view and contribute recipes
- **Plan meals** — Schedule recipes on a calendar for meal planning
- **Manage households** — Organize family members into different households

---

## 3. Account Registration

### 3.1 Account Creation
To use IN Sintonia, you must create an account using Google authentication. You are responsible for:

- Providing accurate information
- Maintaining the security of your account
- All activities that occur under your account

### 3.2 Account Termination
We reserve the right to suspend or terminate your account if you:

- Violate these Terms
- Engage in fraudulent or illegal activity
- Abuse or misuse the service

You may delete your account at any time by contacting us.

---

## 4. User Content

### 4.1 Your Content
"User Content" includes recipes, images, meal plans, and any other content you create or upload. You retain ownership of your User Content.

### 4.2 License Grant
By uploading User Content, you grant IN Sintonia a non-exclusive, worldwide, royalty-free license to:

- Store and display your content
- Share content with your designated family members
- Create backups for service continuity

This license terminates when you delete your content or account.

### 4.3 Content Guidelines
You agree not to upload content that:

- Infringes intellectual property rights
- Contains illegal material
- Is harmful, abusive, or harassing
- Contains malware or malicious code
- Violates any applicable laws

### 4.4 Content Removal
We reserve the right to remove content that violates these Terms without prior notice.

---

## 5. Family Sharing

### 5.1 Family Groups
You may create or join family groups to share recipes. As a family creator, you can:

- Invite members to your family
- Create households within your family
- Manage family settings

### 5.2 Shared Content
Recipes shared within a family are visible to all family members. You are responsible for only sharing content you have the right to share.

### 5.3 Family Member Conduct
You are not responsible for the actions of other family members, but inappropriate behavior by family members may affect your family group.

---

## 6. Acceptable Use

You agree to use IN Sintonia only for lawful purposes. You must not:

- Attempt to gain unauthorized access to our systems
- Use automated tools to scrape or access our service
- Interfere with the service's operation
- Impersonate others or misrepresent your identity
- Use the service for commercial purposes without permission
- Reverse engineer our software
- Circumvent security measures

---

## 7. Intellectual Property

### 7.1 Our Property
IN Sintonia, including its design, features, and code, is owned by us and protected by intellectual property laws. You may not copy, modify, or distribute our intellectual property without permission.

### 7.2 Trademarks
"IN Sintonia" and our logo are trademarks. You may not use them without our written consent.

### 7.3 Feedback
If you provide feedback or suggestions, we may use them without obligation to you.

---

## 8. Third-Party Services

### 8.1 Authentication
We use Google for authentication. Your use of Google services is subject to Google's terms and privacy policy.

### 8.2 Links
Our service may contain links to third-party websites. We are not responsible for their content or practices.

---

## 9. Service Availability

### 9.1 Availability
We strive to maintain high availability but do not guarantee uninterrupted service. We may:

- Perform maintenance with or without notice
- Modify or discontinue features
- Experience downtime due to technical issues

### 9.2 Modifications
We may modify these Terms or the service at any time. Significant changes will be communicated via email or service notification. Continued use after changes constitutes acceptance.

---

## 10. Disclaimers

### 10.1 "As Is" Service
IN Sintonia is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to:

- Merchantability
- Fitness for a particular purpose
- Non-infringement
- Accuracy of content

### 10.2 Recipe Content
We do not verify recipes for accuracy, safety, or nutritional content. Users are responsible for:

- Verifying recipe accuracy
- Checking for allergens
- Ensuring food safety practices

---

## 11. Limitation of Liability

### 11.1 Exclusion of Damages
To the maximum extent permitted by law, IN Sintonia shall not be liable for:

- Indirect, incidental, or consequential damages
- Loss of data, profits, or business opportunities
- Damages from unauthorized access to your account
- Service interruptions or errors

### 11.2 Maximum Liability
Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim (if any), or €100, whichever is greater.

### 11.3 Consumer Rights
These limitations do not affect your statutory rights as a consumer under EU law.

---

## 12. Indemnification

You agree to indemnify and hold harmless IN Sintonia from any claims, damages, or expenses arising from:

- Your violation of these Terms
- Your User Content
- Your use of the service
- Your violation of any third-party rights

---

## 13. Governing Law and Disputes

### 13.1 Governing Law
These Terms are governed by the laws of Portugal and the European Union.

### 13.2 Jurisdiction
Any disputes shall be resolved in the courts of Portugal, unless you are a consumer with the right to bring proceedings in your country of residence under applicable EU consumer protection laws.

### 13.3 Alternative Dispute Resolution
For EU consumers: You may use the European Commission's Online Dispute Resolution platform at https://ec.europa.eu/consumers/odr

---

## 14. General Provisions

### 14.1 Entire Agreement
These Terms, together with our Privacy Policy, constitute the entire agreement between you and IN Sintonia.

### 14.2 Severability
If any provision is found unenforceable, the remaining provisions shall continue in effect.

### 14.3 Waiver
Failure to enforce any provision does not constitute a waiver of that provision.

### 14.4 Assignment
You may not assign your rights under these Terms. We may assign our rights to any successor.

### 14.5 Language
These Terms are provided in English. In case of translation conflicts, the English version prevails.

---

## 15. Contact Information

For questions about these Terms of Service:

**Email:** afonso.caboz@gmail.com

**IN Sintonia**

---

## 16. Acknowledgment

By using IN Sintonia, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.

Thank you for using IN Sintonia! We hope you enjoy sharing recipes with your family. 🍳
`;

export default function TermsPage() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-xl">
          <FileText className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-sm text-gray-500">Rules for using IN Sintonia</p>
        </div>
      </div>

      <div className="prose prose-orange max-w-none">
        <MarkdownRenderer content={termsContent} />
      </div>
    </div>
  );
}
