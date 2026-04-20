export type MockEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  host: string;
  description: string;
  attendees: number;
};

export const mockEvents: MockEvent[] = [
  {
    id: "evt-1",
    title: "First-of-Month Potluck",
    date: "May 3, 2026",
    time: "6:00 PM",
    location: "Patterson Park Pavilion",
    host: "Maya & Jordan",
    description: "Bring a dish, meet the folks who sent or received from you this month. Kids welcome.",
    attendees: 18,
  },
  {
    id: "evt-2",
    title: "Skill Share: Tenant Rights 101",
    date: "May 12, 2026",
    time: "7:00 PM",
    location: "Red Emma's, Waverly",
    host: "Casey",
    description: "A working session led by a club member who is a tenant organizer. Free, all welcome.",
    attendees: 11,
  },
  {
    id: "evt-3",
    title: "Sunday Coffee Hangout",
    date: "May 18, 2026",
    time: "10:00 AM",
    location: "Artifact Coffee, Hampden",
    host: "Alex",
    description: "Casual drop-in. Meet other members in a low-key way. No agenda.",
    attendees: 7,
  },
];

export type MockBoardPost = {
  id: string;
  type: "offer" | "need" | "lead";
  author: string;
  posted: string;
  title: string;
  body: string;
};

export const mockBoardPosts: MockBoardPost[] = [
  {
    id: "post-1",
    type: "offer",
    author: "Dana O.",
    posted: "2 days ago",
    title: "Free haircuts this Saturday",
    body: "I'm a stylist and I'll be doing free haircuts at my place in Hampden, 1–4pm. DM me to book.",
  },
  {
    id: "post-2",
    type: "need",
    author: "Sam W.",
    posted: "4 hours ago",
    title: "Ride to BWI on May 9",
    body: "Flight at 6am — anyone heading that direction? Happy to chip in for gas.",
  },
  {
    id: "post-3",
    type: "lead",
    author: "Taylor C.",
    posted: "yesterday",
    title: "Part-time admin role at a nonprofit",
    body: "My org is hiring a part-time office coordinator. ~20 hrs/wk, $22/hr. Reply if interested.",
  },
  {
    id: "post-4",
    type: "offer",
    author: "Jordan S.",
    posted: "3 days ago",
    title: "Borrow my pressure washer",
    body: "Anyone need it for a stoop or patio? Free to borrow for the weekend.",
  },
];

export type WayToShowUp = {
  id: string;
  title: string;
  description: string;
  cta: string;
};

export const waysToShowUp: WayToShowUp[] = [
  {
    id: "welcome",
    title: "Welcome a new member",
    description: "Three people joined this week. Send a quick hello — it matters more than you'd think.",
    cta: "Say hi",
  },
  {
    id: "learn",
    title: "Host a small skill share",
    description: "Tax tips, bike repair, sourdough, anything. We'll help you find a space.",
    cta: "Propose one",
  },
  {
    id: "task",
    title: "Lend a hand with a task",
    description: "Someone needs a ride to BWI on May 9. Got an hour?",
    cta: "Step up",
  },
  {
    id: "support",
    title: "Check in on a neighbor",
    description: "We pair members for monthly check-ins. Opt in and we'll match you.",
    cta: "Opt in",
  },
];
