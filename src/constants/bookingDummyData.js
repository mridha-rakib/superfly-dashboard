export const bookingDummyData = [
  {
    id: "BKG-001",
    customerInfo: {
      businessName: "Tech Solutions Ltd.",
      email: "info@techsolutions.com",
      phone: "01715000111",
      city: "Dhaka",
      address: "House 12, Road 5, Gulshan 2",
    },
    cleaningDetails: {
      serviceType: "Residential Cleaning",
      squareFoot: 1500,
      frequency: "one-time",
    },
    scheduling: {
      preferredDate: "2025-01-10",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      assignedCleaner: "Ayesha Khan",
      jobNote: "Handle kitchen area carefully.",
    },
    pricing: {
      totalPrice: 250,
      cleanerPrice: 150,
    },
    status: "Ongoing",
    payment: "Paid",
    paymentStatus: "Paid",
  },

  {
    id: "BKG-002",
    customerInfo: {
      businessName: "BD Interior Works",
      email: "contact@bdinterior.com",
      phone: "01890022334",
      city: "Chattogram",
      address: "CEG Tower, Agrabad",
    },
    cleaningDetails: {
      serviceType: "Deep Cleaning",
      squareFoot: 2300,
      frequency: "weekly",
    },
    scheduling: {
      preferredDate: "2025-01-12",
      startTime: "2:00 PM",
      endTime: "5:00 PM",
      assignedCleaner: "Rafiq Islam",
      jobNote: "Special focus on carpets.",
    },
    pricing: {
      totalPrice: 480,
      cleanerPrice: 300,
    },
    status: "Pending",
    payment: "Unpaid",
    paymentStatus: "Unpaid",
  },

  {
    id: "BKG-003",
    customerInfo: {
      businessName: "Fresh Mart Superstore",
      email: "admin@freshmart.com",
      phone: "01611000999",
      city: "Sylhet",
      address: "Zindabazar Main Road",
    },
    cleaningDetails: {
      serviceType: "Commercial Cleaning",
      squareFoot: 5000,
      frequency: "monthly",
    },
    scheduling: {
      preferredDate: "2025-01-15",
      startTime: "9:00 AM",
      endTime: "3:00 PM",
      assignedCleaner: "Shila Begum",
      jobNote: "Full store deep wash required.",
    },
    pricing: {
      totalPrice: 1500,
      cleanerPrice: 900,
    },
    status: "Complete",
    payment: "Paid",
    paymentStatus: "Paid",
  },

  {
    id: "BKG-004",
    customerInfo: {
      businessName: "Metro Builders Ltd.",
      email: "projects@metrobuilders.com",
      phone: "01788004567",
      city: "Dhaka",
      address: "Plot 22, Sector 4, Uttara",
    },
    cleaningDetails: {
      serviceType: "Post-Construction Cleaning",
      squareFoot: 4200,
      frequency: "one-time",
    },
    scheduling: {
      preferredDate: "2025-02-05",
      startTime: "8:30 AM",
      endTime: "2:30 PM",
      assignedCleaner: "",
      jobNote: "Dust-heavy site, bring extra masks.",
    },
    pricing: {
      totalPrice: 2100,
      cleanerPrice: 1200,
    },
    status: "In Progress",
    payment: "Partial",
    paymentStatus: "Partial",
  },
];
