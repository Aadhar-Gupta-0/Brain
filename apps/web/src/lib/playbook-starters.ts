/**
 * Grounded playbook starting points: these are questions, not company facts.
 * Generation must retrieve the tenant's own documents and cite sources.
 */
export type PlaybookCategory =
  | 'Engineering' | 'Security' | 'Product' | 'Operations'
  | 'Finance' | 'People' | 'Sales' | 'Customer Success'
  | 'Marketing' | 'Data' | 'Legal' | 'Leadership';

export interface PlaybookStarter {
  id: string;
  category: PlaybookCategory;
  title: string;
  topic: string;
}

export const PLAYBOOK_CATEGORIES: readonly (PlaybookCategory | 'All')[] = [
  'All', 'Engineering', 'Security', 'Product', 'Operations', 'Finance',
  'People', 'Sales', 'Customer Success', 'Marketing', 'Data', 'Legal', 'Leadership',
];

export const PLAYBOOK_STARTERS: readonly PlaybookStarter[] = [
  { id: 'eng-release', category: 'Engineering', title: 'Release process', topic: 'How does our team ship a production release, including approvals, rollback and verification?' },
  { id: 'sec-incident', category: 'Security', title: 'Security incident response', topic: 'What is our documented security incident escalation, containment and reporting process?' },
  { id: 'ops-oncall', category: 'Operations', title: 'On-call handover', topic: 'How do on-call rotations, escalation and handover work for our services?' },
  { id: 'cs-onboarding', category: 'Customer Success', title: 'Customer onboarding', topic: 'What are the documented steps, ownership and milestones for onboarding a new customer?' },
  { id: 'eng-rollback', category: 'Engineering', title: 'Rollback procedures', topic: 'How do we decide to roll back a failed deployment, execute the rollback and verify recovery?' },
  { id: 'eng-architecture', category: 'Engineering', title: 'Architecture decisions', topic: 'Where are our architecture decisions recorded, and how are trade-offs reviewed and approved?' },
  { id: 'eng-code-review', category: 'Engineering', title: 'Code review standards', topic: 'What are our documented expectations for pull request reviews, ownership and required checks?' },
  { id: 'eng-ci', category: 'Engineering', title: 'Continuous integration', topic: 'How are our build pipelines structured, which checks are mandatory and how are failures resolved?' },
  { id: 'eng-api', category: 'Engineering', title: 'API compatibility', topic: 'How do we version APIs, announce breaking changes and migrate existing consumers?' },
  { id: 'sec-access', category: 'Security', title: 'Access reviews', topic: 'How do we provision, review and revoke employee access across company systems?' },
  { id: 'sec-secrets', category: 'Security', title: 'Secret rotation', topic: 'What is our approved procedure for detecting, rotating and revoking exposed credentials?' },
  { id: 'sec-vulnerability', category: 'Security', title: 'Vulnerability triage', topic: 'How do we intake, prioritize, remediate and verify reported vulnerabilities?' },
  { id: 'sec-vendor', category: 'Security', title: 'Vendor risk reviews', topic: 'How are third-party vendors evaluated for security, privacy and contractual risk?' },
  { id: 'sec-privacy', category: 'Security', title: 'Personal data handling', topic: 'What policies govern the collection, retention, deletion and sharing of personal data?' },
  { id: 'prod-discovery', category: 'Product', title: 'Customer discovery', topic: 'What have customers told us about their problems, and how do those findings influence product decisions?' },
  { id: 'prod-roadmap', category: 'Product', title: 'Roadmap prioritization', topic: 'How do we prioritize roadmap proposals against customer impact, effort and strategic goals?' },
  { id: 'prod-launch', category: 'Product', title: 'Product launch checklist', topic: 'What is the documented process for launching a feature, from readiness checks to release communications?' },
  { id: 'prod-feedback', category: 'Product', title: 'Feedback triage', topic: 'How do we collect, classify and respond to product feedback from customers and teammates?' },
  { id: 'prod-experiments', category: 'Product', title: 'Product experiments', topic: 'How do we define hypotheses, success metrics and decisions for product experiments?' },
  { id: 'ops-incident', category: 'Operations', title: 'Service incident operations', topic: 'Who coordinates customer communications, incident ownership and follow-up during service disruptions?' },
  { id: 'ops-change', category: 'Operations', title: 'Change management', topic: 'Which operational changes require review, approval, communication and a rollback plan?' },
  { id: 'ops-capacity', category: 'Operations', title: 'Capacity planning', topic: 'How do we forecast infrastructure capacity, cost and performance requirements?' },
  { id: 'ops-backups', category: 'Operations', title: 'Backup and restore', topic: 'Where are backup responsibilities, recovery targets and restore exercises documented?' },
  { id: 'ops-continuity', category: 'Operations', title: 'Business continuity', topic: 'What plans cover critical business processes when systems, offices or vendors become unavailable?' },
  { id: 'fin-budget', category: 'Finance', title: 'Annual budgeting', topic: 'How do departments propose, approve and monitor their annual budgets?' },
  { id: 'fin-spend', category: 'Finance', title: 'Expense approvals', topic: 'What spending thresholds require approvals, receipts and budget-owner review?' },
  { id: 'fin-forecast', category: 'Finance', title: 'Revenue forecasting', topic: 'How do we build, update and reconcile forecasts for revenue and operating expenses?' },
  { id: 'fin-close', category: 'Finance', title: 'Monthly close', topic: 'What tasks, ownership and timelines govern our monthly financial close process?' },
  { id: 'fin-pricing', category: 'Finance', title: 'Pricing governance', topic: 'How are prices, discounts and nonstandard commercial terms evaluated and approved?' },
  { id: 'people-onboard', category: 'People', title: 'Employee onboarding', topic: 'How do new employees receive equipment, access, training and clear first-month goals?' },
  { id: 'people-offboard', category: 'People', title: 'Employee offboarding', topic: 'What are the approved steps for device return, access removal and knowledge handover?' },
  { id: 'people-performance', category: 'People', title: 'Performance reviews', topic: 'How are performance expectations set, feedback documented and review decisions calibrated?' },
  { id: 'people-hiring', category: 'People', title: 'Hiring process', topic: 'How are job requirements, interviews, evaluation rubrics and hiring decisions managed?' },
  { id: 'people-leave', category: 'People', title: 'Leave and coverage', topic: 'What are the policies for requesting leave and ensuring team coverage during absences?' },
  { id: 'sales-qualification', category: 'Sales', title: 'Lead qualification', topic: 'What criteria determine whether a prospective customer is qualified for our sales process?' },
  { id: 'sales-discovery', category: 'Sales', title: 'Sales discovery calls', topic: 'Which discovery questions, research and follow-up steps are expected before a product demonstration?' },
  { id: 'sales-handoff', category: 'Sales', title: 'Sales to success handoff', topic: 'How do account executives transfer commitments, risks and customer context to customer success?' },
  { id: 'sales-deals', category: 'Sales', title: 'Deal approvals', topic: 'What process governs pricing exceptions, contractual concessions and high-value deal approvals?' },
  { id: 'sales-loss', category: 'Sales', title: 'Win-loss analysis', topic: 'What have we learned from won and lost opportunities, and how do we act on those findings?' },
  { id: 'cs-kickoff', category: 'Customer Success', title: 'Implementation kickoff', topic: 'How do we prepare and run a kickoff with a newly signed enterprise customer?' },
  { id: 'cs-health', category: 'Customer Success', title: 'Account health signals', topic: 'Which documented signals indicate customer adoption, satisfaction or churn risk?' },
  { id: 'cs-escalation', category: 'Customer Success', title: 'Customer escalation', topic: 'How are urgent customer issues prioritized, assigned and communicated through resolution?' },
  { id: 'cs-renewal', category: 'Customer Success', title: 'Renewal planning', topic: 'What milestones and responsibilities guide enterprise subscription renewals?' },
  { id: 'cs-qbr', category: 'Customer Success', title: 'Business reviews', topic: 'How do we prepare customer business reviews with outcomes, usage and open risks?' },
  { id: 'mkt-campaign', category: 'Marketing', title: 'Campaign planning', topic: 'How do we plan, launch and measure cross-channel marketing campaigns?' },
  { id: 'mkt-brand', category: 'Marketing', title: 'Brand messaging', topic: 'What positioning, brand voice and approved claims guide our public communications?' },
  { id: 'mkt-content', category: 'Marketing', title: 'Editorial workflow', topic: 'How do we research, draft, approve and publish customer-facing content?' },
  { id: 'mkt-attribution', category: 'Marketing', title: 'Attribution reporting', topic: 'What methods and limitations apply to measuring marketing-sourced pipeline and revenue?' },
  { id: 'mkt-events', category: 'Marketing', title: 'Event follow-up', topic: 'What is our process for event planning, lead capture and post-event follow-up?' },
  { id: 'data-governance', category: 'Data', title: 'Data ownership', topic: 'Who owns our core datasets, and how are data quality and access issues escalated?' },
];

export function filterPlaybookStarters(
  query: string,
  category: PlaybookCategory | 'All' = 'All',
): PlaybookStarter[] {
  const needle = query.trim().toLowerCase().slice(0, 150);
  return PLAYBOOK_STARTERS.filter((starter) => (
    (category === 'All' || starter.category === category) &&
    (!needle || [starter.title, starter.topic, starter.category].some((text) =>
      text.toLowerCase().includes(needle)))
  ));
}
