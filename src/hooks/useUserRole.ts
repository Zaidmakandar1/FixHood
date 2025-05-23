import { useState, useEffect } from 'react';

type Role = 'homeowner' | 'fixer' | null;

const useUserRole = () => {
  const [role, setRole] = useState<Role>(() => {
    // Get initial role from localStorage
    return localStorage.getItem('fixitlocal-role') as Role || null;
  });
  
  const setUserRole = (newRole: Role) => {
    setRole(newRole);
    // Update localStorage only when explicitly setting a new role
    if (newRole) {
      localStorage.setItem('fixitlocal-role', newRole);
    } else {
      localStorage.removeItem('fixitlocal-role');
    }
  };
  
  const clearRole = () => {
    localStorage.removeItem('fixitlocal-role');
    setRole(null);
  };
  
  return { role, setUserRole, clearRole };
};

export default useUserRole;