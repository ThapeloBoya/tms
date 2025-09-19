import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import { useAuth } from "../../context/AuthContext";
import '../../index.css'

// Leaflet map components
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [driverLocation, setDriverLocation] = useState(null); // ⬅️ NEW: Track local driver location
  const token = localStorage.getItem("accessToken");

  // Fetch assigned jobs
  useEffect(() => {
    const fetchAssignedJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/jobs/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load assigned deliveries.");
      }
      setLoading(false);
    };

    fetchAssignedJobs();
  }, [token]);

  // Geolocation tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

const success = async (position) => {
  const { latitude, longitude } = position.coords;

  // Update map position state
  setDriverLocation([latitude, longitude]);

  try {
    await axios.post(
      "/api/drivers/location",
      { latitude, longitude },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Location sent successfully");
  } catch (err) {
    console.error("Failed to send location:", err.response?.data || err.message || err);

  }
};


    const error = (err) => {
      console.warn(`Geolocation error (${err.code}): ${err.message}`);
    };

    const watcherId = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000,
    });

    return () => navigator.geolocation.clearWatch(watcherId);
  }, [token]);

  const updateStatus = async (jobId, newStatus) => {
    try {
      await axios.put(
        `/api/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const filteredJobs = jobs.filter(
    (job) => filter === "all" || job.status === filter
  );

  return (
    <div className="driver-dashboard">
      <h1>Driver Dashboard</h1>
      <p>Welcome, {user?.username || "Driver"}</p>
      <button onClick={logout}>Logout</button>

      {/* Filter */}
      <div style={{ margin: "15px 0" }}>
        <label>Filter Jobs: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In-Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Job Table */}
      {loading ? (
        <p>Loading deliveries...</p>
      ) : error ? (
        <p>{error}</p>
      ) : filteredJobs.length === 0 ? (
        <p>No assigned deliveries.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Pickup</th>
              <th>Delivery</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Truck</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job._id}>
                <td>{job.pickup}</td>
                <td>{job.delivery}</td>
                <td>{job.customer?.name || "N/A"}</td>
                <td>{job.phone || job.customer?.phone || "N/A"}</td>
                <td>{job.email || job.customer?.email || "N/A"}</td>
                <td>{job.truck?.plateNumber || "N/A"}</td>
                <td>{job.status}</td>
                <td>
                  {job.status === "pending" && (
                    <button onClick={() => updateStatus(job._id, "in-progress")}>
                      Start Delivery
                    </button>
                  )}
                  {job.status === "in-progress" && (
                    <button onClick={() => updateStatus(job._id, "completed")}>
                      Mark Delivered
                    </button>
                  )}
                  {job.status === "completed" && <span>Delivered</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Driver Location Map */}
      <h2 style={{ marginTop: "30px" }}>Your Current Location</h2>
      {driverLocation ? (
        <MapContainer
          center={driverLocation}
          zoom={15}
          style={{ height: "300px", width: "100%", marginTop: "10px" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={driverLocation}>
            <Popup>You are here</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p>Getting your location...</p>
      )}
    </div>
  );
};

export default DriverDashboard;
