export type Worker = {
  id: string;
  name: string;
  skill: string;
  subSkills: string[];
  city: string;
  area: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  experience: number;
  jobsCompleted: number;
  mlScore: number;
  available: boolean;
  verified: boolean;
  avatar: string;
  bio: string;
  scoreBreakdown: { label: string; value: number }[];
};

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,ffd5dc,b6e3f4,ffdfbf,d1f7c4`;

export const WORKERS: Worker[] = [
  {
    id: "w1", name: "Ravi Kumar", skill: "Electrician",
    subSkills: ["Wiring", "Panel install", "Smart home"],
    city: "Bengaluru", area: "Indiranagar",
    rating: 4.9, reviewCount: 248, pricePerHour: 450, experience: 9,
    jobsCompleted: 612, mlScore: 96, available: true, verified: true,
    avatar: avatar("Ravi Kumar"),
    bio: "Licensed electrician with a decade of residential & commercial wiring experience. Specializes in smart-home retrofits.",
    scoreBreakdown: [
      { label: "Customer satisfaction", value: 98 },
      { label: "Job completion rate", value: 99 },
      { label: "Response time", value: 92 },
      { label: "Verified credentials", value: 100 },
      { label: "Repeat hire rate", value: 88 },
    ],
  },
  {
    id: "w2", name: "Priya Sharma", skill: "Plumber",
    subSkills: ["Leak repair", "Bathroom fitting", "Water heater"],
    city: "Bengaluru", area: "Koramangala",
    rating: 4.8, reviewCount: 192, pricePerHour: 380, experience: 7,
    jobsCompleted: 421, mlScore: 93, available: true, verified: true,
    avatar: avatar("Priya Sharma"),
    bio: "Punctual plumber known for clean work. Bathroom remodels and water-heater specialist.",
    scoreBreakdown: [
      { label: "Customer satisfaction", value: 96 },
      { label: "Job completion rate", value: 97 },
      { label: "Response time", value: 90 },
      { label: "Verified credentials", value: 100 },
      { label: "Repeat hire rate", value: 82 },
    ],
  },
  {
    id: "w3", name: "Mohammed Faiz", skill: "Carpenter",
    subSkills: ["Modular kitchen", "Wardrobe", "Doors"],
    city: "Bengaluru", area: "HSR Layout",
    rating: 4.7, reviewCount: 156, pricePerHour: 520, experience: 12,
    jobsCompleted: 389, mlScore: 89, available: false, verified: true,
    avatar: avatar("Mohammed Faiz"),
    bio: "Master carpenter focused on modular furniture and bespoke wardrobes.",
    scoreBreakdown: [
      { label: "Customer satisfaction", value: 94 },
      { label: "Job completion rate", value: 92 },
      { label: "Response time", value: 78 },
      { label: "Verified credentials", value: 100 },
      { label: "Repeat hire rate", value: 79 },
    ],
  },
  {
    id: "w4", name: "Anjali Reddy", skill: "Painter",
    subSkills: ["Interior", "Texture", "Waterproofing"],
    city: "Bengaluru", area: "Whitefield",
    rating: 4.6, reviewCount: 134, pricePerHour: 320, experience: 6,
    jobsCompleted: 287, mlScore: 84, available: true, verified: true,
    avatar: avatar("Anjali Reddy"),
    bio: "Detail-obsessed painter. Textured walls and waterproofing specialist.",
    scoreBreakdown: [
      { label: "Customer satisfaction", value: 92 },
      { label: "Job completion rate", value: 89 },
      { label: "Response time", value: 86 },
      { label: "Verified credentials", value: 95 },
      { label: "Repeat hire rate", value: 70 },
    ],
  },
  {
    id: "w5", name: "Suresh Patil", skill: "AC Technician",
    subSkills: ["Installation", "Servicing", "Gas refill"],
    city: "Bengaluru", area: "JP Nagar",
    rating: 4.5, reviewCount: 98, pricePerHour: 600, experience: 8,
    jobsCompleted: 245, mlScore: 81, available: true, verified: true,
    avatar: avatar("Suresh Patil"),
    bio: "Certified split & window AC technician. Same-day service.",
    scoreBreakdown: [
      { label: "Customer satisfaction", value: 88 },
      { label: "Job completion rate", value: 86 },
      { label: "Response time", value: 80 },
      { label: "Verified credentials", value: 100 },
      { label: "Repeat hire rate", value: 65 },
    ],
  },
  {
    id: "w6", name: "Deepak Verma", skill: "Plumber",
    subSkills: ["Drainage", "Pipe fitting"],
    city: "Bengaluru", area: "Marathahalli",
    rating: 4.2, reviewCount: 64, pricePerHour: 280, experience: 4,
    jobsCompleted: 132, mlScore: 72, available: true, verified: false,
    avatar: avatar("Deepak Verma"),
    bio: "Reliable mid-experience plumber, great for routine work.",
    scoreBreakdown: [
      { label: "Customer satisfaction", value: 82 },
      { label: "Job completion rate", value: 78 },
      { label: "Response time", value: 70 },
      { label: "Verified credentials", value: 60 },
      { label: "Repeat hire rate", value: 55 },
    ],
  },
];

export const REVIEWS = [
  { id: "r1", author: "Aakash M.", rating: 5, date: "2 weeks ago", text: "Showed up on time, diagnosed a tricky short-circuit in 10 minutes. Clean, polite work.", verified: true },
  { id: "r2", author: "Neha P.", rating: 5, date: "1 month ago", text: "Best electrician I've hired. Walked me through every change. Will absolutely re-book.", verified: true },
  { id: "r3", author: "Kunal D.", rating: 4, date: "1 month ago", text: "Solid work on the panel install. Slight delay but communicated well.", verified: true },
  { id: "r4", author: "Sara K.", rating: 5, date: "2 months ago", text: "Smart home setup was flawless. Highly recommend.", verified: true },
];

export const CATEGORIES = [
  { key: "electrician", label: "Electrician", icon: "Zap" },
  { key: "plumber", label: "Plumber", icon: "Wrench" },
  { key: "carpenter", label: "Carpenter", icon: "Hammer" },
  { key: "painter", label: "Painter", icon: "PaintBucket" },
  { key: "ac", label: "AC Technician", icon: "Snowflake" },
  { key: "cleaner", label: "Cleaner", icon: "Sparkles" },
  { key: "mason", label: "Mason", icon: "Brick" },
  { key: "appliance", label: "Appliance", icon: "Refrigerator" },
  { key: "pest", label: "Pest Control", icon: "Bug" },
  { key: "tutor", label: "Home Tutor", icon: "BookOpen" },
  { key: "driver", label: "Driver", icon: "Car" },
  { key: "chef", label: "Chef", icon: "ChefHat" },
];