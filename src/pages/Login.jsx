import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login, clearError } from '../store/slices/authSlice';

const { Title, Text } = Typography;

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        const result = await dispatch(login(values));
        if (login.fulfilled.match(result)) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Card className="w-full max-w-md shadow-xl">
                <Space direction="vertical" size="large" className="w-full">
                    <div className="text-center">
                        <Title level={2} className="!mb-2">Welcome Back</Title>
                        <Text type="secondary">Sign in to your account</Text>
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
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
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
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center">
                        <Text type="secondary">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700">
                                Register here
                            </Link>
                        </Text>
                    </div>

                    <div className="text-center pt-4 border-t">
                        <Text type="secondary" className="text-xs">
                            Demo Credentials:<br />
                            Admin: admin@example.com / admin123<br />
                            User: user@example.com / user123
                        </Text>
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default Login;
