import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignUp.module.css'; // Reuse existing styles
import pdeuLogo from '../photos/Pdeu_logo.png';
import pdeuBuild from '../photos/pdpu_build.jpg';
import axios from 'axios';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('resetEmail');
    console.log("Email retrieved from localStorage:", email); // Add this line
    if (!email) {
      setError('Email not found. Please start the forgot password process again.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/verify-otp', { email, otp });
      setMessage(response.data.message);
      setError('');
      //localStorage.removeItem('resetEmail'); // REMOVE THIS LINE
      navigate('/reset-password');
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
        <h2 className={styles.signupText}>Verify OTP</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
              className={styles.inputField}
            />
          </div>
          <button type="submit" className={styles.submitBtn}>Verify OTP</button>
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

export default VerifyOTP;