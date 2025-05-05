import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignUp.module.css'; // Reuse existing styles
import pdeuLogo from '../photos/Pdeu_logo.png';
import pdeuBuild from '../photos/pdpu_build.jpg';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setMessage('');
      return;
    }

    const email = localStorage.getItem('resetEmail'); // Or retrieve it from where you stored it
    console.log("Email retrieved from localStorage:", email); // Add this line
    if (!email) {
      setError('Email not found. Please start the forgot password process again.');
      setMessage('');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/reset-password', { email, password });
      setMessage(response.data.message);
      setError('');
      navigate('/auth'); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
      setMessage('');
    }
  };

  return (
    <div className={styles.signupContainer}>
      {/* Left Section */}
      <div className={styles.formSection}>
        <div className={styles.logoContainer}>
          <img src={pdeuLogo} alt="PDEU Logo" className={styles.pdeuLogo} />
        </div>
        <h2 className={styles.signupText}>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter New Password"
              required
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              className={styles.inputField}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={password !== confirmPassword}>Reset Password</button>
          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.message}>{message}</p>}
        </form>
      </div>

      {/* Right Section */}
      <div className={styles.imageSection}>
        <div className={styles.imageOverlay}></div>
        <img src={pdeuBuild} alt="PDEU Building" className={styles.pdeuBuilding} />
      </div>
    </div>
  );
};

export default ResetPassword;