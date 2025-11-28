import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { fetchClients, createClient, updateClient, deleteClient } from '../store/slices/clientsSlice';
import PermissionGuard from '../components/PermissionGuard';

const { Title } = Typography;

const Clients = () => {
    const dispatch = useDispatch();
    const { items: clients, loading } = useSelector((state) => state.clients);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    const handleAdd = () => {
        setEditingClient(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        form.setFieldsValue(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteClient(id)).unwrap();
            message.success('Client deleted successfully');
        } catch (error) {
            message.error(error || 'Failed to delete client');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingClient) {
                await dispatch(updateClient({ id: editingClient.id, data: values })).unwrap();
                message.success('Client updated successfully');
            } else {
                await dispatch(createClient(values)).unwrap();
                message.success('Client created successfully');
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error(error || 'Operation failed');
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
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <PermissionGuard resource="clients" action="update">
                        <Tooltip title="Edit client">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleEdit(record)}
                            />
                        </Tooltip>
                    </PermissionGuard>

                    <PermissionGuard resource="clients" action="delete">
                        <Tooltip title="Delete client">
                            <Popconfirm
                                title="Delete Client"
                                description="Are you sure you want to delete this client?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button danger icon={<DeleteOutlined />} size="small" />
                            </Popconfirm>
                        </Tooltip>
                    </PermissionGuard>

                    <PermissionGuard resource="orders" action="create">
                        <Tooltip title="Place order for this client">
                            <Button
                                type="dashed"
                                icon={<ShoppingCartOutlined />}
                                size="small"
                                disabled
                            />
                        </Tooltip>
                    </PermissionGuard>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <Title level={2}>Clients Management</Title>
                <PermissionGuard resource="clients" action="create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Client
                    </Button>
                </PermissionGuard>
            </div>

            <Table
                columns={columns}
                dataSource={clients}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingClient ? 'Edit Client' : 'Add New Client'}
                open={isModalOpen}
                onOk={form.submit}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
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
                        <Input type="email" placeholder="Enter email" />
                    </Form.Item>

                    <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[{ required: false }]}
                    >
                        <Input placeholder="Enter phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: false }]}
                    >
                        <Input placeholder="Enter address" />
                    </Form.Item>

                    <Form.Item
                        label="City"
                        name="city"
                        rules={[{ required: false }]}
                    >
                        <Input placeholder="Enter city" />
                    </Form.Item>

                    <Form.Item
                        label="Country"
                        name="country"
                        rules={[{ required: false }]}
                    >
                        <Input placeholder="Enter country" />
                    </Form.Item>

                    <Form.Item
                        label="Notes"
                        name="notes"
                        rules={[{ required: false }]}
                    >
                        <Input.TextArea placeholder="Enter notes" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Clients;
