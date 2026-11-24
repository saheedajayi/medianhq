// Matches the limit the API enforces on each list
export const MAX_MENTOR_PROFILE_ITEMS = 20;

// Starting points for the profile modal; mentors can also type their own
export const MENTOR_SKILL_SUGGESTIONS = [
  "Product discovery",
  "User research",
  "Product strategy",
  "Data analysis",
  "Financial modelling",
  "Software engineering",
  "Leadership",
  "Career coaching",
];

// The tools offered for each industry, keyed like INDUSTRY_ROLES; people can also type their own
export const TOOLS_BY_INDUSTRY: Record<string, string[]> = {
  Technology: [
    "Git & GitHub",
    "Visual Studio Code",
    "Docker",
    "Kubernetes",
    "Amazon Web Services (AWS)",
    "Microsoft Azure",
    "Google Cloud Platform (GCP)",
    "Figma",
    "Jira",
    "Postman",
    "PostgreSQL",
    "MongoDB",
    "TensorFlow / PyTorch",
    "Power BI",
    "Tableau",
  ],
  Business: [
    "HubSpot",
    "Salesforce",
    "Notion",
    "Slack",
    "Asana",
    "Trello",
    "Monday.com",
    "Google Workspace",
    "Microsoft 365",
    "Shopify",
    "Mailchimp",
    "Google Analytics (GA4)",
    "Semrush",
    "Zendesk",
    "Intercom",
  ],
  Consulting: [
    "Microsoft PowerPoint",
    "Microsoft Excel",
    "Miro",
    "Lucidchart",
    "ClickUp",
    "Smartsheet",
    "Airtable",
    "Calendly",
    "Confluence",
    "Loom",
    "Qwilr",
    "PandaDoc",
    "SurveyMonkey",
    "Typeform",
    "Teamwork.com",
  ],
  Finance: [
    "Microsoft Excel (Financial Modeling)",
    "QuickBooks",
    "Xero",
    "Sage",
    "Oracle NetSuite",
    "SAP S/4HANA",
    "Microsoft Dynamics 365 Finance",
    "Bloomberg Terminal",
    "S&P Capital IQ",
    "Stripe",
    "Paystack",
    "Flutterwave",
    "Wave",
    "Expensify",
    "Gusto",
  ],
};

// Offered whatever the industry
export const GENERAL_TOOL_SUGGESTIONS = [
  "Claude AI",
  "Whimsical",
  "Figma",
  "Notion",
  "Excel",
  "SQL",
  "Python",
  "Jira",
];

const unique = (items: string[]) => [...new Set(items)];

// Every tool, for when no industry has been picked
export const MENTOR_TOOL_SUGGESTIONS = unique([
  ...Object.values(TOOLS_BY_INDUSTRY).flat(),
  ...GENERAL_TOOL_SUGGESTIONS,
]);

/** The tools for one industry plus the general ones, or all of them when it is unknown */
export const getToolSuggestions = (industry?: string | null) =>
  industry && TOOLS_BY_INDUSTRY[industry]
    ? unique([...TOOLS_BY_INDUSTRY[industry], ...GENERAL_TOOL_SUGGESTIONS])
    : MENTOR_TOOL_SUGGESTIONS;
