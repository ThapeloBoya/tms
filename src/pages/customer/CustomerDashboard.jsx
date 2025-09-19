import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import JobPostingForm from "../../components/JobPostingForm";
import axios from "axios";
import '../../index.css'

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



  useEffect(() => {
    const token = localStorage.getItem("accessToken"); // get token after login

    const fetchJobs = async () => {
      if (!token) {
        setError("No access token found, please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/api/jobs/my-jobs", {
          headers: {
            Authorization: `Bearer ${token}`,  // <-- send token here
          },
          withCredentials: true,  // for cookies if you use refresh tokens
        });
        setJobs(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load your jobs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);




  return (
 <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Customer Dashboard</h1>
          <p>Welcome, {user.username}</p>
        </div>
        <button onClick={logout}>Logout</button>
      </div>

      <h2 className="section-title">Post a New Job</h2>
      <JobPostingForm />

      <h2 className="section-title" style={{ marginTop: 40 }}>
        Your Posted Jobs
      </h2>

      {loading && <p>Loading your jobs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <p>You have not posted any jobs yet.</p>
      )}

      {!loading && !error && jobs.length > 0 && (
<div className="job-list">
  {jobs.map((job) => (
    <div key={job._id} className="job-card">
      <p><strong>Pickup:</strong> {job.pickup}</p>
      <p><strong>Delivery:</strong> {job.delivery}</p>
      <p><strong>Package:</strong> {job.packageDetails}</p>
    </div>
  ))}
</div>
      )}
    </div>
  );
};

export default CustomerDashboard;
