import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div style={{ padding: 20 }}>
    <h2>404 - Page Not Found</h2>
    <Link to="/">Go to Home</Link>
  </div>
);

export default NotFoundPage;
