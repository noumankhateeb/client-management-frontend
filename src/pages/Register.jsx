import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { register, clearError } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const { confirmPassword, ...userData } = values;
        const result = await dispatch(register(userData));
        if (register.fulfilled.match(result)) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md shadow-xl">
                <Space direction="vertical" size="large" className="w-full">
                    <div className="text-center">
                        <Title level={2} className="!mb-2">Create Account</Title>
                        <Text type="secondary">Sign up to get started</Text>
                    </div>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            closable
                            onClose={() => dispatch(clearError())}
                        />
                    )}

                    <Form
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="firstName"
                            rules={[{ required: true, message: 'Please input your first name!' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="First Name"
                            />
                        </Form.Item>

                        <Form.Item
                            name="lastName"
                            rules={[{ required: true, message: 'Please input your last name!' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Last Name"
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 6, message: 'Password must be at least 6 characters!' },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirm Password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                className="!h-12"
                            >
                                Sign Up
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center">
                        <Text type="secondary">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700">
                                Login here
                            </Link>
                        </Text>
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default Register;
