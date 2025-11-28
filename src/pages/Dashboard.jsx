import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
    return (
        <div>
            <Title level={2}>Dashboard</Title>
            <Paragraph>
                Welcome to the Client Management System! Use the sidebar to navigate to different sections.
            </Paragraph>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">Products</div>
                    <div className="text-gray-600 mt-2">Manage your inventory</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600">Clients</div>
                    <div className="text-gray-600 mt-2">Manage your clients</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600">Orders</div>
                    <div className="text-gray-600 mt-2">Track all orders</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600">Comments</div>
                    <div className="text-gray-600 mt-2">View all comments</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
