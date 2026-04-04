import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/RegisterPage';
import Login from './pages/LoginPage';

// Placeholder components for missing pages
const Home = () => <h1>Home Page</h1>;
// const Login = () => <h1>Login Page</h1>;
const Motos = () => <h1>Motos Page</h1>;
const Moto = () => <h1>Moto Details Page</h1>;

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/motos" element={<Motos />} />
        <Route path="/moto/:id" element={<Moto />} />
      </Routes>
    </Router>
    //     {/* <div className = "head">
    //         <div className = "storeName">
    //      <span>moto</span>
    // <span>Country</span>
    //       </div>
    //       <div className = "motoClassification">

    //       </div>
    //   </div> */}


  )
}

export default App
