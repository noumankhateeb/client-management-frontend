import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table, Button, Modal, Form, Input, message, Popconfirm, Space, Typography, Card, Row, Col,
    Switch, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { fetchUsers, createUser, updateUser, deleteUser, fetchUserPermissions, updatePermissions } from '../store/slices/usersSlice';

const { Title } = Typography;

const resources = ['products', 'clients', 'orders', 'comments', 'users'];
const actions = ['canView', 'canCreate', 'canUpdate', 'canDelete'];

const Users = () => {
    const dispatch = useDispatch();
    const { items: users, loading } = useSelector((state) => state.users);
    
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [permissionsState, setPermissionsState] = useState({});
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleAddUser = () => {
        setEditingUser(null);
        form.resetFields();
        setIsUserModalOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = async (id) => {
        try {
            await dispatch(deleteUser(id)).unwrap();
            message.success('User deleted successfully');
        } catch (error) {
            message.error(error || 'Failed to delete user');
        }
    };

    const handleSubmitUser = async (values) => {
        try {
            if (editingUser) {
                await dispatch(updateUser({ id: editingUser.id, data: values })).unwrap();
                message.success('User updated successfully');
            } else {
                await dispatch(createUser(values)).unwrap();
                message.success('User created successfully');
            }
            setIsUserModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error(error || 'Operation failed');
        }
    };

    const handleManagePermissions = async (user) => {
        setSelectedUser(user);
        setIsPermModalOpen(true);
        try {
            const result = await dispatch(fetchUserPermissions(user.id)).unwrap();
            // Initialize permissions state from fetched data
            const permsMap = {};
            result.forEach(perm => {
                permsMap[perm.resource] = {
                    canView: perm.canView,
                    canCreate: perm.canCreate,
                    canUpdate: perm.canUpdate,
                    canDelete: perm.canDelete,
                };
            });
            setPermissionsState(permsMap);
        } catch (err) {
            message.error(err.message || 'Failed to fetch permissions');
        }
    };

    const handlePermissionToggle = (resource, action) => {
        setPermissionsState(prev => ({
            ...prev,
            [resource]: {
                ...prev[resource],
                [action]: !prev[resource]?.[action],
            },
        }));
    };

    const handleSavePermissions = async () => {
        try {
            const permissionsArray = resources.map(resource => ({
                resource,
                canView: permissionsState[resource]?.canView || false,
                canCreate: permissionsState[resource]?.canCreate || false,
                canUpdate: permissionsState[resource]?.canUpdate || false,
                canDelete: permissionsState[resource]?.canDelete || false,
            }));

            await dispatch(updatePermissions({ userId: selectedUser.id, permissions: permissionsArray })).unwrap();
            message.success('Permissions updated successfully');
            setIsPermModalOpen(false);
        } catch (error) {
            message.error(error || 'Failed to update permissions');
        }
    };

    const columns = [
        {
            title: 'Name',
            key: 'name',
            render: (_, record) => `${record.firstName} ${record.lastName}`,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            key: 'role',
            render: (_, record) => record.isAdmin ? <Tag color="red">Admin</Tag> : <Tag color="blue">User</Tag>,
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                record.isActive ? <Tag color="success">Active</Tag> : <Tag color="error">Inactive</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 250,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditUser(record)}
                    >
                        Edit
                    </Button>

                    {!record.isAdmin && (
                        <Button
                            type="default"
                            icon={<LockOutlined />}
                            size="small"
                            onClick={() => handleManagePermissions(record)}
                        >
                            Permissions
                        </Button>
                    )}

                    <Popconfirm
                        title="Delete User"
                        description="Are you sure you want to delete this user?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <Title level={2}>Users Management</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                    Add User
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            {/* Create/Edit User Modal */}
            <Modal
                title={editingUser ? 'Edit User' : 'Add New User'}
                open={isUserModalOpen}
                onOk={form.submit}
                onCancel={() => {
                    setIsUserModalOpen(false);
                    form.resetFields();
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitUser}
                >
                    <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={[{ required: true, message: 'First name is required' }]}
                    >
                        <Input placeholder="Enter first name" />
                    </Form.Item>

                    <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[{ required: true, message: 'Last name is required' }]}
                    >
                        <Input placeholder="Enter last name" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Email is required' },
                            { type: 'email', message: 'Please enter valid email' },
                        ]}
                    >
                        <Input type="email" placeholder="Enter email" disabled={!!editingUser} />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: 'Password is required' },
                                { min: 6, message: 'Password must be at least 6 characters' },
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}

                    <Form.Item
                        label="Is Active"
                        name="isActive"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Permissions Management Modal */}
            <Modal
                title={`Manage Permissions: ${selectedUser?.firstName} ${selectedUser?.lastName}`}
                open={isPermModalOpen}
                onOk={handleSavePermissions}
                onCancel={() => setIsPermModalOpen(false)}
                width={900}
                okText="Save Permissions"
            >
                <div className="space-y-4">
                    <Card>
                        <p className="text-sm text-gray-500 mb-4">
                            Configure granular permissions for each resource. Check the boxes to allow specific actions.
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left font-semibold">Resource</th>
                                        <th className="border border-gray-300 p-2 text-center font-semibold">View</th>
                                        <th className="border border-gray-300 p-2 text-center font-semibold">Create</th>
                                        <th className="border border-gray-300 p-2 text-center font-semibold">Update</th>
                                        <th className="border border-gray-300 p-2 text-center font-semibold">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resources.map(resource => (
                                        <tr key={resource} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 p-2 font-medium capitalize">{resource}</td>
                                            {actions.map(action => (
                                                <td key={action} className="border border-gray-300 p-2 text-center">
                                                    <Switch
                                                        checked={permissionsState[resource]?.[action] || false}
                                                        onChange={() => handlePermissionToggle(resource, action)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card type="inner" title="Quick Actions">
                        <Space>
                            <Button
                                size="small"
                                onClick={() => {
                                    const newPerms = {};
                                    resources.forEach(r => {
                                        newPerms[r] = {
                                            canView: true,
                                            canCreate: true,
                                            canUpdate: true,
                                            canDelete: true,
                                        };
                                    });
                                    setPermissionsState(newPerms);
                                }}
                            >
                                Grant All
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    const newPerms = {};
                                    resources.forEach(r => {
                                        newPerms[r] = {
                                            canView: true,
                                            canCreate: false,
                                            canUpdate: false,
                                            canDelete: false,
                                        };
                                    });
                                    setPermissionsState(newPerms);
                                }}
                            >
                                View Only
                            </Button>
                            <Button
                                size="small"
                                onClick={() => setPermissionsState({})}
                            >
                                Clear All
                            </Button>
                        </Space>
                    </Card>
                </div>
            </Modal>
        </div>
    );
};

export default Users;
