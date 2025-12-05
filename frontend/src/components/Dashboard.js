import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const API = "http://localhost:4000"; // Pointing to your Memory Backend

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState("home");
  const [balance, setBalance] = useState(user.balance || 0); // Initialize with logged-in user's balance
  const [ledger, setLedger] = useState([]);
  const [events, setEvents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Inputs
  const [payTo, setPayTo] = useState("");
  const [payAmount, setPayAmount] = useState("");

  // Event Creation
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  // Add Participant
  const [targetEventId, setTargetEventId] = useState("");
  const [winnerUser, setWinnerUser] = useState("");
  const [winnerAmount, setWinnerAmount] = useState("10");
  const [winnerPos, setWinnerPos] = useState("Participant");

  useEffect(() => {
    // Fetch fresh data every time the dashboard loads
    fetchBalance();
    fetchLedger();
    fetchEvents();
    if (user.role === "admin") fetchFacultyList();
  }, [user.role, view]); // Reload when view changes (e.g. clicking Dashboard)

  // --- 1. NEW FETCH BALANCE FUNCTION (Connects to Backend, NOT Blockchain) ---
  async function fetchBalance() {
    try {
      // We ask the backend: "How much money does this wallet have?"
      const res = await fetch(`${API}/api/user/${user.walletAddress}`);
      const data = await res.json();

      if (data && data.balance !== undefined) {
        setBalance(data.balance);
      }
    } catch (e) {
      console.error("Could not fetch balance:", e);
    }
  }

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

  // --- ACTIONS ---

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

  // --- 2. UPDATED TRANSFER FUNCTION (Uses Backend API) ---
  async function handleTransfer() {
    try {
      const res = await fetch(`${API}/api/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toAddress: payTo,
          amount: payAmount,
          reason: "Student Transfer",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Success! Sent " + payAmount + " CAMP");
        setPayTo("");
        setPayAmount("");
        fetchBalance(); // Update balance immediately
        fetchLedger();
      } else {
        alert("Failed: " + data.message);
      }
    } catch (e) {
      alert("Transfer Error: " + e.message);
    }
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
                {/* LEFT: CREATE EVENT */}
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

                {/* RIGHT: ADD STUDENT */}
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

                {/* BOTTOM: EVENT LIST */}
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
                                style={{ padding: "5px" }}
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
                  <h3>Send Payment</h3>
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
                    Pay
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

            {/* VENDOR VIEW */}
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
