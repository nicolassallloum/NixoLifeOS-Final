import React, { useState } from "react";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, ArrowRightLeft, CreditCard, DollarSign, Trash2, Edit3, AlertCircle, Building, Filter } from "lucide-react";
import { nixStorage } from "../../lib/storage";
import { Account, AccountType, Transaction, TransactionType, FinanceCategory } from "../../types";
import { NixCard, NixModal } from "../ui/NixUi";

export const FinanceView: React.FC = () => {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "transactions">("overview");

  // Account Modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<AccountType>("Main");
  const [accOpening, setAccOpening] = useState<number>(0);
  const [accCurrency, setAccCurrency] = useState("USD");
  const [fromWho, setFromWho] = useState("");
  const [toWho, setToWho] = useState("");
  const [debtDirection, setDebtDirection] = useState<"I Owe" | "Owed To Me">("I Owe");
  const [debtDueDate, setDebtDueDate] = useState("");

  // Transaction Modal
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<TransactionType>("Expense");
  const [txTitle, setTxTitle] = useState("");
  const [txAccountId, setTxAccountId] = useState("");
  const [txDestAccountId, setTxDestAccountId] = useState("");
  const [txCategoryId, setTxCategoryId] = useState("");
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txTime, setTxTime] = useState("12:00");
  const [txNotes, setTxNotes] = useState("");
  const [formError, setFormError] = useState("");

  const accounts = nixStorage.getAccounts();
  const transactions = nixStorage.getTransactions();
  const categories = nixStorage.getFinanceCategories();

  const totalBalance = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

  const openAddAccountModal = () => {
    setEditingAccount(null);
    setAccName("");
    setAccType("Main");
    setAccOpening(0);
    setAccCurrency("USD");
    setFromWho("");
    setToWho("");
    setDebtDirection("I Owe");
    setDebtDueDate("");
    setFormError("");
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = () => {
    if (!accName.trim()) {
      setFormError("Account Name is required.");
      return;
    }

    nixStorage.saveAccount({
      id: editingAccount ? editingAccount.id : undefined,
      name: accName.trim(),
      type: accType,
      initialAmount: accOpening,
      currency: accCurrency,
      fromWho: accType === "Debts" ? fromWho : undefined,
      toWho: accType === "Debts" ? toWho : undefined,
      debtDirection: accType === "Debts" ? debtDirection : undefined,
      debtDueDate: accType === "Debts" ? debtDueDate : undefined,
    });

    setIsAccountModalOpen(false);
    refresh();
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm("Delete this account? Associated transactions will remain stored.")) {
      nixStorage.deleteAccount(id);
      refresh();
    }
  };

  const openAddTxModal = () => {
    setTxType("Expense");
    setTxTitle("");
    setTxAccountId(accounts[0]?.id || "");
    setTxDestAccountId(accounts[1]?.id || "");
    setTxCategoryId(categories[0]?.id || "");
    setTxAmount(0);
    setTxDate(new Date().toISOString().split("T")[0]);
    setTxTime("12:00");
    setTxNotes("");
    setFormError("");
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = () => {
    if (!txTitle.trim()) {
      setFormError("Transaction Description is required.");
      return;
    }
    if (!txAmount || txAmount <= 0) {
      setFormError("Transaction Amount must be greater than 0.");
      return;
    }
    if (!txAccountId) {
      setFormError("Source Account is required.");
      return;
    }
    if (txType === "Transfer") {
      if (!txDestAccountId) {
        setFormError("Destination Account is required for Transfers.");
        return;
      }
      if (txAccountId === txDestAccountId) {
        setFormError("Origin Account and Destination Account must be different.");
        return;
      }
    }

    nixStorage.saveTransaction({
      transactionType: txType,
      title: txTitle.trim(),
      accountId: txAccountId,
      destinationAccountId: txType === "Transfer" ? txDestAccountId : undefined,
      categoryId: txCategoryId || undefined,
      amount: txAmount,
      transactionDate: txDate,
      transactionTime: txTime,
      notes: txNotes,
    });

    setIsTxModalOpen(false);
    refresh();
  };

  const handleDeleteTx = (id: string) => {
    if (window.confirm("Delete this transaction?")) {
      nixStorage.deleteTransaction(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-xl font-mono font-extrabold text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" /> FINANCIAL ACCOUNTS & LEDGER
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">Manage multi-currency accounts, debts, transactions, categories, and real-time ledger balance.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddAccountModal}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> New Account
          </button>
          <button
            onClick={openAddTxModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-mono font-extrabold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Record Transaction
          </button>
        </div>
      </div>

      {/* Net Worth Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Total Ledger Balance</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Active Accounts</span>
            <span className="text-slate-100 font-bold">{accounts.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Total Transactions</span>
            <span className="text-slate-100 font-bold">{transactions.length}</span>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Financial Accounts ({accounts.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <NixCard key={acc.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-bold">
                    {acc.type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">{acc.name}</h4>
                </div>
                <button onClick={() => handleDeleteAccount(acc.id)} className="text-slate-500 hover:text-rose-400 p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400">Current Calculated Balance</span>
                <div className="text-xl font-mono font-bold text-slate-100 mt-0.5">
                  ${acc.currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} {acc.currency}
                </div>
              </div>

              {acc.type === "Debts" && (
                <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800 space-y-0.5">
                  <div>Direction: <strong className="text-amber-400">{acc.debtDirection}</strong></div>
                  {acc.debtDueDate && <div>Due Date: {acc.debtDueDate}</div>}
                </div>
              )}
            </NixCard>
          ))}
        </div>
      </div>

      {/* Transactions History */}
      <NixCard className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Transaction History ({transactions.length})</h3>
        </div>

        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-xs font-mono text-slate-500 py-8 text-center">No transactions logged yet.</p>
          ) : (
            transactions.map((tx) => {
              const account = accounts.find((a) => a.id === tx.accountId);
              const destAccount = accounts.find((a) => a.id === tx.destinationAccountId);

              return (
                <div key={tx.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        tx.transactionType === "Income"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : tx.transactionType === "Transfer"
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {tx.transactionType === "Income" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : tx.transactionType === "Transfer" ? (
                        <ArrowRightLeft className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{tx.title}</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {account?.name || "Account"}
                        {tx.transactionType === "Transfer" && destAccount && ` → ${destAccount.name}`} • {tx.transactionDate} {tx.transactionTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold ${
                        tx.transactionType === "Income" ? "text-emerald-400" : tx.transactionType === "Transfer" ? "text-cyan-400" : "text-slate-100"
                      }`}
                    >
                      {tx.transactionType === "Income" ? "+" : tx.transactionType === "Expense" ? "-" : ""}
                      ${tx.amount.toFixed(2)}
                    </span>
                    <button onClick={() => handleDeleteTx(tx.id)} className="text-slate-500 hover:text-rose-400 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </NixCard>

      {/* Account Modal */}
      <NixModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="Add Financial Account">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Account Name *</label>
            <input
              type="text"
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
              placeholder="e.g. Chase Freedom Visa"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Account Type</label>
              <select
                value={accType}
                onChange={(e) => setAccType(e.target.value as AccountType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                <option value="Main">Main Checking</option>
                <option value="Save">Savings</option>
                <option value="Cash">Physical Cash</option>
                <option value="Card">Credit Card</option>
                <option value="Debts">Debts & IOUs</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Initial Opening Amount</label>
              <input
                type="number"
                value={accOpening}
                onChange={(e) => setAccOpening(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          {accType === "Debts" && (
            <div className="space-y-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 mb-1">Direction</label>
                  <select
                    value={debtDirection}
                    onChange={(e) => setDebtDirection(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
                  >
                    <option value="I Owe">I Owe (Liability)</option>
                    <option value="Owed To Me">Owed To Me (Asset)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsAccountModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveAccount} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              Save Account
            </button>
          </div>
        </div>
      </NixModal>

      {/* Transaction Modal */}
      <NixModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title="Record Transaction">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div className="flex gap-2">
            {(["Expense", "Income", "Transfer"] as TransactionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTxType(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  txType === t
                    ? t === "Income"
                      ? "bg-emerald-500 text-slate-950"
                      : t === "Transfer"
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-rose-500 text-white"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Description / Title *</label>
            <input
              type="text"
              value={txTitle}
              onChange={(e) => setTxTitle(e.target.value)}
              placeholder="e.g. Whole Foods Grocery Run"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                {txType === "Transfer" ? "From Origin Account *" : "Account *"}
              </label>
              <select
                value={txAccountId}
                onChange={(e) => setTxAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (${a.currentBalance})
                  </option>
                ))}
              </select>
            </div>

            {txType === "Transfer" ? (
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">To Destination Account *</label>
                <select
                  value={txDestAccountId}
                  onChange={(e) => setTxDestAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (${a.currentBalance})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Category</label>
                <select
                  value={txCategoryId}
                  onChange={(e) => setTxCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Amount ($ USD) *</label>
              <input
                type="number"
                value={txAmount}
                onChange={(e) => setTxAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button onClick={() => setIsTxModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 text-slate-400">
              Cancel
            </button>
            <button onClick={handleSaveTransaction} className="px-4 py-2 rounded-xl text-xs font-mono font-extrabold bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              Save Transaction
            </button>
          </div>
        </div>
      </NixModal>
    </div>
  );
};
