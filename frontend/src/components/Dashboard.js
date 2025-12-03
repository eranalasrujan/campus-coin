import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";

const API = "http://localhost:4000";
// !!! UPDATE THIS ADDRESS TO YOUR DEPLOYED CONTRACT !!!
const COIN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
];

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState("home");
  const [balance, setBalance] = useState("0");
  const [ledger, setLedger] = useState([]);
  const [events, setEvents] = useState([]);

  // Admin Tabs
  const [adminTab, setAdminTab] = useState("create");

  // Inputs
  const [payTo, setPayTo] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [targetEventId, setTargetEventId] = useState("");
  const [winnerUser, setWinnerUser] = useState("");
  const [winnerAmount, setWinnerAmount] = useState("50");
  const [winnerPos, setWinnerPos] = useState("Participant");
  const [newUserName, setNewUserName] = useState("");
  const [newUserUser, setNewUserUser] = useState("");
  const [newUserPass, setNewUserPass] = useState("");
  const [newUserRole, setNewUserRole] = useState("student");
  const [newUserWallet, setNewUserWallet] = useState("");

  useEffect(() => {
    fetchBalance();
    fetchLedger();
    if (user.role === "faculty" || user.role === "admin") fetchEvents();
  }, [user.role]);

  async function fetchBalance() {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "http://127.0.0.1:8545"
      );
      const contract = new ethers.Contract(COIN_ADDRESS, ERC20_ABI, provider);
      const bal = await contract.balanceOf(user.walletAddress);
      setBalance(ethers.utils.formatUnits(bal, 18));
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchLedger() {
    try {
      const res = await fetch(`${API}/ledger`);
      const data = await res.json();
      // Safety check: Is data actually an array?
      if (Array.isArray(data)) {
        setLedger(data);
      } else {
        console.error("Backend Error:", data);
        // Don't crash, just show empty list
        setLedger([]);
      }
    } catch (e) {
      console.error("Ledger Connection Error", e);
    }
  }

  async function fetchEvents() {
    const res = await fetch(`${API}/faculty/events`);
    setEvents(await res.json());
  }

  async function handleTransfer() {
    if (!window.ethereum) return alert("Install MetaMask");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(COIN_ADDRESS, ERC20_ABI, signer);
    try {
      const tx = await contract.transfer(
        payTo,
        ethers.utils.parseUnits(payAmount, 18)
      );
      alert("Sending...");
      await tx.wait();
      alert("Success!");
      fetchBalance();
      fetchLedger();
    } catch (e) {
      alert("Failed: " + e.message);
    }
  }

  async function handleCreateUser() {
    await fetch(`${API}/admin/add-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUserUser,
        password: newUserPass,
        role: newUserRole,
        name: newUserName,
        walletAddress: newUserWallet,
      }),
    });
    alert("User Created!");
  }

  async function handleCreateEvent() {
    await fetch(`${API}/admin/create-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, date: eventDate }),
    });
    alert("Event Created!");
    fetchEvents();
  }

  async function handleAddWinner() {
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
    alert("Participant Added!");
    fetchEvents();
  }

  async function handleVerify(eventId, studentWallet) {
    const res = await fetch(`${API}/faculty/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, studentWallet }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Verified! Blockchain Updated.\nTx: " + data.txHash);
      fetchEvents();
      fetchLedger();
    } else alert("Error: " + data.error);
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h3>{user.name}</h3>
          <small>{user.role.toUpperCase()}</small>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "1px solid white",
            color: "white",
            borderRadius: "4px",
            padding: "5px",
          }}
        >
          Logout
        </button>
      </div>
      <div className="content">
        <div
          className="card"
          style={{
            background: "linear-gradient(to right, #4F46E5, #818cf8)",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <small>Balance</small>
              <h1 style={{ margin: "5px 0" }}>{balance} CAMP</h1>
            </div>
            <div
              style={{
                background: "white",
                padding: "5px",
                borderRadius: "8px",
              }}
            >
              <QRCodeCanvas value={user.walletAddress} size={50} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button className="btn btn-secondary" onClick={() => setView("home")}>
            Dashboard
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setView("ledger")}
          >
            Ledger
          </button>
        </div>

        {view === "home" && (
          <>
            {user.role === "admin" && (
              <div>
                <div
                  style={{ display: "flex", gap: "5px", marginBottom: "15px" }}
                >
                  <button
                    onClick={() => setAdminTab("create")}
                    className={`btn ${
                      adminTab === "create" ? "" : "btn-secondary"
                    }`}
                    style={{ fontSize: "12px", padding: "8px" }}
                  >
                    1. Events
                  </button>
                  <button
                    onClick={() => setAdminTab("add_student")}
                    className={`btn ${
                      adminTab === "add_student" ? "" : "btn-secondary"
                    }`}
                    style={{ fontSize: "12px", padding: "8px" }}
                  >
                    2. Add Student
                  </button>
                  <button
                    onClick={() => setAdminTab("add_user")}
                    className={`btn ${
                      adminTab === "add_user" ? "" : "btn-secondary"
                    }`}
                    style={{ fontSize: "12px", padding: "8px" }}
                  >
                    3. Users
                  </button>
                </div>
                {adminTab === "create" && (
                  <div className="card">
                    <h3>Create Event</h3>
                    <input
                      className="input"
                      placeholder="Name"
                      onChange={(e) => setEventName(e.target.value)}
                    />
                    <input
                      className="input"
                      type="date"
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                    <button className="btn" onClick={handleCreateEvent}>
                      Create
                    </button>
                  </div>
                )}
                {adminTab === "add_student" && (
                  <div className="card">
                    <h3>Assign Student</h3>
                    <select
                      className="input"
                      onChange={(e) => setTargetEventId(e.target.value)}
                    >
                      <option>Select Event</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input"
                      placeholder="Roll No (e.g. 21-cse-001)"
                      onChange={(e) => setWinnerUser(e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Coins"
                      value={winnerAmount}
                      onChange={(e) => setWinnerAmount(e.target.value)}
                    />
                    <button className="btn" onClick={handleAddWinner}>
                      Assign
                    </button>
                  </div>
                )}
                {adminTab === "add_user" && (
                  <div className="card">
                    <h3>New User</h3>
                    <input
                      className="input"
                      placeholder="Name"
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Username"
                      onChange={(e) => setNewUserUser(e.target.value)}
                    />
                    <input
                      className="input"
                      placeholder="Password"
                      onChange={(e) => setNewUserPass(e.target.value)}
                    />
                    <select
                      className="input"
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="vendor">Vendor</option>
                    </select>
                    <input
                      className="input"
                      placeholder="Wallet Address"
                      onChange={(e) => setNewUserWallet(e.target.value)}
                    />
                    <button className="btn" onClick={handleCreateUser}>
                      Create
                    </button>
                  </div>
                )}
              </div>
            )}
            {user.role === "faculty" && (
              <div>
                <h3>Pending Verifications</h3>
                {events.map((ev) => (
                  <div key={ev.id}>
                    {ev.participants.map((p, i) => (
                      <div key={i} className="card">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <b>{ev.name}</b>
                            <br />
                            {p.studentName}
                          </div>
                          <div>
                            <b>{p.amount}</b>
                          </div>
                        </div>
                        {p.status !== "Verified" && (
                          <button
                            className="btn"
                            style={{ marginTop: "10px" }}
                            onClick={() => handleVerify(ev.id, p.studentWallet)}
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {user.role === "student" && (
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
          <div className="card">
            <h3>Blockchain Ledger</h3>
            {ledger.map((tx, i) => (
              <div key={i} className="ledger-row">
                <div style={{ flex: 2 }}>
                  <b>{tx.reason}</b>
                  <br />
                  <span style={{ fontSize: "10px", color: "#999" }}>
                    {tx.hash}
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: tx.type === "REWARD" ? "green" : "black",
                  }}
                >
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default Dashboard;
