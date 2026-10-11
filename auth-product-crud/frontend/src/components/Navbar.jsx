import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, PlusCircle, User, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/products" className="nav-brand">
          <ShoppingBag size={24} />
          <span>ProductCRUD</span>
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Products
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/products/new"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <PlusCircle size={17} />
                <span>Add Product</span>
              </NavLink>

              <div className="nav-user">
                <Link to="/profile" className="user-badge" title="View Profile">
                  <User size={15} />
                  <span>{user?.name || 'My Profile'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Log out of account"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="nav-user">
              <Link to="/login" className="btn btn-outline btn-sm">
                <LogIn size={15} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
