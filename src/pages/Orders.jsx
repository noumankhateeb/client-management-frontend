import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Space, Typography,
    Tabs, Tag, Card, Row, Col, Divider
} from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { fetchOrders, createOrder, deleteOrder } from '../store/slices/ordersSlice';
import { fetchClients } from '../store/slices/clientsSlice';
import { fetchProducts } from '../store/slices/productsSlice';
import PermissionGuard from '../components/PermissionGuard';

const { Title } = Typography;

const paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Debit Card', value: 'debit_card' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
];

const orderStatuses = [
    { label: 'Pending', value: 'pending', color: 'warning' },
    { label: 'Processing', value: 'processing', color: 'processing' },
    { label: 'Completed', value: 'completed', color: 'success' },
    { label: 'Cancelled', value: 'cancelled', color: 'error' },
];

const Orders = () => {
    const dispatch = useDispatch();
    const { items: orders, loading } = useSelector((state) => state.orders);
    const { items: clients } = useSelector((state) => state.clients);
    const { items: products } = useSelector((state) => state.products);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchOrders());
        dispatch(fetchClients());
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleAdd = () => {
        setOrderItems([]);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteOrder(id)).unwrap();
            message.success('Order deleted successfully');
        } catch (error) {
            message.error(error || 'Failed to delete order');
        }
    };

    const addOrderItem = () => {
        const defaultProduct = products && products.length > 0 ? products[0] : null;
        setOrderItems([
            ...orderItems,
            {
                productId: defaultProduct ? defaultProduct.id : undefined,
                quantity: 1,
                unitPrice: defaultProduct ? defaultProduct.price : 0,
            },
        ]);
    };

    const removeOrderItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const updateOrderItem = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setOrderItems(newItems);
    };

    const calculateItemTotal = (item) => {
        return item.quantity * item.unitPrice;
    };

    const calculateTotalAmount = () => {
        return orderItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    const handleSubmit = async (values) => {
        if (orderItems.length === 0) {
            message.error('Please add at least one product to the order');
            return;
        }

        // Validate each order item before submit
        for (const item of orderItems) {
            if (!item.productId) {
                message.error('Please select a product for all items');
                return;
            }
            if (!item.quantity || item.quantity < 1) {
                message.error('Quantity must be at least 1 for all items');
                return;
            }
            if (item.unitPrice === undefined || item.unitPrice === null || Number(item.unitPrice) < 0) {
                message.error('Unit price must be positive for all items');
                return;
            }
        }

        const amount1 = parseFloat(values.paymentAmount1) || 0;
        const amount2 = parseFloat(values.paymentAmount2) || 0;
        const totalAmount = calculateTotalAmount();

        if (Math.abs((amount1 + amount2) - totalAmount) > 0.01) {
            message.error('Payment amounts must equal total amount');
            return;
        }

        try {
            const orderData = {
                clientId: values.clientId,
                items: orderItems,
                totalAmount: totalAmount,
                paymentMethod1: values.paymentMethod1,
                paymentAmount1: values.paymentAmount1,
                paymentMethod2: values.paymentMethod2 || null,
                paymentAmount2: values.paymentAmount2 || 0,
                notes: values.notes,
            };

            await dispatch(createOrder(orderData)).unwrap();
            message.success('Order created successfully');
            setIsModalOpen(false);
            form.resetFields();
            setOrderItems([]);
        } catch (error) {
            message.error(error || 'Failed to create order');
        }
    };

    const getStatusTag = (status) => {
        const statusConfig = orderStatuses.find(s => s.value === status);
        return statusConfig ? <Tag color={statusConfig.color}>{statusConfig.label}</Tag> : status;
    };

    const columns = [
        {
            title: 'Order #',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
        },
        {
            title: 'Client',
            key: 'client',
            render: (_, record) => record.client ? `${record.client.firstName} ${record.client.lastName}` : '-',
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
        },
        {
            title: 'Payment Methods',
            key: 'payment',
            render: (_, record) => (
                <div className="text-sm">
                    <div>{record.paymentMethod1}: ${parseFloat(record.paymentAmount1).toFixed(2)}</div>
                    {record.paymentMethod2 && (
                        <div>{record.paymentMethod2}: ${parseFloat(record.paymentAmount2).toFixed(2)}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="default"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewDetails(record)}
                    >
                        View
                    </Button>

                    <PermissionGuard resource="orders" action="delete">
                        <Popconfirm
                            title="Delete Order"
                            description="Are you sure you want to delete this order?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                    </PermissionGuard>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <Title level={2}>Orders Management</Title>
                <PermissionGuard resource="orders" action="create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Create Order
                    </Button>
                </PermissionGuard>
            </div>

            <Table
                columns={columns}
                dataSource={orders}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            {/* Create/Edit Order Modal */}
            <Modal
                title="Create New Order"
                open={isModalOpen}
                onOk={form.submit}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setOrderItems([]);
                }}
                width={900}
                okText="Create Order"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Client"
                                name="clientId"
                                rules={[{ required: true, message: 'Client is required' }]}
                            >
                                <Select placeholder="Select client" style={{ width: '100%' }}>
                                    {clients.map((client) => (
                                        <Select.Option key={client.id} value={client.id}>
                                            {client.firstName} {client.lastName} ({client.email})
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <div className="text-right">
                                <p className="text-lg font-bold">
                                    Total: <span className="text-blue-600">${calculateTotalAmount().toFixed(2)}</span>
                                </p>
                            </div>
                        </Col>
                    </Row>

                    <Divider>Order Items</Divider>

                <div className="bg-gray-50 p-4 rounded mb-4">
                    {orderItems.length === 0 ? (
                        <p className="text-gray-400">No items added. Click "Add Item" to start.</p>
                    ) : (
                        <div className="space-y-3">
                            {orderItems.map((item, index) => (
                                <Row key={index} gutter={16} align="middle">
                                    <Col span={8}>
                                        <Select
                                            placeholder="Select product"
                                            value={item.productId ?? null}
                                            options={products.map((product) => ({
                                                label: `${product.name} ($${product.price})`,
                                                value: product.id,
                                            }))}
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.label.toLowerCase().includes(input.toLowerCase())
                                            }
                                            disabled={products.length === 0}
                                            onChange={(value) => {
                                                const product = products.find(p => p.id === value);
                                                updateOrderItem(index, 'productId', value);
                                                if (product) {
                                                    updateOrderItem(index, 'unitPrice', product.price);
                                                }
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                        <Col span={5}>
                                            <InputNumber
                                                min={1}
                                                value={item.quantity}
                                                onChange={(value) => updateOrderItem(index, 'quantity', value)}
                                                placeholder="Qty"
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <InputNumber
                                                min={0}
                                                step={0.01}
                                                value={item.unitPrice}
                                                onChange={(value) => updateOrderItem(index, 'unitPrice', value)}
                                                placeholder="Price"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <div className="text-right font-semibold">
                                                ${calculateItemTotal(item).toFixed(2)}
                                            </div>
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                onClick={() => removeOrderItem(index)}
                                            >
                                                Remove
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button onClick={addOrderItem} block>
                        + Add Item
                    </Button>

                    <Divider>Payment Information</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Payment Method 1"
                                name="paymentMethod1"
                                rules={[{ required: true, message: 'First payment method is required' }]}
                            >
                                <Select placeholder="Select payment method" style={{ width: '100%' }}>
                                    {paymentMethods.map((method) => (
                                        <Select.Option key={method.value} value={method.value}>
                                            {method.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Payment Amount 1"
                                name="paymentAmount1"
                                rules={[{ required: true, message: 'Amount is required' }]}
                            >
                                <InputNumber
                                    min={0}
                                    step={0.01}
                                    placeholder="0.00"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Payment Method 2 (Optional)"
                                name="paymentMethod2"
                            >
                                <Select placeholder="Select payment method (optional)" style={{ width: '100%' }}>
                                    <Select.Option value="">None</Select.Option>
                                    {paymentMethods.map((method) => (
                                        <Select.Option key={method.value} value={method.value}>
                                            {method.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Payment Amount 2 (Optional)"
                                name="paymentAmount2"
                            >
                                <InputNumber
                                    min={0}
                                    step={0.01}
                                    placeholder="0.00"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Notes"
                        name="notes"
                    >
                        <Input.TextArea placeholder="Enter order notes" rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Order Details Modal */}
            <Modal
                title={`Order Details: ${selectedOrder?.orderNumber}`}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={null}
                width={700}
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <Card>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Client:</strong></p>
                                    <p>{selectedOrder.client?.firstName} {selectedOrder.client?.lastName}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.client?.email}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Status:</strong> {getStatusTag(selectedOrder.status)}</p>
                                    <p><strong>Created By:</strong> {selectedOrder.creator?.firstName} {selectedOrder.creator?.lastName}</p>
                                </Col>
                            </Row>
                        </Card>

                        <Card title="Order Items">
                            <Table
                                columns={[
                                    { title: 'Product', dataIndex: ['product', 'name'], key: 'product' },
                                    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                                    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', render: (price) => `$${price}` },
                                    { title: 'Total', key: 'total', render: (_, record) => `$${(record.quantity * record.unitPrice).toFixed(2)}` },
                                ]}
                                dataSource={selectedOrder.items}
                                pagination={false}
                                rowKey="id"
                            />
                        </Card>

                        <Card title="Payment Information">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Method 1:</strong> {selectedOrder.paymentMethod1}</p>
                                    <p>Amount: ${parseFloat(selectedOrder.paymentAmount1).toFixed(2)}</p>
                                </Col>
                                <Col span={12}>
                                    {selectedOrder.paymentMethod2 && (
                                        <>
                                            <p><strong>Method 2:</strong> {selectedOrder.paymentMethod2}</p>
                                            <p>Amount: ${parseFloat(selectedOrder.paymentAmount2).toFixed(2)}</p>
                                        </>
                                    )}
                                </Col>
                            </Row>
                            <Divider />
                            <p className="text-lg font-bold">Total: ${parseFloat(selectedOrder.totalAmount).toFixed(2)}</p>
                        </Card>

                        {selectedOrder.notes && (
                            <Card title="Notes">
                                <p>{selectedOrder.notes}</p>
                            </Card>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Orders;
