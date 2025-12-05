import React, { useEffect, useState } from "react";
import { ethers } from "ethers"; // 🟢 Added for Blockchain
import { QRCodeCanvas } from "qrcode.react";

const API = "http://127.0.0.1:4000";

// 🔴 CRITICAL: REPLACE THIS WITH YOUR CONTRACT ADDRESS FROM TERMINAL
const COIN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState("home");
  const [balance, setBalance] = useState("0");
  const [ledger, setLedger] = useState([]);
  const [events, setEvents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Inputs
  const [payTo, setPayTo] = useState("");
  const [payAmount, setPayAmount] = useState("");

  // Event Creation Inputs
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  // Add Participant Inputs
  const [targetEventId, setTargetEventId] = useState("");
  const [winnerUser, setWinnerUser] = useState("");
  const [winnerAmount, setWinnerAmount] = useState("10");
  const [winnerPos, setWinnerPos] = useState("Participant");

  useEffect(() => {
    fetchBalance(); // 🟢 Checks Blockchain for Money
    fetchLedger(); // Checks Backend for History
    fetchEvents();
    if (user.role === "admin") fetchFacultyList();
  }, [user.walletAddress, view]);

  // ============================================================
  // 🟢 1. BLOCKCHAIN LOGIC (THE NEW PART)
  // ============================================================

  async function fetchBalance() {
    try {
      // Tries to connect to Ganache (Localhost 8545)
      const provider = new ethers.providers.JsonRpcProvider(
        "http://127.0.0.1:8545"
      );
      const contract = new ethers.Contract(COIN_ADDRESS, ERC20_ABI, provider);

      // Reads the ACTUAL balance from the Smart Contract
      const bal = await contract.balanceOf(user.walletAddress);
      setBalance(ethers.utils.formatUnits(bal, 18));
    } catch (e) {
      console.error("Blockchain Error:", e);
      // If blockchain fails, show 0 or keep old balance
    }
  }

  async function handleTransfer() {
    if (!window.ethereum) return alert("Please install MetaMask!");

    try {
      // Connect to MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(COIN_ADDRESS, ERC20_ABI, signer);

      // Send the transaction to the Blockchain
      const tx = await contract.transfer(
        payTo,
        ethers.utils.parseUnits(payAmount, 18)
      );
      alert("Transaction Sent! Waiting for confirmation...");

      await tx.wait(); // Wait for it to be mined
      alert("Transaction Confirmed on Blockchain!");

      fetchBalance(); // Update balance instantly
    } catch (e) {
      alert("Transfer Failed: " + e.message);
    }
  }

  // ============================================================
  // 🔵 2. BACKEND LOGIC (KEEPING YOUR UI DATA)
  // ============================================================

  async function fetchLedger() {
    try {
      const res = await fetch(`${API}/ledger`);
      const data = await res.json();
      if (Array.isArray(data)) setLedger(data);
    } catch (e) {
      setLedger([]);
    }
  }

  async function fetchEvents() {
    try {
      const res = await fetch(`${API}/events`);
      setEvents(await res.json());
    } catch (e) {
      setEvents([]);
    }
  }

  async function fetchFacultyList() {
    try {
      const res = await fetch(`${API}/list/faculty`);
      setFacultyList(await res.json());
    } catch (e) {
      setFacultyList([]);
    }
  }

  // --- ACTIONS (Backend DB Updates) ---

  async function handleCreateEvent() {
    await fetch(`${API}/admin/create-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        date: eventDate,
        assignedFaculty: selectedFaculty,
      }),
    });
    alert("Event Created Successfully!");
    fetchEvents();
  }

  async function handleAddParticipant() {
    await fetch(`${API}/admin/add-participant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: targetEventId,
        studentUsername: winnerUser,
        prizeAmount: winnerAmount,
        position: winnerPos,
      }),
    });
    alert("Student Added to Event!");
    fetchEvents();
  }

  async function handleVerify(eventId, studentWallet) {
    const res = await fetch(`${API}/faculty/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        studentWallet,
        facultyUsername: user.username,
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Verified! Coins Sent.");
      fetchEvents();
      fetchLedger();
    } else alert(data.error);
  }

  return (
    <div className="app-layout">
      <div className="sidebar">
        <h2>Campus Coin</h2>
        <div style={{ marginBottom: "20px" }}>
          <small>Welcome,</small>
          <br />
          <strong>{user.name}</strong>
          <br />
          <small style={{ opacity: 0.7 }}>{user.role.toUpperCase()}</small>
        </div>
        <button
          className={view === "home" ? "active" : ""}
          onClick={() => setView("home")}
        >
          Dashboard
        </button>
        <button
          className={view === "ledger" ? "active" : ""}
          onClick={() => setView("ledger")}
        >
          Public Ledger
        </button>
        <div style={{ marginTop: "auto" }}>
          <button onClick={onLogout} style={{ color: "#f87171" }}>
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="header-bar">
          <h1>{view === "home" ? "Dashboard" : "Blockchain Ledger"}</h1>
          <div style={{ textAlign: "right" }}>
            <div
              style={{ fontSize: "24px", color: "#4F46E5", fontWeight: "bold" }}
            >
              {balance} CAMP
            </div>
            <small style={{ fontFamily: "monospace" }}>
              {user.walletAddress}
            </small>
          </div>
        </div>

        {view === "home" && (
          <>
            {/* ADMIN VIEW */}
            {user.role === "admin" && (
              <div className="grid-container">
                <div className="card">
                  <h3>1. Create Event</h3>
                  <label>Event Name</label>
                  <input
                    className="input"
                    onChange={(e) => setEventName(e.target.value)}
                  />
                  <label>Date</label>
                  <input
                    className="input"
                    type="date"
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                  <label>Assign Faculty</label>
                  <select
                    className="input"
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                  >
                    <option>Select Faculty...</option>
                    {facultyList.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <button className="btn" onClick={handleCreateEvent}>
                    Create Event
                  </button>
                </div>

                <div className="card">
                  <h3>2. Add Participant</h3>
                  <label>Select Event</label>
                  <select
                    className="input"
                    onChange={(e) => setTargetEventId(e.target.value)}
                  >
                    <option>Select...</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name}
                      </option>
                    ))}
                  </select>
                  <label>Student Username</label>
                  <input
                    className="input"
                    onChange={(e) => setWinnerUser(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      className="input"
                      placeholder="10"
                      value={winnerAmount}
                      onChange={(e) => setWinnerAmount(e.target.value)}
                    />
                    <select
                      className="input"
                      onChange={(e) => setWinnerPos(e.target.value)}
                    >
                      <option>Participant</option>
                      <option>Winner</option>
                    </select>
                  </div>
                  <button className="btn" onClick={handleAddParticipant}>
                    Add Student
                  </button>
                </div>

                <div className="card full-width">
                  <h3>All Created Events</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Assigned Faculty</th>
                        <th>Participants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => (
                        <tr key={ev.id}>
                          <td>{ev.name}</td>
                          <td>{ev.date}</td>
                          <td style={{ color: "#4F46E5", fontWeight: "bold" }}>
                            {ev.assignedFaculty}
                          </td>
                          <td>{ev.participants.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FACULTY VIEW */}
            {user.role === "faculty" && (
              <div className="card full-width">
                <h3>My Assigned Events (Pending Verification)</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events
                      .filter((ev) => ev.assignedFaculty === user.name)
                      .flatMap((ev) =>
                        ev.participants.map((p) => ({
                          ...p,
                          eventId: ev.id,
                          eventName: ev.name,
                        }))
                      )
                      .map((p, i) => (
                        <tr key={i}>
                          <td>{p.eventName}</td>
                          <td>{p.studentName}</td>
                          <td>{p.amount}</td>
                          <td>
                            {p.status === "Verified" ? (
                              <span className="status-badge Verified">
                                Verified
                              </span>
                            ) : (
                              <button
                                className="btn"
                                onClick={() =>
                                  handleVerify(p.eventId, p.studentWallet)
                                }
                              >
                                Verify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* STUDENT VIEW */}
            {user.role === "student" && (
              <div className="grid-container">
                <div className="card">
                  <h3>Send Payment (Blockchain)</h3>
                  <input
                    className="input"
                    placeholder="Address"
                    value={payTo}
                    onChange={(e) => setPayTo(e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Amount"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                  <button className="btn" onClick={handleTransfer}>
                    Pay via MetaMask
                  </button>
                </div>
                <div className="card full-width">
                  <h3>My Participation History</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Result</th>
                        <th>Reward</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => {
                        const p = ev.participants.find(
                          (part) => part.studentUsername === user.username
                        );
                        if (!p) return null;
                        return (
                          <tr key={ev.id}>
                            <td>{ev.name}</td>
                            <td>{p.position}</td>
                            <td>{p.amount}</td>
                            <td>{p.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {user.role === "vendor" && (
              <div className="card" style={{ textAlign: "center" }}>
                <h3>Scan to Pay</h3>
                <QRCodeCanvas value={user.walletAddress} size={180} />
              </div>
            )}
          </>
        )}

        {view === "ledger" && (
          <div className="card full-width">
            <h3>Real-Time Blockchain Transactions</h3>
            <table>
              <thead>
                <tr>
                  <th>Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((tx, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "monospace", color: "#6366f1" }}>
                      {tx.hash ? tx.hash.slice(0, 10) + "..." : "Min"}
                    </td>
                    <td>
                      {tx.type === "REWARD"
                        ? "University"
                        : tx.from.slice(0, 6) + "..."}
                    </td>
                    <td>{tx.to ? tx.to.slice(0, 10) + "..." : ""}</td>
                    <td style={{ color: "#166534", fontWeight: "bold" }}>
                      {tx.amount}
                    </td>
                    <td>{tx.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
