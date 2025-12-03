const fs = require("fs");
const { ethers } = require("ethers");

// --- 1. REAL STUDENTS FROM YOUR PDF ---
const rawStudents = [
  { name: "KARTHIKEYA REDDY VELAGALA", roll: "22261A1233" },
  { name: "KARANGULA YESHWANTH REDDY", roll: "22261A1232" },
  { name: "VEDANT MALPANI", roll: "22261A1262" },
  { name: "PATLANNAGARI PRITEESH REDDY", roll: "22261A1245" },
  { name: "MAHAREDDY MEGHA REDDY", roll: "2221A1238" },
  { name: "ROHAN SIDDHARTH SAVALAM", roll: "22261A1250" },
  { name: "PINNINTI SOUMYA", roll: "23265A1206" },
  { name: "MAROJU KRISHNA SAHEE", roll: "23265A1205" },
  { name: "KRITHI CHIPPADA", roll: "22261A1236" },
  { name: "DABBARA SATVIK", roll: "22261A1217" },
  { name: "THALLA AKSHAYA", roll: "22261A1258" },
  { name: "AEDDU PAVAN", roll: "23265A1201" },
  { name: "GUMMALLA PAVANA LAKSHMI NARASIMHA", roll: "22261A1222" },
  { name: "C YETNESH REDDY", roll: "22261A1213" },
  { name: "BATTULA SATYANARAYANA REDDY", roll: "22261A1209" },
  { name: "THOTA ADVITH", roll: "22261A1260" },
  { name: "TANNERU JOSHNAVI", roll: "22261A1255" },
  { name: "POTHEPAKA PRASANNA", roll: "22261A1248" },
  { name: "THARUNI GANAPATHI", roll: "22261A1259" },
  { name: "BANOTHU NIRANJAN KUMAR", roll: "22261A1208" },
  { name: "SURAGANI REVATHI", roll: "22261A1253" },
  { name: "PATLOORI DURGA", roll: "22261A1246" },
  { name: "DASHRITH REDDY", roll: "22261A1216" },
  { name: "ARURI NIKHIL", roll: "22261A1205" },
  { name: "BUSATHI ANURAGH", roll: "22261A1212" },
  { name: "M DEEPAK", roll: "22261A1237" },
  { name: "DARGA PRAWALIKA", roll: "22261A1218" },
  { name: "TEEGALA KAVERI REDDY", roll: "22261A1257" },
  { name: "ERENALA SRUJAN", roll: "22261A1220" },
  { name: "BADAVATH UDAY", roll: "22261A1206" },
  { name: "JAMUNA SHYAMALA", roll: "22261A1225" },
  { name: "GOTURI HARSHITA", roll: "22261A1221" },
  { name: "BOGA SNEHITHA", roll: "22261A1211" },
  { name: "KANDULA PRADEEP REDDY", roll: "22261A1230" },
  { name: "CHIRIKI CHANDANA", roll: "22261A1215" },
  { name: "KANIVETA BHUVAN CHANDRA", roll: "2226121231" },
  { name: "JUNUTHULA SIRI LASYA", roll: "22261A1227" },
  { name: "SAMBHAV T", roll: "22261A1251" },
  { name: "SUVARNA AGASTHYA", roll: "22261A1254" },
  { name: "TEEDA BHARAT VENKAT VINAY TEZ", roll: "22261A1256" },
  { name: "ABDUL MUQTADIR", roll: "22261A1201" },
  { name: "SOWDAGAR ROSHAN NAVEED", roll: "22261A1252" },
  { name: "ABDUL RASHEED", roll: "22261A1202" },
  { name: "KANAKA SHARON", roll: "22261A1229" },
  { name: "DENDUKURI NAGA VAISHNAVI", roll: "23265A1203" },
  { name: "ESHABOINA ARAVIND", roll: "23265A1204" },
  { name: "BHAVANARUSHI RAJDEEP", roll: "22261A1210" },
  { name: "PARUPATI SUDARSHAN REDDY", roll: "22261A1244" },
  { name: "BANDAM VENKATA MOHAN KARTHIK", roll: "22261A1207" },
  { name: "PALLIKONDA SINDHUJA", roll: "22261A1243" },
  { name: "PENDYALA JAYA CHARAN", roll: "22261A1247" },
  { name: "CHENEMONI VAISHNAVI", roll: "22261A1214" },
  { name: "CHALLURI BHANUPRAKASH", roll: "23265A1202" },
  { name: "ANTHAMGARI TEJASRI", roll: "22261A1204" },
  { name: "K TANVISH REDDY", roll: "22261A1228" },
  { name: "VISHWANATH SAI RUTHIK", roll: "22261A1263" },
  { name: "KATEPALLY SRIKANTH", roll: "22261A1234" },
  { name: "VADLA BINDU SRI", roll: "22261A1261" },
  { name: "GURMITKAL SHARATH KUMAR REDDY", roll: "22261A1223" },
  { name: "N RANI", roll: "22261A1239" },
  { name: "NAGIREDDY AMITH REDDY", roll: "22261A1240" },
  { name: "NALLA SANTHOSH REDDY", roll: "22261A1242" },
  { name: "M MAHESH", roll: "21261A1244" },
  { name: "GURRAM YESHWANTH REDDY", roll: "22261A1224" },
  { name: "ALISHETTY HARSHA VARDHAN SAI", roll: "22261A1203" },
];

