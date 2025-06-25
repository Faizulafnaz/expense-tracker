import React, { useState, useEffect, useRef } from 'react';
import { 
  FaHome, FaUsers, FaChartBar, FaShoppingCart, FaBox, FaCog, 
  FaSearch, FaBell, FaDollarSign, FaArrowUp, FaEye, FaEdit, 
  FaTrash, FaDownload, FaPlus, FaCube, 
  FaUserPlus
} from 'react-icons/fa';
import axios from "../api/axios";
import { ToastContainer, toast } from 'react-toastify';
import Cookies from "js-cookie";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";



const ExpenseDashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user)
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("expenses/summary/", {
          withCredentials: true,
        });

        // Recharts expects `name` and `value` keys
        const formatted = res.data.map(item => ({
          name: item.category,
          value: item.total
        }));

        setChartData(formatted);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    fetchSummary();
  }, []);

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "food",
    note: "",
    date: "",
  });

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
  });

  const fetchExpenses = async () => {
    const params = {};

    if (filters.startDate) params.start_date = filters.startDate;
    if (filters.endDate) params.end_date = filters.endDate;
    if (filters.category) params.category = filters.category;

    const res = await axios.get("http://localhost:8000/api/expenses/", {
      params,
      withCredentials: true,
    });

    setExpenses(res.data);
  };


  const csrfToken = Cookies.get("csrftoken");


  const handleNavClick = async (navItem) => {
    if (navItem == 'logout'){
      try {
        await axios.post("expenses/logout/", null, {
          withCredentials: true,
          headers: {"X-CSRFToken": csrfToken}
        });
        localStorage.removeItem("user");
        navigate('/login')
        } catch (error) {
        console.error("Logout failed", error);
        toast.error("Logout failed");
      }
    }

    setActiveNav(navItem);
  };

  useEffect(() => {
    axios.get("expenses/", { withCredentials: true })
      .then(res => setExpenses(res.data))
      .catch(err => console.error("Failed to fetch expenses", err));
  }, []);

  const handleView = (expense) => {
  setSelectedExpense(expense);
  setIsViewModalOpen(true);
  };

  const handleEdit = (expense) => {
  setSelectedExpense(expense);
  setIsEditModalOpen(true);
  };

  const handleDelete = async (expenseId) => {
  if (!window.confirm("Are you sure you want to delete this expense?")) return;
  try {
      await axios.delete(`expenses/${expenseId}/`, { withCredentials: true });
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      toast.success("Expense deleted");
  } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
  }
  };


  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff6f61"];



  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'logout', label: 'logout', icon: FaTrash },
  ];

  return (
    <>
    <ToastContainer /> 
    {isViewModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-bold mb-4">Expense Detail</h2>
          <p><strong>Title:</strong> {selectedExpense.title}</p>
          <p><strong>Amount:</strong> ₹{selectedExpense.amount}</p>
          <p><strong>Category:</strong> {selectedExpense.category}</p>
          <p><strong>Date:</strong> {selectedExpense.date}</p>
          <p><strong>Note:</strong> {selectedExpense.notes}</p>
          <button onClick={() => setIsViewModalOpen(false)} className="mt-4 bg-gray-700 text-white px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    )}
    {isEditModalOpen && selectedExpense && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-96">
          <h2 className="text-lg font-bold mb-4">Edit Expense</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.put(`expenses/${selectedExpense.id}/`, selectedExpense, { withCredentials: true, headers: {"X-CSRFToken": csrfToken}});
                setIsEditModalOpen(false);
                // Reload the expenses list
                const res = await axios.get("expenses/", { withCredentials: true });
                setExpenses(res.data);
                toast.success("Expense updated");
              } catch (err) {
                toast.error("Failed to update");
              }
            }}
          >
            <input
              className="w-full border px-3 py-2 mb-3 rounded"
              type="text"
              value={selectedExpense.title}
              onChange={(e) => setSelectedExpense({ ...selectedExpense, title: e.target.value })}
              placeholder="Title"
            />
            <input
              className="w-full border px-3 py-2 mb-3 rounded"
              type="number"
              value={selectedExpense.amount}
              onChange={(e) => setSelectedExpense({ ...selectedExpense, amount: e.target.value })}
              placeholder="Amount"
            />
            <select
              className="w-full border px-3 py-2 mb-3 rounded"
              value={selectedExpense.category}
              onChange={(e) => setSelectedExpense({ ...selectedExpense, category: e.target.value })}
            >
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="utilities">Utilities</option>
              <option value="misc">Misc</option>
            </select>
            <textarea
              className="w-full border px-3 py-2 mb-3 rounded"
              value={selectedExpense.notes || ""}
              onChange={(e) => setSelectedExpense({ ...selectedExpense, notes: e.target.value })}
              placeholder="Note"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    {isCreateModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
          <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post(
                  "http://localhost:8000/api/expenses/",
                  newExpense,
                  {
                    withCredentials: true,
                    headers: {"X-CSRFToken": csrfToken}
                  }
                );
                toast.success("Expense added");
                setIsCreateModalOpen(false);
                setNewExpense({ title: "", amount: "", category: "Food", note: "", date: new Date().toISOString().split("T")[0] });
                const res = await axios.get("http://localhost:8000/api/expenses/", { withCredentials: true,  });
                setExpenses(res.data); // refresh list
              } catch (err) {
                toast.error("Failed to add expense");
              }
            }}
          >
            <input
              className="w-full border px-3 py-2 mb-3 rounded"
              type="text"
              placeholder="Title"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              required
            />
            <input
              className="w-full border px-3 py-2 mb-3 rounded"
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              required
            />
            <select
              className="w-full border px-3 py-2 mb-3 rounded"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            >
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="utilities">Utilities</option>
              <option value="misc">Misc</option>
            </select>
            <input
              className="w-full border px-3 py-2 mb-3 rounded"
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            />
            <textarea
              className="w-full border px-3 py-2 mb-3 rounded"
              placeholder="Note (optional)"
              value={newExpense.notes}
              onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    )}



      {/* Add Chart.js script */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
      
      <div className="bg-gray-100 min-h-screen">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 shadow-xl z-50">
          <div className="flex items-center justify-center h-16 bg-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <FaCube className="text-blue-700 text-lg" />
              </div>
              <span className="text-white text-xl font-bold">Expense Tracker</span>{}
            </div>
          </div>
          
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors group ${
                      activeNav === item.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className={`mr-3 ${
                      activeNav === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Track your expenses</h1>
                  <p className="text-gray-600 text-sm mt-1">Welcome back, here's what's happening today</p>
                </div>
                
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="p-6">
            {/* Recent expenses Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent expenses</h3>
                    <p className="text-gray-600 text-sm">These are recent expenses that you added</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        className="border px-2 py-1 rounded text-sm"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      />
                      <input
                        type="date"
                        className="border px-2 py-1 rounded text-sm"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      className="border px-2 py-1 rounded text-sm"
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                      <option value="">All</option>
                      <option value="food">Food</option>
                      <option value="travel">Travel</option>
                      <option value="utilities">Utilities</option>
                      <option value="misc">Misc</option>
                    </select>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    onClick={() => fetchExpenses()}
                  >
                    Apply Filters
                  </button>
                  <button
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    onClick={() => {
                      setFilters({ ...filters, startDate: "", endDate: "", category: "" });
                      fetchExpenses()
                    }}
                  >
                    Clear Filters
                  </button>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors" onClick={() => setIsCreateModalOpen(true)}>
                      <FaPlus className="mr-2 inline" />Add Expenses
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.map((expense, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{expense.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                              <div className="text-sm text-gray-500">{expense.titile}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.notes}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{expense.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900" onClick={() => handleView(expense)}>
                              <FaEye />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900" onClick={()=>handleEdit(expense)}>
                              <FaEdit />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(expense.id)}>
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
              </div>
            </div>

            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ExpenseDashboard;