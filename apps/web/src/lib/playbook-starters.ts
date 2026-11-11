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
