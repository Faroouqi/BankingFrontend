import Navbar from './Navbar';

const Dashboard = () => {
    return (
        <div>
            <Navbar userName="Nabeel" totalBalance={120000} />
            {/* Your dashboard content */}
        </div>
    );
};

export default Dashboard;