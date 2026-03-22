import { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Card } from 'react-bootstrap';
import { adminApi } from '../../utils/adminApi';
import AOS from 'aos';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    AOS.init();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await adminApi.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert(err.message || "Failed to delete user");
      }
    }
  };

  return (
    <div className="admin-main-content">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-down">
          <h2 className="fw-bold">User Directory</h2>
          <Badge bg="primary" className="p-2 px-3 rounded-pill">Total: {users.length}</Badge>
        </div>

        <Card className="admin-card border-0 shadow-sm" data-aos="fade-up">
          <Table hover responsive className="admin-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="fw-semibold">{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.role === 'admin' ? 'danger' : 'info'} className="status-badge">
                      {user.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="btn-modern"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === 'admin'} // Prevent accidental self-deletion
                    >
                      <i className="bi bi-person-x me-1"></i> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Container>
    </div>
  );
};

export default AdminUsers;