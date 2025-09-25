import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

export default function NewCustomerPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!address.trim()) newErrors.address = "Address is required";
    return newErrors;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const newCustomer = { name, phone, email, address };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCustomer),
      });

      if (!res.ok) throw new Error("Failed to save customer");

      const savedCustomer = await res.json();
      console.log("Customer saved:", savedCustomer);

      toast.success("Customer created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving customer:", err);
      toast.error("Failed to save customer");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gray-100 p-6 max-w-md mx-auto flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add Customer</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            className={`w-full rounded-lg border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } px-3 py-2.5 text-sm shadow-sm`}
            placeholder="Enter customer name"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm"
            placeholder="Optional"
          />
        </div>

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
            } px-3 py-2.5 text-sm shadow-sm`}
            placeholder="Enter address"
          />
          {errors.address && (
            <p className="text-xs text-red-500 mt-1">{errors.address}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-base shadow-md transition-colors duration-200 ${
            isSubmitting
              ? "opacity-75 cursor-not-allowed"
              : "hover:from-blue-600 hover:to-indigo-700 active:scale-95"
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Customer"}
        </button>
      </form>
    </div>
  );
}
