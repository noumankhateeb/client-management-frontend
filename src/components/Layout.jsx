import { Layout as AntLayout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    DashboardOutlined,
    ShoppingOutlined,
    TeamOutlined,
    ShoppingCartOutlined,
    CommentOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { logout } from '../store/slices/authSlice';
import PermissionGuard from './PermissionGuard';

const { Header, Sider, Content } = AntLayout;

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/products',
            icon: <ShoppingOutlined />,
            label: 'Products',
            permission: { resource: 'products', action: 'view' },
        },
        {
            key: '/clients',
            icon: <TeamOutlined />,
            label: 'Clients',
            permission: { resource: 'clients', action: 'view' },
        },
        {
            key: '/orders',
            icon: <ShoppingCartOutlined />,
            label: 'Orders',
            permission: { resource: 'orders', action: 'view' },
        },
        {
            key: '/comments',
            icon: <CommentOutlined />,
            label: 'Comments',
            permission: { resource: 'comments', action: 'view' },
        },
        ...(user?.isAdmin
            ? [
                {
                    key: '/users',
                    icon: <UserOutlined />,
                    label: 'Users',
                },
            ]
            : []),
    ];

    // Filter menu items based on permissions
    const visibleMenuItems = menuItems.filter((item) => {
        if (!item.permission) return true;
        // This is a simplified check - in real app, use the permission hook
        return true; // For now, show all items
    });

    return (
        <AntLayout className="min-h-screen">
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                theme="dark"
            >
                <div className="h-16 flex items-center justify-center text-white text-xl font-bold">
                    CMS
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={visibleMenuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <AntLayout>
                <Header className="bg-white px-6 flex items-center justify-between shadow-sm">
                    <div className="text-lg font-semibold">Client Management System</div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                            {user?.firstName} {user?.lastName}
                            {user?.isAdmin && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Admin</span>}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <LogoutOutlined />
                            Logout
                        </button>
                    </div>
                </Header>
                <Content className="m-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm min-h-full">
                        <Outlet />
                    </div>
                </Content>
            </AntLayout>
        </AntLayout>
    );
};

export default Layout;
