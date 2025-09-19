import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axiosConfig";
import { Link } from "react-router-dom";

import "../../index.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "../../styles/MarkerCluster.Default.css";




// Fix Leaflet's default icon paths in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Green marker (online)
const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Red marker (offline)
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignments, setAssignments] = useState({});
  const [assigningJobId, setAssigningJobId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // ✅ NEW
  const token = localStorage.getItem("accessToken");
  const [driverLocations, setDriverLocations] = useState([]);

useEffect(() => {
  const fetchDriverLocations = async () => {
    try {
      const res = await axios.get("/api/drivers/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Driver locations:", res.data);
      setDriverLocations(res.data);
    } catch (err) {
      console.error("Failed to fetch driver locations", err);
    }
  };

  fetchDriverLocations();
  const interval = setInterval(fetchDriverLocations, 15000); // Poll every 15s

  return () => clearInterval(interval);
}, [token]);


  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, driversRes, trucksRes] = await Promise.all([
          axios.get("/api/jobs", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/user?role=driver", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/trucks", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setJobs(jobsRes.data);
        setDrivers(driversRes.data);
        setTrucks(trucksRes.data);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err.response || err);
        setError("Failed to load data");
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const handleSelectChange = (jobId, type, value) => {
    setAssignments((prev) => ({
      ...prev,
      [jobId]: { ...prev[jobId], [type]: value },
    }));
  };

  const handleAssign = async (jobId) => {
    const assignment = assignments[jobId];
    if (!assignment?.driver || !assignment?.truck) {
      alert("Select driver and truck first");
      return;
    }
    setAssigningJobId(jobId);
    try {
      await axios.put(
        `/api/jobs/${jobId}/assign`,
        { driver: assignment.driver, truck: assignment.truck },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId
            ? {
                ...job,
                driver: drivers.find((d) => d._id === assignment.driver),
                truck: trucks.find((t) => t._id === assignment.truck),
              }
            : job
        )
      );
      alert("Assigned successfully!");
      setAssignments((prev) => {
        const copy = { ...prev };
        delete copy[jobId];
        return copy;
      });
    } catch (err) {
      console.error(err.response || err);
      alert("Failed to assign");
    }
    setAssigningJobId(null);
  };

  // ✅ Filter jobs before rendering
  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === "all") return true;
    return job.status === statusFilter;
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div>
          <p>Welcome, {user.username}</p>
        </div>
        <button onClick={logout}>Logout</button>
      </div>

      {/* ✅ Filter dropdown */}
      <div style={{ marginBottom: "20px" }}>
        <label>Status Filter: </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">New</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* JOB TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pickup</th>
              <th>Delivery</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Driver</th>
              <th>Truck</th>
              <th>Assign</th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => {
              const assigned = assignments[job._id] || {};
              const selectedDriver = assigned.driver || job.driver?._id || "";
              const selectedTruck = assigned.truck || job.truck?._id || "";

              return (
                <tr key={job._id}>
                  <td>{job.pickup}</td>
                  <td>{job.delivery}</td>
                  <td>{job.customer?.name || "N/A"}</td>
                  <td>{job.phone || job.customer?.phone || "N/A"}</td>
                  <td>{job.email || job.customer?.email || "N/A"}</td>
                  <td>{job.driver ? job.driver.username : "N/A"}</td>
                  <td>{job.truck ? job.truck.plateNumber : "N/A"}</td>
                  <td>
                    <select
                      value={selectedDriver}
                      onChange={(e) =>
                        handleSelectChange(job._id, "driver", e.target.value)
                      }
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.username}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedTruck}
                      onChange={(e) =>
                        handleSelectChange(job._id, "truck", e.target.value)
                      }
                      style={{ marginLeft: "10px" }}
                    >
                      <option value="">Select Truck</option>
                      {trucks.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.plateNumber}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(job._id)}
                      disabled={
                        !selectedDriver || !selectedTruck || assigningJobId === job._id
                      }
                      style={{ marginLeft: "10px" }}
                    >
                      {assigningJobId === job._id ? "Assigning..." : "Assign"}
                    </button>
                  </td>
                  <td>
                    <Link to={`/jobs/${job._id}`}>Details</Link>
                  </td>
                  <td>{job.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
       <h2>Driver Locations</h2>

  <MapContainer center={[0, 0]} zoom={2} style={{ height: "500px", width: "100%" }}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <MarkerClusterGroup>
      {driverLocations
        .filter(
          (driver) =>
            typeof driver.latitude === "number" &&
            !isNaN(driver.latitude) &&
            typeof driver.longitude === "number" &&
            !isNaN(driver.longitude)
        )
        .map((driver) => {
          const lastUpdate = driver.lastLocationUpdate
            ? new Date(driver.lastLocationUpdate)
            : null;
          const now = new Date();
          const isOnline = lastUpdate && (now - lastUpdate) < 10 * 60 * 1000;

          return (
            <Marker key={driver._id} position={[driver.latitude, driver.longitude]}>
              <Popup>
                <strong>{driver.username}</strong>
                <br />
                Lat: {driver.latitude?.toFixed(5)}
                <br />
                Lng: {driver.longitude?.toFixed(5)}
                <br />
                Last seen: {lastUpdate ? lastUpdate.toLocaleString() : "Unknown"}
                <br />
                Status: <span style={{ color: isOnline ? "green" : "red" }}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </Popup>
            </Marker>
          );
        })}
    </MarkerClusterGroup>
  </MapContainer>


      </div>
    </div>
  );
};

export default AdminDashboard;
