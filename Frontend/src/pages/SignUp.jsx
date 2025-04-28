// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import './SignUp.css'; 
// import pdeuLogo from '../photos/Pdeu_logo.jpeg'; // Import the logo
// import pdeuBuild from '../photos/pdpu_build.jpg';
// import axios from 'axios';

// const SignUp = ({ onLogin }) => {
//   const [isSignUp, setIsSignUp] = useState(true); // Toggle between Sign-Up and Login
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     role: 'CDC Cell'
//   });
//   const [error, setError] = useState('');
  
//   const navigate = useNavigate(); // Initialize useNavigate

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevState => ({
//       ...prevState,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if(isSignUp){
//     try {
//       const response = await axios.post('http://localhost:3000/',{
//         email:formData.email,
//         password:formData.password
//       });
//       if (response.status === 200) {
//         alert('Registration successful!');
//       } else {
//         throw new Error(response.data.message || 'Something went wrong');
//       }
//     } catch (error) {
//       alert(error.message);
//     }

//     }else{
//       const data = await axios.post('http://localhost:3000/login',{
//         email:formData.email,
//         password:formData.password
//       });
    
//     if (data.status === 400 || !data) {
//       window.alert('Invalid credentials');
//     } else {
//       if (data.data.token!=null&&data.data.token!=undefined){
//         localStorage.setItem('token', data.data.token);
//       }
//       onLogin()
//       navigate('/');
//     }
    
//     }
//   };
  

//   const toggleForm = () => {
//     setIsSignUp(!isSignUp); // Toggle between login and sign-up
//     setError('');
//   };

//   return (
//     <div className="signup-container">
//       <div className="form-section">
//         <img src={pdeuLogo} alt="PDEU Logo" className="pdeu-logo" />
//         <h2>{isSignUp ? 'SIGN-UP' : 'LOGIN'}</h2>
//         <form onSubmit={handleSubmit}>
//           {isSignUp && (
//             <div className="form-group">
//               <label>Name:</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Enter Your Name"
//                 required
//               />
//             </div>
//           )}
//           <div className="form-group">
//             <label>Email ID:</label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Enter College Id"
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>Password:</label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Enter Password"
//               required
//             />
//             <a href="#" className="forgot-password">Forgot Password?</a>
//           </div>
//           {isSignUp && (
//             <div className="form-group">
//               <label>Role:</label>
//               <div className="role-options">
//                 <label>
//                   <input
//                     type="radio"
//                     name="role"
//                     value="CDC Cell"
//                     checked={formData.role === 'CDC Cell'}
//                     onChange={handleChange}
//                   />
//                   CDC Cell
//                 </label>
//                 <label>
//                   <input
//                     type="radio"
//                     name="role"
//                     value="Student"
//                     checked={formData.role === 'Student'}
//                     onChange={handleChange}
//                   />
//                   Student
//                 </label>
//               </div>
//             </div>
//           )}
//           <button type="submit" className="submit-btn">
//             {isSignUp ? 'SUBMIT' : 'LOGIN'}
//           </button>
//           {error && <p className="error">{error}</p>}
//         </form>
//         <p>
//           {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
//           <button onClick={toggleForm} className="toggle-btn">
//             {isSignUp ? 'Login' : 'Sign Up'}
//           </button>
//         </p>
//       </div>
//       <div className="image-section">
//         <img src={pdeuBuild} alt="PDEU Building" className="pdeu-building" />
//       </div>
//     </div>
//   );
// };

// export default SignUp;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './SignUp.module.css';
import pdeuLogo from '../photos/Pdeu_logo.png';
import pdeuBuild from '../photos/pdpu_build.jpg';
import axios from 'axios';

const SignUp = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CDC Cell'
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isSignUp ? 'http://localhost:3000/' : 'http://localhost:3000/login';
      const response = await axios.post(url, formData);

      if (response.status === 200) {
        alert(isSignUp ? 'Registration successful!' : 'Login successful!');
        if (!isSignUp) {
          localStorage.setItem('token', response.data.token);
          onLogin();
          navigate('/');
        }
      } else {
        throw new Error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={styles.signupContainer}>
      {/* Left Section */}
      <div className={styles.formSection}>
        <div className={styles.logoContainer}>
          <img src={pdeuLogo} alt="PDEU Logo" className={styles.pdeuLogo} />
        </div>
        <h2 className={styles.signupText}>{isSignUp ? 'SIGN-UP' : 'LOGIN'}</h2>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className={styles.formGroup}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Your Name" required className={styles.inputField} />
            </div>
          )}
          <div className={styles.formGroup}>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter Email ID" required className={styles.inputField} />
          </div>
          <div className={styles.formGroup}>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter Password" required className={styles.inputField} />
            {!isSignUp && (
              <Link to="/forgot-password" className={styles.forgotPassword}>Forgot Password?</Link>
            )}
          </div>
          {isSignUp && (
            <div className={styles.roleOptions}>
              <label>
                <input type="radio" name="role" value="CDC Cell" checked={formData.role === 'CDC Cell'} onChange={handleChange} />
                CDC Cell
              </label>
              <label>
                <input type="radio" name="role" value="Student" checked={formData.role === 'Student'} onChange={handleChange} />
                Student
              </label>
            </div>
          )}
          <button type="submit" className={styles.submitBtn}>{isSignUp ? 'SIGN UP' : 'LOGIN'}</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>

        <p className={styles.toggleText}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className={styles.toggleBtn}>
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>

      {/* Right Section */}
      <div className={styles.imageSection}>
        <div className={styles.imageOverlay}></div>
        <img src={pdeuBuild} alt="PDEU Building" className={styles.pdeuBuilding} />
      </div>
    </div>
  );
};

export default SignUp;
