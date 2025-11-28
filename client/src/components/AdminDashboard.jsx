//AdminDashboard.jsx
import "./AdminDashboard.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

const defaultStages = [
  { name: "Received at China Warehouse", emoji: "📦", done: false },
  { name: "On the way to Airport", emoji: "🚚", done: false },
  { name: "Departed by Air", emoji: "✈️", done: false },
  { name: "Arrived in BD Airport", emoji: "🛬", done: false },
  { name: "Customs Clearance", emoji: "🛃", done: false },
  { name: "In Delivery Process", emoji: "🏍️", done: false },
  { name: "Delivered", emoji: "🏠", done: false },
];

const AdminDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [newShipment, setNewShipment] = useState({
    trackingNumber: "",
    name: "",
    transport: "Air",
    status: "Received at China Warehouse",
    stages: defaultStages,
  });
  const [statusUpdate, setStatusUpdate] = useState("");

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracking`);
      setShipments(res.data);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    }
  };

  const handleAddShipment = async (e) => {
    e.preventDefault();
    try {
      // ensure stages all done=false
      const shipmentToSend = {
        ...newShipment,
        stages: newShipment.stages.map((s) => ({ ...s, done: false })),
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/tracking`, shipmentToSend, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Shipment added successfully ✅");
      setNewShipment({
        trackingNumber: "",
        name: "",
        transport: "Air",
        status: "Received at China Warehouse",
        stages: defaultStages,
      });
      fetchShipments();
    } catch (error) {
      console.error("Error adding shipment:", error);
    }
  };

  const handleSelectShipment = (id) => {
    if (selectedShipments.includes(id)) {
      setSelectedShipments(selectedShipments.filter((s) => s !== id));
    } else {
      setSelectedShipments([...selectedShipments, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(shipments.map((s) => s._id));
    }
    setSelectAll(!selectAll);
  };
  const handleBulkUpdate = async () => {
    if (selectedShipments.length === 0 || !statusUpdate) {
      alert("Please select shipments and a status 🚨");
      return;
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/tracking/bulk-update`, {
        ids: selectedShipments,
        status: statusUpdate,
      });
      alert("Status updated successfully ✅");
      setSelectedShipments([]);
      setSelectAll(false);
      setStatusUpdate("");
      fetchShipments();
    } catch (error) {
      console.error("Error updating shipments:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>👨🏻‍💻 Admin Dashboard</h1>

      {/* Add Shipment */}
      <section className="card">
        <h2>Add New Shipment</h2>
        <form onSubmit={handleAddShipment}>
          <input
            type="text"
            placeholder="Tracking Number"
            value={newShipment.trackingNumber}
            onChange={(e) =>
              setNewShipment({ ...newShipment, trackingNumber: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Customer Name"
            value={newShipment.name}
            onChange={(e) =>
              setNewShipment({ ...newShipment, name: e.target.value })
            }
            required
          />
          <select
            value={newShipment.transport}
            onChange={(e) =>
              setNewShipment({ ...newShipment, transport: e.target.value })
            }
          >
            <option value="Air">Air</option>
            <option value="Sea">Sea</option>
          </select>
          <select
            value={newShipment.status}
            onChange={(e) =>
              setNewShipment({ ...newShipment, status: e.target.value })
            }
          >
            {defaultStages.map((stage, idx) => (
              <option key={idx} value={stage.name}>
                {stage.name}
              </option>
            ))}
          </select>
          <button type="submit">Add Shipment</button>
        </form>
      </section>

      {/* Update Shipments */}
      <section className="card">
        <h2>Update Shipments</h2>

        <div className="select-all">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label>Select All</label>
        </div>

        <div className="shipment-cards">
          {shipments.map((s) => (
            <div key={s._id} className="shipment-card">
              <input
                type="checkbox"
                checked={selectedShipments.includes(s._id)}
                onChange={() => handleSelectShipment(s._id)}
              />
              <div className="shipment-info">
                <h3>{s.trackingNumber}</h3>
                <p>
                  <strong>Name:</strong> {s.name}
                </p>
                <p>
                  <strong>Transport:</strong> {s.transport}
                </p>
                <p>
                  <strong>Status:</strong> {s.status}
                </p>
                <div className="stages">
                  {s.stages.map((stage, idx) => (
                    <span
                      key={idx}
                      className={`stage ${stage.done ? "done" : ""}`}
                      title={stage.name}
                    >
                      {stage.emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bulk-update">
          <select
            value={statusUpdate}
            onChange={(e) => setStatusUpdate(e.target.value)}
          >
            <option value="">-- Select Status --</option>
            {defaultStages.map((stage, idx) => (
              <option key={idx} value={stage.name}>
                {stage.name}
              </option>
            ))}
          </select>
          <button onClick={handleBulkUpdate}>Update Selected</button>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
