import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabaseClient";

import {
  ShoppingBag,
  Receipt,
  Truck,
  Trash2,
  Edit3,
  Calendar,
  Printer,
  Plus,
  BookOpen,
  X,
  Check,
  UserCheck,
  BarChart3,
  Wallet,
  Clock,
  Layers,
  Archive,
  FolderOpen,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

const MOHAMED_SALARY = 7000;
const ESMAIL_SALARY = 6000;

const getDateTimeFormatted = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} - ${timeStr}`;
};

const extractMonthFromDate = (dateStr) => {
  try {
    if (!dateStr)
      return new Date().toLocaleDateString("ar-EG", {
        month: "long",
        year: "numeric",
      });
    const parts = dateStr.trim().split("-");
    const mainDate = parts[0] ? parts[0].trim() : dateStr;
    const dateParts = mainDate.split(" ");
    if (dateParts.length >= 3) {
      return `${dateParts[1]} ${dateParts[2]}`;
    }
    return new Date().toLocaleDateString("ar-EG", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("ar-EG", {
      month: "long",
      year: "numeric",
    });
  }
};

export default function StoreSystemMaster() {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState(() =>
    extractMonthFromDate(getDateTimeFormatted()),
  );

  const [saleAmount, setSaleAmount] = useState("");
  const [saleNote, setSaleNote] = useState("");
  const [saleDateInput, setSaleDateInput] = useState(getDateTimeFormatted());

  const [supAmount, setSupAmount] = useState("");
  const [supName, setSupName] = useState("");
  const [supDirection, setSupDirection] = useState("out");
  const [supDateInput, setSupDateInput] = useState(getDateTimeFormatted());

  const [expAmount, setExpAmount] = useState("");
  const [expTypeInput, setExpTypeInput] = useState("");
  const [isEmployeeAdvance, setIsEmployeeAdvance] = useState(false);
  const [expenseEmpName, setExpenseEmpName] = useState("محمد");
  const [expDateInput, setExpDateInput] = useState(getDateTimeFormatted());

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editTypeInput, setEditTypeInput] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOption, setPrintOption] = useState("full_summary");
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null);
  const [selectedPrintSupplier, setSelectedPrintSupplier] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ في جلب البيانات:", error);
    } else if (data) {
      setTransactions(data);
    }
  };

  const handleAdd = async (type) => {
    let amount = 0,
      desc = "",
      subtype = "",
      empName = "",
      customDate = getDateTimeFormatted();

    if (type === "sale") {
      amount = parseFloat(saleAmount);
      desc = saleNote ? `ملاحظة: ${saleNote}` : "مبيعات محل الأخوة";
      customDate = saleDateInput || getDateTimeFormatted();
      if (!amount || amount <= 0) return alert("أدخل مبلغ المبيعات الصحيح");
      setSaleAmount("");
      setSaleNote("");
      setSaleDateInput(getDateTimeFormatted());
    } else if (type === "supplier") {
      amount = parseFloat(supAmount);
      desc = supName.trim();
      customDate = supDateInput || getDateTimeFormatted();
      if (!amount || amount <= 0 || !desc)
        return alert("أدخل اسم المورد ومبلغ الحركة بشكل صحيح");
      if (supDirection === "in") type = "supplier_in";
      setSupAmount("");
      setSupName("");
      setSupDateInput(getDateTimeFormatted());
    } else if (type === "expense") {
      amount = parseFloat(expAmount);
      subtype = expTypeInput.trim() || (isEmployeeAdvance ? `سلفة شريك (${expenseEmpName})` : "مصروف عام");
      desc = subtype;
      customDate = expDateInput || getDateTimeFormatted();

      if (!amount || amount <= 0) return alert("أدخل المبلغ الصحيح للمصروف");
      if (isEmployeeAdvance) empName = expenseEmpName;

      setExpAmount("");
      setExpTypeInput("");
      setIsEmployeeAdvance(false);
      setExpDateInput(getDateTimeFormatted());
    }

    const month = extractMonthFromDate(customDate);
    const newItem = {
      id: Date.now(),
      date: customDate,
      month,
      type:
        type === "supplier_in"
          ? "supplier_in"
          : type === "supplier"
            ? "supplier"
            : type === "sale"
              ? "sale"
              : "expense",
      amount,
      desc,
      subtype,
      isemp: isEmployeeAdvance,
      empname: empName,
    };

    const { error } = await supabase.from("transactions").insert([
      {
        id: newItem.id,
        date: newItem.date,
        month: newItem.month,
        type: newItem.type,
        amount: newItem.amount,
        desc: newItem.desc,
        subtype: newItem.subtype,
        isemp: newItem.isemp,
        empname: newItem.empname,
      },
    ]);

    if (error) {
      alert(`حدث خطأ أثناء الحفظ: ${error.message}`);
      console.error(error);
    } else {
      setTransactions((prev) => [newItem, ...prev]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الكارت؟")) {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) {
        alert("فشل الحذف من قاعدة البيانات");
      } else {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    }
  };

  const startEditing = (t) => {
    setEditingId(t.id);
    setEditDate(t.date);
    setEditAmount(t.amount);
    setEditTypeInput(t.subtype || t.desc || "");
  };

  const saveEdit = async (id) => {
    const targetItem = transactions.find((t) => t.id === id);
    if (!targetItem) return;

    const newDate = editDate || targetItem.date;
    const newMonth = extractMonthFromDate(newDate);
    const updatedAmount = parseFloat(editAmount) || targetItem.amount;
    const updatedDesc = editTypeInput || targetItem.desc;
    const updatedSubtype = editTypeInput || targetItem.subtype;

    const { error } = await supabase
      .from("transactions")
      .update({
        date: newDate,
        month: newMonth,
        amount: updatedAmount,
        desc: updatedDesc,
        subtype: updatedSubtype,
      })
      .eq("id", id);

    if (error) {
      alert("فشل تحديث البيانات في قاعدة البيانات");
      console.error(error);
      return;
    }

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            date: newDate,
            month: newMonth,
            amount: updatedAmount,
            desc: updatedDesc,
            subtype: updatedSubtype,
          };
        }
        return t;
      }),
    );
    setEditingId(null);
  };

  const archiveFilteredTransactions = useMemo(() => {
    if (selectedArchiveMonth === "all") return transactions;
    return transactions.filter((t) => t.month === selectedArchiveMonth);
  }, [transactions, selectedArchiveMonth]);

  const { totalSales, totalExpenses, totalSuppliersBought, totalSuppliersPaid, totalIncome, totalOut, netProfit } = useMemo(() => {
    let sales = 0, expenses = 0, supBought = 0, supPaid = 0;
    
    archiveFilteredTransactions.forEach((t) => {
      const val = parseFloat(t.amount) || 0;
      if (t.type === "sale") sales += val;
      else if (t.type === "expense") expenses += val;
      else if (t.type === "supplier") supBought += val;
      else if (t.type === "supplier_in") supPaid += val;
    });

    const income = sales + supPaid;
    const out = expenses + supBought;

    return {
      totalSales: sales,
      totalExpenses: expenses,
      totalSuppliersBought: supBought,
      totalSuppliersPaid: supPaid,
      totalIncome: income,
      totalOut: out,
      netProfit: income - out,
    };
  }, [archiveFilteredTransactions]);

  const supplierNamesList = useMemo(
    () => [
      ...new Set(
        archiveFilteredTransactions
          .filter((t) => t.type === "supplier" || t.type === "supplier_in")
          .map((t) => t.desc),
      ),
    ],
    [archiveFilteredTransactions],
  );

  const allSuppliersEver = useMemo(
    () => [
      ...new Set(
        transactions
          .filter((t) => t.type === "supplier" || t.type === "supplier_in")
          .map((t) => t.desc),
      ),
    ],
    [transactions],
  );

  const suppliersSummary = useMemo(
    () =>
      supplierNamesList.map((name) => {
        const totalBought = archiveFilteredTransactions
          .filter((t) => t.type === "supplier" && t.desc === name)
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const totalPaidOrReturned = archiveFilteredTransactions
          .filter((t) => t.type === "supplier_in" && t.desc === name)
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        return {
          name,
          totalBought,
          totalPaidOrReturned,
          netBalance: totalBought - totalPaidOrReturned,
        };
      }),
    [supplierNamesList, archiveFilteredTransactions],
  );

  const selectedSupplierTransactions = useMemo(() => {
    if (!selectedPrintSupplier) return [];
    return transactions.filter(
      (t) =>
        (t.type === "supplier" || t.type === "supplier_in") &&
        t.desc === selectedPrintSupplier,
    );
  }, [transactions, selectedPrintSupplier]);

  const selectedSupplierStats = useMemo(() => {
    let bought = 0;
    let paid = 0;
    selectedSupplierTransactions.forEach((t) => {
      const val = parseFloat(t.amount) || 0;
      if (t.type === "supplier") bought += val;
      if (t.type === "supplier_in") paid += val;
    });
    return {
      bought,
      paid,
      balance: bought - paid,
    };
  }, [selectedSupplierTransactions]);

  const monthsList = useMemo(
    () => [...new Set(transactions.map((t) => t.month))],
    [transactions],
  );

  const monthlyStats = useMemo(
    () =>
      monthsList.map((monthName) => {
        const monthTransactions = transactions.filter(
          (t) => t.month === monthName,
        );
        const salesTotal = monthTransactions
          .filter((t) => t.type === "sale")
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const expensesTotal = monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const suppliersBoughtTotal = monthTransactions
          .filter((t) => t.type === "supplier")
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        const suppliersPaidTotal = monthTransactions
          .filter((t) => t.type === "supplier_in")
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        const monthIncome = salesTotal + suppliersPaidTotal;
        const monthOut = expensesTotal + suppliersBoughtTotal;

        return {
          monthName,
          salesTotal,
          expensesTotal,
          suppliersBoughtTotal,
          suppliersPaidTotal,
          monthIncome,
          monthOut,
          monthNetProfit: monthIncome - monthOut,
        };
      }),
    [monthsList, transactions],
  );

  const currentMonthStr = extractMonthFromDate(getDateTimeFormatted());

  const mohamedAdvances = useMemo(
    () =>
      transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            (t.isemp === true || t.isEmp === true) &&
            (t.empname === "محمد" || t.empName === "محمد") &&
            t.month === currentMonthStr,
        )
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    [transactions, currentMonthStr],
  );

  const mohamedAdvancesList = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.type === "expense" &&
          (t.isemp === true || t.isEmp === true) &&
          (t.empname === "محمد" || t.empName === "محمد") &&
          t.month === currentMonthStr,
      ),
    [transactions, currentMonthStr],
  );

  const esmailAdvances = useMemo(
    () =>
      transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            (t.isemp === true || t.isEmp === true) &&
            (t.empname === "إسماعيل" || t.empName === "إسماعيل") &&
            t.month === currentMonthStr,
        )
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
    [transactions, currentMonthStr],
  );

  const esmailAdvancesList = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.type === "expense" &&
          (t.isemp === true || t.isEmp === true) &&
          (t.empname === "إسماعيل" || t.empName === "إسماعيل") &&
          t.month === currentMonthStr,
      ),
    [transactions, currentMonthStr],
  );

  const filteredTransactions = useMemo(
    () =>
      archiveFilteredTransactions.filter((t) => {
        const isEmpVal = t.isemp ?? t.isEmp;
        if (selectedCategory === "supplier") {
          if (t.type !== "supplier" && t.type !== "supplier_in") return false;
        } else if (selectedCategory === "employee") {
          if (t.type !== "expense" || !isEmpVal) return false;
        } else if (selectedCategory === "expense") {
          if (t.type !== "expense" || isEmpVal) return false;
        } else if (selectedCategory !== "all" && t.type !== selectedCategory) {
          return false;
        }
        return true;
      }),
    [archiveFilteredTransactions, selectedCategory],
  );

  const aggregatedMonthlyList = useMemo(() => {
    const map = {};
    archiveFilteredTransactions.forEach((t) => {
      const isEmpVal = t.isemp ?? t.isEmp;
      const empNameVal = t.empname ?? t.empName;
      let subKey = t.desc || t.subtype || "general";
      if (t.type === "expense" && isEmpVal) subKey = `emp_${empNameVal}`;
      const key = `${t.month}_${t.type}_${subKey}`;

      if (!map[key]) {
        map[key] = {
          id: key,
          month: t.month,
          type: t.type,
          desc: t.desc,
          subtype: t.subtype,
          isEmp: isEmpVal,
          empName: empNameVal,
          totalAmount: 0,
        };
      }
      map[key].totalAmount += parseFloat(t.amount) || 0;
    });

    return Object.values(map).filter((item) => {
      if (selectedCategory === "supplier") {
        if (item.type !== "supplier" && item.type !== "supplier_in")
          return false;
      } else if (selectedCategory === "employee") {
        if (item.type !== "expense" || !item.isEmp) return false;
      } else if (selectedCategory === "expense") {
        if (item.type !== "expense" || item.isEmp) return false;
      } else if (selectedCategory !== "all" && item.type !== selectedCategory)
        return false;
      return true;
    });
  }, [archiveFilteredTransactions, selectedCategory]);

  const printSingleInvoice = (item) => {
    setSelectedInvoiceItem(item);
    setPrintOption("single_invoice");
    setTimeout(() => window.print(), 300);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 p-3 sm:p-6 md:p-10 font-sans selection:bg-indigo-600 selection:text-white overflow-x-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8 print:hidden">
        <header className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200/85 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right w-full">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0 font-black">
              <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-1.5 w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] sm:text-sm bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-100">
                  إدارة محلات الأخوة التجاريّة
                </span>
                <span className="text-[11px] sm:text-sm bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full border border-amber-200">
                  {selectedArchiveMonth === "all"
                    ? "عرض كل الأشهر"
                    : `الشهر المعروض: ${selectedArchiveMonth}`}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                نظام الحسابات الذكي 
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                لوحة تحكم متكاملة لإدارة المبيعات، الموردين، سلف الشركاء
                والأرشيف بدقة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowArchiveModal(true)}
              className="px-3 sm:px-5 py-2.5 sm:py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 border border-amber-200 cursor-pointer shadow-sm"
            >
              <Archive className="w-4 h-4 text-amber-600 shrink-0" /> أرشيف
              الشهر
            </button>
            <button
              onClick={() => {
                setPrintOption("full_summary");
                setShowPrintModal(true);
              }}
              className="px-3 sm:px-5 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <Printer className="w-4 h-4 shrink-0" /> التقارير والطباعة
            </button>
          </div>
        </header>

        {/* إحصائيات عامة تفصيلية وشاملة داخل بوردات واضحة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-emerald-100 shadow-lg shadow-slate-100 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>
            <div>
              <p className="text-xs font-bold text-slate-500">إجمالي المبيعات</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-600 mt-1">
                {totalSales.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-blue-100 shadow-lg shadow-slate-100 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500"></div>
            <div>
              <p className="text-xs font-bold text-slate-500">مشتريات الموردين (بضاعة)</p>
              <p className="text-lg sm:text-2xl font-black text-blue-600 mt-1">
                {totalSuppliersBought.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-amber-100 shadow-lg shadow-slate-100 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500"></div>
            <div>
              <p className="text-xs font-bold text-slate-500">المصروفات العامة</p>
              <p className="text-lg sm:text-2xl font-black text-amber-600 mt-1">
                {totalExpenses.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-indigo-100 shadow-lg shadow-slate-100 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600"></div>
            <div>
              <p className="text-xs font-bold text-slate-500">صافي الربح الشامل (الكل)</p>
              <p className={`text-lg sm:text-2xl font-black mt-1 ${netProfit >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                {netProfit.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          <div className="bg-gradient-to-br from-white to-violet-50/25 p-4 sm:p-7 rounded-3xl border-2 border-violet-100 shadow-lg shadow-slate-100 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-black text-sm sm:text-base shrink-0 border border-violet-200">
                  م
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-bold text-slate-900">
                    الأخ: محمد
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    حساب السلف والراتب الثابت (الشهر الحالي)
                  </p>
                </div>
              </div>
              <span className="text-[11px] sm:text-xs bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl border border-violet-200 font-bold">
                الراتب: {MOHAMED_SALARY} ج.م
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-violet-200/60 shadow-sm">
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold">
                  إجمالي السلف
                </p>
                <p className="text-base sm:text-xl font-black text-rose-600 mt-1">
                  {mohamedAdvances.toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-slate-400">
                    ج.م
                  </span>
                </p>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-violet-200/60 shadow-sm">
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold">
                  المتبقي للقبض
                </p>
                <p className="text-base sm:text-xl font-black text-emerald-600 mt-1">
                  {(MOHAMED_SALARY - mohamedAdvances).toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-slate-400">
                    ج.م
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50/25 p-4 sm:p-7 rounded-3xl border-2 border-blue-100 shadow-lg shadow-slate-100 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm sm:text-base shrink-0 border border-blue-200">
                  إ
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-bold text-slate-900">
                    الأخ: إسماعيل
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    حساب السلف والراتب الثابت (الشهر الحالي)
                  </p>
                </div>
              </div>
              <span className="text-[11px] sm:text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 font-bold">
                الراتب: {ESMAIL_SALARY} ج.م
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-200/60 shadow-sm">
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold">
                  إجمالي السلف
                </p>
                <p className="text-base sm:text-xl font-black text-rose-600 mt-1">
                  {esmailAdvances.toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-slate-400">
                    ج.م
                  </span>
                </p>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-200/60 shadow-sm">
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold">
                  المتبقي للقبض
                </p>
                <p className="text-base sm:text-xl font-black text-emerald-600 mt-1">
                  {(ESMAIL_SALARY - esmailAdvances).toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-slate-400">
                    ج.م
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* قسم لوحة تسجيل العمليات اليومية المنظم بداخل بوردات منفصلة لكل عملية */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-black text-base sm:text-xl border-b border-slate-200 pb-2">
            <Layers className="w-5 h-5 text-indigo-600 shrink-0" /> لوحة تسجيل
            العمليات اليومية (كل قسم داخل حد مستقل)
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            
            {/* بورد تسجيل المبيعات */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-emerald-200 shadow-xl shadow-slate-100 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      تسجيل المبيعات
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      الدخل اليومي للمحل
                    </p>
                  </div>
                </div>
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">المبلغ المحصل:</label>
                    <input
                      type="number"
                      placeholder="أدخل المبلغ (ج.م)"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(e.target.value)}
                      className="w-full bg-emerald-50/30 border-2 border-emerald-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">ملاحظة سريعة:</label>
                    <input
                      type="text"
                      placeholder="مثال: مبيعات الفترة المسائية"
                      value={saleNote}
                      onChange={(e) => setSaleNote(e.target.value)}
                      className="w-full bg-emerald-50/30 border-2 border-emerald-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">التاريخ والوقت:</label>
                    <input
                      type="text"
                      value={saleDateInput}
                      onChange={(e) => setSaleDateInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-[11px] sm:text-xs text-emerald-700 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAdd("sale")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" /> حفظ كرت المبيعات
              </button>
            </div>

            {/* بورد حسابات الموردين */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-blue-200 shadow-xl shadow-slate-100 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-blue-100 pb-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      حسابات الموردين
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      بضاعة جديدة أو دفع نقدي
                    </p>
                  </div>
                </div>
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">اسم المورد:</label>
                    <input
                      type="text"
                      placeholder="أدخل اسم المورد بدقة"
                      value={supName}
                      onChange={(e) => setSupName(e.target.value)}
                      className="w-full bg-blue-50/30 border-2 border-blue-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">المبلغ:</label>
                    <input
                      type="number"
                      placeholder="المبلغ (ج.م)"
                      value={supAmount}
                      onChange={(e) => setSupAmount(e.target.value)}
                      className="w-full bg-blue-50/30 border-2 border-blue-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">
                      نوع الحركة:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSupDirection("out")}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition border-2 cursor-pointer flex items-center justify-center gap-1 ${
                          supDirection === "out"
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        شراء بضاعة (عليك)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSupDirection("in")}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition border-2 cursor-pointer flex items-center justify-center gap-1 ${
                          supDirection === "in"
                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/25"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        دفع نقدي (دفعنا)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">التاريخ والوقت:</label>
                    <input
                      type="text"
                      value={supDateInput}
                      onChange={(e) => setSupDateInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-[11px] sm:text-xs text-blue-700 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAdd("supplier")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" /> حفظ كرت المورد
              </button>
            </div>

            {/* بورد المصروفات وسلف الشركاء */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-amber-200 shadow-xl shadow-slate-100 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 font-bold">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      المصروفات والسلف
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      مصاريف المحل وسلف الشركاء
                    </p>
                  </div>
                </div>
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">وصف المصروف / السلفة:</label>
                    <input
                      type="text"
                      placeholder="مثال: فاتورة كهرباء، شراء أدوات.."
                      value={expTypeInput}
                      onChange={(e) => setExpTypeInput(e.target.value)}
                      className="w-full bg-amber-50/30 border-2 border-amber-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-amber-600 transition"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">المبلغ المدفوع:</label>
                    <input
                      type="number"
                      placeholder="المبلغ (ج.م)"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full bg-amber-50/30 border-2 border-amber-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-amber-600 transition"
                    />
                  </div>

                  {/* صندوق اختيار سلفة الشريك بداخل بورد فرعي بحد ممتاز */}
                  <div className="bg-amber-50/60 p-3.5 rounded-2xl border-2 border-amber-200/80 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEmployeeAdvance}
                        onChange={(e) => setIsEmployeeAdvance(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                      />
                      <span className="text-xs text-slate-900 font-extrabold">
                        ⚠️ تسجيل سلفة لأحد الشركاء (تخصم من راتبه)
                      </span>
                    </label>

                    {isEmployeeAdvance && (
                      <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                        <span className="text-[10px] font-bold text-slate-600 block">اختر اسم الشريك المستلف:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setExpenseEmpName("محمد")}
                            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition border-2 cursor-pointer ${
                              expenseEmpName === "محمد"
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            الشريك: محمد
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpenseEmpName("إسماعيل")}
                            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition border-2 cursor-pointer ${
                              expenseEmpName === "إسماعيل"
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            الشريك: إسماعيل
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">التاريخ والوقت:</label>
                    <input
                      type="text"
                      value={expDateInput}
                      onChange={(e) => setExpDateInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-[11px] sm:text-xs text-amber-700 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAdd("expense")}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-600/20"
              >
                <Plus className="w-4 h-4" /> حفظ المصروف / السلفة
              </button>
            </div>

          </div>
        </div>

        {/* قسم أرصدة الموردين المنظم داخل بوردات واضحة وأرشيف الفولدرات الشهرية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {suppliersSummary.length > 0 && (
            <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-blue-200 shadow-lg shadow-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-base border-b border-blue-100 pb-3">
                <UserCheck className="w-5 h-5 shrink-0" /> أرصدة الموردين (في الشهر المحدد: {selectedArchiveMonth})
              </div>
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {suppliersSummary.map((sup, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-white to-blue-50/20 p-4 sm:p-5 rounded-3xl border-2 border-blue-100 shadow-sm space-y-3 transition hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          🚛
                        </div>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          {sup.name}
                        </h4>
                      </div>
                      <span className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-xl border border-blue-200">
                        مورد معتمد
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] text-slate-500 font-bold block">مشتريات البضاعة:</span>
                        <span className="font-black text-blue-700 text-sm">
                          {sup.totalBought.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] text-slate-500 font-bold block">المدفوع نقداً:</span>
                        <span className="font-black text-teal-600 text-sm">
                          {sup.totalPaidOrReturned.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-900">الصافي المتبقي على الحساب:</span>
                      <span className="text-sm sm:text-base font-black text-indigo-900">
                        {sup.netBalance.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* فولدرات الأرباح الشهرية المنظمة والواضحة */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border-2 border-indigo-200 shadow-lg shadow-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b border-indigo-100 pb-3">
              <FolderOpen className="w-5 h-5 shrink-0" /> ملفات (فولدرات) الأرباح الشهرية الشاملة
            </div>
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {monthlyStats.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold text-xs">
                  لا توجد أشهر مسجلة حتى الآن
                </div>
              ) : (
                monthlyStats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-slate-50 to-indigo-50/20 p-4 sm:p-5 rounded-3xl border border-indigo-100 shadow-sm space-y-3 transition hover:shadow-md"
                  >
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                          📁
                        </div>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">
                          {stat.monthName}
                        </h4>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block font-semibold">صافي الربح الشامل</span>
                        <span className={`text-sm sm:text-base font-black ${stat.monthNetProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {stat.monthNetProfit.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] text-slate-500 font-bold block">إجمالي الدخل الشامل:</span>
                        <span className="font-black text-emerald-600 text-sm">
                          {stat.monthIncome.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
                        </span>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                          <span>مبيعات: {stat.salesTotal.toLocaleString()}</span>
                          <span>وارد: {stat.suppliersPaidTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-[11px] text-slate-500 font-bold block">إجمالي المنصرف الشامل:</span>
                        <span className="font-black text-rose-600 text-sm">
                          {stat.monthOut.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ج.م</span>
                        </span>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                          <span>مصاريف: {stat.expensesTotal.toLocaleString()}</span>
                          <span>بضاعة: {stat.suppliersBoughtTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200/85 shadow-lg shadow-slate-100 space-y-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="text-sm sm:text-lg font-bold text-slate-900">
                {activeTab === "daily"
                  ? "السجل التفصيلي اليومي"
                  : "السجل الشهري المجمع"}
                {selectedArchiveMonth !== "all" &&
                  ` (عرض شهر: ${selectedArchiveMonth})`}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full lg:w-auto">
              <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex gap-1">
                <button
                  onClick={() => setActiveTab("daily")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "daily"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  اليومي
                </button>
                <button
                  onClick={() => setActiveTab("monthly")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "monthly"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  الشهري
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {[
                  { id: "all", label: "كل الأقسام" },
                  { id: "sale", label: "مبيعات" },
                  { id: "supplier", label: "موردين" },
                  { id: "expense", label: "مصروفات عامة" },
                  { id: "employee", label: "سلف الأخوة" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap border ${
                      selectedCategory === cat.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeTab === "daily" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredTransactions.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-slate-400 font-bold text-sm">
                  لا توجد حركات مسجلة في هذا الشهر حالياً
                </div>
              ) : (
                filteredTransactions.map((t) => {
                  let cardBorder = "border-slate-200 bg-slate-50/50";
                  let badgeText = "";
                  let badgeColor =
                    "bg-slate-100 text-slate-700 border-slate-200";

                  const isEmpVal = t.isemp ?? t.isEmp;
                  const empNameVal = t.empname ?? t.empName;

                  if (t.type === "sale") {
                    cardBorder = "border-emerald-200 bg-emerald-50/20";
                    badgeText = "مبيعات محل الأخوة";
                    badgeColor =
                      "bg-emerald-50 text-emerald-700 border-emerald-200";
                  } else if (t.type === "supplier") {
                    cardBorder = "border-blue-200 bg-blue-50/20";
                    badgeText = "شراء بضاعة (مورد)";
                    badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                  } else if (t.type === "supplier_in") {
                    cardBorder = "border-teal-200 bg-teal-50/20";
                    badgeText = "دفع نقدي (مورد)";
                    badgeColor = "bg-teal-50 text-teal-700 border-teal-200";
                  } else if (t.type === "expense") {
                    if (isEmpVal) {
                      cardBorder = "border-violet-200 bg-violet-50/20";
                      badgeText = `سلفة الشريك: ${empNameVal}`;
                      badgeColor =
                        "bg-violet-50 text-violet-700 border-violet-200";
                    } else {
                      cardBorder = "border-amber-200 bg-amber-50/20";
                      badgeText = "مصروف عام";
                      badgeColor =
                        "bg-amber-50 text-amber-700 border-amber-200";
                    }
                  }

                  const isEditing = editingId === t.id;

                  return (
                    <div
                      key={t.id}
                      className={`p-4 sm:p-5 rounded-3xl border ${cardBorder} shadow-sm flex flex-col justify-between space-y-4`}
                    >
                      {isEditing ? (
                        <div className="space-y-2.5">
                          <span className="text-xs font-bold text-amber-700">
                            تعديل البيانات:
                          </span>
                          <input
                            type="text"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                          />
                          {t.type === "expense" && (
                            <input
                              type="text"
                              value={editTypeInput}
                              onChange={(e) => setEditTypeInput(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                            />
                          )}
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span
                              className={`px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold border ${badgeColor}`}
                            >
                              {badgeText}
                            </span>
                            <div className="text-left">
                              <span className="text-base sm:text-xl font-black text-slate-900">
                                {parseFloat(t.amount).toLocaleString()}{" "}
                                <span className="text-[10px] font-normal text-slate-400">
                                  ج.م
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="bg-white/80 p-3 rounded-2xl border border-slate-200/60 space-y-1.5 text-xs">
                            <div className="flex justify-between items-center text-slate-700">
                              <span className="text-slate-400 font-semibold">
                                البيان / التفصيل:
                              </span>
                              <span className="font-bold text-slate-900">
                                {t.desc || t.subtype || "لا يوجد بيان"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-700">
                              <span className="text-slate-400 font-semibold">
                                الشهر:
                              </span>
                              <span className="font-semibold text-indigo-600">
                                {t.month}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />{" "}
                            {t.date}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/60 flex-wrap">
                        <button
                          onClick={() => printSingleInvoice(t)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-indigo-200 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> طباعة
                        </button>
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(t.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> حفظ
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" /> إلغاء
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(t)}
                                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-slate-200 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-600" />{" "}
                                تعديل
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-rose-200 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> حذف
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "monthly" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {aggregatedMonthlyList.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-slate-400 font-bold text-sm">
                  لا توجد بيانات شهرية مسجلة في هذا الشهر
                </div>
              ) : (
                aggregatedMonthlyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl border border-slate-200 bg-slate-50/50 shadow-sm space-y-2"
                  >
                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold border bg-white text-slate-700 border-slate-200 self-start">
                      {item.desc || item.subtype || item.type}
                    </span>
                    <div className="text-base sm:text-lg font-black text-slate-900">
                      {parseFloat(item.totalAmount).toLocaleString()}{" "}
                      <span className="text-[10px] font-normal text-slate-400">
                        ج.م
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-indigo-600 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0" /> الشهر:{" "}
                      {item.month}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showArchiveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white border border-slate-200 w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                أرشيف الأشهر السابقة
              </h3>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedArchiveMonth("all");
                  setShowArchiveModal(false);
                }}
                className={`w-full text-right p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                  selectedArchiveMonth === "all"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                عرض كل الأشهر (الكل)
              </button>
              {monthsList.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedArchiveMonth(m);
                    setShowArchiveModal(false);
                  }}
                  className={`w-full text-right p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    selectedArchiveMonth === m
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  شهر: {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white border border-slate-200 w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                خيارات الطباعة
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <label
                onClick={() => setPrintOption("full_summary")}
                className={`block p-3 rounded-2xl border cursor-pointer text-xs font-bold transition ${
                  printOption === "full_summary"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                تقرير العمليات التفصيلي العام
              </label>
              <label
                onClick={() => setPrintOption("mohamed_slip")}
                className={`block p-3 rounded-2xl border cursor-pointer text-xs font-bold transition ${
                  printOption === "mohamed_slip"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                حساب وسلف الأخ: محمد
              </label>
              <label
                onClick={() => setPrintOption("esmail_slip")}
                className={`block p-3 rounded-2xl border cursor-pointer text-xs font-bold transition ${
                  printOption === "esmail_slip"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                حساب وسلف الأخ: إسماعيل
              </label>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">
                  اختر مورد لطباعة كشف حسابه الشخصي:
                </label>
                <select
                  value={selectedPrintSupplier}
                  onChange={(e) => {
                    setSelectedPrintSupplier(e.target.value);
                    setPrintOption("supplier_slip");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="">-- اضغط لاختيار اسم المورد --</option>
                  {allSuppliersEver.map((supName, idx) => (
                    <option key={idx} value={supName}>
                      {supName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (
                    printOption === "supplier_slip" &&
                    !selectedPrintSupplier
                  ) {
                    alert("برجاء اختيار اسم المورد أولاً");
                    return;
                  }
                  setShowPrintModal(false);
                  setTimeout(() => window.print(), 300);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/20"
              >
                طباعة الآن
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="hidden print:block print:bg-white print:text-slate-900 p-8 font-sans"
        dir="rtl"
      >
        <div className="flex justify-between items-center border-b-2 border-indigo-900 pb-6 mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-indigo-900 tracking-wide">
              محل الأخوة للتجارة والحسابات
            </h1>
            <p className="text-xs font-bold text-slate-600">
              نظام إدارة الحسابات والسلف والمبيعات والموردين
            </p>
          </div>
          <div className="text-left space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-800">تاريخ الطباعة:</p>
            <p className="text-[11px] font-semibold text-indigo-700">
              {getDateTimeFormatted()}
            </p>
          </div>
        </div>

        {printOption === "full_summary" && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex justify-between items-center text-xs font-bold text-indigo-900">
              <span>نوع التقرير: كشف الحركات المالية التفصيلي العام</span>
              <span>الشهر المعروض: {selectedArchiveMonth}</span>
            </div>
            <table className="w-full text-right border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-indigo-900 text-white">
                  <th className="border border-indigo-900 p-2.5 font-bold">
                    #
                  </th>
                  <th className="border border-indigo-900 p-2.5 font-bold">
                    التاريخ والوقت
                  </th>
                  <th className="border border-indigo-900 p-2.5 font-bold">
                    نوع الحركة والبيان
                  </th>
                  <th className="border border-indigo-900 p-2.5 font-bold text-left">
                    المبلغ
                  </th>
                </tr>
              </thead>
              <tbody>
                {archiveFilteredTransactions.map((t, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                  >
                    <td className="border border-slate-300 p-2 font-semibold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 p-2 font-bold text-slate-700">
                      {t.date}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-900 font-medium">
                      {t.desc || t.subtype || "عملية مالية عامة"}
                    </td>
                    <td className="border border-slate-300 p-2 font-black text-indigo-900 text-left">
                      {parseFloat(t.amount).toLocaleString()} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {printOption === "mohamed_slip" && (
          <div className="space-y-4">
            <div className="bg-violet-50 border border-violet-200 p-4 rounded-xl flex justify-between items-center text-xs font-bold text-violet-900">
              <span>كشف سلف وراتب الأخ: محمد</span>
              <span>الشهر: {currentMonthStr}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-[11px] text-slate-500">الراتب الثابت</p>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {MOHAMED_SALARY} ج.م
                </p>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                <p className="text-[11px] text-rose-600">إجمالي السلف</p>
                <p className="text-sm font-black text-rose-700 mt-1">
                  {mohamedAdvances} ج.م
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <p className="text-[11px] text-emerald-600">المتبقي للقبض</p>
                <p className="text-sm font-black text-emerald-700 mt-1">
                  {MOHAMED_SALARY - mohamedAdvances} ج.م
                </p>
              </div>
            </div>
            <table className="w-full text-right border-collapse border border-slate-300 text-xs mt-3">
              <thead>
                <tr className="bg-violet-900 text-white">
                  <th className="border border-violet-900 p-2.5 font-bold">
                    التاريخ والوقت
                  </th>
                  <th className="border border-violet-900 p-2.5 font-bold">
                    بيان السلفة
                  </th>
                  <th className="border border-violet-900 p-2.5 font-bold text-left">
                    المبلغ المسحوب
                  </th>
                </tr>
              </thead>
              <tbody>
                {mohamedAdvancesList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="border border-slate-300 p-4 text-center text-slate-500 font-semibold"
                    >
                      لا توجد سلف مسجلة للأخ محمد خلال هذا الشهر
                    </td>
                  </tr>
                ) : (
                  mohamedAdvancesList.map((t, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                    >
                      <td className="border border-slate-300 p-2 font-bold text-slate-700">
                        {t.date}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-900">
                        {t.subtype || "سلفة نقدية"}
                      </td>
                      <td className="border border-slate-300 p-2 font-black text-rose-600 text-left">
                        {parseFloat(t.amount).toLocaleString()} ج.م
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {printOption === "esmail_slip" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center text-xs font-bold text-blue-900">
              <span>كشف سلف وراتب الأخ: إسماعيل</span>
              <span>الشهر: {currentMonthStr}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-[11px] text-slate-500">الراتب الثابت</p>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {ESMAIL_SALARY} ج.م
                </p>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                <p className="text-[11px] text-rose-600">إجمالي السلف</p>
                <p className="text-sm font-black text-rose-700 mt-1">
                  {esmailAdvances} ج.م
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                <p className="text-[11px] text-emerald-600">المتبقي للقبض</p>
                <p className="text-sm font-black text-emerald-700 mt-1">
                  {ESMAIL_SALARY - esmailAdvances} ج.م
                </p>
              </div>
            </div>
            <table className="w-full text-right border-collapse border border-slate-300 text-xs mt-3">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-blue-900 p-2.5 font-bold">
                    التاريخ والوقت
                  </th>
                  <th className="border border-blue-900 p-2.5 font-bold">
                    بيان السلفة
                  </th>
                  <th className="border border-blue-900 p-2.5 font-bold text-left">
                    المبلغ المسحوب
                  </th>
                </tr>
              </thead>
              <tbody>
                {esmailAdvancesList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="border border-slate-300 p-4 text-center text-slate-500 font-semibold"
                    >
                      لا توجد سلف مسجلة للأخ إسماعيل خلال هذا الشهر
                    </td>
                  </tr>
                ) : (
                  esmailAdvancesList.map((t, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                    >
                      <td className="border border-slate-300 p-2 font-bold text-slate-700">
                        {t.date}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-900">
                        {t.subtype || "سلفة نقدية"}
                      </td>
                      <td className="border border-slate-300 p-2 font-black text-rose-600 text-left">
                        {parseFloat(t.amount).toLocaleString()} ج.م
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {printOption === "supplier_slip" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex justify-between items-center text-xs font-bold text-blue-900">
              <span>
                كشف حساب المورد: {selectedPrintSupplier || "غير محدد"}
              </span>
              <span>سجل جميع المعاملات</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <p className="text-[11px] text-slate-500">
                  إجمالي المشتريات (عليك)
                </p>
                <p className="text-sm font-black text-blue-700 mt-1">
                  {selectedSupplierStats.bought.toLocaleString()} ج.م
                </p>
              </div>
              <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl">
                <p className="text-[11px] text-teal-600">
                  إجمالي المدفوع (دفعنا)
                </p>
                <p className="text-sm font-black text-teal-700 mt-1">
                  {selectedSupplierStats.paid.toLocaleString()} ج.م
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl">
                <p className="text-[11px] text-indigo-600">
                  الرصيد المتبقي (عليه / لك)
                </p>
                <p className="text-sm font-black text-indigo-900 mt-1">
                  {selectedSupplierStats.balance.toLocaleString()} ج.م
                </p>
              </div>
            </div>
            <table className="w-full text-right border-collapse border border-slate-300 text-xs mt-3">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-blue-900 p-2.5 font-bold">
                    التاريخ والوقت
                  </th>
                  <th className="border border-blue-900 p-2.5 font-bold">
                    نوع الحركة
                  </th>
                  <th className="border border-blue-900 p-2.5 font-bold text-left">
                    المبلغ
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedSupplierTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="border border-slate-300 p-4 text-center text-slate-500 font-semibold"
                    >
                      لا توجد معاملات مسجلة لهذا المورد
                    </td>
                  </tr>
                ) : (
                  selectedSupplierTransactions.map((t, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                    >
                      <td className="border border-slate-300 p-2 font-bold text-slate-700">
                        {t.date}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-900 font-medium">
                        {t.type === "supplier"
                          ? "شراء بضاعة (عليك)"
                          : "دفع نقدية (دفعنا للمورد)"}
                      </td>
                      <td
                        className={`border border-slate-300 p-2 font-black text-left ${t.type === "supplier" ? "text-blue-700" : "text-teal-700"}`}
                      >
                        {parseFloat(t.amount).toLocaleString()} ج.م
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {printOption === "single_invoice" && selectedInvoiceItem && (
          <div className="max-w-md mx-auto border-2 border-indigo-900 p-6 rounded-2xl bg-white shadow-sm space-y-4">
            <div className="text-center border-b border-slate-200 pb-3">
              <h3 className="font-black text-lg text-indigo-900">
                إيصال حركة مالية رسمي
              </h3>
              <p className="text-[11px] text-slate-500">محل الأخوة للتجارة</p>
            </div>
            <div className="text-xs space-y-3 font-bold text-slate-800">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">تاريخ الحركة:</span>
                <span>{selectedInvoiceItem.date}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">الشهر:</span>
                <span>{selectedInvoiceItem.month}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">نوع الحركة:</span>
                <span className="text-indigo-700">
                  {selectedInvoiceItem.type}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">البيان:</span>
                <span>
                  {selectedInvoiceItem.desc ||
                    selectedInvoiceItem.subtype ||
                    "بدون بيان"}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-black text-slate-900 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <span>المبلغ الإجمالي:</span>
                <span className="text-indigo-900">
                  {parseFloat(selectedInvoiceItem.amount).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-slate-300 flex justify-between text-xs font-bold text-slate-700">
          <div>توقيع المحاسب / المسئول: ........................</div>
          <div>ختم المحل: ........................</div>
        </div>
      </div>
    </div>
  );
}