import React, { useState } from "react";
import axios from "axios";
import '../index.css'
const JobPostingForm = () => {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (pickup.trim().length < 3) return "Pickup location is too short.";
    if (delivery.trim().length < 3) return "Delivery location is too short.";
    if (packageDetails.trim().length < 5) return "Package details are too short.";
    if (customerName.trim().length < 2) return "Customer name is too short.";

    // Simple phone regex: only numbers, +, -, ()
    const phoneRegex = /^[0-9+\-() ]{7,15}$/;
    if (!phoneRegex.test(phone)) return "Invalid phone number.";

    // Email regex (basic but safe)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email address.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const jobData = {
      pickup: pickup.trim(),
      delivery: delivery.trim(),
      packageDetails: packageDetails.trim(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to post a job.");
        return;
      }

      const res = await axios.post("/api/jobs", jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setMessage(res.data.message || "Job posted successfully!");
      // Clear form fields
      setPickup("");
      setDelivery("");
      setPackageDetails("");
      setCustomerName("");
      setPhone("");
      setEmail("");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError(err.response?.data?.message || "Failed to post job.");
      }
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="job-form-container">
      <form onSubmit={handleSubmit}>
        <label>
          Pickup Location:
          <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} required />
        </label>

        <label>
          Delivery Location:
          <input type="text" value={delivery} onChange={(e) => setDelivery(e.target.value)} required />
        </label>

        <label>
          Package Details:
          <textarea value={packageDetails} onChange={(e) => setPackageDetails(e.target.value)} required />
        </label>

        <label>
          Customer Name:
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        </label>

        <label>
          Phone Number:
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>

        <label>
          Email Address:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Job"}
        </button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default JobPostingForm;
