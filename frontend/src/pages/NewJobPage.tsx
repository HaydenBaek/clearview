// src/pages/NewJobPage.tsx
import { useState, useEffect, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Listbox } from "@headlessui/react";

type Customer = {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
};

export default function NewJobPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const jobData = location.state as { address?: string } | null;

  const [tab, setTab] = useState<"manual" | "customer">("manual");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState(jobData?.address || ""); 
  const [jobDate, setJobDate] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data: Customer[] = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load customers");
      }
    };
    fetchCustomers();
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (tab === "manual") {
      if (!customerName.trim()) newErrors.customerName = "Customer name is required";
      if (!address.trim()) newErrors.address = "Address is required";
    } else {
      if (!selectedCustomer) newErrors.selectedCustomer = "Please select a customer";
    }
    if (!jobDate) newErrors.jobDate = "Job date is required";
    if (!price || parseFloat(price) <= 0) newErrors.price = "Price must be greater than 0";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    const newJob = {
      service: "Window Cleaning",
      jobDate,
      price: parseFloat(price),
      notes,
      customerId: tab === "customer" ? selectedCustomer!.id : null,
      customerName: tab === "manual" ? customerName : null,
      address: tab === "manual" ? address : null,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newJob),
      });
      if (!res.ok) throw new Error("Failed to save job");
      toast.success("Job created!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-100 p-6 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Create New Job</h1>
        <div className="w-10" />
      </header>

      {/* Pre-filled Address from Map */}
      {jobData?.address && tab === "manual" && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow border border-gray-200">
          <p className="text-sm">
            <span className="font-medium">Selected Address: </span>
            {jobData.address}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-6 bg-white rounded-xl shadow border border-gray-200">
        <button
          className={`flex-1 py-3 text-sm font-medium rounded-l-xl transition-colors ${
            tab === "manual" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setTab("manual")}
        >
          Manual
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium rounded-r-xl transition-colors ${
            tab === "customer" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setTab("customer")}
        >
          From Customer
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        {tab === "manual" ? (
          <div className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setErrors((prev) => ({ ...prev, customerName: "" }));
                }}
                className={`w-full rounded-lg border ${
                  errors.customerName ? "border-red-500" : "border-gray-300"
                } px-3 py-2.5 text-sm`}
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors((prev) => ({ ...prev, address: "" }));
                }}
                className={`w-full rounded-lg border ${
                  errors.address ? "border-red-500" : "border-gray-300"
                } px-3 py-2.5 text-sm`}
                placeholder="Enter address"
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
          </div>
        ) : (
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Select Customer
  </label>

  <div className="relative">
    <Listbox value={selectedCustomer} onChange={setSelectedCustomer}>
      {/* Button */}
      <Listbox.Button className="w-full flex justify-between items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
        {selectedCustomer
          ? `${selectedCustomer.name} — ${selectedCustomer.address}`
          : "Select a customer"}

        {/* Down Arrow Icon (no external libs) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Listbox.Button>

      {/* Dropdown Options */}
      <Listbox.Options className="absolute mt-2 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg z-10">
        {customers.map((customer) => (
          <Listbox.Option
            key={customer.id}
            value={customer}
            as={Fragment}
          >
            {({ active, selected }) => (
              <li
                className={`cursor-pointer select-none px-4 py-2 text-sm ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-800"
                } ${selected ? "font-semibold" : ""}`}
              >
                {customer.name} — {customer.address}
              </li>
            )}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  </div>

  {errors.selectedCustomer && (
    <p className="text-xs text-red-500 mt-1">{errors.selectedCustomer}</p>
  )}
</div>

        )}

        {/* Job Date, Price, Notes */}
        <JobFormFields
          jobDate={jobDate}
          setJobDate={(v) => {
            setJobDate(v);
            setErrors((prev) => ({ ...prev, jobDate: "" }));
          }}
          price={price}
          setPrice={(v) => {
            setPrice(v);
            setErrors((prev) => ({ ...prev, price: "" }));
          }}
          notes={notes}
          setNotes={setNotes}
          errors={errors}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-base shadow-md ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:from-blue-600 hover:to-indigo-700 active:scale-95"
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}

type JobFormFieldsProps = {
  jobDate: string;
  setJobDate: React.Dispatch<React.SetStateAction<string>>;
  price: string;
  setPrice: React.Dispatch<React.SetStateAction<string>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  errors: { [key: string]: string };
};

function JobFormFields({
  jobDate,
  setJobDate,
  price,
  setPrice,
  notes,
  setNotes,
  errors,
}: JobFormFieldsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Date</label>
        <input
          type="date"
          value={jobDate}
          onChange={(e) => setJobDate(e.target.value)}
          className={`w-full rounded-lg border ${
            errors.jobDate ? "border-red-500" : "border-gray-300"
          } px-3 py-2.5 text-sm`}
        />
        {errors.jobDate && <p className="text-xs text-red-500 mt-1">{errors.jobDate}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.01"
          className={`w-full rounded-lg border ${
            errors.price ? "border-red-500" : "border-gray-300"
          } px-3 py-2.5 text-sm`}
          placeholder="Enter price"
        />
        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Optional special instructions..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-none"
        />
      </div>
    </div>
  );
}
