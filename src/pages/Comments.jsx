import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchComments, createComment, updateComment, deleteComment } from '../store/slices/commentsSlice';
import PermissionGuard from '../components/PermissionGuard';

const { Title } = Typography;

const Comments = () => {
    const dispatch = useDispatch();
    const { items: comments, loading } = useSelector((state) => state.comments);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchComments());
    }, [dispatch]);

    const handleAdd = () => {
        setEditingComment(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (comment) => {
        setEditingComment(comment);
        form.setFieldsValue(comment);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteComment(id)).unwrap();
            message.success('Comment deleted successfully');
        } catch (error) {
            message.error(error || 'Failed to delete comment');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingComment) {
                await dispatch(updateComment({ id: editingComment.id, data: values })).unwrap();
                message.success('Comment updated successfully');
            } else {
                await dispatch(createComment(values)).unwrap();
                message.success('Comment created successfully');
            }
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error(error || 'Operation failed');
        }
    };

    const getRelatedLabel = (relatedTo) => {
        const labels = {
            product: { text: 'Product', color: 'blue' },
            client: { text: 'Client', color: 'cyan' },
            order: { text: 'Order', color: 'orange' },
            general: { text: 'General', color: 'default' },
        };
        return labels[relatedTo] || { text: relatedTo, color: 'default' };
    };

    const columns = [
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
            width: 300,
        },
        {
            title: 'Related To',
            dataIndex: 'relatedTo',
            key: 'relatedTo',
            render: (relatedTo) => {
                const label = getRelatedLabel(relatedTo);
                return <Tag color={label.color}>{label.text}</Tag>;
            },
        },
        {
            title: 'Related ID',
            dataIndex: 'relatedId',
            key: 'relatedId',
            render: (relatedId) => relatedId || '-',
        },
        {
            title: 'Created By',
            key: 'creator',
            render: (_, record) => record.creator ? `${record.creator.firstName} ${record.creator.lastName}` : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <PermissionGuard resource="comments" action="update">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </PermissionGuard>

                    <PermissionGuard resource="comments" action="delete">
                        <Popconfirm
                            title="Delete Comment"
                            description="Are you sure you want to delete this comment?"
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
                <Title level={2}>Comments Management</Title>
                <PermissionGuard resource="comments" action="create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Comment
                    </Button>
                </PermissionGuard>
            </div>

            <Table
                columns={columns}
                dataSource={comments}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingComment ? 'Edit Comment' : 'Add New Comment'}
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
                        label="Content"
                        name="content"
                        rules={[{ required: true, message: 'Comment content is required' }]}
                    >
                        <Input.TextArea placeholder="Enter comment" rows={4} />
                    </Form.Item>

                    <Form.Item
                        label="Related To"
                        name="relatedTo"
                        rules={[{ required: true, message: 'Please select what this comment is related to' }]}
                    >
                        <Select placeholder="Select related resource">
                            <Select.Option value="general">General</Select.Option>
                            <Select.Option value="product">Product</Select.Option>
                            <Select.Option value="client">Client</Select.Option>
                            <Select.Option value="order">Order</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Related ID (Optional)"
                        name="relatedId"
                        rules={[{ required: false }]}
                    >
                        <Input placeholder="Enter ID of related resource" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Comments;
