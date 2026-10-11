import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to easily consume AuthContext in any component
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
