import { useSelector } from 'react-redux';

/**
 * Hook to check if user has specific permission
 * @param {string} resource - Resource name (e.g., 'products', 'clients')
 * @param {string} action - Action type ('view', 'create', 'update', 'delete')
 * @returns {boolean} - Whether user has permission
 */
export const usePermissions = (resource, action) => {
    const { user, permissions } = useSelector((state) => state.auth);

    // Admins have all permissions
    if (user?.isAdmin) {
        return true;
    }

    // Check if user has the specific permission
    const resourcePermissions = permissions[resource];
    if (!resourcePermissions) {
        return false;
    }

    const permissionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}`;
    return resourcePermissions[permissionKey] || false;
};

export default usePermissions;
