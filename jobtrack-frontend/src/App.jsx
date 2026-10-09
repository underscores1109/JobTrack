import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const AUTH_API = "http://localhost:8080/api/auth/login";
const USER_API = "http://localhost:8080/api/users";
const APPLICATION_API = "http://localhost:8080/api/applications";

function App() {
  // Authentication state
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );
  const [isLogin, setIsLogin] = useState(true);

  // Login and registration fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Job application fields
  const [applications, setApplications] = useState([]);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [appliedDate, setAppliedDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  // UI state
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Authenticated API request configuration
  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Load only the logged-in user's applications
  const loadApplications = useCallback(async () => {
    if (!token) {
      setApplications([]);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        APPLICATION_API,
        authConfig
      );

      setApplications(response.data);
      setMessage("");
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        setMessage("Your session expired. Please log in again.");
      } else {
        setMessage("Could not load applications. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadApplications();
    }
  }, [token, loadApplications]);

  // Login or register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isLogin) {
        const response = await axios.post(AUTH_API, {
          email,
          password,
        });

        const receivedToken = response.data.token;

        if (!receivedToken) {
          setMessage("Login response did not contain a token.");
          return;
        }

        localStorage.setItem("token", receivedToken);
        setToken(receivedToken);
        setPassword("");
        setMessage("");
      } else {
        await axios.post(USER_API, {
          name,
          email,
          password,
        });

        setIsLogin(true);
        setName("");
        setPassword("");
        setMessage("Registration successful! Please log in.");
      }
    } catch (error) {
      const data = error.response?.data;

      setMessage(
        typeof data === "string"
          ? data
          : data?.message || "Request failed. Please check your details."
      );
    }
  };

  // Logout and return to login form immediately
  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setApplications([]);
    setCompany("");
    setPosition("");
    setStatus("APPLIED");
    setAppliedDate("");
    setEditingId(null);
    setSearchTerm("");
    setStatusFilter("ALL");
    setPassword("");
    setMessage("You have been logged out.");
    setIsLogin(true);
  }

  // Reset add/edit form
  const resetForm = () => {
    setCompany("");
    setPosition("");
    setStatus("APPLIED");
    setAppliedDate("");
    setEditingId(null);
  };

  // Add or update an application
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const application = {
      company,
      position,
      status,
      appliedDate: appliedDate || null,
    };

    try {
      if (editingId !== null) {
        await axios.put(
          `${APPLICATION_API}/${editingId}`,
          application,
          authConfig
        );

        setMessage("Application updated successfully.");
      } else {
        await axios.post(
          APPLICATION_API,
          application,
          authConfig
        );

        setMessage("Application added successfully.");
      }

      resetForm();
      await loadApplications();
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        setMessage("Your session expired. Please log in again.");
      } else {
        setMessage(
          error.response?.data?.message ||
            "Could not save application. Please try again."
        );
      }
    }
  };

  // Load an application into the edit form
  const handleEdit = (application) => {
    setEditingId(application.id);
    setCompany(application.company || "");
    setPosition(application.position || "");
    setStatus(application.status || "APPLIED");
    setAppliedDate(application.appliedDate || "");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete an application
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) {
      return;
    }

    setMessage("");

    try {
      await axios.delete(
        `${APPLICATION_API}/${id}`,
        authConfig
      );

      setMessage("Application deleted successfully.");
      await loadApplications();
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
        setMessage("Your session expired. Please log in again.");
      } else {
        setMessage("Could not delete application.");
      }
    }
  };

  // Search and status filtering
  const filteredApplications = applications.filter((application) => {
    const companyName = (application.company || "").toLowerCase();
    const jobPosition = (application.position || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      companyName.includes(search) ||
      jobPosition.includes(search);

    const matchesStatus =
      statusFilter === "ALL" ||
      application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Dashboard statistics
  const counts = {
    total: applications.length,
    applied: applications.filter(
      (a) => a.status === "APPLIED"
    ).length,
    interview: applications.filter(
      (a) => a.status === "INTERVIEW"
    ).length,
    offer: applications.filter(
      (a) => a.status === "OFFER"
    ).length,
  };

  // LOGIN AND REGISTRATION PAGE
  if (!token) {
    return (
      <div className="page">
        <div className="auth-card">
          <div className="logo">JT</div>

          <h1>JobTrack</h1>

          <p className="subtitle">
            Keep your career moving forward.
          </p>

          <div className="tabs">
            <button
              type="button"
              className={isLogin ? "active" : "inactive"}
              onClick={() => {
                setIsLogin(true);
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={!isLogin ? "active" : "inactive"}
              onClick={() => {
                setIsLogin(false);
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <label>
                Full name
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="submit">
              {isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          {message && (
            <div className="message" role="status">
              {message}
            </div>
          )}

          <p className="footer">
            Manage applications. Track opportunities. Get hired.
          </p>
        </div>
      </div>
    );
  }

  // JOB APPLICATION DASHBOARD
  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">JT</span>
          <span>JobTrack</span>
        </div>

        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="main-content">
        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR CAREER WORKSPACE</p>
            <h1>Application dashboard</h1>
            <p className="subtitle">
              Keep every opportunity organized in one place.
            </p>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total applications</span>
            <strong>{counts.total}</strong>
          </div>

          <div className="stat-card">
            <span>Applied</span>
            <strong>{counts.applied}</strong>
          </div>

          <div className="stat-card">
            <span>Interviews</span>
            <strong>{counts.interview}</strong>
          </div>

          <div className="stat-card">
            <span>Offers</span>
            <strong>{counts.offer}</strong>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel form-panel">
            <h2>
              {editingId !== null
                ? "Edit application"
                : "Add application"}
            </h2>

            <p className="panel-description">
              Record a new job opportunity.
            </p>

            <form onSubmit={handleApplicationSubmit}>
              <label>
                Company
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Microsoft"
                  required
                />
              </label>

              <label>
                Job position
                <input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Java Developer"
                  required
                />
              </label>

              <label>
                Application status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="APPLIED">Applied</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </label>

              <label>
                Application date
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                />
              </label>

              <button type="submit">
                {editingId !== null
                  ? "Save changes"
                  : "Add application"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="secondary"
                  onClick={resetForm}
                >
                  Cancel editing
                </button>
              )}
            </form>
          </div>

          <div className="panel applications-panel">
            <div className="list-heading">
              <div>
                <h2>Your applications</h2>
                <p className="panel-description">
                  All your tracked opportunities.
                </p>
              </div>

              <button
                className="refresh"
                onClick={loadApplications}
              >
                Refresh
              </button>
            </div>

            <div className="filters">
              <input
                type="text"
                placeholder="Search company or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {message && (
              <div className="message" role="status">
                {message}
              </div>
            )}

            {loading ? (
              <p>Loading applications...</p>
            ) : filteredApplications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">＋</div>
                <h3>
                  {applications.length === 0
                    ? "No applications yet"
                    : "No matching applications"}
                </h3>
                <p>
                  {applications.length === 0
                    ? "Add your first job application using the form."
                    : "Try a different search term or status filter."}
                </p>
              </div>
            ) : (
              <div className="application-list">
                {filteredApplications.map((application) => (
                  <article
                    className="application-card"
                    key={application.id}
                  >
                    <div className="application-info">
                      <h3>{application.company}</h3>
                      <p>{application.position}</p>

                      <span className="date">
                        Applied:{" "}
                        {application.appliedDate || "Not specified"}
                      </span>
                    </div>

                    <div className="application-actions">
                      <span
                        className={`status status-${(
                          application.status || "APPLIED"
                        ).toLowerCase()}`}
                      >
                        {application.status}
                      </span>

                      <div className="action-buttons">
                        <button
                          className="edit"
                          onClick={() => handleEdit(application)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete"
                          onClick={() =>
                            handleDelete(application.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;