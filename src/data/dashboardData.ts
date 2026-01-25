export type SidebarLink = {
  label: string;
  href: string;
  icon: "LayoutDashboard" | "CalendarCheck" | "Users" | "BadgeDollarSign" | "FileText" | "Settings";
};

export type StatCard = {
  id: string;
  title: string;
  value: number;
  prefix?: string;
  helper?: string;
  icon: "CalendarCheck" | "Users" | "BadgeDollarSign";
};

export type EarningsPoint = {
  label: string;
  amount: number;
};

export type BookingRow = {
  id: string;
  customer: string;
  service: string;
  date: string;
  status: "Complete" | "In Progress" | "Pending";
  amount: number;
};

export const sidebarLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Bookings", href: "/bookings", icon: "CalendarCheck" },
  {
    label: "Service Requests",
    href: "/service-requests",
    icon: "FileText",
  },
  { label: "Cleaners", href: "/users", icon: "Users" },
  { label: "Pricing", href: "/pricing", icon: "BadgeDollarSign" },
  { label: "Job Reports", href: "/job-reports", icon: "FileText" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

export const statCards: StatCard[] = [
  {
    id: "bookings",
    title: "Total Bookings",
    value: 340,
    helper: "This week",
    icon: "CalendarCheck",
  },
  {
    id: "cleaners",
    title: "Active Cleaners",
    value: 25,
    helper: "On duty",
    icon: "Users",
  },
  {
    id: "revenue",
    title: "Total Revenue",
    value: 12450,
    prefix: "$",
    helper: "MTD",
    icon: "BadgeDollarSign",
  },
];

export const earningsBreakdown: Record<"daily" | "weekly" | "monthly" | "yearly", EarningsPoint[]> = {
  daily: [
    { label: "Mon", amount: 210 },
    { label: "Tue", amount: 168 },
    { label: "Wed", amount: 192 },
    { label: "Thu", amount: 154 },
    { label: "Fri", amount: 220 },
    { label: "Sat", amount: 130 },
    { label: "Sun", amount: 175 },
  ],
  weekly: [
    { label: "Week 1", amount: 1240 },
    { label: "Week 2", amount: 1380 },
    { label: "Week 3", amount: 1120 },
    { label: "Week 4", amount: 1490 },
  ],
  monthly: [
    { label: "Jan", amount: 5200 },
    { label: "Feb", amount: 4800 },
    { label: "Mar", amount: 5500 },
    { label: "Apr", amount: 5100 },
    { label: "May", amount: 6200 },
    { label: "Jun", amount: 5800 },
    { label: "Jul", amount: 6400 },
    { label: "Aug", amount: 6000 },
    { label: "Sep", amount: 5900 },
    { label: "Oct", amount: 6500 },
    { label: "Nov", amount: 6300 },
    { label: "Dec", amount: 7200 },
  ],
  yearly: [
    { label: "2021", amount: 58000 },
    { label: "2022", amount: 64500 },
    { label: "2023", amount: 70200 },
    { label: "2024", amount: 75800 },
  ],
};

export const bookingRows: BookingRow[] = [
  {
    id: "#RES-10245",
    customer: "Rahim Ahmed",
    service: "Residential",
    date: "02 Nov",
    status: "Complete",
    amount: 50,
  },
  {
    id: "#COM-1009",
    customer: "Sara Malik",
    service: "Commercial",
    date: "02 Nov",
    status: "In Progress",
    amount: 80,
  },
  {
    id: "#RES-10248",
    customer: "Rahim Ahmed",
    service: "Residential",
    date: "02 Nov",
    status: "Complete",
    amount: 65,
  },
  {
    id: "#RES-1050",
    customer: "Ava Brooks",
    service: "Residential",
    date: "02 Nov",
    status: "Pending",
    amount: 95,
  },
  {
    id: "#COM-1010",
    customer: "Commercial Group",
    service: "Commercial",
    date: "02 Nov",
    status: "In Progress",
    amount: 125,
  },
];

export const headerUser = {
  name: "Jafor Mia",
  role: "Admin",
  avatar: "https://ui-avatars.com/api/?name=Jafor+Mia&background=C85344&color=fff",
};
