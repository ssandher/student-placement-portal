import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignUp.module.css'; // Reuse the existing styles
import pdeuLogo from '../photos/Pdeu_logo.png';
import pdeuBuild from '../photos/pdpu_build.jpg';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/forgot-password', { email });
      setMessage(response.data.message);
      setError('');
      // Store email in local storage for the next component
      localStorage.setItem('resetEmail', email);
      console.log("Email stored in localStorage:", email); 
      navigate('/verify-otp');
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
        <h2 className={styles.signupText}>Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email ID"
              required
              className={styles.inputField}
            />
          </div>
          <button type="submit" className={styles.submitBtn}>Send OTP</button>
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

export default ForgotPassword;