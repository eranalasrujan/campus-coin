import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Minimal ERC20 ABI for UI interactions
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
];

// Defaults — you can change these if needed
const DEFAULT_CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const BACKEND_URL = "http://localhost:4000";

function App() {
  const [view, setView] = useState("student");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  const [tokenAddress, setTokenAddress] = useState(DEFAULT_CONTRACT);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [balance, setBalance] = useState("0.0");

  const [toAddr, setToAddr] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [mintResult, setMintResult] = useState(null);

  const [status, setStatus] = useState("");

  useEffect(() => {
    // detect MetaMask
    if (window.ethereum) {
      const p = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(p);
      p.listAccounts()
        .then((accounts) => {
          if (accounts && accounts.length) {
            const s = p.getSigner();
            setSigner(s);
            s.getAddress().then((a) => {
              setAccount(a);
              fetchBalance(a, tokenAddress, p);
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!tokenAddress) return;
    async function loadTokenMeta() {
      try {
        const readProvider =
          provider ||
          new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        const c = new ethers.Contract(tokenAddress, ERC20_ABI, readProvider);
        const [n, s, d] = await Promise.all([
          c.name(),
          c.symbol(),
          c.decimals(),
        ]);
        setTokenName(n);
        setTokenSymbol(s);
        setTokenDecimals(d);
        if (account) fetchBalance(account, tokenAddress, readProvider);
      } catch (e) {
        // ignore
      }
    }
    loadTokenMeta();
  }, [tokenAddress, provider, account]);

  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const p = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(p);
      const s = p.getSigner();
      setSigner(s);
      const a = await s.getAddress();
      setAccount(a);
      fetchBalance(a, tokenAddress, p);
      setStatus("Wallet connected");
    } catch (e) {
      console.error(e);
      setStatus("Connection failed");
    }
  }

  async function fetchBalance(
    addr,
    tokenAddr = tokenAddress,
    readProvider = provider
  ) {
    try {
      const rp =
        readProvider ||
        new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
      const c = new ethers.Contract(tokenAddr, ERC20_ABI, rp);
      const b = await c.balanceOf(addr);
      const formatted = ethers.utils.formatUnits(b, tokenDecimals || 18);
      setBalance(formatted);
    } catch (e) {
      console.error(e);
      setBalance("0.0");
    }
  }

  async function doTransfer() {
    if (!signer) return alert("Connect wallet first");
    if (!toAddr || !transferAmount) return alert("Fill fields");
    try {
      const c = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const amt = ethers.utils.parseUnits(
        transferAmount.toString(),
        tokenDecimals || 18
      );
      const tx = await c.transfer(toAddr, amt);
      setStatus("Sending transaction...");
      await tx.wait();
      setStatus("Transfer completed");
      fetchBalance(account);
    } catch (e) {
      console.error(e);
      setStatus("Transfer failed: " + (e.message || e));
    }
  }

  async function adminMint() {
    if (!mintAddress || !mintAmount)
      return alert("Fill mint address and amount");
    try {
      setMintResult(null);
      setStatus("Calling backend mint...");
      const res = await fetch(`${BACKEND_URL}/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentAddress: mintAddress,
          amount: mintAmount,
        }),
      });
      const data = await res.json();
      setMintResult(data);
      setStatus("Mint request complete");
    } catch (e) {
      console.error(e);
      setStatus("Mint failed: " + (e.message || e));
    }
  }

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1>CampusCoin — Demo</h1>
          <div className="small">Local Hardhat • Contract: {tokenAddress}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {account ? (
            <>
              <div className="small-muted">Connected: {account}</div>
              <div className="small-muted">
                Balance: {balance} {tokenSymbol || "CAMP"}
              </div>
            </>
          ) : (
            <button className="button primary" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <div className="nav">
        <button
          className={`button ${view === "student" ? "primary" : ""}`}
          onClick={() => setView("student")}
        >
          Student
        </button>
        <button
          className={`button ${view === "admin" ? "primary" : ""}`}
          onClick={() => setView("admin")}
        >
          Admin
        </button>
        <button
          className={`button ${view === "vendor" ? "primary" : ""}`}
          onClick={() => setView("vendor")}
        >
          Vendor
        </button>
      </div>

      <div className="box">
        <div className="row">
          <label className="small-muted">Token contract address:</label>
          <input
            className="input"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
          <button
            className="button"
            onClick={() => {
              if (account) fetchBalance(account);
            }}
          >
            Reload Meta
          </button>
        </div>
        <div className="small-muted">
          Name: {tokenName} • Symbol: {tokenSymbol} • Decimals: {tokenDecimals}
        </div>
      </div>

      {view === "student" && (
        <div>
          <div className="box">
            <h3>Send Tokens</h3>
            <div className="row">
              <input
                className="input"
                placeholder="Recipient address"
                value={toAddr}
                onChange={(e) => setToAddr(e.target.value)}
              />
              <input
                className="input"
                placeholder="Amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <button className="button primary" onClick={doTransfer}>
                Send
              </button>
            </div>
            <div className="small-muted">
              After sending, your balance will refresh automatically.
            </div>
          </div>

          <div className="box">
            <h3>Quick actions</h3>
            <div className="row">
              <button
                className="button"
                onClick={() => {
                  navigator.clipboard.writeText(tokenAddress);
                  alert("Copied");
                }}
              >
                Copy token address
              </button>
              <button
                className="button"
                onClick={() => {
                  window.open("https://metamask.io/download.html", "_blank");
                }}
              >
                Install MetaMask
              </button>
              <button
                className="button"
                onClick={() => {
                  alert(
                    "To see token in MetaMask: Add Token → Custom Token → Address: " +
                      tokenAddress +
                      " • Symbol: " +
                      (tokenSymbol || "CAMP") +
                      " • Decimals: " +
                      (tokenDecimals || 18)
                  );
                }}
              >
                How to add token to MetaMask
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "admin" && (
        <div>
          <div className="box">
            <h3>Admin mint (backend)</h3>
            <div className="row">
              <input
                className="input"
                placeholder="Recipient address"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
              />
              <input
                className="input"
                placeholder="Amount"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
              />
              <button className="button primary" onClick={adminMint}>
                Mint via backend
              </button>
            </div>
            <div className="small-muted">
              Backend result: {mintResult ? JSON.stringify(mintResult) : "—"}
            </div>
          </div>

          <div className="box">
            <h3>Developer tools</h3>
            <div className="row">
              <button
                className="button"
                onClick={() => {
                  alert(
                    "Hardhat local RPC: http://127.0.0.1:8545. Contract: " +
                      tokenAddress
                  );
                }}
              >
                Show RPC
              </button>
              <button
                className="button"
                onClick={() => {
                  navigator.clipboard.writeText(BACKEND_URL);
                  alert("Backend copied");
                }}
              >
                Copy backend URL
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "vendor" && (
        <div>
          <div className="box">
            <h3>Vendor — Receive payments</h3>
            <div className="row">
              <input
                className="input"
                placeholder="Recipient (your) address"
                value={toAddr}
                onChange={(e) => setToAddr(e.target.value)}
              />
              <input
                className="input"
                placeholder="Amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <button
                className="button primary"
                onClick={() => {
                  const payload = {
                    to: toAddr,
                    amount: transferAmount,
                    token: tokenAddress,
                  };
                  const encoded = btoa(JSON.stringify(payload));
                  alert("Invoice (base64): " + encoded);
                }}
              >
                Create Invoice (base64)
              </button>
            </div>
            <div className="small-muted">
              Send this invoice to a student — they will paste into Student →
              Send.
            </div>
          </div>
        </div>
      )}

      <div className="footer">
        <div className="small-muted">Status: {status}</div>
      </div>
    </div>
  );
}

export default App;