// --- 2. REAL FACULTY ---
const rawFaculty = [
  "Dr. D. VIJAYA LAKSHMI",
  "Dr. M. RUDRA KUMAR",
  "Dr. CH. PREM KUMAR",
  "Mrs. A. V. L. PRASUNA",
  "Dr. U. CHAITANYA",
  "Dr. N. SREE DIVYA",
  "Mrs. J. HIMA BINDU",
  "Mrs. B. MEENAKSHI",
  "Mrs. CH. LAKSHMI KUMAR",
  "Mrs. B. SWETHA",
  "Mrs. CH. SUDHA",
  "Mr. B. LOKESH",
  "Mrs. V. VEENA",
  "Mrs. A. AMULYA",
  "Ms. M. VARA LAKSHMI",
  "Mrs. R. VIJAYA LAKSHMI",
  "Mr. B. TULASI DASU",
  "Mrs. SK ASHRIYA JULMA",
  "Dr. SUBA SUSEELA",
  "Mrs. J. PADMAVATHI",
];

// --- 3. VENDORS ---
const rawVendors = [
  "Campus Canteen",
  "Library Xerox",
  "Stationery Shop",
  "Juice Point",
  "Coffee Shop",
  "College Mart",
];

const users = [];

// HELPER: Create Unique Wallet
function createAccount(username, password, role, name) {
  const wallet = ethers.Wallet.createRandom(); // <--- UNIQUE PRIVATE KEY GENERATED HERE
  return {
    username,
    password,
    role,
    name,
    walletAddress: wallet.address,
    privateKey: wallet.privateKey, // Saving this so you can demonstrate it's unique
  };
}

console.log("Generating Unique Wallets... (This might take a moment)");

// 1. ADMIN
// We keep Admin on the Hardhat Account #0 so it has ETH to fund others if needed
// Change this wallet address to YOUR Hardhat Account #0 address
const ADMIN_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
users.push({
  username: "admin",
  password: "123",
  role: "admin",
  name: "System Admin",
  walletAddress: ADMIN_WALLET,
  privateKey: "HIDDEN_HARDHAT_KEY",
});

// 2. FACULTY (Unique Random Wallets)
rawFaculty.forEach((name) => {
  users.push(createAccount(name, name, "faculty", name));
});

// 3. VENDORS (Unique Random Wallets)
rawVendors.forEach((name) => {
  users.push(
    createAccount(name.toLowerCase().replace(/ /g, ""), "123", "vendor", name)
  );
});

// 4. STUDENTS (Unique Random Wallets)
rawStudents.forEach((s) => {
  users.push(createAccount(s.name, s.roll, "student", s.name));
});

const data = { users: users, events: [] };

fs.writeFileSync("./database.json", JSON.stringify(data, null, 2));

console.log(`✅ DATABASE SEEDED WITH REAL UNIQUE DATA!`);
console.log(`- ${rawStudents.length} Students (Unique Keys)`);
console.log(`- ${rawFaculty.length} Faculty (Unique Keys)`);
console.log(`- ${rawVendors.length} Vendors (Unique Keys)`);
console.log(`- 1 Admin`);
console.log(`\nNOTE: Since these are random wallets, they have 0 ETH.`);
console.log(`Faculty can still 'Verify' because the Backend pays the gas.`);
console.log(
  `Students cannot 'Send' coins unless you fund them from the Admin wallet.`
);
