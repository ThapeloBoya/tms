import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "../../index.css";


const JobDetails = ({ jobId }) => {
  const { logout } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(res.data);
        setStatus(res.data.status);
        setError("");
      } catch (err) {
        setError("Failed to load job details");
      }
      setLoading(false);
    };
    fetchJob();
  }, [jobId, token]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axios.put(
        `/api/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus(newStatus);
      alert("Status updated!");
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading) return <p>Loading job details...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>No job found</p>;

  return (
    <div className="job-details-container">
      <h2>Job Details</h2>
      <p><strong>Pickup:</strong> {job.pickup}</p>
      <p><strong>Delivery:</strong> {job.delivery}</p>
      <p><strong>Customer:</strong> {job.customer.name}</p>
      <p><strong>Driver:</strong> {job.driver ? job.driver.username : "Not assigned"}</p>
      <p><strong>Truck:</strong> {job.truck ? job.truck.plateNumber : "Not assigned"}</p>
      <p>
        <strong>Status:</strong>{" "}
        <select value={status} onChange={handleStatusChange}>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </p>
      <button onClick={logout}>Logout</button>
      <Link to="/admin">Home</Link>
    </div>
  );
};

export default JobDetails;
