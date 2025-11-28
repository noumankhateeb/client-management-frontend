import { usePermissions } from '../hooks/usePermissions';

/**
 * Component that conditionally renders children based on permissions
 */
const PermissionGuard = ({ resource, action, children, fallback = null }) => {
    const hasPermission = usePermissions(resource, action);

    if (!hasPermission) {
        return fallback;
    }

    return children;
};

export default PermissionGuard;
