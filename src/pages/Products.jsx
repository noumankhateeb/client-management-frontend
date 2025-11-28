import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/slices/productsSlice';
import PermissionGuard from '../components/PermissionGuard';

const { Title } = Typography;

const Products = () => {
    const dispatch = useDispatch();
    const { items: products, loading } = useSelector((state) => state.products);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteProduct(id)).unwrap();
            message.success('Product deleted successfully');
        } catch (error) {
            message.error(error || 'Failed to delete product');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingProduct) {
                await dispatch(updateProduct({ id: editingProduct.id, data: values })).unwrap();
                message.success('Product updated successfully');
            } else {
                await dispatch(createProduct(values)).unwrap();
                message.success('Product created successfully');
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error(error || 'Operation failed');
        }
    };

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `$${parseFloat(price).toFixed(2)}`,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <span className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <PermissionGuard resource="products" action="update">
                        <Button
                            type="default"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                            title="Edit product"
                        />
                    </PermissionGuard>
                    <PermissionGuard resource="products" action="delete">
                        <Popconfirm
                            title="Delete product"
                            description="Are you sure you want to delete this product?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                title="Delete product"
                            />
                        </Popconfirm>
                    </PermissionGuard>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} className="!mb-0">Products</Title>
                <PermissionGuard resource="products" action="create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Product
                    </Button>
                </PermissionGuard>
            </div>

            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingProduct ? 'Edit Product' : 'Add Product'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Product Name"
                        rules={[{ required: true, message: 'Please enter product name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="sku"
                        label="SKU"
                        rules={[{ required: true, message: 'Please enter SKU' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber
                            min={0}
                            step={0.01}
                            precision={2}
                            className="w-full"
                            prefix="$"
                        />
                    </Form.Item>

                    <Form.Item
                        name="stock"
                        label="Stock"
                        rules={[{ required: true, message: 'Please enter stock quantity' }]}
                    >
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>

                    <Form.Item className="mb-0 flex justify-end gap-2">
                        <Button onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingProduct ? 'Update' : 'Create'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Products;
